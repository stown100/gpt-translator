import { useTranslatorStore } from '@shared/lib/store/useTranslatorStore';
import { TRANSLATION_MODE_CONFIG, TRANSLATION_MODES_ORDER } from '../config/modeConfig';
import styles from './TranslationModeTabs.module.css';

export const TranslationModeTabs = () => {
  const { translationMode, setTranslationMode } = useTranslatorStore();

  return (
    <div className={styles.tabs} role="tablist" aria-label="Translation mode">
      {TRANSLATION_MODES_ORDER.map((modeId) => {
        const config = TRANSLATION_MODE_CONFIG[modeId];
        return (
          <button
            key={modeId}
            type="button"
            role="tab"
            aria-selected={translationMode === modeId}
            className={`${styles.tab} ${translationMode === modeId ? styles.tabActive : ''}`}
            onClick={() => setTranslationMode(modeId)}
          >
            {config.icon}
            {config.label}
          </button>
        );
      })}
    </div>
  );
};
