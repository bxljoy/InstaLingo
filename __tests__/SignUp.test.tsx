import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import SignUp from "../app/(auth)/sign-up";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";

jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn().mockResolvedValue({}),
  sendEmailVerification: jest.fn(),
}));

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

describe("SignUp", () => {
  it("renders correctly", () => {
    const { getByText, getByPlaceholderText, getAllByText } = render(
      <SignUp />
    );
    const signUpTexts = getAllByText("Sign Up");
    expect(signUpTexts.length).toBe(2);
    expect(getByText("Already have an account? Sign In")).toBeTruthy();
    expect(getByPlaceholderText("Email")).toBeTruthy();
    expect(getByPlaceholderText("Password")).toBeTruthy();
    expect(getByPlaceholderText("Confirm Password")).toBeTruthy();
  });

  it("handles sign up", async () => {
    const { getByPlaceholderText, getByTestId } = render(<SignUp />);

    fireEvent.changeText(getByPlaceholderText("Email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Password"), "password123");
    fireEvent.changeText(
      getByPlaceholderText("Confirm Password"),
      "password123"
    );

    const signUpButton = getByTestId("sign-up-button");
    fireEvent.press(signUpButton);

    // Wait for the async operation to complete
    await waitFor(
      () => {
        expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
          expect.anything(),
          "test@example.com",
          "password123"
        );
      },
      { timeout: 5000 }
    ); // Increase timeout if needed
  });

  // Add more tests for password mismatch and error handling
});
