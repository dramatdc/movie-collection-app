"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useMovies } from "@/lib/hooks/useMovies";
import { signOut } from "@/lib/firebase/auth";

export default function ProfilePage() {
  const { user } = useAuth();
  const { movies } = useMovies();
  const router = useRouter();

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Profile</h1>
        <p className="text-sm text-neutral-400">{user?.email}</p>
      </div>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 text-sm">
        <p className="text-neutral-300">{movies.length} movies in your collection</p>
      </div>

      <button
        type="button"
        onClick={async () => {
          await signOut();
          router.replace("/login");
        }}
        className="w-fit rounded border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 hover:bg-neutral-900"
      >
        Sign out
      </button>

      <p className="text-xs leading-relaxed text-neutral-500">
        This product uses the TMDb API but is not endorsed or certified by
        TMDb.
      </p>
    </div>
  );
}
