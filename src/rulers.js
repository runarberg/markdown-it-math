/**
 * @typedef {import("markdown-it/lib/parser_block.mjs").RuleBlock} RuleBlock
 * @typedef {import("markdown-it/lib/parser_inline.mjs").RuleInline} RuleInline
 */

/**
 * @param {object} options
 * @param {Array<[string, string]>} options.delimiters
 * @param {boolean} options.allowWhiteSpacePadding
 * @returns {RuleInline}
 */
export function createInlineMathRule({ delimiters, allowWhiteSpacePadding }) {
  return (state, silent) => {
    const start = state.pos;

    const markers = delimiters.filter(
      ([open]) => open === state.src.slice(start, start + open.length),
    );

    if (markers.length === 0) {
      return false;
    }

    // Scan until the end of the line (or until close marker is found).
    for (const [open, close] of markers) {
      const pos = start + open.length;

      if (
        state.md.utils.isWhiteSpace(state.src.charCodeAt(pos)) &&
        !allowWhiteSpacePadding
      ) {
        // Don’t allow whitespace immediately after open delimiter
        continue;
      }

      const matchStart = state.src.indexOf(close, pos);

      if (matchStart === -1 || pos === matchStart) {
        // Don’t allow empty expressions.
        continue;
      }

      if (
        state.md.utils.isWhiteSpace(state.src.charCodeAt(matchStart - 1)) &&
        !allowWhiteSpacePadding
      ) {
        // Don’t allow whitespace immediately before close delimiter
        continue;
      }

      let content = state.src.slice(pos, matchStart).replaceAll("\n", " ");

      if (allowWhiteSpacePadding) {
        content = content.replace(/^ (.+) $/, "$1");
      }

      if (!silent) {
        const token = state.push("math_inline", "math", 0);

        token.markup = open;
        token.content = content;
      }

      state.pos = matchStart + close.length;

      return true;
    }

    return false;
  };
}

/**
 * @param {Array<[string, string]>} delimiters
 * @returns {RuleBlock}
 */
export function createBlockMathRule(delimiters) {
  return function math_block(state, startLine, endLine, silent) {
    const start = state.bMarks[startLine] + state.tShift[startLine];

    for (const [open, close] of delimiters) {
      let pos = start;
      let max = state.eMarks[startLine];

      if (pos + open.length > max) {
        continue;
      }

      const openDelim = state.src.slice(pos, pos + open.length);

      if (openDelim !== open) {
        continue;
      }

      pos += open.length;
      let firstLine = state.src.slice(pos, max);

      // Since start is found, we can report success here in validation mode
      if (silent) {
        return true;
      }

      let haveEndMarker = false;

      if (firstLine.trim().slice(-close.length) === close) {
        // Single line expression
        firstLine = firstLine.trim().slice(0, -close.length);
        haveEndMarker = true;
      }

      // search end of block
      let nextLine = startLine;
      /** @type {string | undefined} */
      let lastLine;

      for (;;) {
        if (haveEndMarker) {
          break;
        }

        nextLine += 1;

        if (nextLine >= endLine) {
          // unclosed block should be autoclosed by end of document.
          // also block seems to be autoclosed by end of parent
          break;
        }

        pos = state.bMarks[nextLine] + state.tShift[nextLine];
        max = state.eMarks[nextLine];

        if (state.src.slice(pos, max).trim().slice(-close.length) !== close) {
          continue;
        }

        if (state.tShift[nextLine] - state.blkIndent >= 4) {
          // closing block math should be indented less then 4 spaces
          continue;
        }

        const lastLinePos = state.src.slice(0, max).lastIndexOf(close);
        lastLine = state.src.slice(pos, lastLinePos);

        pos += lastLine.length + close.length;

        // make sure tail has spaces only
        pos = state.skipSpaces(pos);

        if (pos < max) {
          continue;
        }

        // found!
        haveEndMarker = true;
      }

      // If math block has heading spaces, they should be removed from its inner block
      const len = state.tShift[startLine];

      state.line = nextLine + (haveEndMarker ? 1 : 0);

      const token = state.push("math_block", "math", 0);
      token.block = true;

      const firstLineContent = firstLine && firstLine.trim() ? firstLine : "";
      const contentLines = state.getLines(startLine + 1, nextLine, len, false);
      const lastLineContent = lastLine && lastLine.trim() ? lastLine : "";

      token.content = `${firstLineContent}${firstLineContent && (contentLines || lastLineContent) ? "\n" : ""}${contentLines}${contentLines && lastLineContent ? "\n" : ""}${lastLineContent}`;
      token.map = [startLine, state.line];
      token.markup = open;

      return true;
    }

    return false;
  };
}
