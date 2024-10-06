import { User } from "firebase/auth";
import { create } from "zustand";
import { createSelectors } from "./createSelectors";

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

const useStoreBase = create<State & Action>((set) => ({
  user: null,
  isLoading: true,
  isPro: false,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsPro: (isPro) => set({ isPro }),
}));

const useStore = createSelectors(useStoreBase);

export default useStore;
