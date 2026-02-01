import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { LANGUAGES } from '@shared/config/languages';

interface TranslatorState {
  sourceLanguage: string;
  targetLanguage: string;
  sourceText: string;
  translatedText: string;
  isTranslating: boolean;
  setSourceLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  setSourceText: (text: string) => void;
  setTranslatedText: (text: string) => void;
  setTranslating: (value: boolean) => void;
  swapLanguages: () => void;
  clearText: () => void;
}

const STORAGE_KEY = 'translator-storage';

// Маппинг navigator.language (BCP 47) на коды наших языков
const BROWSER_LANG_TO_CODE: Record<string, string> = {
  'zh-TW': 'zh-TW',
  'zh-HK': 'zh-TW',
  'zh-Hant': 'zh-TW',
  'zh-CN': 'zh',
  'zh-SG': 'zh',
  'zh-Hans': 'zh',
  'pt-BR': 'pt',
  'pt-PT': 'pt',
  'nb': 'no',
  'nn': 'no',
};

const supportedCodes = new Set(LANGUAGES.filter((l) => l.code !== 'auto').map((l) => l.code));

function getBrowserLanguageCode(): string | null {
  if (typeof navigator === 'undefined') return null;
  const browserLang = navigator.language || (navigator as Navigator & { userLanguage?: string }).userLanguage;
  if (!browserLang) return null;

  if (BROWSER_LANG_TO_CODE[browserLang]) return BROWSER_LANG_TO_CODE[browserLang];
  if (supportedCodes.has(browserLang)) return browserLang;

  const [primary] = browserLang.split('-');
  return supportedCodes.has(primary) ? primary : null;
}

function isStorageEmpty(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return true;
    const parsed = JSON.parse(stored);
    return !parsed?.state;
  } catch {
    return true;
  }
}

// Значения по умолчанию: при пустом localStorage — sourceLanguage из языка браузера
const defaultState = {
  sourceLanguage: (isStorageEmpty() ? getBrowserLanguageCode() || 'auto' : 'auto') as string,
  targetLanguage: 'en' as const,
};

export const useTranslatorStore = create<TranslatorState>()(
  persist(
    (set) => ({
      ...defaultState,
      sourceText: '',
      translatedText: '',
      isTranslating: false,
      setSourceLanguage: (lang) => set({ sourceLanguage: lang }),
      setTargetLanguage: (lang) => set({ targetLanguage: lang }),
      setSourceText: (text) => set({ sourceText: text }),
      setTranslatedText: (text) => set({ translatedText: text }),
      setTranslating: (value) => set({ isTranslating: value }),
      swapLanguages: () =>
        set((state) => {
          const newSourceLang = state.targetLanguage === 'auto' ? 'en' : state.targetLanguage;
          const newTargetLang = state.sourceLanguage === 'auto' ? 'en' : state.sourceLanguage;

          return {
            sourceLanguage: newSourceLang,
            targetLanguage: newTargetLang,
            sourceText: state.translatedText,
            translatedText: state.sourceText,
          };
        }),
      clearText: () => set({ sourceText: '', translatedText: '' }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // Сохраняем только языки, текст не сохраняем
      partialize: (state) => ({
        sourceLanguage: state.sourceLanguage,
        targetLanguage: state.targetLanguage,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          console.error('Error loading translator state from localStorage:', error);
        }
      },
    }
  )
);
