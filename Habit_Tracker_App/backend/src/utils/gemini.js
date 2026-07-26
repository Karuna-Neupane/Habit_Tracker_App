// Gemini client — shared by AI Coach + AI Chatbot
//
// Both controllers need to call the same Gemini text-generation endpoint,
// with JSON-mode for the coach and free-text for the chatbot. Centralizing
// the fetch call means the API key and model name are configured in exactly
// one place.

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.6-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

function isConfigured() {
  return Boolean(GEMINI_API_KEY);
}

// contents: Gemini "contents" array — [{ role: 'user'|'model', parts: [{ text }] }, ...]
// options.json: true -> ask Gemini to respond with responseMimeType: application/json
async function generate(contents, { json = false, systemInstruction = null } = {}) {
  if (!isConfigured()) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const body = {
    contents,
    generationConfig: json ? { responseMimeType: 'application/json' } : {},
  };
  if (systemInstruction) {
    body.systemInstruction = { parts: [{ text: systemInstruction }] };
  }

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || '').join('') || '';
  if (!text) {
    throw new Error('Gemini returned an empty response');
  }
  return text;
}

module.exports = { generate, isConfigured };
