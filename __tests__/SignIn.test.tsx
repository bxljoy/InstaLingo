import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignIn from "../app/(auth)/sign-in";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

jest.mock("firebase/auth", () => ({
  signInWithEmailAndPassword: jest.fn(),
  sendEmailVerification: jest.fn(),
  GoogleAuthProvider: {
    credential: jest.fn(),
  },
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(),
    signIn: jest.fn(),
  },
}));

jest.mock("expo-apple-authentication", () => ({
  signInAsync: jest.fn(),
}));

describe("SignIn", () => {
  it("renders correctly", () => {
    const { getByText, getByPlaceholderText, getAllByText } = render(
      <SignIn />
    );
    const signInTexts = getAllByText("Sign In");
    expect(signInTexts.length).toBe(2);
    expect(getByText("Don't have an account? Sign Up")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
  });

  it("handles email/password sign in", async () => {
    const { getByText, getByPlaceholderText, getByTestId } = render(<SignIn />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");

    const signInButton = getByTestId("sign-in-button");
    fireEvent.press(signInButton);

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "test@example.com",
        "password123"
      );
    });
  });

  // Add more tests for Google Sign In, Apple Sign In, and error handling
});
