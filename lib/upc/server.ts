import "server-only";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { parseProductTitle } from "@/lib/utils/parseProductTitle";

export type UpcLookupResult =
  | { status: "found"; upc: string; rawTitle: string; searchTitle: string; cached: boolean }
  | { status: "not_found"; upc: string }
  | { status: "rate_limited"; upc: string };

export async function lookupUpc(upc: string): Promise<UpcLookupResult> {
  const cacheRef = doc(db, "upc_cache", upc);
  const cached = await getDoc(cacheRef);
  if (cached.exists()) {
    const rawTitle = cached.data().title as string;
    return {
      status: "found",
      upc,
      rawTitle,
      searchTitle: parseProductTitle(rawTitle),
      cached: true,
    };
  }

  const res = await fetch(
    `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(upc)}`,
    { headers: { Accept: "application/json" } }
  );

  if (res.status === 429) {
    return { status: "rate_limited", upc };
  }

  if (!res.ok) {
    return { status: "not_found", upc };
  }

  const data = await res.json();
  const item = data?.items?.[0];
  if (!item?.title) {
    return { status: "not_found", upc };
  }

  await setDoc(cacheRef, {
    title: item.title,
    lookedUpAt: serverTimestamp(),
    source: "upcitemdb",
  });

  return {
    status: "found",
    upc,
    rawTitle: item.title,
    searchTitle: parseProductTitle(item.title),
    cached: false,
  };
}
