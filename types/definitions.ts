export interface ExtractedText extends TranslatedEntity {
  id: number;
  timestamp: Date;
}

export interface TranslatedEntity {
  originalText: string;
  originalLanguage: string;
  translatedText: string;
  translatedLanguage: string;
}
