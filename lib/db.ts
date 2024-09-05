import * as SQLite from "expo-sqlite";
import { ExtractedText } from "@/types/definitions";

const db = SQLite.openDatabaseSync("extractedTexts.db");

export const initDatabase = async () => {
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS extracted_texts (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);"
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

export const saveExtractedText = async (text: string) => {
  const result = await db.runAsync(
    "INSERT INTO extracted_texts (text, timestamp) VALUES (?, CURRENT_TIMESTAMP)",
    text
  );
  console.log("result", result);
  console.log(result.lastInsertRowId, result.changes);
};

export const getExtractedTexts = (): Promise<ExtractedText[]> => {
  console.log("getExtractedTexts");
  return new Promise((resolve, reject) => {
    db.withTransactionAsync(async () => {
      try {
        const result = await db.getAllAsync(
          "SELECT * FROM extracted_texts order by id desc"
        );
        const texts: ExtractedText[] = result.map((row: any) => ({
          id: row.id,
          text: row.text,
          timestamp: row.timestamp,
        }));
        resolve(texts);
      } catch (error) {
        reject(error);
      }
    });
  });
};
