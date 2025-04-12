/**
 * @typedef {import("mathup").Options} MathupOptions
 * @typedef {import("markdown-it").default} MarkdownIt
 * @typedef {import("markdown-it/lib/token.mjs").default} Token
 *
 * @typedef {import("./options.js").CustomElementOption} CustomElementOption
 * @typedef {import("./options.js").Delimiter} Delimiter
 * @typedef {import("./options.js").Renderer} Renderer
 *
 * @typedef {object} PluginOptions
 * @property {string | Delimiter[]} [inlineDelimiters] - Inline math delimiters.
 * @property {string} [inlineOpen] - Deprecated: Use inlineDelimiters
 * @property {string} [inlineClose] - Deprecated: Use inlineDelimiters
 * @property {CustomElementOption} [inlineCustomElement] - If you want to render to a custom element.
 * @property {Renderer} [inlineRenderer] - Custom renderer for inline math. Default mathup.
 * @property {boolean} [inlineAllowWhiteSpacePadding] - If you want allow inline math to start or end with whitespace.
 * @property {string | Delimiter[]} [blockDelimiters] - Block math delimters.
 * @property {string} [blockOpen] - Deprecated: Use blockDelimiters
 * @property {string} [blockClose] - Deprecated: Use blockDelimiters
 * @property {CustomElementOption} [blockCustomElement] - If you want to render to a custom element.
 * @property {Renderer} [blockRenderer] - Custom renderer for block math. Default mathup with display = "block".
 */

import { fromDelimiterOption } from "./options.js";
import { createBlockRenderer, createInlineRenderer } from "./renderers.js";
import { createBlockMathRule, createInlineMathRule } from "./rulers.js";

/** @type {import("markdown-it").PluginWithOptions<PluginOptions>} */
export default function plugin(
  md,
  {
    inlineAllowWhiteSpacePadding = false,
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
    inlineRenderer = createInlineRenderer(inlineCustomElement, md),

    blockCustomElement,
    blockRenderer = createBlockRenderer(blockCustomElement, md),
  } = {},
) {
  const inlineDelimitersArray = fromDelimiterOption(inlineDelimiters);
  if (inlineDelimitersArray) {
    const inlineMathRule = createInlineMathRule({
      delimiters: inlineDelimitersArray,
      allowWhiteSpacePadding: inlineAllowWhiteSpacePadding,
    });

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
