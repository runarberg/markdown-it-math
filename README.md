markdown-it-math
================

```md
Pythagoran theorem is $$a^2 + b^2 = c^2$$.

Bayes theorem:

$$$
P(A | B) = (P(B | A)P(A)) / P(B)
$$$
```

```html
<p>Pythagoran theorem is <math><msup><mi>a</mi><mn>2</mn></msup><mo>+</mo><msup><mi>b</mi><mn>2</mn></msup><mo>=</mo><msup><mi>c</mi><mn>2</mn></msup></math>.</p>
<p>Bayes theorem:</p>
<math display="block">
<mi>P</mi><mfenced open="(" close=")"><mrow><mi>A</mi><mo stretchy="true" lspace="veryverythickmathspace" rspace="veryverythickmathspace">|</mo><mi>B</mi></mrow></mfenced><mo>=</mo><mfrac><mrow><mi>P</mi><mfenced open="(" close=")"><mrow><mi>B</mi><mo stretchy="true" lspace="veryverythickmathspace" rspace="veryverythickmathspace">|</mo><mi>A</mi></mrow></mfenced><mi>P</mi><mfenced open="(" close=")"><mi>A</mi></mfenced></mrow><mrow><mi>P</mi><mfenced open="(" close=")"><mi>B</mi></mfenced></mrow></mfrac></math>
```

Installation
------------

```sh
npm install markdown-it-math --save
```

Usage
-----

```js
var md = require('markdown-it')()
        .use(require('markdown-it-math') [, options | renderer]);
```

If renderer function is not provided, it will default to
`require('ascii2mathml')(options)`
[(see here for info)](http://runarberg.github.io/ascii2mathml/).


Examples
--------

Using comma as a decimal mark

```js
var md = require('markdown-it')()
        .use(require('markdown-it-math'), {decimalMark: ','});

md.render("$$40,2$$");
// <p><math><mn>40,2</mn></math></p>
```

Using [TeXZilla](http://fred-wang.github.io/TeXZilla/) as renderer

```js
var texzilla = require('./node_modules/texzilla/TeXZilla');
var md = require('markdown-it')()
        .use(require('markdown-it-math'), function(str) {
            // We need to strip the root math element out
            return texzilla.toMathMLString(str).slice(49, -7);
        });

md.render("$$\\sin(2\\pi)$$");
// <semantics><mrow><mo lspace="0em" rspace="0em">sin</mo><mo stretchy="false">(</mo><mn>2</mn><mi>π;</mi><mo stretchy="false">)</mo></mrow><annotation encoding="TeX">\sin(2\pi)</annotation></semantics>
```
