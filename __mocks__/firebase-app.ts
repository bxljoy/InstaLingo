const firebaseAppMock = {
  auth: jest.fn(() => ({
    signInWithEmailAndPassword: jest.fn(() =>
      Promise.resolve({ user: { uid: "testuid" } })
    ),
    createUserWithEmailAndPassword: jest.fn(() =>
      Promise.resolve({ user: { uid: "newuser" } })
    ),
    signOut: jest.fn(() => Promise.resolve()),
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() =>
          Promise.resolve({ data: () => ({ id: "1", name: "Test" }) })
        ),
        set: jest.fn(() => Promise.resolve()),
      })),
    })),
  })),
  initializeApp: jest.fn(),
};

export default firebaseAppMock;
