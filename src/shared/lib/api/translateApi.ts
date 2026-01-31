import { getLanguageName } from '@shared/config/languages';

const API_TRANSLATE_URL = '/api/translate';

export interface TranslateOptions {
  text: string;
  sourceLanguage: string;
  targetLanguage: string;
}

export interface TranslateResult {
  translatedText: string;
  error?: string;
}

/**
 * Translates text via backend API (key is kept on the server).
 */
export async function translateWithChatGPT(options: TranslateOptions): Promise<TranslateResult> {
  const { text, sourceLanguage, targetLanguage } = options;

  const trimmedText = text.trim();
  if (!trimmedText) {
    return { translatedText: '' };
  }

  const sourceLanguageName = sourceLanguage === 'auto' ? null : getLanguageName(sourceLanguage);
  const targetLanguageName = getLanguageName(targetLanguage);

  try {
    const response = await fetch(API_TRANSLATE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: trimmedText,
        sourceLanguage,
        targetLanguage,
        sourceLanguageName,
        targetLanguageName,
      }),
    });

    const data = (await response.json()) as TranslateResult;

    if (!response.ok) {
      return {
        translatedText: '',
        error: data.error ?? `API error (${response.status})`,
      };
    }

    return {
      translatedText: data.translatedText ?? '',
      error: data.error,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return {
      translatedText: '',
      error: `Translation failed: ${message}`,
    };
  }
}
