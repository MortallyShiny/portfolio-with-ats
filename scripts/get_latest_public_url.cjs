require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env'); process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, { auth:{ persistSession:false }});
(async () => {
  const { data, error } = await supabase.storage.from('resumes').list('', { limit: 1, sortBy: { column: 'created_at', order: 'desc' }});
  if (error) return console.error('list error:', error);
  if (!data || data.length === 0) return console.log('no files found');
  const name = data[0].name;
  console.log('Newest file name:', name);
  const { publicURL, error: urlErr } = supabase.storage.from('resumes').getPublicUrl(name);
  if (urlErr) console.error('getPublicUrl error:', urlErr);
  console.log('publicURL:', publicURL);
})();
