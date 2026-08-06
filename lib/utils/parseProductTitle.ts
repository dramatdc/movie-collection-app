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
