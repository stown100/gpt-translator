import styles from './TranslationSkeleton.module.css';

export const TranslationSkeleton = () => {
  return <div className={styles.overlay} aria-hidden />;
};
