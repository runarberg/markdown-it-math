import plugin from "./src/plugin.js";

/**
 * @import { MarkdownIt } from "markdown-it";
 * @import { Options as MathupOptions } from "mathup"
 * @import { PluginOptions } from "./src/plugin.js"
 */

const mathup = await import("mathup").then(
  (pkg) => pkg.default,
  () => null,
);

/**
 * @typedef {PluginOptions & { mathupOptions?: MathupOptions }} MarkdownItMathOptions
 * @param {MarkdownIt} md
 * @param {MarkdownItMathOptions} options
 * @returns {void}
 */
export default function markdownItMath(md, { mathupOptions, ...options } = {}) {
  if (!mathup) {
    plugin(md, options);
    return;
  }

  let { blockRenderer, inlineRenderer } = options;

  if (!inlineRenderer && !options.inlineCustomElement) {
    inlineRenderer = (src) => mathup(src, mathupOptions).toString();
  }

  if (!blockRenderer && !options.blockCustomElement) {
    blockRenderer = (src) =>
      mathup(src, { ...mathupOptions, display: "block" }).toString();
  }

  plugin(md, {
    ...options,
    inlineRenderer,
    blockRenderer,
  });
}
