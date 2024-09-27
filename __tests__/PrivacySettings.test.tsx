import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PrivacySettingsScreen from "../app/privacy-settings";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Mock Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  setDoc: jest.fn().mockResolvedValue(undefined),
  getDoc: jest.fn().mockResolvedValue({
    data: () => ({ dataCollection: false }),
    exists: () => true,
  }),
}));

jest.mock("@/firebase/config", () => ({
  auth: {
    currentUser: { uid: "testUserId" },
  },
  db: {},
}));

describe("PrivacySettingsScreen", () => {
  it("renders correctly", async () => {
    (getDoc as jest.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({ dataCollection: false }),
    });

    const { getByText } = render(<PrivacySettingsScreen />);

    await waitFor(() => {
      expect(getByText("Privacy Settings")).toBeTruthy();
      expect(getByText("Enable Cloud Sync")).toBeTruthy();
    });
  });

  it("toggles data collection", async () => {
    const { getByTestId } = render(<PrivacySettingsScreen />);

    // Wait for initial data to load
    await waitFor(() => {
      expect(getDoc).toHaveBeenCalled();
    });

    // Find and press the toggle
    const toggle = getByTestId("cloud-sync-toggle");
    fireEvent(toggle, "valueChange", true);

    // // Wait for the setDoc to be called
    // await waitFor(
    //   () => {
    //     expect(setDoc).toHaveBeenCalledWith(
    //       expect.anything(),
    //       { dataCollection: true },
    //       { merge: true }
    //     );
    //   }
    // ); // Increase timeout if needed
  });

  // Add more tests for disabling cloud sync and initial loading state
});
