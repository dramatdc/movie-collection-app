import Link from "next/link";
import Image from "next/image";
import { useListItems } from "@/lib/hooks/useListItems";
import { posterUrl } from "@/lib/tmdb/image";
import { ListIcon } from "@/lib/icons";
import type { CustomList } from "@/lib/firebase/types";

const PREVIEW_COUNT = 4;

export function ListPreviewCard({ list }: { list: CustomList }) {
  const { items } = useListItems(list.id);
  const preview = [...items].sort((a, b) => b.addedAt - a.addedAt).slice(0, PREVIEW_COUNT);

  return (
    <Link
      href={`/lists/${list.id}`}
      className="flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg shadow-black/40 hover:border-accent"
    >
      <div className="grid h-16 w-16 shrink-0 grid-cols-2 gap-0.5 overflow-hidden rounded-lg bg-surface-hover">
        {preview.length === 0 ? (
          <div className="col-span-2 row-span-2 flex items-center justify-center">
            <ListIcon className="h-6 w-6 text-muted" />
          </div>
        ) : (
          preview.map((item) => {
            const poster = posterUrl(item.posterPath, "w92");
            return (
              <div key={item.tmdbId} className="relative bg-surface-hover">
                {poster && (
                  <Image src={poster} alt={item.title} fill unoptimized className="object-cover" />
                )}
              </div>
            );
          })
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate font-medium">{list.name}</p>
        <p className="text-xs text-muted">
          {items.length} {items.length === 1 ? "movie" : "movies"}
        </p>
      </div>
    </Link>
  );
}
