import { useTranslatorStore } from '@shared/lib/store/useTranslatorStore';
import { TRANSLATION_MODE_CONFIG } from '../config/modeConfig';

export const TranslationModeContent = () => {
  const { translationMode } = useTranslatorStore();
  const config = TRANSLATION_MODE_CONFIG[translationMode];
  const Component = config.Component;
  return <Component />;
};
