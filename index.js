/**
 * @typedef {import("mathup").Options} MathupOptions
 * @typedef {import("markdown-it").default} MarkdownIt
 * @typedef {import("markdown-it/lib/parser_block.mjs").RuleBlock} RuleBlock
 * @typedef {import("markdown-it/lib/parser_inline.mjs").RuleInline} RuleInline
 * @typedef {import("markdown-it/lib/rules_block/state_block.mjs").default} StateBlock
 * @typedef {import("markdown-it/lib/rules_inline/state_inline.mjs").default} StateInline
 * @typedef {import("markdown-it/lib/token.mjs").default} Token
 * @typedef {string | [string, string]} Delimiter
 */

/** @type {import("mathup").default | undefined} */
let mathup;
try {
  mathup = (await import("mathup")).default;
} catch {
  // pass
}

/**
 * @param {string | Delimiter[]} delimiters
 * @returns {Array<[string, string]> | null}
 */
function fromDelimiterOption(delimiters) {
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

/**
 * @param {Array<[string, string]>} delimiters
 * @returns {RuleInline}
 */
function createInlineMathRule(delimiters) {
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

      if (state.md.utils.isWhiteSpace(state.src.charCodeAt(pos))) {
        // Don’t allow whitespace immediately after open delimiter ... for now.
        continue;
      }

      const matchStart = state.src.indexOf(close, pos);

      if (matchStart === -1 || pos === matchStart) {
        // Don’t allow empty expressions.
        continue;
      }

      // Don’t allow whitespace immediately before close delimiter ... for now.
      if (state.md.utils.isWhiteSpace(state.src.charCodeAt(matchStart - 1))) {
        continue;
      }

      const content = state.src.slice(pos, matchStart);

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
function createBlockMathRule(delimiters) {
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

/**
 * @typedef {string | [tag: string, attrs?: Record<string, string>]} CustomElementOption
 * @param {CustomElementOption} customElementOption
 * @param {MarkdownIt} md
 * @returns {(src: string) => string}
 */
function createCustomElementRenderer(customElementOption, md) {
  const { escapeHtml } = md.utils;

  /** @type {string} */
  let tag;
  let attrs = "";
  if (typeof customElementOption === "string") {
    tag = customElementOption;
  } else {
    const [tagName, attrsObj = {}] = customElementOption;
    tag = tagName;

    for (const [key, value] of Object.entries(attrsObj)) {
      attrs += ` ${key}="${escapeHtml(value)}"`;
    }
  }

  return (src) => `<${tag}${attrs}>${escapeHtml(src)}</${tag}>`;
}

/**
 * @param {MathupOptions} options
 * @param {MarkdownIt} md
 * @returns {(src: string) => string}
 */
function defaultInlineRenderer(options, md) {
  if (!mathup) {
    return createCustomElementRenderer(["span", { class: "math inline" }], md);
  }

  return (src) => mathup(src, options).toString();
}

/**
 * @param {MathupOptions} options
 * @param {MarkdownIt} md
 * @returns {(src: string) => string}
 */
function defaultBlockRenderer(options, md) {
  if (!mathup) {
    return createCustomElementRenderer(["div", { class: "math block" }], md);
  }

  return (src) => mathup(src, { ...options, display: "block" }).toString();
}

/**
 * @callback Renderer
 * @param {string} src - The source content
 * @param {Token} token - The parsed markdown-it token
 * @param {MarkdownIt} md - The markdown-it instance
 * @typedef {object} PluginOptions
 * @property {string | Delimiter[]} [inlineDelimiters] - Inline math delimiters.
 * @property {string} [inlineOpen] - Deprecated: Use inlineDelimiters
 * @property {string} [inlineClose] - Deprecated: Use inlineDelimiters
 * @property {CustomElementOption} [inlineCustomElement] - If you want to render to a custom element.
 * @property {Renderer} [inlineRenderer] - Custom renderer for inline math. Default mathup.
 * @property {string | Delimiter[]} [blockDelimiters] - Block math delimters.
 * @property {string} [blockOpen] - Deprecated: Use blockDelimiters
 * @property {string} [blockClose] - Deprecated: Use blockDelimiters
 * @property {CustomElementOption} [blockCustomElement] - If you want to render to a custom element.
 * @property {Renderer} [blockRenderer] - Custom renderer for block math. Default mathup with display = "block".
 * @property {MathupOptions} [defaultRendererOptions] - The options passed into the default renderer.
 */

/** @type {import("markdown-it").PluginWithOptions<PluginOptions>} */
export default function markdownItMath(
  md,
  {
    defaultRendererOptions = {},

    inlineOpen,
    inlineClose,
    inlineDelimiters = inlineOpen && inlineClose
      ? /** @type {Delimiter[]} */ ([[inlineOpen, inlineClose]])
      : /** @type {Delimiter[]} */ (["$", ["$`", "`$"]]),

    blockOpen,
    blockClose,
    blockDelimiters = blockOpen && blockClose
      ? /** @type {Delimiter[]} */ ([[blockOpen, blockClose]])
      : "$$",

    inlineCustomElement,
    inlineRenderer = inlineCustomElement
      ? createCustomElementRenderer(inlineCustomElement, md)
      : defaultInlineRenderer(defaultRendererOptions, md),

    blockCustomElement,
    blockRenderer = blockCustomElement
      ? createCustomElementRenderer(blockCustomElement, md)
      : defaultBlockRenderer(defaultRendererOptions, md),
  } = {},
) {
  const inlineDelimitersArray = fromDelimiterOption(inlineDelimiters);
  if (inlineDelimitersArray) {
    const inlineMathRule = createInlineMathRule(inlineDelimitersArray);

    md.inline.ruler.before("escape", "math_inline", inlineMathRule);

    md.renderer.rules.math_inline = (tokens, idx) =>
      inlineRenderer(tokens[idx].content, tokens[idx], md);
  }

  const blockDelitiersArray = fromDelimiterOption(blockDelimiters);
  if (blockDelitiersArray) {
    const blockMathRule = createBlockMathRule(blockDelitiersArray);

    md.block.ruler.after("blockquote", "math_block", blockMathRule, {
      alt: ["paragraph", "reference", "blockquote", "list"],
    });

    md.renderer.rules.math_block = (tokens, idx) =>
      `${blockRenderer(tokens[idx].content, tokens[idx], md)}\n`;
  }
}
