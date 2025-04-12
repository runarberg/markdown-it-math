import plugin from "./src/plugin.js";

const temml = await import("temml").then(
  (pkg) => pkg.default,
  () => null,
);

/**
 * @typedef {import("./src/plugin.js").PluginOptions} PluginOptions
 * @typedef {import("temml").Options} TemmlOptions
 * @typedef {object} ExtraOptions
 * @property {TemmlOptions} [temmlOptions] - Options passed into the mathup default renderer.
 * @typedef {PluginOptions & ExtraOptions} MarkdownItMathOptions
 */

/** @type {import("markdown-it").PluginWithOptions<MarkdownItMathOptions>} */
export default function markdownItMath(md, { temmlOptions, ...options } = {}) {
  if (!temml) {
    return plugin(md, options);
  }

  let { blockRenderer, inlineRenderer } = options;

  if (!inlineRenderer && !options.inlineCustomElement) {
    inlineRenderer = (src) => temml.renderToString(src, temmlOptions);
  }

  if (!blockRenderer && !options.blockCustomElement) {
    blockRenderer = (src) =>
      temml.renderToString(src, { ...temmlOptions, displayMode: true });
  }

  return plugin(md, {
    ...options,
    inlineRenderer,
    blockRenderer,
  });
}
