"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLists } from "@/lib/hooks/useLists";
import { useListItems } from "@/lib/hooks/useListItems";
import { addItemToList, removeItemFromList, deleteList } from "@/lib/firebase/lists";
import { TMDbSearchResults } from "@/components/movie/TMDbSearchResults";
import { CloseIcon } from "@/lib/icons";
import { posterUrl } from "@/lib/tmdb/image";
import { useConfirm } from "@/components/ui/ConfirmDialog";
import { BackButton } from "@/components/ui/BackButton";
import type { TMDbSearchResult } from "@/lib/tmdb/types";

export default function ListDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const { lists } = useLists();
  const { items, loading } = useListItems(id);
  const [searchQuery, setSearchQuery] = useState("");
  const confirmDialog = useConfirm();

  const list = lists.find((l) => l.id === id);
  const listedTmdbIds = useMemo(() => new Set(items.map((i) => i.tmdbId)), [items]);

  function handleAdd(result: TMDbSearchResult) {
    if (!user) return;
    addItemToList(user.uid, id, {
      tmdbId: result.id,
      title: result.title,
      posterPath: result.poster_path,
      year: result.release_date ? Number(result.release_date.slice(0, 4)) : null,
    });
  }

  function handleRemove(tmdbId: number) {
    if (!user) return;
    removeItemFromList(user.uid, id, tmdbId);
  }

  async function handleDeleteList() {
    if (!user || !list) return;
    const confirmed = await confirmDialog({
      title: "Delete this list?",
      message: `"${list.name}" and everything in it will be deleted. This can't be undone.`,
      confirmLabel: "Delete",
      tone: "danger",
    });
    if (!confirmed) return;
    await deleteList(user.uid, id);
    router.push("/lists");
  }

  const sorted = useMemo(() => [...items].sort((a, b) => b.addedAt - a.addedAt), [items]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <BackButton fallbackHref="/lists" />
      <div>
        <h1 className="text-xl font-semibold">{list?.name ?? "List"}</h1>
        <p className="text-sm text-muted">
          {loading ? "Loading..." : `${sorted.length} ${sorted.length === 1 ? "movie" : "movies"}`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide">
          Search to add
        </h2>
        <input
          type="text"
          placeholder="e.g. The Matrix"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="rounded border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
        />
        <TMDbSearchResults
          query={searchQuery}
          onSelect={handleAdd}
          onAddToWishlist={handleAdd}
          wishlistTmdbIds={listedTmdbIds}
          addLabel="Add to list"
          addedLabel="In list"
        />
      </div>

      <div className="flex flex-col gap-3 border-t border-border pt-6">
        {!loading && sorted.length === 0 && (
          <p className="text-sm text-muted">
            Nothing here yet — search above to add movies to this list.
          </p>
        )}

        <div className="grid grid-cols-3 gap-4">
          {sorted.map((item) => {
            const poster = posterUrl(item.posterPath, "w342");
            return (
              <div key={item.tmdbId} className="flex flex-col gap-1.5">
                <div className="relative aspect-2/3 overflow-hidden rounded-xl bg-surface-hover shadow-lg shadow-black/40">
                  {poster ? (
                    <Image src={poster} alt={item.title} fill unoptimized className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted">
                      {item.title}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(item.tmdbId)}
                    aria-label={`Remove ${item.title} from list`}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="truncate text-xs font-medium">{item.title}</p>
                {item.year && <p className="text-xs text-muted">{item.year}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDeleteList}
        className="w-fit rounded border border-red-800 px-3 py-1.5 text-sm text-red-400 hover:bg-red-950"
      >
        Delete this list
      </button>
    </div>
  );
}
