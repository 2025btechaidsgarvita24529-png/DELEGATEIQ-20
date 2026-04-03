// api/gemini.js
// ================================================================
// Vercel Serverless Function — Gemini AI Proxy
// ================================================================
// SETUP STEPS:
//
// 1. Create this file at:  /api/gemini.js  (project root, not /pages/)
//
// 2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
//    Add:  GEMINI_API_KEY = your_actual_gemini_api_key_here
//
// 3. In your frontend ai-chat.html JS, replace the direct Gemini fetch with:
//
//    const res = await fetch('/api/gemini', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ prompt: userMessage, context: munContext })
//    });
//    const data = await res.json();
//    const reply = data.text; // AI response text
//
// 4. Redeploy to Vercel — the API key is now NEVER in the browser.
// ================================================================

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers — allow your Vercel domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable not set');
    return res.status(500).json({ error: 'Server configuration error. Please contact the admin.' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body)
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return res.status(geminiRes.status).json({
        error: errText || 'AI service error'
      });
    }

    const data = await geminiRes.json();
    return res.status(200).json(data);

  } catch (err) {
    console.error('Proxy fetch error:', err);
    return res.status(500).json({
      error: 'Server error. Please try again in a moment.'
    });
  }
}
