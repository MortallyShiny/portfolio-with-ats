require('dotenv').config();

const key = process.env.GEMINI_API_KEY;
if (!key) {
  console.error('Missing GEMINI_API_KEY in .env');
  process.exit(1);
}

(async () => {
  try {
    const url = 'https://generativelanguage.googleapis.com/v1/models?key=' + encodeURIComponent(key);
    const res = await fetch(url);
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
  } catch (err) {
    console.error('Request failed:', err);
    process.exit(1);
  }
})();
