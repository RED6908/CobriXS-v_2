import {
  createContext,
  useContext,
  useCallback,
  type ReactNode,
} from "react";
import type { Store } from "../types/database";

interface StoreContextType {
  currentStore: Store | null;
  currentStoreId: string | null;
  stores: Store[];
  loading: boolean;
  setCurrentStoreId: (id: string | null) => void;
  refetchStores: () => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const value: StoreContextType = {
    currentStore: null,
    currentStoreId: null,
    stores: [],
    loading: false,
    setCurrentStoreId: () => {},
    refetchStores: useCallback(async () => {}, []),
  };

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}
