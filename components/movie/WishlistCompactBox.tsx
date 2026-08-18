import { CompactMovieBox } from "./CompactMovieBox";

export interface WishlistPreviewItem {
  key: string;
  title: string;
  posterUrl: string | null;
}

export function WishlistCompactBox({
  items,
  loading,
}: {
  items: WishlistPreviewItem[];
  loading?: boolean;
}) {
  return (
    <CompactMovieBox
      title="Wishlist"
      titleHref="/wishlist"
      items={items.map((item) => ({ ...item, href: "/wishlist" }))}
      loading={loading}
      emptyLabel="Nothing on your wishlist yet."
      footerHref="/wishlist"
      footerLabel="+ View Full Wishlist"
    />
  );
}
