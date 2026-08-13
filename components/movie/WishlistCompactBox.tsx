import { CompactMovieBox } from "./CompactMovieBox";

export interface WishlistPreviewItem {
  key: string;
  title: string;
  posterUrl: string | null;
}

export function WishlistCompactBox({ items }: { items: WishlistPreviewItem[] }) {
  return (
    <CompactMovieBox
      title="Wishlist"
      titleHref="/wishlist"
      items={items.map((item) => ({ ...item, href: "/wishlist" }))}
      emptyLabel="Nothing on your wishlist yet."
      footerHref="/wishlist"
      footerLabel="+ View Full Wishlist"
    />
  );
}
