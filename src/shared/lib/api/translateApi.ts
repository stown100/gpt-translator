import { getLanguageName } from '@shared/config/languages';

const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL;
const DEFAULT_MODEL = import.meta.env.VITE_OPENAI_MODEL;

export interface TranslateOptions {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
  apiKey?: string;
  model?: string;
}

export interface TranslateResult {
  translatedText: string;
  error?: string;
}

function getApiKey(): string {
  const key = import.meta.env.VITE_OPENAI_API_KEY;
  if (!key || typeof key !== 'string') {
    throw new Error(
      'VITE_OPENAI_API_KEY is not set. Add it to your .env file: VITE_OPENAI_API_KEY=sk-...'
    );
  }
  return key;
}

const TRANSLATION_SYSTEM_RULES = [
  'Return ONLY the translated text, nothing else: no explanations, quotes, prefixes like "Translation:", or commentary.',
  'Preserve the tone (formal/informal) and style of the original.',
  'Output natural, fluent text in the target language.',
].join(' ');

function buildSystemMessage(sourceLanguage: string, targetLanguage: string): string {
  const targetLangName = getLanguageName(targetLanguage);

  if (sourceLanguage === 'auto') {
    return `You are a professional translator. Detect the language of the user's text and translate it into ${targetLangName}. ${TRANSLATION_SYSTEM_RULES}`;
  }

  const sourceLangName = getLanguageName(sourceLanguage);
  return `You are a professional translator. Translate the user's text from ${sourceLangName} to ${targetLangName}. ${TRANSLATION_SYSTEM_RULES}`;
}

/**
 * Translates text using OpenAI ChatGPT API.
 */
export async function translateWithChatGPT(options: TranslateOptions): Promise<TranslateResult> {
  const { text, sourceLanguage, targetLanguage } = options;
  const apiKey = options.apiKey ?? getApiKey();
  const model = options.model ?? DEFAULT_MODEL;

  const trimmedText = text.trim();
  if (!trimmedText) {
    return { translatedText: '' };
  }

  const systemMessage = buildSystemMessage(sourceLanguage, targetLanguage);

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

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message =
        (errorData as { error?: { message?: string } })?.error?.message ||
        response.statusText;
      return {
        translatedText: '',
        error: `API error (${response.status}): ${message}`,
      };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = data.choices?.[0]?.message?.content?.trim() ?? '';
    return { translatedText: content };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      translatedText: '',
      error: `Translation failed: ${message}`,
    };
  }
}
