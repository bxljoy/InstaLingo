interface LanguageCode {
  tts: string;
  translate: string;
  name: string;
}

const languageCodeMapping: { [key: string]: LanguageCode } = {
  en: { tts: "en-US", translate: "en", name: "English" },
  es: { tts: "es-ES", translate: "es", name: "Spanish" },
  fr: { tts: "fr-FR", translate: "fr", name: "French" },
  de: { tts: "de-DE", translate: "de", name: "German" },
  it: { tts: "it-IT", translate: "it", name: "Italian" },
  ja: { tts: "ja-JP", translate: "ja", name: "Japanese" },
  ko: { tts: "ko-KR", translate: "ko", name: "Korean" },
  pt: { tts: "pt-BR", translate: "pt", name: "Portuguese" },
  ru: { tts: "ru-RU", translate: "ru", name: "Russian" },
  zh: { tts: "cmn-CN", translate: "zh-CN", name: "Chinese (Simplified)" },
  ar: { tts: "ar-XA", translate: "ar", name: "Arabic" },
  hi: { tts: "hi-IN", translate: "hi", name: "Hindi" },
  nl: { tts: "nl-NL", translate: "nl", name: "Dutch" },
  pl: { tts: "pl-PL", translate: "pl", name: "Polish" },
  tr: { tts: "tr-TR", translate: "tr", name: "Turkish" },
  vi: { tts: "vi-VN", translate: "vi", name: "Vietnamese" },
  sv: { tts: "sv-SE", translate: "sv", name: "Swedish" },
  no: { tts: "nb-NO", translate: "no", name: "Norwegian" },
  da: { tts: "da-DK", translate: "da", name: "Danish" },
  fi: { tts: "fi-FI", translate: "fi", name: "Finnish" },
  el: { tts: "el-GR", translate: "el", name: "Greek" },
  he: { tts: "he-IL", translate: "he", name: "Hebrew" },
  id: { tts: "id-ID", translate: "id", name: "Indonesian" },
  ms: { tts: "ms-MY", translate: "ms", name: "Malay" },
  th: { tts: "th-TH", translate: "th", name: "Thai" },
  uk: { tts: "uk-UA", translate: "uk", name: "Ukrainian" },
  cs: { tts: "cs-CZ", translate: "cs", name: "Czech" },
  ro: { tts: "ro-RO", translate: "ro", name: "Romanian" },
  hu: { tts: "hu-HU", translate: "hu", name: "Hungarian" },
  sk: { tts: "sk-SK", translate: "sk", name: "Slovak" },
  sl: { tts: "sl-SI", translate: "sl", name: "Slovenian" },
  bg: { tts: "bg-BG", translate: "bg", name: "Bulgarian" },
  hr: { tts: "hr-HR", translate: "hr", name: "Croatian" },
  lt: { tts: "lt-LT", translate: "lt", name: "Lithuanian" },
  lv: { tts: "lv-LV", translate: "lv", name: "Latvian" },
  mt: { tts: "mt-MT", translate: "mt", name: "Maltese" },
};

export function getTTSLanguageCode(translateCode: string): string {
  return languageCodeMapping[translateCode]?.tts || translateCode;
}

export function getTranslateLanguageCode(ttsCode: string): string {
  const entry = Object.values(languageCodeMapping).find(
    (lang) => lang.tts === ttsCode
  );
  return entry?.translate || ttsCode;
}

export function getLanguageName(code: string): string {
  return languageCodeMapping[code]?.name || code;
}

export function getAllLanguages(): LanguageCode[] {
  return Object.values(languageCodeMapping);
}

export default languageCodeMapping;
