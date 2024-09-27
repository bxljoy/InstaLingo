import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import LearnScreen from "../app/(study)/learn";
import { translateText } from "@/lib/googleTranslate";
import { saveExtractedText } from "@/lib/db";

// Mock the necessary dependencies
jest.mock("expo-router", () => ({
  useRouter: () => ({
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({
    extractedText: "Sample extracted text",
  }),
}));

jest.mock("@/lib/googleTranslate", () => ({
  translateText: jest.fn(),
}));

jest.mock("@/lib/db", () => ({
  initDatabase: jest.fn(),
  saveExtractedText: jest.fn(),
}));

jest.mock("@/lib/apiWrapper", () => ({
  apiWrapper: (fn: () => any) => fn(),
}));

jest.mock("@/firebase/config", () => ({
  auth: {
    currentUser: { uid: "testUserId" },
  },
}));

describe("LearnScreen", () => {
  it("renders correctly", () => {
    const { getByText } = render(<LearnScreen />);
    expect(getByText("Extracted Text:")).toBeTruthy();
    expect(getByText("Sample extracted text")).toBeTruthy();
  });

  it("handles translation", async () => {
    const { getByText } = render(<LearnScreen />);
    const translateButton = getByText("Translate");

    (translateText as jest.Mock).mockResolvedValue({
      translatedText: "Translated sample text",
      originalLanguage: "en",
      translatedLanguage: "es",
    });

    fireEvent.press(translateButton);

    await waitFor(() => {
      expect(getByText("Translated Text:")).toBeTruthy();
      expect(getByText("Translated sample text")).toBeTruthy();
    });
  });

  it("handles saving", async () => {
    const { getByText } = render(<LearnScreen />);
    const saveButton = getByText("Save");

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(saveExtractedText).toHaveBeenCalledWith(
        "testUserId",
        expect.any(Object)
      );
      expect(getByText("Saved Successfully!")).toBeTruthy();
    });
  });
});
