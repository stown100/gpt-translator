import { TranslationArea } from '@features/translation-area';
import styles from './TextMode.module.css';

export const TextMode = () => {
  return (
    <div className={styles.translationSection}>
      <TranslationArea type="source" />
      <TranslationArea type="target" />
    </div>
  );
};
