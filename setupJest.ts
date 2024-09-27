jest.mock("firebase/app", () => require("./__mocks__/firebase").default);

jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    data: () => ({ dataCollection: false }),
    exists: () => true,
  }),
  setDoc: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  getAllKeys: jest.fn(),
  multiGet: jest.fn(),
  multiSet: jest.fn(),
  multiRemove: jest.fn(),
}));

jest.mock("@/firebase/config", () => require("./__mocks__/firebase-config"));

jest.mock("firebase/auth", () => ({
  initializeAuth: jest.fn(),
  getReactNativePersistence: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(() =>
    Promise.resolve({ user: { uid: "newuser" } })
  ),
  signOut: jest.fn(),
}));

jest.mock("expo-sqlite", () => ({
  openDatabaseSync: jest.fn().mockReturnValue({
    execAsync: jest.fn().mockResolvedValue({}),
    // Add other methods you use from SQLite here
  }),
}));
