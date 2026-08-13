"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useLists } from "@/lib/hooks/useLists";
import { useWatchlist } from "@/lib/hooks/useWatchlist";
import { createList } from "@/lib/firebase/lists";
import { AddIcon } from "@/lib/icons";
import { ListPreviewCard } from "@/components/movie/ListPreviewCard";
import { FavoritesSection } from "@/components/movie/FavoritesSection";
import { WatchlistPreviewCard } from "@/components/movie/WatchlistPreviewCard";

export default function ListsPage() {
  const { user } = useAuth();
  const { lists, loading } = useLists();
  const { items: watchlistItems } = useWatchlist();
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name || !user) return;
    setCreating(true);
    try {
      await createList(user.uid, name);
      setNewName("");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Lists</h1>
        <p className="text-sm text-muted">Group movies your own way.</p>
      </div>

      <FavoritesSection />

      <WatchlistPreviewCard items={watchlistItems} />

      <div className="flex flex-col gap-4 border-t border-border pt-6">
        <h2 className="text-base font-semibold">Your lists</h2>

        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New list name..."
            className="flex-1 rounded border border-border bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="flex items-center gap-1.5 rounded bg-accent px-3 py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
          >
            <AddIcon className="h-4 w-4" />
            Create
          </button>
        </form>

        {loading ? (
          <p className="py-16 text-center text-sm text-muted">Loading...</p>
        ) : lists.length === 0 ? (
          <p className="text-sm text-muted">
            No lists yet — create one above to start grouping movies.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {[...lists]
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((list) => (
                <ListPreviewCard key={list.id} list={list} />
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
