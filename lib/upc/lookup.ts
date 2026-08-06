import type { UpcLookupResult } from "./server";

export async function lookupUpcClient(code: string): Promise<UpcLookupResult> {
  const res = await fetch(`/api/upc/${encodeURIComponent(code)}`);
  return res.json();
}
