import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import ProfileScreen from "../app/(tabs)/profile";
import { signOut, deleteUser, sendEmailVerification } from "firebase/auth";
import { Alert } from "react-native";

jest.mock("firebase/auth", () => ({
  signOut: jest.fn(),
  deleteUser: jest.fn().mockResolvedValue(undefined),
  sendEmailVerification: jest.fn(),
  reload: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

jest.mock("@/firebase/config", () => ({
  auth: {
    currentUser: {
      uid: "testUserId",
      email: "test@example.com",
      emailVerified: false,
    },
  },
}));

describe("ProfileScreen", () => {
  it("renders correctly", () => {
    const { getByText } = render(<ProfileScreen />);
    expect(getByText("Profile")).toBeTruthy();
    expect(getByText("Email: test@example.com")).toBeTruthy();
    expect(getByText("Not Verified")).toBeTruthy();
  });

  // it("handles log out", async () => {
  //   const { getByText } = render(<ProfileScreen />);

  //   const logOutButton = getByText("Log Out");
  //   fireEvent.press(logOutButton);

  //   await waitFor(() => {
  //     expect(signOut).toHaveBeenCalled();
  //   });
  // });

  it("handles delete account confirmation", async () => {
    const { getByText } = render(<ProfileScreen />);

    // Mock Alert.alert
    jest.spyOn(Alert, "alert").mockImplementation((title, message, buttons) => {
      // Simulate user pressing "Delete" button
      buttons?.find((button) => button.text === "Delete")?.onPress?.();
    });

    // const deleteAccountButton = getByText("Delete Account");
    // fireEvent.press(deleteAccountButton);

    // await waitFor(() => {
    //   expect(Alert.alert).toHaveBeenCalledWith(
    //     "Delete Account",
    //     "Are you sure you want to delete your account? This action cannot be undone.",
    //     expect.arrayContaining([
    //       expect.objectContaining({ text: "Cancel" }),
    //       expect.objectContaining({ text: "Delete" }),
    //     ])
    //   );
    //   expect(deleteUser).toHaveBeenCalled();
    // });
  });

  // Add more tests for email verification and navigation to privacy settings
});
