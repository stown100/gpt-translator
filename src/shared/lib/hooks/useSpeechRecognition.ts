import { useState, useEffect, useRef } from 'react';

interface UseSpeechRecognitionOptions {
  language?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onResult?: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
}

export const useSpeechRecognition = (options: UseSpeechRecognitionOptions = {}) => {
  const {
    language = 'en-US',
    continuous = true,
    interimResults = true,
    onResult,
    onError,
  } = options;

  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isManuallyStoppedRef = useRef(false);

  useEffect(() => {
    interface WindowWithSpeechRecognition extends Window {
      SpeechRecognition?: new () => SpeechRecognition;
      webkitSpeechRecognition?: new () => SpeechRecognition;
    }

    const SpeechRecognition =
      (window as unknown as WindowWithSpeechRecognition).SpeechRecognition ||
      (window as unknown as WindowWithSpeechRecognition).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    setIsSupported(true);
    const recognition = new SpeechRecognition() as SpeechRecognition;
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;

    recognition.onstart = () => {
      setIsListening((prevIsListening) => {
        if (isManuallyStoppedRef.current) {
          if (recognitionRef.current) {
            try {
              recognitionRef.current.stop();
            } catch {
              try {
                recognitionRef.current.abort();
              } catch {
                // Игнорируем ошибки
              }
            }
          }
          return prevIsListening;
        }
        isManuallyStoppedRef.current = false;
        return true;
      });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript && onResult) {
        onResult(finalTranscript.trim(), true);
      }
      if (interimTranscript && onResult) {
        onResult(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMessage = event.error || 'Unknown error occurred';

      if (errorMessage === 'aborted' && isManuallyStoppedRef.current) {
        setIsListening(false);
        return;
      }

      setIsListening(false);

      if (errorMessage === 'no-speech' || errorMessage === 'audio-capture') {
        return;
      }

      if (onError) {
        onError(errorMessage);
      }
    };

    recognition.onend = () => {
      if (isManuallyStoppedRef.current) {
        setIsListening(false);
        return;
      }

      setIsListening(false);

      if (continuous && recognitionRef.current === recognition) {
        try {
          recognition.start();
        } catch {
          // Игнорируем ошибки при перезапуске
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Игнорируем ошибки при остановке
        }
        recognitionRef.current = null;
      }
    };
  }, [language, continuous, interimResults, onResult, onError]);

  const startListening = () => {
    if (!recognitionRef.current || isListening) {
      return;
    }

    isManuallyStoppedRef.current = false;
    try {
      recognitionRef.current.start();
    } catch (error: unknown) {
      setIsListening(false);
      if (error instanceof Error && (error.message.includes('already') || error.name === 'InvalidStateError')) {
        return;
      }
      if (onError) {
        onError('Failed to start speech recognition');
      }
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current || !isListening) {
      return;
    }

    isManuallyStoppedRef.current = true;
    setIsListening(false);

    try {
      // Используем abort() для немедленной остановки без перезапуска
      recognitionRef.current.abort();
    } catch {
      // Если abort() не работает, пробуем stop()
      try {
        recognitionRef.current.stop();
      } catch {
        // Игнорируем ошибки
      }
    }
  };

  const toggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return {
    isListening,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
  };
};
