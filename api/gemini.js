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

  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'No prompt provided' });
  }

  // Build a MUN-specific system instruction
  const systemInstruction = `You are DelegateIQ, an expert AI assistant for Model United Nations (MUN) delegates.
${context ? `Current delegate context: ${context}` : ''}

Your role:
- Give detailed, accurate MUN research with real UN resolution numbers (e.g., S/RES/2254, A/RES/70/1)
- Provide country-specific policy positions based on their actual UN voting history
- Format speeches, clauses, and position papers in proper MUN format
- Cite real UN sources when available
- Be helpful, clear, and structured in your responses

Always verify important facts. If unsure about a specific resolution number, say so clearly.`;

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY environment variable not set');
    return res.status(500).json({ error: 'Server configuration error. Please contact the admin.' });
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }]
          },
          contents: [
            { role: 'user', parts: [{ text: prompt }] }
          ],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ]
        })
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error('Gemini API error:', geminiRes.status, errText);
      return res.status(502).json({
        error: 'AI service temporarily unavailable. Please try again in a moment.'
      });
    }

    const data = await geminiRes.json();

    // Extract text from response
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(200).json({
        text: 'I couldn\'t generate a response for that. Please rephrase your question and try again.'
      });
    }

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Proxy fetch error:', err);
    return res.status(500).json({
      error: 'Server error. Please try again in a moment.'
    });
  }
}
