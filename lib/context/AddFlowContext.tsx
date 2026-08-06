"use client";

import { createContext, useContext, useState } from "react";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

interface AddFlowState {
  candidate: TMDbSearchResult | null;
  setCandidate: (c: TMDbSearchResult | null) => void;
  barcodeUpc: string | null;
  setBarcodeUpc: (upc: string | null) => void;
}

const AddFlowContext = createContext<AddFlowState | null>(null);

export function AddFlowProvider({ children }: { children: React.ReactNode }) {
  const [candidate, setCandidate] = useState<TMDbSearchResult | null>(null);
  const [barcodeUpc, setBarcodeUpc] = useState<string | null>(null);

  return (
    <AddFlowContext.Provider
      value={{ candidate, setCandidate, barcodeUpc, setBarcodeUpc }}
    >
      {children}
    </AddFlowContext.Provider>
  );
}

export function useAddFlow() {
  const ctx = useContext(AddFlowContext);
  if (!ctx) throw new Error("useAddFlow must be used within AddFlowProvider");
  return ctx;
}
