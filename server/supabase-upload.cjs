require('dotenv').config();
const express = require('express');
const multer = require('multer');
const fs = require('fs/promises');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET = process.env.SUPABASE_BUCKET || 'resumes';

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

// ----------- SIGNED URL UPLOAD HELPER -----------
async function uploadToSupabase(localFilePath, originalName, mime) {
  const buffer = await fs.readFile(localFilePath);
  const key = `${Date.now()}_${originalName.replace(/\s+/g, '_')}`;

  const { data, error } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(key, buffer, { contentType: mime });

  if (error) throw error;

  const { data: signedData, error: signErr } =
    await supabaseAdmin.storage.from(BUCKET).createSignedUrl(data.path, 3600);

  if (signErr) throw signErr;

  return signedData.signedUrl;
}

// ------------- ROUTE -------------
router.post('/upload-resume', upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const mime = req.file.mimetype;

    const signedUrl = await uploadToSupabase(filePath, fileName, mime);

    res.json({
      success: true,
      signedURL: signedUrl,
      fileName
    });
  } catch (err) {
    res.status(500).json({ error: err.message || String(err) });
  }
});

module.exports = router;
