import { User } from "firebase/auth";
import { StoreApi, UseBoundStore, create } from "zustand";

type WithSelectors<S> = S extends { getState: () => infer T }
  ? S & { use: { [K in keyof T]: () => T[K] } }
  : never;

const createSelectors = <S extends UseBoundStore<StoreApi<object>>>(
  _store: S
) => {
  let store = _store as WithSelectors<typeof _store>;
  store.use = {};
  for (let k of Object.keys(store.getState())) {
    (store.use as any)[k] = () => store((s) => s[k as keyof typeof s]);
  }

  return store;
};

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
