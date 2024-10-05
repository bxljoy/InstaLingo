import { create } from "zustand";
import { User } from "firebase/auth";

interface State {
  user: User | null;
  isLoading: boolean;
}

interface Action {
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
}

const useStore = create<State & Action>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
}));

export default useStore;
