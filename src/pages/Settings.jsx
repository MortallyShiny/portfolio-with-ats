import React, { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { supabase } from "../supabase/config";
import "./Settings.css";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [displayName, setDisplayName] = useState(
    user?.user_metadata?.display_name || ""
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user?.user_metadata?.avatar_url || ""
  );
  const [statusMsg, setStatusMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [uploading, setUploading] = useState(false);

  // 🧩 Update display name (Auth + Profiles table)
  const handleUpdateProfile = async () => {
    try {
      setStatusMsg("");
      setErrorMsg("");

      // Update auth metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: { display_name: displayName },
      });
      if (authError) throw authError;

      // Update or insert in profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert(
          { id: user.id, display_name: displayName, avatar_url: avatarUrl },
          { onConflict: "id" }
        );

      if (dbError) throw dbError;

      setStatusMsg("Profile updated successfully ✅");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  // 🧠 Upload avatar to Supabase Storage
  const handleUploadPhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setStatusMsg("");
      setErrorMsg("");

      const fileExt = file.name.split(".").pop();
      const filePath = `users/${user.id}/avatar.${fileExt}`;

      // Upload file to storage bucket
      const { data, error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      const publicUrl = publicData.publicUrl;

      // Update in auth and profiles table
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });
      if (authError) throw authError;

      await supabase
        .from("profiles")
        .upsert({ id: user.id, avatar_url: publicUrl });

      setAvatarUrl(publicUrl);
      setStatusMsg("Profile picture updated successfully ✅");
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setUploading(false);
    }
  };

  // 🔑 Reset password
  const handlePasswordReset = async () => {
    try {
      setStatusMsg("");
      setErrorMsg("");

      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
      if (error) throw error;

      setStatusMsg("Password reset email sent successfully ✅");
    } catch (error) {
      setErrorMsg(error.message);
    }
  };

  return (
    <div className="settings-page">
      <div className="container py-5">
        <motion.div
          className="settings-card mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h3 className="mb-4 text-center">Account Settings</h3>

          {/* Avatar Preview */}
          <div className="text-center mb-4">
            <img
              src={
                avatarUrl ||
                "https://cdn-icons-png.flaticon.com/512/847/847969.png"
              }
              alt="Profile"
              className="settings-avatar mb-2"
            />
            <div>
              <input
                type="file"
                id="avatarUpload"
                className="d-none"
                onChange={handleUploadPhoto}
                disabled={uploading}
              />
              <label htmlFor="avatarUpload" className="btn btn-outline-primary">
                {uploading ? "Uploading..." : "Change Photo"}
              </label>
            </div>
          </div>

          {/* Display Name */}
          <div className="mb-4">
            <label className="form-label">Display Name</label>
            <input
              className="form-control"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
            <button
              className="btn btn-primary mt-2"
              onClick={handleUpdateProfile}
            >
              Save Changes
            </button>
          </div>

          {/* Password Reset */}
          <div className="mb-4">
            <button
              className="btn btn-warning w-100"
              onClick={handlePasswordReset}
            >
              Send Password Reset Email
            </button>
          </div>

          {/* Theme Toggle */}
          <div className="mb-4">
            <button
              className="btn btn-outline-dark w-100"
              onClick={toggleTheme}
            >
              Toggle {theme === "light" ? "Dark" : "Light"} Mode
            </button>
          </div>

          {/* Logout */}
          <div className="mb-4">
            <button className="btn btn-danger w-100" onClick={logout}>
              Logout
            </button>
          </div>

          {/* Status Messages */}
          {statusMsg && <div className="alert alert-success">{statusMsg}</div>}
          {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
        </motion.div>
      </div>
    </div>
  );
}
