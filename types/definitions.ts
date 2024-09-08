export interface ExtractedText {
  id: number;
  text: String;
  timestamp: Date;
}

export interface TranslatedEntity {
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  translatedLanguage: string;
}
