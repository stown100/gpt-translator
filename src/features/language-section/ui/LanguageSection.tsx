import { LanguageSelector } from '@features/language-selector';
import { SwapButton } from '@features/swap-languages';
import { useTranslatorStore } from '@shared/lib/store/useTranslatorStore';
import { trackSwap } from '@shared/lib/analytics';
import styles from './LanguageSection.module.css';

export const LanguageSection = () => {
  const {
    sourceLanguage,
    targetLanguage,
    swapLanguages,
    setSourceLanguage,
    setTargetLanguage,
  } = useTranslatorStore();

  return (
    <div className={styles.languageSection}>
      <LanguageSelector value={sourceLanguage} onChange={setSourceLanguage} />
      <SwapButton onClick={() => { trackSwap(); swapLanguages(); }} />
      <LanguageSelector value={targetLanguage} onChange={setTargetLanguage} />
    </div>
  );
};
