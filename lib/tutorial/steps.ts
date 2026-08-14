export interface TutorialStep {
  id: string;
  route: string;
  // data-tutorial attribute value of the element to spotlight; null shows a
  // plain centered card with no cutout, for intro/closing steps.
  selector: string | null;
  title: string;
  body: string;
  // When true, there's no Next button until the user actually presses the
  // highlighted control (see actionDone in TutorialContext) — they can't
  // click past the demo without having tried the real thing, but once
  // they have, Next appears so they move on at their own pace rather than
  // the tour auto-advancing the instant they act.
  requireAction?: boolean;
  // Prefer placing the info card above the highlight rather than below,
  // when there's room — for a target near the top of a section, "below"
  // would sit right on top of the content the step is trying to show off.
  preferAbove?: boolean;
  // When false, the highlighted area itself stays non-interactive (visible
  // but not clickable) — for a step that's purely explaining a feature
  // rather than inviting the user to actually use it right now.
  interactive?: boolean;
  // When true, the region below the highlight is left undimmed (still
  // click-blocked, just not darkened) — for a step where the highlighted
  // control changes content beneath it that the user needs to actually see,
  // rather than the usual single dimmed backdrop everywhere but the target.
  revealBelow?: boolean;
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "welcome",
    route: "/library",
    selector: null,
    title: "Welcome to Hardcopy",
    body: "Quick tour, about a minute. Skip anytime, and you can retake it later from your Profile.",
  },
  {
    id: "nav",
    route: "/library",
    selector: "bottom-nav",
    title: "Getting around",
    body: "Library, Add, Lists, Pick, and Profile are all one tap away down here.",
    interactive: false,
  },
  {
    id: "recently-added",
    route: "/library",
    selector: "recently-added",
    title: "Recently Added",
    body: "Your latest additions show up first, right at the top of your library.",
    interactive: false,
  },
  {
    id: "wishlist",
    route: "/library",
    selector: "wishlist-box",
    title: "Wishlist",
    body: "Movies you want to buy, kept separate from your collection until you actually own them.",
    interactive: false,
  },
  {
    id: "trending",
    route: "/library",
    selector: "trending-box",
    title: "Trending This Week",
    body: "See what's popular right now. Tap a poster to add it to your wishlist, watchlist, or straight to your collection.",
    interactive: false,
  },
  {
    id: "your-collection",
    route: "/library",
    selector: "your-collection",
    title: "Your Collection",
    body: "Everything you own lives here, sorted A-Z. Search it or filter by format and watched status.",
    interactive: false,
  },
  {
    id: "view-toggle",
    route: "/library",
    selector: "view-toggle",
    title: "Card or list view",
    body: "Tap the toggle above to switch between grid and list layout. Give it a try.",
    requireAction: true,
    preferAbove: true,
    revealBelow: true,
  },
  {
    id: "add",
    route: "/add",
    selector: "add-search",
    title: "Adding a movie",
    body: "Search by title to pick the format and shelf location before it's added. Scanning a barcode adds the movie to your collection right away — as Blu-ray by default, which you can change anytime from the movie's page — so you can scan several in a row.",
    interactive: false,
  },
  {
    id: "share-feature",
    route: "/library",
    selector: "movie-added-card",
    title: "Show it off",
    body: "Every time you add a movie, a card like this pops up. Tap Share with friends to copy an image of it, ready to paste straight into a chat — the closest thing to bragging about your rarest pull.",
    interactive: false,
  },
  {
    id: "lists-top",
    route: "/lists",
    selector: "lists-top",
    title: "Favorites & Watchlist",
    body: "Feature up to 4 favorites, and keep a Watchlist of movies you want to watch. That's different from your Wishlist, which is about buying.",
    interactive: false,
  },
  {
    id: "custom-lists",
    route: "/lists",
    selector: "custom-lists",
    title: "Your own lists",
    body: "Group movies however you like: by genre, mood, shelf, anything.",
    interactive: false,
  },
  {
    id: "randomizer",
    route: "/picker",
    selector: "randomizer",
    title: "Pick for me",
    body: "Can't decide? Spin the randomizer. Every movie in your filtered results has a genuinely equal shot at getting picked.",
    interactive: false,
  },
  {
    id: "profile",
    route: "/profile",
    selector: "profile-page",
    title: "Your Profile",
    body: "Turn off sounds or haptics, manage your password, or retake this tour anytime. It's all right here.",
    interactive: false,
  },
];
