import assert from "node:assert/strict";
import { mock, suite, test } from "node:test";

import markdownIt from "markdown-it";
import Token from "markdown-it/lib/token.mjs";
import temml from "temml";

import markdownItMath from "../index.js";

const inlineCustomElement = ["span", { class: "math inline" }];
const blockCustomElement = ["div", { class: "math block" }];

/**
 * @param {string} str
 * @returns {string}
 */
function mathspan(str) {
  return `<span class="math inline">${str}</span>`;
}

/**
 * @param {string} str
 * @returns {string}
 */
function mathblock(str) {
  return `<div class="math block">${str}</div>\n`;
}

/**
 * @param {string} str
 * @returns {string}
 */
function codeblock(str) {
  return `<pre><code>${str}\n</code></pre>\n`;
}

/**
 * @param {string[]} strs
 * @returns {string}
 */
function p(...strs) {
  return strs.map((str) => `<p>${str}</p>\n`).join("");
}

/**
 * @param {string[]} strs
 * @returns {string}
 */
function ul(strs) {
  const lis = strs.map((str) => `<li>${str}</li>`);
  return `<ul>\n${lis.join("\n")}\n</ul>\n`;
}

suite("Inline Math", () => {
  const md = markdownIt().use(markdownItMath, {
    inlineCustomElement,
    blockCustomElement,
  });

  test("Simple inline math", () => {
    const src = "$1+1 = 2$";

    assert.equal(md.render(src), p(mathspan("1+1 = 2")));
  });

  test("Simple inline math with $`...`$ notation", () => {
    const src = "$`1+1 = 2`$";

    assert.equal(md.render(src), p(mathspan("1+1 = 2")));
  });

  test("Multiple maths and text", () => {
    const src = "foo $`1+1 = 2`$ bar $1+1$ quux";

    assert.equal(
      md.render(src),
      p(`foo ${mathspan("1+1 = 2")} bar ${mathspan("1+1")} quux`),
    );
  });

  test("dollar inside math", () => {
    const src = "$`$`$";

    assert.equal(md.render(src), p(mathspan("$")));
  });

  test("Whitespace immediately after opening is not allowed", () => {
    const src = "foo$ 1+1 = 2$ bar";

    assert.equal(md.render(src), p(`foo$ 1+1 = 2$ bar`));
  });

  test("Whitespace immediately before closing is not allowed", () => {
    const src = "foo $1+1 = 2 $bar";

    assert.equal(md.render(src), p("foo $1+1 = 2 $bar"));
  });

  test("Empty expressions are not allowed", () => {
    const src = "foo $$ bar";

    assert.equal(md.render(src), p("foo $$ bar"));
  });

  test("This is an ignored expression, and a space after open, both are ignored", () => {
    const src = "foo $$$ bar";

    assert.equal(md.render(src), p("foo $$$ bar"));
  });

  test("Whitespace around delims is not required", () => {
    const src = "foo$1+1 = 2$bar";

    assert.equal(md.render(src), p(`foo${mathspan("1+1 = 2")}bar`));
  });

  test("Punctuation immediatly after opening is fine", () => {
    const src = "foo$-2x < 4$bar";

    assert.equal(md.render(src), p(`foo${mathspan("-2x &lt; 4")}bar`));
  });

  test("Punctuation immediatly before closing is fine", () => {
    const src = "foo$f'$bar";

    assert.equal(md.render(src), p(`foo${mathspan("f'")}bar`));
  });

  test("Punctuation can immediately precede", () => {
    const src = "foo!$42$bar";

    assert.equal(md.render(src), p(`foo!${mathspan("42")}bar`));
  });

  test("Punctuation can immediately follow", () => {
    const src = "The $n$-th order";

    assert.equal(md.render(src), p(`The ${mathspan("n")}-th order`));
  });

  test("Paragraph break in inline math is not allowed", () => {
    const src = `foo $1+1

= 2$ bar
`;

    assert.equal(md.render(src), p("foo $1+1", "= 2$ bar"));
  });

  test("End of document is not allowed", () => {
    const src = "foo $1+1 = 2";

    assert.equal(md.render(src), p("foo $1+1 = 2"));
  });

  test("Inline math with apparent markup", () => {
    const src = "foo $1 *i* 1$ bar";

    assert.equal(md.render(src), p(`foo ${mathspan("1 *i* 1")} bar`));
  });

  test("Multiline inline math replaces newlines with spaces", () => {
    const src = `foo $1 +
1
= 2$ bar
`;

    assert.equal(md.render(src), p(`foo ${mathspan("1 + 1 = 2")} bar`));
  });

  test("Multiline inline math that looks like a matrix", () => {
    const src = "$(a, b,\nd)$";

    assert.equal(md.render(src), p(mathspan("(a, b, d)")));
  });

  test("Can be escaped", () => {
    const src = "foo \\$1$ bar";

    assert.equal(md.render(src), p("foo $1$ bar"));
  });
});

suite("Block Math", () => {
  const md = markdownIt().use(markdownItMath, {
    inlineCustomElement,
    blockCustomElement,
  });

  test("Simple block math", () => {
    const src = `$$
1+1 = 2
$$
`;

    assert.equal(md.render(src), mathblock("1+1 = 2"));
  });

  test("Can be written in one line", () => {
    const src = "$$1+1 = 2$$";

    assert.equal(md.render(src), mathblock("1+1 = 2"));
  });

  test("Can span multiple lines", () => {
    const src = `
$$[1, 2
   3, 4]$$
`;

    assert.equal(md.render(src), mathblock("[1, 2\n3, 4]"));
  });

  test("Can appear in lists", () => {
    const src = `
* $1+1 = 2$
* $$
  a+b = c
  $$
`;

    assert.equal(
      md.render(src),
      ul([mathspan("1+1 = 2"), `\n${mathblock("a+b = c")}`]),
    );
  });

  test("Paragraph breaks around delims are not required", () => {
    const src = `foo
$$
x + y
$$
bar
`;

    assert.equal(
      md.render(src),
      [p("foo"), mathblock("x + y"), p("bar")].join(""),
    );
  });

  test("Block math with apparent markup", () => {
    const src = `foo

$$
1 *i* 1
$$

bar
`;

    assert.equal(
      md.render(src),
      [p("foo"), mathblock("1 *i* 1"), p("bar")].join(""),
    );
  });

  test("Block math can be indented up to 3 spaces", () => {
    const src = `
   $$
   1+1 = 2
   $$
`;

    assert.equal(md.render(src), mathblock("1+1 = 2"));
  });

  test("But 4 means a code block", () => {
    const src = `
    $$
    1+1 = 2
    $$
`;

    assert.equal(md.render(src), codeblock("$$\n1+1 = 2\n$$"));
  });

  test("Cloasing block cannot be indented with 4 spaces or more", () => {
    const src = `
   $$
   1+1 = 2
    $$
`;

    assert.equal(md.render(src), mathblock("1+1 = 2\n $$"));
  });

  test("Multiline block math", () => {
    const src = `$$

  1
+ 1

= 2

$$
`;

    assert.equal(md.render(src), mathblock("\n  1\n+ 1\n\n= 2\n"));
  });

  test("Multiline math that might look like an unordered list", () => {
    const src = `$$
  1

+ 1
+ 1

= 3
$$
`;

    assert.equal(md.render(src), mathblock("  1\n\n+ 1\n+ 1\n\n= 3"));
  });

  test("Can be escaped", () => {
    const src = String.raw`Foo
\$$
1
\$$
`;

    assert.equal(md.render(src), p("Foo\n$$\n1\n$$"));
  });

  test("Matches the longest possible delimiter", () => {
    const mdd = markdownIt().use(markdownItMath, {
      blockDelimiters: ["$$", "$$$"],
      inlineCustomElement,
      blockCustomElement,
    });

    const src = "$$$ $$1+1$$ $$$";
    assert.equal(mdd.render(src), mathblock("$$1+1$$ "));
  });

  test("Self-closes at the end of document", () => {
    const src = "$$1+1 = 2";

    assert.equal(md.render(src), mathblock("1+1 = 2"));
  });

  test("Allows close delimiters as long as end of line matches", () => {
    const mdd = markdownIt().use(markdownItMath, {
      blockDelimiters: ["$$", "$$$"],
      inlineCustomElement,
      blockCustomElement,
    });

    const src = "$$ $$$1+1$$$ $$";
    assert.equal(mdd.render(src), mathblock("$$$1+1$$$ "));
  });

  test("But closes on the first match on multiline", () => {
    const mdd = markdownIt().use(markdownItMath, {
      blockDelimiters: ["$$", "$$$"],
      inlineCustomElement,
      blockCustomElement,
    });

    const src = `
$$
$$$1+1$$$
$$
`;
    assert.equal(
      mdd.render(src),
      [mathblock("$$$1+1$"), mathblock("")].join(""),
    );
  });
});

suite("Options", () => {
  test("Thick dollar delims", () => {
    const md = markdownIt().use(markdownItMath, {
      inlineCustomElement,
      blockCustomElement,
      inlineDelimiters: "$$",
      blockDelimiters: "$$$",
    });

    const src = `Foo $$1+1 = 2$$ bar

$$$
1+1 = 2
$$$
`;

    assert.equal(
      md.render(src),
      [p(`Foo ${mathspan("1+1 = 2")} bar`), mathblock("1+1 = 2")].join(""),
    );
  });

  test("No delimiters turns off rules", () => {
    const md = markdownIt().use(markdownItMath, {
      inlineDelimiters: "",
      blockDelimiters: [],
    });

    const src = `Foo $1+1 = 2$ bar

$$
1+1 = 2
$$
`;

    assert.equal(md.render(src), p("Foo $1+1 = 2$ bar", "$$\n1+1 = 2\n$$"));
  });

  test("Empty open or close dilimeters are filtered out", () => {
    const md = markdownIt().use(markdownItMath, {
      blockCustomElement,
      blockDelimiters: [["$$", ""]],
      inlineCustomElement,
      inlineDelimiters: ["", ["", "$"]],
    });

    const src = `Foo $1+1 = 2$ bar

$$
1+1 = 2
$$
`;

    assert.equal(md.render(src), p("Foo $1+1 = 2$ bar", "$$\n1+1 = 2\n$$"));
  });

  test("Space dollar delims", () => {
    const md = markdownIt().use(markdownItMath, {
      blockCustomElement,
      inlineCustomElement,
      inlineDelimiters: [["$ ", " $"]],
    });

    const src = `foo $ 1+1 = 2 $ bar`;

    assert.equal(md.render(src), p(`foo ${mathspan("1+1 = 2")} bar`));
  });

  test("Allow inline space padding", () => {
    const md = markdownIt().use(markdownItMath, {
      blockCustomElement,
      inlineCustomElement,
      inlineAllowWhiteSpacePadding: true,
    });

    const src = "foo $` 1+1 = 2 `$ bar";

    assert.equal(md.render(src), p(`foo ${mathspan("1+1 = 2")} bar`));
  });

  test("LaTeX style delims", () => {
    const md = markdownIt().use(markdownItMath, {
      inlineCustomElement,
      blockCustomElement,
      inlineDelimiters: [["\\(", "\\)"]],
      blockDelimiters: [["\\[", "\\]"]],
    });

    const src = String.raw`Foo \(1+1 = 2\) bar

\[
1+1 = 2
\]
`;

    assert.equal(
      md.render(src),
      [p(`Foo ${mathspan("1+1 = 2")} bar`), mathblock("1+1 = 2")].join(""),
    );
  });

  test("Different options for the default renderer", (t) => {
    const md = markdownIt().use(markdownItMath, {
      defaultRendererOptions: {
        decimalMark: ",",
      },
    });

    const src = `$40,2$
$$
40,2
$$`;

    t.assert.snapshot(md.render(src));
  });

  suite("Use Temml as renderer", () => {
    const md = markdownIt().use(markdownItMath, {
      inlineRenderer: (str) => temml.renderToString(str),
      blockRenderer: (str) => temml.renderToString(str, { displayMode: true }),
    });

    test("inline", (t) => {
      t.assert.snapshot(md.render("$1+1 = 2$"));
    });

    test("block", (t) => {
      t.assert.snapshot(md.render("$$\n\\sin(2\\pi)\n$$"));
    });
  });

  suite("renderer", () => {
    test("Custom renderer", () => {
      const md = markdownIt().use(markdownItMath, {
        inlineRenderer: (src) => `<inline-math>${src}</inline-math>`,
        blockRenderer: (src) => `<block-math>${src}</block-math>`,
      });

      const res = md.render("$foo$\n$$\nbar\n$$");

      assert.equal(
        res,
        "<p><inline-math>foo</inline-math></p>\n<block-math>bar</block-math>\n",
      );
    });

    test("Correct arguments passed into renderer", () => {
      const inlineRenderer = mock.fn((_src, _token, _md) => "");
      const blockRenderer = mock.fn((_src, _token, _md) => "");
      const md = markdownIt().use(markdownItMath, {
        inlineRenderer,
        blockRenderer,
      });

      md.render("$foo$\n$$\nbar\n$$");

      {
        const [firstCall] = inlineRenderer.mock.calls;
        assert.ok(firstCall);

        const args = firstCall.arguments;

        assert.equal(args[0], "foo");
        assert.equal(args[1] instanceof Token, true);
        assert.equal(args[2], md);
      }
      {
        const [firstCall] = blockRenderer.mock.calls;
        assert.ok(firstCall);

        const args = firstCall.arguments;

        assert.equal(args[0], "bar");
        assert.equal(args[1] instanceof Token, true);
        assert.equal(args[2], md);
      }
    });

    test("customElement", () => {
      const md = markdownIt().use(markdownItMath, {
        inlineCustomElement: "my-el",
        blockCustomElement: ["my-el", { some: "attr" }],
      });

      const res = md.render("$foo$\n$$\nbar\n$$");

      assert.equal(
        res,
        '<p><my-el>foo</my-el></p>\n<my-el some="attr">bar</my-el>\n',
      );
    });
  });

  suite("Depricated", () => {
    test("inlineOpen inlineClose blockOpen blockClose", () => {
      const mdDepricated = markdownIt().use(markdownItMath, {
        inlineOpen: "$((",
        inlineClose: "))$",
        blockOpen: "$[[",
        blockClose: "]]$",
      });

      const mdRecommended = markdownIt().use(markdownItMath, {
        inlineDelimiters: [["$((", "))$"]],
        blockDelimiters: [["$[[", "]]$"]],
      });

      const src = '$(("inline"))$\n$[["block"]]$';

      assert.equal(mdDepricated.render(src), mdRecommended.render(src));
    });
  });
});
