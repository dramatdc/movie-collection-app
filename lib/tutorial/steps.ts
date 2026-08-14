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
  },
  {
    id: "recently-added",
    route: "/library",
    selector: "recently-added",
    title: "Recently Added",
    body: "Your latest additions show up first, right at the top of your library.",
  },
  {
    id: "wishlist",
    route: "/library",
    selector: "wishlist-box",
    title: "Wishlist",
    body: "Movies you want to buy, kept separate from your collection until you actually own them.",
  },
  {
    id: "trending",
    route: "/library",
    selector: "trending-box",
    title: "Trending This Week",
    body: "See what's popular right now. Tap a poster to add it to your wishlist, watchlist, or straight to your collection.",
  },
  {
    id: "your-collection",
    route: "/library",
    selector: "your-collection",
    title: "Your Collection",
    body: "Everything you own lives here, sorted A-Z. Search it or filter by format and watched status.",
  },
  {
    id: "view-toggle",
    route: "/library",
    selector: "view-toggle",
    title: "Card or list view",
    body: "Tap the toggle above to switch between grid and list layout. Give it a try.",
    requireAction: true,
    preferAbove: true,
  },
  {
    id: "add",
    route: "/add",
    selector: "add-search",
    title: "Adding a movie",
    body: "Search by title for something you own. Scanning the barcode works too, but search is quicker since barcode lookups are limited each day. Either way, you'll pick the format and shelf location next.",
    interactive: false,
  },
  {
    id: "lists-top",
    route: "/lists",
    selector: "lists-top",
    title: "Favorites & Watchlist",
    body: "Feature up to 4 favorites, and keep a Watchlist of movies you want to watch. That's different from your Wishlist, which is about buying.",
  },
  {
    id: "custom-lists",
    route: "/lists",
    selector: "custom-lists",
    title: "Your own lists",
    body: "Group movies however you like: by genre, mood, shelf, anything.",
  },
  {
    id: "randomizer",
    route: "/picker",
    selector: "randomizer",
    title: "Pick for me",
    body: "Can't decide? Spin the randomizer. Every movie in your filtered results has a genuinely equal shot at getting picked.",
  },
  {
    id: "profile",
    route: "/profile",
    selector: "profile-page",
    title: "Your Profile",
    body: "Turn off sounds or haptics, manage your password, or retake this tour anytime. It's all right here.",
  },
];
