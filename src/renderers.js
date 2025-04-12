/**
 * @typedef {import("mathup").Options} MathupOptions
 * @typedef {import("markdown-it").default} MarkdownIt
 * @typedef {import("./options.js").CustomElementOption} CustomElementOption
 */

/**
 * @param {CustomElementOption} customElementOption
 * @param {MarkdownIt} md
 * @returns {(src: string) => string}
 */
export function createCustomElementRenderer(customElementOption, md) {
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
 * @param {CustomElementOption | undefined} customElement
 * @param {MarkdownIt} md
 * @returns {(src: string) => string}
 */
export function createInlineRenderer(customElement, md) {
  if (customElement) {
    return createCustomElementRenderer(customElement, md);
  }

  return createCustomElementRenderer(["span", { class: "math inline" }], md);
}

/**
 * @param {CustomElementOption | undefined} customElement
 * @param {MarkdownIt} md
 * @returns {(src: string) => string}
 */
export function createBlockRenderer(customElement, md) {
  if (customElement) {
    return createCustomElementRenderer(customElement, md);
  }

  return createCustomElementRenderer(["div", { class: "math block" }], md);
}
