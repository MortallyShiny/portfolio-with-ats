require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
});

(async () => {
  try {
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }

    console.log('Buckets:', data);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
})();
