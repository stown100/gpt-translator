import styles from './SwapButton.module.css';

interface SwapButtonProps {
  onClick: () => void;
}

export const SwapButton = ({ onClick }: SwapButtonProps) => {
  return (
    <button className={styles.swapButton} onClick={onClick} aria-label="Swap languages">
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3zM21 9l-3.99-4v3H10v2h7.01v3L21 9z"
          fill="currentColor"
        />
      </svg>
    </button>
  );
};
