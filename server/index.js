import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();
dotenv.config({ path: '.env.local' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3001;

const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';


const TRANSLATION_SYSTEM_RULES = [
  'Return ONLY the translated text, nothing else: no explanations, quotes, prefixes like "Translation:", or commentary.',
  'Preserve the tone (formal/informal) and style of the original.',
  'Output natural, fluent text in the target language.',
].join(' ');

function buildSystemMessage(sourceLanguageName, targetLanguageName) {
  if (!sourceLanguageName || sourceLanguageName === 'auto') {
    return `You are a professional translator. Detect the language of the user's text and translate it into ${targetLanguageName}. ${TRANSLATION_SYSTEM_RULES}`;
  }
  return `You are a professional translator. Translate the user's text from ${sourceLanguageName} to ${targetLanguageName}. ${TRANSLATION_SYSTEM_RULES}`;
}

const app = express();
app.use(express.json());

app.post('/api/translate', async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      translatedText: '',
      error: 'Server: OPENAI_API_KEY is not configured.',
    });
  }

  const { text, sourceLanguageName, targetLanguageName } = req.body;
  const trimmedText = typeof text === 'string' ? text.trim() : '';
  if (!trimmedText) {
    return res.json({ translatedText: '' });
  }

  const systemMessage = buildSystemMessage(sourceLanguageName, targetLanguageName);
  const model = DEFAULT_MODEL;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: trimmedText },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.error?.message || response.statusText;
      return res.status(response.status).json({
        translatedText: '',
        error: `API error (${response.status}): ${message}`,
      });
    }

    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    return res.json({ translatedText: content });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({
      translatedText: '',
      error: `Translation failed: ${message}`,
    });
  }
});

if (isProduction) {
  const distPath = path.join(__dirname, '..', 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(isProduction ? `Serving app on port ${PORT}` : `API server on http://localhost:${PORT}`);
});
