/**
 * Преобразует код языка в формат, поддерживаемый Web Speech API
 */
export const languageToSpeechCode = (languageCode: string): string => {
  // Если язык уже в формате BCP 47, возвращаем как есть
  if (languageCode.includes('-')) {
    return languageCode;
  }

  // Маппинг основных языков
  const languageMap: Record<string, string> = {
    'en': 'en-US',
    'es': 'es-ES',
    'fr': 'fr-FR',
    'de': 'de-DE',
    'it': 'it-IT',
    'pt': 'pt-BR',
    'ru': 'ru-RU',
    'ja': 'ja-JP',
    'ko': 'ko-KR',
    'zh': 'zh-CN',
    'zh-TW': 'zh-TW',
    'ar': 'ar-SA',
    'hi': 'hi-IN',
    'tr': 'tr-TR',
    'pl': 'pl-PL',
    'nl': 'nl-NL',
    'sv': 'sv-SE',
    'da': 'da-DK',
    'fi': 'fi-FI',
    'no': 'nb-NO',
    'cs': 'cs-CZ',
    'ro': 'ro-RO',
    'hu': 'hu-HU',
    'el': 'el-GR',
    'bg': 'bg-BG',
    'hr': 'hr-HR',
    'sk': 'sk-SK',
    'sl': 'sl-SI',
    'sr': 'sr-RS',
    'uk': 'uk-UA',
    'vi': 'vi-VN',
    'th': 'th-TH',
    'id': 'id-ID',
    'ms': 'ms-MY',
    'he': 'he-IL',
    'fa': 'fa-IR',
    'ur': 'ur-PK',
    'bn': 'bn-BD',
    'ta': 'ta-IN',
    'te': 'te-IN',
    'ml': 'ml-IN',
    'kn': 'kn-IN',
    'gu': 'gu-IN',
    'pa': 'pa-IN',
    'mr': 'mr-IN',
  };

  return languageMap[languageCode] || 'en-US';
};
