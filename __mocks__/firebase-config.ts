const mockAuth = {
  // Add any auth methods you use in your app
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  currentUser: { uid: "testUserId" },
};

const mockDb = {
  // Add any Firestore methods you use
  collection: jest.fn(),
  doc: jest.fn(),
};

export const auth = mockAuth;
export const db = mockDb;

// Mock other exports from your firebase/config if necessary
