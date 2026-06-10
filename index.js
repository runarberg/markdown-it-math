import plugin from "./src/plugin.js";

/**
 * @import { Options as MathupOptions } from "mathup"
 * @import { PluginOptions } from "./src/plugin.js"
 */

const mathup = await import("mathup").then(
  (pkg) => pkg.default,
  () => null,
);

/**
 * @typedef {PluginOptions & { mathupOptions?: MathupOptions }} MarkdownItMathOptions
 */

/** @type {import("markdown-it").PluginWithOptions<MarkdownItMathOptions>} */
export default function markdownItMath(md, { mathupOptions, ...options } = {}) {
  if (!mathup) {
    return plugin(md, options);
  }

  let { blockRenderer, inlineRenderer } = options;

  if (!inlineRenderer && !options.inlineCustomElement) {
    inlineRenderer = (src) => mathup(src, mathupOptions).toString();
  }

  if (!blockRenderer && !options.blockCustomElement) {
    blockRenderer = (src) =>
      mathup(src, { ...mathupOptions, display: "block" }).toString();
  }

  return plugin(md, {
    ...options,
    inlineRenderer,
    blockRenderer,
  });
}
