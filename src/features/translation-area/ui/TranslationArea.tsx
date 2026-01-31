import { useEffect, useState, useRef } from 'react';
import { useTranslatorStore } from '@shared/lib/store/useTranslatorStore';
import { concatenateText } from '@shared/lib/utils/concatenateText';
import { translateWithChatGPT } from '@shared/lib/api/translateApi';
import { ClearButton } from '@features/clear-text';
import { CopyButton } from '@features/copy-text';
import { VoiceInputButton } from '@features/voice-input';
import { TranslationSkeleton } from '@features/translation-skeleton';
import styles from './TranslationArea.module.css';

const TRANSLATE_DEBOUNCE_MS = 500;

interface TranslationAreaProps {
  type: 'source' | 'target';
}

export const TranslationArea = ({ type }: TranslationAreaProps) => {
  const {
    sourceText,
    translatedText,
    setSourceText,
    setTranslatedText,
    setTranslating,
    isTranslating,
    sourceLanguage,
    targetLanguage
  } = useTranslatorStore();

  const [interimText, setInterimText] = useState('');
  const [translateError, setTranslateError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const value = type === 'source' ? sourceText : translatedText;
  const displayValue = type === 'source' && interimText
    ? concatenateText(sourceText, interimText)
    : value;
  const isReadOnly = type === 'target';
  const placeholder = type === 'source'
    ? 'Enter text'
    : isTranslating
      ? 'Translating...'
      : translateError
        ? translateError
        : 'Translation';

  useEffect(() => {
    if (type !== 'source' || !sourceText.trim() || !targetLanguage || targetLanguage === 'auto') {
      if (!sourceText.trim()) {
        setTranslatedText('');
        setTranslateError(null);
      }
      return;
    }

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    const textToTranslate = sourceText;
    debounceRef.current = setTimeout(async () => {
      setTranslating(true);
      setTranslateError(null);
      const result = await translateWithChatGPT({
        text: textToTranslate,
        sourceLanguage,
        targetLanguage,
      });
      setTranslating(false);
      const currentSourceText = useTranslatorStore.getState().sourceText;
      if (textToTranslate !== currentSourceText) return;
      if (result.error) {
        setTranslateError(result.error);
        setTranslatedText('');
      } else {
        setTranslatedText(result.translatedText);
        setTranslateError(null);
      }
    }, TRANSLATE_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
  }, [sourceText, sourceLanguage, targetLanguage, type, setTranslatedText, setTranslating]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (type === 'source') {
      setSourceText(e.target.value);
      setInterimText('');
    }
  };

  return (
    <div className={`${styles.container} ${type === 'target' ? styles.container_target : ''}`}>
      <div className={styles.toolbar}>
        {type === 'source' && value && (
          <ClearButton onClick={() => {
            const { clearText } = useTranslatorStore.getState();
            clearText();
          }} />
        )}
        {type === 'target' && value && (
          <CopyButton text={value} />
        )}
      </div>

      <div className={styles.textareaWrapper}>
        <textarea
          className={styles.textarea}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          readOnly={isReadOnly}
          rows={5}
        />
        {type === 'target' && isTranslating && <TranslationSkeleton />}
      </div>

      {type === 'source' && (
        <div className={styles.footer}>
          <VoiceInputButton
            language={sourceLanguage}
            currentText={sourceText}
            onTextUpdate={setSourceText}
            onInterimText={setInterimText}
          />
        </div>
      )}
    </div>
  );
};
