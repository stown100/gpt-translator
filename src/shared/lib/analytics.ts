/**
 * Analytics layer: Google Analytics 4 + Yandex Metrika
 * Отправка кастомных событий для отслеживания действий пользователей.
 */

const YM_COUNTER_ID = 106567961;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    ym?: (id: number, action: string, ...args: unknown[]) => void;
  }
}

/** Отправка события в GA4 */
function sendToGA4(eventName: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
}

/** Отправка цели в Яндекс.Метрику */
function sendToYM(targetName: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.ym) {
    window.ym(YM_COUNTER_ID, 'reachGoal', targetName, params);
  }
}

/** Отправка события в оба сервиса */
function track(eventName: string, ymTarget?: string, params?: Record<string, string | number>) {
  sendToGA4(eventName, params);
  sendToYM(ymTarget ?? eventName, params);
}

/**
 * Успешный перевод выполнен
 * @param sourceLang — исходный язык (или 'auto')
 * @param targetLang — целевой язык
 */
export function trackTranslation(sourceLang: string, targetLang: string) {
  track('translation_done', 'translation_done', {
    source_language: sourceLang,
    target_language: targetLang,
  });
}

/** Пользователь использовал голосовой ввод */
export function trackVoiceInput() {
  track('voice_input_used', 'voice_input_used');
}

/** Пользователь скопировал результат перевода */
export function trackCopy() {
  track('text_copied', 'text_copied');
}

/** Пользователь очистил текст */
export function trackClear() {
  track('text_cleared', 'text_cleared');
}

/** Пользователь поменял языки местами */
export function trackSwap() {
  track('languages_swapped', 'languages_swapped');
}
