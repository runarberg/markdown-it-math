import plugin from "./src/plugin.js";

/**
 * @import { Options as TemmlOptions } from "temml"
 * @import { PluginOptions } from "./src/plugin.js"
 */

const temml = await import("temml").then(
  (pkg) => pkg.default,
  () => null,
);

/**
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
