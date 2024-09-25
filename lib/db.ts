import * as SQLite from "expo-sqlite";
import { ExtractedText } from "@/types/definitions";
import { TranslatedEntity } from "@/types/definitions";
import {
  doc,
  getDoc,
  collection,
  setDoc,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";
import { db as firestoreDb } from "@/firebase/config";

const db = SQLite.openDatabaseSync("extractedTexts.db");

export const initDatabase = async () => {
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS extracted_texts (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT, original_text TEXT, original_language_code TEXT, translated_text TEXT, translated_language_code TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);"
  );
};

export const clearDatabase = async () => {
  await db.execAsync("DROP TABLE IF EXISTS extracted_texts");
};

export const clearExtractedTexts = async (userId: string) => {
  await db.runAsync("DELETE FROM extracted_texts WHERE user_id = ?", [userId]);
};

export const deleteExtractedText = async (
  userId: string,
  id: string | number
) => {
  await db.runAsync(
    "DELETE FROM extracted_texts WHERE id = ? AND user_id = ?",
    [id, userId]
  );
};

export const saveExtractedText = async (
  userId: string,
  translatedEntity: TranslatedEntity
) => {
  // Generate a unique ID
  const uniqueId = Date.now().toString();

  // Check if Cloud Sync is enabled
  const cloudSyncEnabled = await isCloudSyncEnabled(userId);

  if (cloudSyncEnabled) {
    // Save to Firestore
    const extractedTextRef = doc(
      collection(firestoreDb, "users", userId, "extractedTexts"),
      uniqueId // Use the same uniqueId here
    );
    await setDoc(extractedTextRef, {
      id: uniqueId,
      ...translatedEntity,
      timestamp: serverTimestamp(),
    });
  } else {
    // Save to local SQLite database
    await db.runAsync(
      "INSERT INTO extracted_texts (id, user_id, original_text, original_language_code, translated_text, translated_language_code, timestamp) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)",
      uniqueId,
      userId,
      translatedEntity.originalText,
      translatedEntity.originalLanguage,
      translatedEntity.translatedText,
      translatedEntity.translatedLanguage
    );
  }
};

export const getExtractedTexts = (userId: string): Promise<ExtractedText[]> => {
  return new Promise((resolve, reject) => {
    db.withTransactionAsync(async () => {
      try {
        const result = await db.getAllAsync(
          "SELECT * FROM extracted_texts WHERE user_id = ? ORDER BY id DESC",
          userId
        );
        const texts: ExtractedText[] = result.map((row: any) => ({
          id: row.id,
          userId: row.user_id,
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

export const isCloudSyncEnabled = async (userId: string): Promise<boolean> => {
  const userDocRef = doc(firestoreDb, "users", userId);
  const userDoc = await getDoc(userDocRef);
  return userDoc.exists() && userDoc.data().dataCollection === true;
};

export const deleteExtractedTextFromCloud = async (
  userId: string,
  id: string | number
) => {
  try {
    const userRef = doc(firestoreDb, "users", userId);
    const extractedTextRef = doc(userRef, "extractedTexts", id.toString());

    const docSnapshot = await getDoc(extractedTextRef);

    if (docSnapshot.exists()) {
      await deleteDoc(extractedTextRef);
    } else {
      console.log(`Document with id ${id} not found in Firestore.`);
    }
  } catch (error) {
    console.error("Error deleting from cloud:", error);
    throw error;
  }
};
