import { TranslationModeTabs, TranslationModeContent } from '@features/translation-mode-tabs';
import styles from './TranslatorWidget.module.css';
import { LanguageSection } from '@/features/language-section';

export const TranslatorWidget = () => {
  return (
    <div className={styles.translator}>
      <div className={styles.tabsWrapper}>
        <TranslationModeTabs />
      </div>
      <div className={styles.container}>

        <LanguageSection />

        <TranslationModeContent />
      </div>
    </div>
  );
};
