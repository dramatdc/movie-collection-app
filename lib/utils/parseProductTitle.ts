const NOISE_PATTERNS = [
  /\b4k\s*ultra\s*hd\b/gi,
  /\b4k\s*uhd\b/gi,
  /\bultra\s*hd\b/gi,
  /\bblu-?ray\b/gi,
  /\bdvd\b/gi,
  /\bdigital\s*(hd|copy|code)?\b/gi,
  /\bsteelbook\b/gi,
  /\bwidescreen\b/gi,
  /\bfullscreen\b/gi,
  /\bunrated\b/gi,
  /\bextended\s*(cut|edition)?\b/gi,
  /\bdirector'?s\s*cut\b/gi,
  /\bspecial\s*edition\b/gi,
  /\bcollector'?s\s*edition\b/gi,
  /\banniversary\s*edition\b/gi,
  /\b\d+\s*disc(s)?\b/gi,
  /\+\s*digital/gi,
  /\[.*?\]/g,
  /\(.*?\)/g,

  // Studio/distributor names — UPC product titles from retail databases
  // routinely tack these on, which otherwise dilutes the TMDb search
  // enough that the actual movie doesn't surface (e.g. "Tarzan Walt
  // Disney Pictures" not matching "Tarzan").
  /\bwalt\s*disney\s*(pictures|studios|home\s*(entertainment|video))?\b/gi,
  /\bdisney\s*(pictures|studios|home\s*(entertainment|video))?\b/gi,
  /\bpixar\b/gi,
  /\bwarner\s*(bros\.?|brothers)\s*(pictures|studios|home\s*(entertainment|video))?\b/gi,
  /\buniversal\s*(pictures|studios)?\s*(home\s*(entertainment|video))?\b/gi,
  /\bsony\s*pictures\s*(home\s*entertainment|classics)?\b/gi,
  /\bparamount\s*(pictures|home\s*entertainment)?\b/gi,
  /\b(20th|twentieth)\s*century\s*(fox|studios)?\b/gi,
  /\bfox\s*searchlight\b/gi,
  /\bmetro-goldwyn-mayer\b/gi,
  /\bmgm\b/gi,
  /\blions?\s*gate\b/gi,
  /\bnew\s*line\s*cinema\b/gi,
  /\bdreamworks\s*(pictures|animation)?\b/gi,
  /\bcolumbia\s*pictures\b/gi,
  /\btristar\s*pictures\b/gi,
  /\btouchstone\s*pictures\b/gi,
  /\bmiramax\b/gi,
  /\bfocus\s*features\b/gi,
  /\ba24\b/gi,
  /\bbuena\s*vista\b/gi,
  /\brko\s*(radio\s*)?pictures\b/gi,
  /\bunited\s*artists\b/gi,
  /\brepublic\s*pictures\b/gi,
  /\bartisan\s*entertainment\b/gi,
  /\bhollywood\s*pictures\b/gi,
  /\bsummit\s*entertainment\b/gi,
  /\bstudiocanal\b/gi,
  /\bweinstein\s*company\b/gi,
];

/** Strips retail packaging noise ("Blu-ray", "4K UHD", "(Steelbook)") from a
 * UPC lookup's product title so it searches cleanly against TMDb. */
export function parseProductTitle(rawTitle: string): string {
  let cleaned = rawTitle;
  for (const pattern of NOISE_PATTERNS) {
    cleaned = cleaned.replace(pattern, " ");
  }
  cleaned = cleaned
    .replace(/[-:]\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
  return cleaned || rawTitle.trim();
}
