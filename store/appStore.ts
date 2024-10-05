import { create } from "zustand";
import { User } from "firebase/auth";

interface State {
  user: User | null;
  isLoading: boolean;
  isPro: boolean;
}

interface Action {
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsPro: (isPro: boolean) => void;
}

const useStore = create<State & Action>((set) => ({
  user: null,
  isLoading: true,
  isPro: false,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsPro: (isPro) => set({ isPro }),
}));

export default useStore;
