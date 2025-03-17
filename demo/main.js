import markdownIt from "markdown-it";
import markdownItMath from "markdown-it-math";
import temml from "temml";

// import stylesheet from "mathup/dist/mathup.css" with { type: "css" };
const mathupStylesheet = new CSSStyleSheet();
fetch(import.meta.resolve("mathup/mathup.css"))
  .then((r) => r.text())
  .then((text) => mathupStylesheet.replace(text));

const temmlStylesheet = new CSSStyleSheet();
fetch(import.meta.resolve("temml/Temml-Local.css"))
  .then((r) => r.text())
  .then((text) => temmlStylesheet.replace(text));

const inputs = document.getElementById("inputs");

if (!(inputs instanceof HTMLFormElement)) {
  throw new Error("playground not in DOM");
}

const textInput = inputs.elements.namedItem("markdown");
const rendererControl = inputs.elements.namedItem("renderer");
const fontSelect = inputs.elements.namedItem("font");
const inlineDelimitersInput = inputs.elements.namedItem("inline-delimiters");
const blockDelimitersInput = inputs.elements.namedItem("block-delimiters");
const output = document.getElementById("output");

if (
  !(textInput instanceof HTMLTextAreaElement) ||
  !(fontSelect instanceof HTMLSelectElement) ||
  !(rendererControl instanceof RadioNodeList) ||
  !(inlineDelimitersInput instanceof HTMLInputElement) ||
  !(blockDelimitersInput instanceof HTMLInputElement) ||
  !(output instanceof HTMLElement)
) {
  throw new Error("playground not in DOM");
}

{
  const { searchParams } = new URL(window.location.href);

  if (searchParams.has("latex")) {
    rendererControl.value = "temml";
  }
}

let renderer = rendererControl.value === "temml" ? "temml" : "mathml";

/**
 * @param {unknown} thing
 * @returns {thing is string | import("../index.js").Delimiter[]}
 */
function isValidDelimiters(thing) {
  if (typeof thing === "string") {
    return true;
  }

  if (Array.isArray(thing)) {
    for (const item of thing) {
      if (typeof item === "string") {
        continue;
      }

      if (Array.isArray(item) && item.length === 2) {
        const [a, b] = item;
        if (typeof a === "string" && typeof b === "string") {
          continue;
        }
      }

      return false;
    }
  }

  return true;
}

/** @type {string | import("../index.js").Delimiter[] | undefined} */
let inlineDelimiters;
try {
  const value = JSON.parse(inlineDelimitersInput.value);
  if (isValidDelimiters(value)) {
    inlineDelimiters = value;
  }
} catch {
  // pass
}

/** @type {string | import("../index.js").Delimiter[] | undefined} */
let blockDelimiters;
try {
  const value = JSON.parse(blockDelimitersInput.value);
  if (isValidDelimiters(value)) {
    blockDelimiters = value;
  }
} catch {
  // pass
}

if (rendererControl.value === "temml") {
  document.adoptedStyleSheets = [temmlStylesheet];
} else {
  document.adoptedStyleSheets = [mathupStylesheet];
}

/**
 * @returns {ReturnType<markdownIt>}
 */
function getMd() {
  /** @type {Record<string, string>} */
  const macros = {};

  return markdownIt().use(markdownItMath, {
    inlineDelimiters,
    blockDelimiters,
    inlineRenderer:
      renderer === "temml"
        ? (src) => temml.renderToString(src, { macros })
        : undefined,
    blockRenderer:
      renderer === "temml"
        ? (src) => temml.renderToString(src, { displayMode: true, macros })
        : undefined,
  });
}

/** @returns {void} */
function handleInput() {
  if (
    !(textInput instanceof HTMLTextAreaElement) ||
    !(output instanceof HTMLElement)
  ) {
    throw new Error("element not in DOM");
  }

  const md = getMd();
  output.innerHTML = md.render(textInput?.value);
}

textInput.addEventListener("input", handleInput);
handleInput();

/** @returns {void} */
function handleRendererChange() {
  if (!(rendererControl instanceof RadioNodeList)) {
    throw new Error("element not in DOM");
  }

  if (rendererControl.value === "temml") {
    renderer = "temml";
    document.adoptedStyleSheets = [temmlStylesheet];
  } else {
    renderer = "mathup";
    document.adoptedStyleSheets = [mathupStylesheet];
  }

  handleInput();
}

for (const radio of rendererControl) {
  radio.addEventListener("change", handleRendererChange);
}

/** @returns {void}  */
function handleFontChange() {
  if (
    !(fontSelect instanceof HTMLSelectElement) ||
    !(output instanceof HTMLElement)
  ) {
    throw new Error("element not in DOM");
  }

  const { value } = fontSelect;

  if (value) {
    output.style.setProperty("--math-font-family", value);
  } else {
    output.style.removeProperty("--math-font-family");
  }
}

fontSelect.addEventListener("change", handleFontChange);
handleFontChange();

/** @returns {void}  */
function handleInlineDelimitersChange() {
  if (
    !(inlineDelimitersInput instanceof HTMLInputElement) ||
    !(output instanceof HTMLElement)
  ) {
    throw new Error("element not in DOM");
  }

  try {
    const value = JSON.parse(inlineDelimitersInput.value);
    if (isValidDelimiters(value)) {
      inlineDelimiters = value;
      handleInput();
    }
  } catch {
    // pass
  }
}

inlineDelimitersInput.addEventListener("change", handleInlineDelimitersChange);
handleInlineDelimitersChange();

/** @returns {void}  */
function handleBlockDelimitersChange() {
  if (
    !(blockDelimitersInput instanceof HTMLInputElement) ||
    !(output instanceof HTMLElement)
  ) {
    throw new Error("element not in DOM");
  }

  try {
    const value = JSON.parse(blockDelimitersInput.value);
    if (isValidDelimiters(value)) {
      blockDelimiters = value;
      handleInput();
    }
  } catch {
    // pass
  }
}

blockDelimitersInput.addEventListener("change", handleBlockDelimitersChange);
handleBlockDelimitersChange();

if (!textInput.value) {
  const startDocPath =
    rendererControl.value === "temml"
      ? "./eulers-identity.latex.md"
      : "./eulers-identity.md";

  fetch(startDocPath)
    .then((r) => r.text())
    .then((text) => {
      textInput.value = text;
      handleInput();
    });
}
