/**
 * @typedef {import("mathup").Options} MathupOptions
 * @typedef {import("markdown-it").default} MarkdownIt
 * @typedef {import("markdown-it/lib/parser_block.mjs").RuleBlock} RuleBlock
 * @typedef {import("markdown-it/lib/parser_inline.mjs").RuleInline} RuleInline
 * @typedef {import("markdown-it/lib/rules_block/state_block.mjs").default} StateBlock
 * @typedef {import("markdown-it/lib/rules_inline/state_inline.mjs").default} StateInline
 * @typedef {import("markdown-it/lib/token.mjs").default} Token
 */

/** @type {import("mathup").default | undefined} */
let mathup;
try {
  mathup = (await import("mathup")).default;
} catch {
  // pass
}

/**
 * @param {StateInline} state
 * @param {number} start
 * @param {number} delimLength
 * @returns {{ can_open: boolean; can_close: boolean; delims: number }}
 */
function scanDelims(state, start, delimLength) {
  let pos = start;
  const max = state.posMax;

  // treat beginning of the line as a whitespace
  const lastChar = start > 0 ? state.src.charCodeAt(start - 1) : 0x20;

  pos += delimLength;

  const count = pos - start;

  // treat end of the line as a whitespace
  const nextChar = pos < max ? state.src.charCodeAt(pos) : 0x20;

  const left_flanking = !state.md.utils.isWhiteSpace(nextChar);
  const right_flanking = !state.md.utils.isWhiteSpace(lastChar);

  return {
    can_open: left_flanking,
    can_close: right_flanking,
    delims: count,
  };
}

/**
 * @param {string} open
 * @param {string} close
 * @returns {RuleInline}
 */
function createInlineMathRule(open, close) {
  return function math_inline(state, silent) {
    const max = state.posMax;
    const start = state.pos;
    const openDelim = state.src.slice(start, start + open.length);

    if (openDelim !== open) {
      return false;
    }
    if (silent) {
      return false;
    } // Don’t run any pairs in validation mode

    let res = scanDelims(state, start, openDelim.length);
    const startCount = res.delims;

    if (!res.can_open) {
      state.pos += startCount;
      // Earlier we checked !silent, but this implementation does not need it
      state.pending += state.src.slice(start, state.pos);
      return true;
    }

    state.pos = start + open.length;

    /** @type {string | undefined} */
    let closeDelim;
    let found = false;

    while (state.pos < max) {
      closeDelim = state.src.slice(state.pos, state.pos + close.length);
      if (closeDelim === close) {
        res = scanDelims(state, state.pos, close.length);
        if (res.can_close) {
          found = true;
          break;
        }
      }

      state.md.inline.skipToken(state);
    }

    if (!found) {
      // Parser failed to find ending tag, so it is not a valid math
      state.pos = start;
      return false;
    }

    // Found!
    state.posMax = state.pos;
    state.pos = start + close.length;

    // Earlier we checked !silent, but this implementation does not need it
    const token = state.push("math_inline", "math", 0);
    token.content = state.src.slice(state.pos, state.posMax);
    token.markup = open;

    state.pos = state.posMax + close.length;
    state.posMax = max;

    return true;
  };
}

/**
 * @param {string} open
 * @param {string} close
 * @returns {RuleBlock}
 */
function createBlockMathRule(open, close) {
  return function math_block(state, startLine, endLine, silent) {
    let pos = state.bMarks[startLine] + state.tShift[startLine];
    let max = state.eMarks[startLine];

    if (pos + open.length > max) {
      return false;
    }

    const openDelim = state.src.slice(pos, pos + open.length);

    if (openDelim !== open) {
      return false;
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
 * @property {string} [inlineOpen] - Inline math open delimiter.
 * @property {string} [inlineClose] - Inline math close delimeter.
 * @property {CustomElementOption} [inlineCustomElement] - If you want to render to a custom element.
 * @property {MathupOptions} [defaultRendererOptions] - The options passed into the default renderer.
 * @property {Renderer} [inlineRenderer] - Custom renderer for inline math. Default mathup.
 * @property {string} [blockOpen] - Block math open delimter.
 * @property {string} [blockClose] - Block math close delimter.
 * @property {CustomElementOption} [blockCustomElement] - If you want to render to a custom element.
 * @property {Renderer} [blockRenderer] - Custom renderer for block math. Default mathup with display = "block".
 */

/** @type {import("markdown-it").PluginWithOptions<PluginOptions>} */
export default function markdownItMath(
  md,
  {
    inlineOpen = "$",
    inlineClose = "$",
    blockOpen = "$$",
    blockClose = "$$",
    defaultRendererOptions = {},

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
  const inlineMathRule = createInlineMathRule(inlineOpen, inlineClose);
  const blockMathRule = createBlockMathRule(blockOpen, blockClose);

  md.inline.ruler.before("escape", "math_inline", inlineMathRule);
  md.block.ruler.after("blockquote", "math_block", blockMathRule, {
    alt: ["paragraph", "reference", "blockquote", "list"],
  });

  md.renderer.rules.math_inline = (tokens, idx) =>
    inlineRenderer(tokens[idx].content, tokens[idx], md);

  md.renderer.rules.math_block = (tokens, idx) =>
    `${blockRenderer(tokens[idx].content, tokens[idx], md)}\n`;
}
