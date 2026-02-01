import { useState } from 'react';
import { trackCopy } from '@shared/lib/analytics';
import styles from './CopyButton.module.css';

interface CopyButtonProps {
  text: string;
}

export const CopyButton = ({ text }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      trackCopy();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error('Failed to copy text:', err);
      }
    }
  };

  return (
    <button
      className={styles.copyButton}
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy translation'}
    >
      {copied ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
            fill="currentColor"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path
            d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
            fill="currentColor"
          />
        </svg>
      )}
    </button>
  );
};
