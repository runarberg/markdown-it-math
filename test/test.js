import { suite, test } from "node:test";

import markdownIt from "markdown-it";
import texzilla from "texzilla";

import markdownItMath from "../index.js";

suite("Inline Math", () => {
  const md = markdownIt().use(markdownItMath);

  test("Simple inline math", (t) => {
    const src = "$1+1 = 2$";

    t.assert.snapshot(md.render(src));
  });

  test("Whitespace immediately after opening is not allowed", (t) => {
    // just like other inline markup.
    const src = "foo$ 1+1 = 2$ bar";

    t.assert.snapshot(md.render(src));
  });

  test("Whitespace immediately before closing is not allowed", (t) => {
    const src = "foo $1+1 = 2 $bar";

    t.assert.snapshot(md.render(src));
  });

  test("Whitespace around delims is not required", (t) => {
    const src = "foo$1+1 = 2$bar";

    t.assert.snapshot(md.render(src));
  });

  test("Punctuation immediatly after opening is fine", (t) => {
    const src = "foo$-2x < 4$bar";

    t.assert.snapshot(md.render(src));
  });

  test("Punctuation immediatly before closing is fine", (t) => {
    const src = "foo$f'$bar";

    t.assert.snapshot(md.render(src));
  });

  test("Punctuation can immediately precede", (t) => {
    const src = "foo!$42$bar";

    t.assert.snapshot(md.render(src));
  });

  test("Punctuation can immediately follow", (t) => {
    const src = "The $n$-th order";

    t.assert.snapshot(md.render(src));
  });

  test("Paragraph break in inline math is not allowed", (t) => {
    const src = `foo $1+1

= 2$ bar
`;

    t.assert.snapshot(md.render(src));
  });

  test("End of document is not allowed", (t) => {
    const src = "foo $1+1 = 2";

    t.assert.snapshot(md.render(src));
  });

  test("Inline math with apparent markup", (t) => {
    const src = "foo $1 *i* 1$ bar";

    t.assert.snapshot(md.render(src));
  });

  test("Multiline inline math", (t) => {
    const src = `foo $1 + 1
= 2$ bar
`;

    t.assert.snapshot(md.render(src));
  });

  test("Self-closes at the end of document", (t) => {
    const src = "$$1+1 = 2";

    t.assert.snapshot(md.render(src));
  });

  test("Can be escaped", (t) => {
    const src = String.raw`Foo \$1$ bar`;

    t.assert.snapshot(md.render(src));
  });
});

suite("Block Math", () => {
  const md = markdownIt().use(markdownItMath);

  test("Simple block math", (t) => {
    const src = `$$
1+1 = 2
$$
`;

    t.assert.snapshot(md.render(src));
  });

  test("Can be written in one line", (t) => {
    const src = "$$1+1 = 2$$";

    t.assert.snapshot(md.render(src));
  });

  test("Can span multiple lines", (t) => {
    const src = `
$$[1, 2
   3, 4]$$
`;

    t.assert.snapshot(md.render(src));
  });

  test("Can appear in lists", (t) => {
    const src = `
* $1+1 = 2$
* $$
  1+1 = 2
  $$
`;

    t.assert.snapshot(md.render(src));
  });

  test("Paragraph breaks around delims are not required", (t) => {
    const src = `foo
$$
x + y
$$
bar
`;

    t.assert.snapshot(md.render(src));
  });

  test("Block math with apparent markup", (t) => {
    const src = `foo

$$
1 *i* 1
$$

bar
`;

    t.assert.snapshot(md.render(src));
  });

  test("Block math can be indented up to 3 spaces", (t) => {
    const src = `
   $$
   1+1 = 2
   $$
`;

    t.assert.snapshot(md.render(src));
  });

  test("But 4 means a code block", (t) => {
    const src = `
    $$
    1+1 = 2
    $$
`;

    t.assert.snapshot(md.render(src));
  });

  test("Multiline block math", (t) => {
    const src = `$$

  1
+ 1

= 2

$$
`;

    t.assert.snapshot(md.render(src));
  });

  test("Multiline math that might look like an unordered list", (t) => {
    const src = `$$
  1

+ 1
+ 1

= 3
$$
`;

    t.assert.snapshot(md.render(src));
  });

  test("Can be escaped", (t) => {
    const src = String.raw`Foo
\$$
1
\$$
`;

    t.assert.snapshot(md.render(src));
  });
});

suite("Options", () => {
  test("Thick dollar delims", (t) => {
    const md = markdownIt().use(markdownItMath, {
      inlineOpen: "$$",
      inlineClose: "$$",
      blockOpen: "$$$",
      blockClose: "$$$",
    });

    const src = `Foo $$1+1 = 2$$ bar

$$$
1+1 = 2
$$$
`;

    t.assert.snapshot(md.render(src));
  });

  test("LaTeX style delims", (t) => {
    const md = markdownIt().use(markdownItMath, {
      inlineOpen: "\\(",
      inlineClose: "\\)",
      blockOpen: "\\[",
      blockClose: "\\]",
    });

    const src = String.raw`Foo \(1+1 = 2\) bar

\[
1+1 = 2
\]
`;

    t.assert.snapshot(md.render(src));
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

  suite("Use TexZilla as renderer", () => {
    const md = markdownIt().use(markdownItMath, {
      inlineRenderer: (str) => texzilla.toMathMLString(str),
      blockRenderer: (str) => texzilla.toMathMLString(str, true),
    });

    test("inline", (t) => {
      t.assert.snapshot(md.render("$1+1 = 2$"));
    });

    test("block", (t) => {
      t.assert.snapshot(md.render("$$\n\\sin(2\\pi)\n$$"));
    });
  });
});
