import { User } from "firebase/auth";
import { create } from "zustand";
import { createSelectors } from "./createSelectors";
import { checkSubscriptionStatus } from "@/lib/revenueCat";

interface appState {
  user: User | null;
  isLoading: boolean;
  isPro: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setIsPro: (isPro: boolean) => void;
}

const useStoreBase = create<appState>((set) => ({
  user: null,
  isLoading: true,
  isPro: false,
  setUser: (user) => set({ user }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setIsPro: (isPro) => set({ isPro }),
}));

const useStore = createSelectors(useStoreBase);

export default useStore;

export const actions = {
  checkProStatus: async () => {
    const { setIsPro } = useStore.getState();
    const status = await checkSubscriptionStatus();
    setIsPro(status);
  },
};
