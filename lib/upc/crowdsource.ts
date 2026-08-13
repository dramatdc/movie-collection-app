import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

// Links a barcode that failed (or was rate-limited on) automatic lookup to
// the movie title the user manually confirmed, so the next scan of this same
// barcode is an instant cache hit instead of an API call — turning today's
// "100 lookups/day" cap into "100 never-before-seen barcodes/day, solved
// forever for everyone" over time.
export async function recordUpcResolution(upc: string, title: string) {
  try {
    await setDoc(doc(db, "upc_cache", upc), {
      title,
      lookedUpAt: serverTimestamp(),
      source: "crowdsourced",
    });
  } catch (err) {
    console.error("Failed to record crowdsourced UPC resolution", err);
  }
}
