import { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { LANGUAGES } from '@shared/config/languages';
import { getLanguageName } from '@shared/config/languages';
import styles from './LanguageSelector.module.css';

const DROPDOWN_GAP = 4;
const DROPDOWN_MIN_WIDTH = 185;
const DROPDOWN_MAX_HEIGHT = 400;

interface LanguageSelectorProps {
  value: string;
  onChange: (code: string) => void;
}

interface DropdownPosition {
  top?: number;
  bottom?: number;
  left?: number;
  width: number;
}

export const LanguageSelector = ({ value, onChange }: LanguageSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!isOpen) {
      setDropdownPosition(null);
      return;
    }
    if (!triggerRef.current || !dropdownRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const dropdownRect = dropdownRef.current.getBoundingClientRect();
    const dropdownWidth = Math.max(triggerRect.width, DROPDOWN_MIN_WIDTH);
    const dropdownHeight = Math.min(dropdownRect.height, DROPDOWN_MAX_HEIGHT);

    const spaceBelow = window.innerHeight - triggerRect.bottom - DROPDOWN_GAP;
    const spaceAbove = triggerRect.top - DROPDOWN_GAP;
    const spaceRight = window.innerWidth - triggerRect.left;
    const spaceLeft = triggerRect.right;

    const openDown = spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove;
    const alignLeft = spaceRight >= dropdownWidth;
    const alignRight = spaceLeft >= dropdownWidth;

    let left: number;
    if (alignLeft && alignRight) {
      left = triggerRect.left;
    } else if (alignLeft) {
      left = triggerRect.left;
    } else if (alignRight) {
      left = triggerRect.right - dropdownWidth;
    } else {
      left = Math.max(0, Math.min(triggerRect.left, window.innerWidth - dropdownWidth));
    }

    setDropdownPosition({
      ...(openDown ? { top: triggerRect.bottom + DROPDOWN_GAP } : { bottom: window.innerHeight - triggerRect.top + DROPDOWN_GAP }),
      left,
      width: dropdownWidth
    });
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node) &&
          dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLanguages = LANGUAGES.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  const dropdownContent = isOpen && (
    <div
      ref={dropdownRef}
      className={styles.dropdown}
      style={
        dropdownPosition
          ? {
              position: 'fixed',
              top: dropdownPosition.top,
              bottom: dropdownPosition.bottom,
              left: dropdownPosition.left,
              width: dropdownPosition.width,
              visibility: 'visible'
            }
          : { visibility: 'hidden' as const }
      }
    >
          <div className={styles.searchContainer}>
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search languages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className={styles.languageList}>
            {filteredLanguages.map((lang) => (
              <button
                key={lang.code}
                className={`${styles.languageItem} ${value === lang.code ? styles.selected : ''}`}
                onClick={() => handleSelect(lang.code)}
              >
                {lang.name}
              </button>
            ))}
          </div>
        </div>
  );

  return (
    <div className={styles.selector} ref={selectorRef}>
      <button
        ref={triggerRef}
        className={styles.trigger}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className={styles.triggerText}>{getLanguageName(value)}</span>
        <span className={styles.arrow}>{isOpen ? '▲' : '▼'}</span>
      </button>

      {createPortal(dropdownContent, document.body)}
    </div>
  );
};
