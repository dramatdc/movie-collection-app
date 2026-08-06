import Link from "next/link";

export default function AddChoicePage() {
  return (
    <div className="mx-auto flex max-w-sm flex-col gap-4 pt-8">
      <h1 className="text-xl font-semibold">Add a movie</h1>
      <Link
        href="/add/scan"
        className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-emerald-400"
      >
        <span className="font-medium">📷 Scan barcode</span>
        <span className="text-sm text-neutral-400">
          Scan the UPC on the back of a DVD/Blu-ray case.
        </span>
      </Link>
      <Link
        href="/add/search"
        className="flex flex-col gap-1 rounded-lg border border-neutral-800 bg-neutral-900 p-4 hover:border-emerald-400"
      >
        <span className="font-medium">🔎 Search by title</span>
        <span className="text-sm text-neutral-400">
          Type a movie title and pick the right match.
        </span>
      </Link>
    </div>
  );
}
