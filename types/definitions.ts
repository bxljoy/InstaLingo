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

export interface UserData {
  apiCalls: number;
  appUsageCount: number;
  dataCollection: boolean;
  geminiApiCalls: number;
  lastResetDate: string;
  lastReviewPrompt: number;
  pushToken: string;
  [key: string]: any;
}
