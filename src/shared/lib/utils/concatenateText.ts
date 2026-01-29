/**
 * Объединяет текущий текст с новым текстом
 * @param current - текущий текст (может быть пустой строкой)
 * @param newText - новый текст для добавления
 * @returns объединенный текст
 */
export const concatenateText = (current: string, newText: string): string => {
  return current ? `${current} ${newText}`.trim() : newText;
};
