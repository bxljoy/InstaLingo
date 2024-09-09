import * as SQLite from "expo-sqlite";
import { ExtractedText } from "@/types/definitions";
import { TranslatedEntity } from "@/types/definitions";

const db = SQLite.openDatabaseSync("extractedTexts.db");

export const initDatabase = async () => {
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS extracted_texts (id INTEGER PRIMARY KEY AUTOINCREMENT, original_text TEXT, original_language_code TEXT, translated_text TEXT, translated_language_code TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);"
  );
};

export const clearDatabase = async () => {
  await db.execAsync("DROP TABLE IF EXISTS extracted_texts");
};

export const clearExtractedTexts = async () => {
  await db.execAsync("DELETE FROM extracted_texts");
};

export const deleteExtractedText = async (id: number) => {
  await db.execAsync(`DELETE FROM extracted_texts WHERE id = ${id}`);
};

export const saveExtractedText = async (translatedEntity: TranslatedEntity) => {
  await db.runAsync(
    "INSERT INTO extracted_texts (original_text, original_language_code, translated_text, translated_language_code, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)",
    translatedEntity.originalText,
    translatedEntity.originalLanguage,
    translatedEntity.translatedText,
    translatedEntity.translatedLanguage
  );
};

export const getExtractedTexts = (): Promise<ExtractedText[]> => {
  return new Promise((resolve, reject) => {
    db.withTransactionAsync(async () => {
      try {
        const result = await db.getAllAsync(
          "SELECT * FROM extracted_texts order by id desc"
        );
        const texts: ExtractedText[] = result.map((row: any) => ({
          id: row.id,
          originalText: row.original_text,
          originalLanguage: row.original_language_code,
          translatedText: row.translated_text,
          translatedLanguage: row.translated_language_code,
          timestamp: row.timestamp,
        }));
        resolve(texts);
      } catch (error) {
        console.error("Error getting extracted texts:", error);
        reject(error);
      }
    });
  });
};
