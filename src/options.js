/**
 * @typedef {string | [string, string]} Delimiter
 * @typedef {string | [tag: string, attrs?: Record<string, string>]} CustomElementOption
 * @callback Renderer
 * @param {string} src - The source content
 * @param {Token} token - The parsed markdown-it token
 * @param {MarkdownIt} md - The markdown-it instance
 */

/**
 * @param {string | Delimiter[]} delimiters
 * @returns {Array<[string, string]> | null}
 */
export function fromDelimiterOption(delimiters) {
  if (typeof delimiters === "string") {
    if (delimiters.length === 0) {
      return null;
    }

    return [[delimiters, delimiters]];
  }

  /** @type {Array<[string, string]>} */
  const pairs = [];
  for (const pair of delimiters) {
    if (typeof pair === "string") {
      if (pair.length === 0) {
        continue;
      }

      pairs.push([pair, pair]);
    } else {
      if (pair[0].length === 0 || pair[1].length === 0) {
        continue;
      }

      pairs.push(pair);
    }
  }

  if (pairs.length === 0) {
    return null;
  }

  // Make sure we match longer variants first.
  return pairs.sort(([a], [b]) => b.length - a.length);
}
