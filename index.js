import plugin from "./src/plugin.js";

const mathup = await import("mathup").then(
  (pkg) => pkg.default,
  () => null,
);

/**
 * @typedef {import("./src/plugin.js").PluginOptions} PluginOptions
 * @typedef {import("mathup").Options} MathupOptions
 * @typedef {object} ExtraOptions
 * @property {MathupOptions} [defaultRendererOptions] - DEPRICATED: use mathupOptions.
 * @property {MathupOptions} [mathupOptions] - Options passed into the mathup default renderer.
 * @typedef {PluginOptions & ExtraOptions} MarkdownItMathOptions
 */

/** @type {import("markdown-it").PluginWithOptions<MarkdownItMathOptions>} */
export default function markdownItMath(
  md,
  {
    defaultRendererOptions,
    mathupOptions = defaultRendererOptions,
    ...options
  } = {},
) {
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
