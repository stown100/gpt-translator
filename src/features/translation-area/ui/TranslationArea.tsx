import { useEffect, useState } from 'react';
import { useTranslatorStore } from '@shared/lib/store/useTranslatorStore';
import { concatenateText } from '@shared/lib/utils/concatenateText';
import { ClearButton } from '@features/clear-text';
import { CopyButton } from '@features/copy-text';
import { VoiceInputButton } from '@features/voice-input';
import styles from './TranslationArea.module.css';

interface TranslationAreaProps {
  type: 'source' | 'target';
}

export const TranslationArea = ({ type }: TranslationAreaProps) => {
  const {
    sourceText,
    translatedText,
    setSourceText,
    setTranslatedText,
    sourceLanguage,
    targetLanguage
  } = useTranslatorStore();

  const [interimText, setInterimText] = useState('');

  const value = type === 'source' ? sourceText : translatedText;
  const displayValue = type === 'source' && interimText
    ? concatenateText(sourceText, interimText)
    : value;
  const isReadOnly = type === 'target';
  const placeholder = type === 'source'
    ? 'Enter text'
    : 'Translation';

  useEffect(() => {
    if (type === 'source' && sourceText && sourceLanguage !== 'auto' && targetLanguage) {
      // TODO: Replace with actual translation API call
      setTranslatedText('');
    }
  }, [sourceText, sourceLanguage, targetLanguage, type, setTranslatedText]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (type === 'source') {
      setSourceText(e.target.value);
      setInterimText('');
    }
  };

  return (
    <div className={styles.container}>
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

      <textarea
        className={styles.textarea}
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={isReadOnly}
        rows={5}
      />

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
