import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

// Значения по умолчанию
const defaultState = {
  sourceLanguage: 'auto' as const,
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
