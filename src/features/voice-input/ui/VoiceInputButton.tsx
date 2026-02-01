import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '@shared/lib/hooks/useSpeechRecognition';
import { trackVoiceInput } from '@shared/lib/analytics';
import { languageToSpeechCode } from '@shared/lib/utils/languageToSpeechCode';
import { concatenateText } from '@shared/lib/utils/concatenateText';
import styles from './VoiceInputButton.module.css';

interface VoiceInputButtonProps {
  language: string;
  currentText: string;
  onTextUpdate: (text: string) => void;
  onInterimText?: (text: string) => void;
}

export const VoiceInputButton = ({
  language,
  currentText,
  onTextUpdate,
  onInterimText
}: VoiceInputButtonProps) => {
  const [interimText, setInterimText] = useState('');
  const currentTextRef = useRef(currentText);

  useEffect(() => {
    currentTextRef.current = currentText;
  }, [currentText]);

  const speechLanguage = language === 'auto' ? 'en-US' : languageToSpeechCode(language);

  const handleResult = useCallback((text: string, isFinal: boolean) => {
    if (isFinal) {
      const current = currentTextRef.current;
      const newText = concatenateText(current, text);
      currentTextRef.current = newText;
      onTextUpdate(newText);
      setInterimText('');
      onInterimText?.('');
    } else {
      setInterimText(text);
      if (onInterimText) {
        const current = currentTextRef.current;
        const displayText = concatenateText(current, text);
        onInterimText(displayText);
      }
    }
  }, [onTextUpdate, onInterimText]);

  const handleError = useCallback((error: string) => {
    if (error === 'aborted' || error === 'no-speech' || error === 'audio-capture') {
      return;
    }

    setInterimText('');
    if (onInterimText) {
      onInterimText(currentTextRef.current);
    }
  }, [onInterimText]);

  const { isListening, isSupported, toggleListening } = useSpeechRecognition({
    language: speechLanguage,
    continuous: true,
    interimResults: true,
    onResult: handleResult,
    onError: handleError,
  });

  useEffect(() => {
    if (!isListening) {
      // При остановке записи сохраняем промежуточный текст как финальный, если он есть
      if (interimText) {
        const current = currentTextRef.current;
        const finalText = concatenateText(current, interimText);
        currentTextRef.current = finalText;
        onTextUpdate(finalText);
      }
      setInterimText('');
      onInterimText?.('');
    }
  }, [isListening, interimText, onTextUpdate, onInterimText]);

  const handleClick = () => {
    if (!isSupported) {
      alert('Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.');
      return;
    }
    if (!isListening) trackVoiceInput();
    toggleListening();
  };

  return (
    <button
      type="button"
      className={`${styles.voiceButton} ${isListening ? styles.voiceButtonActive : ''}`}
      onClick={handleClick}
      aria-label={isListening ? 'Stop listening' : 'Start voice input'}
      title={isListening ? 'Stop listening' : 'Start voice input'}
      disabled={!isSupported}
    >
      {isListening ? (
        <div className={styles.recordingIndicator}>
          <div className={styles.recordingDot}></div>
        </div>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"
            fill="currentColor"
          />
          <path
            d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
};
