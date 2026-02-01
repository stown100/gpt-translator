import { LanguageSelector } from '@features/language-selector';
import { TranslationArea } from '@features/translation-area';
import { SwapButton } from '@features/swap-languages';
import { useTranslatorStore } from '@shared/lib/store/useTranslatorStore';
import { trackSwap } from '@shared/lib/analytics';
import styles from './TranslatorWidget.module.css';

export const TranslatorWidget = () => {
  const {
    sourceLanguage,
    targetLanguage,
    swapLanguages,
    setSourceLanguage,
    setTargetLanguage
  } = useTranslatorStore();

  return (
    <div className={styles.translator}>
      <div className={styles.container}>
        <div className={styles.languageSection}>
          <LanguageSelector
            value={sourceLanguage}
            onChange={setSourceLanguage}
          />

          <SwapButton onClick={() => { trackSwap(); swapLanguages(); }} />

          <LanguageSelector
            value={targetLanguage}
            onChange={setTargetLanguage}
          />
        </div>

        <div className={styles.translationSection}>
          <TranslationArea type="source" />
          <TranslationArea type="target" />
        </div>
      </div>
    </div>
  );
};
