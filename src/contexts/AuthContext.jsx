import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../supabase/config";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;

    const initSession = async () => {
      // 1️⃣ Get current session
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) console.error("Session fetch error:", error.message);
      if (!ignore) {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }

      // 2️⃣ Listen to changes (login, logout, token refresh)
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
      });

      return () => {
        ignore = true;
        subscription.unsubscribe();
      };
    };

    initSession();
  }, []);

  // 🔐 LOGIN
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { success: false, error: error.message };
    setUser(data.user);
    return { success: true, user: data.user };
  };

  // 🆕 SIGNUP
  const signup = async (email, password, displayName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: displayName } },
    });
    if (error) return { success: false, error: error.message };
    setUser(data.user);
    return { success: true, user: data.user };
  };

  // 🚪 LOGOUT
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    setUser(null);
    setSession(null);
    return { success: true };
  };

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
