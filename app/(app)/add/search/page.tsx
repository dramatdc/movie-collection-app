"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TMDbSearchResults } from "@/components/movie/TMDbSearchResults";
import { useAddFlow } from "@/lib/context/AddFlowContext";

export default function SearchAddPage() {
  const [query, setQuery] = useState("");
  const { setCandidate, setBarcodeUpc } = useAddFlow();
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4">
      <h1 className="text-xl font-semibold">Search by title</h1>
      <input
        autoFocus
        type="text"
        placeholder="e.g. The Matrix"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="rounded border border-neutral-700 bg-neutral-950 px-3 py-2 text-sm"
      />
      <TMDbSearchResults
        query={query}
        onSelect={(result) => {
          setBarcodeUpc(null);
          setCandidate(result);
          router.push("/add/confirm");
        }}
      />
    </div>
  );
}
