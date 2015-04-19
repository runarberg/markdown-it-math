markdown-it-math
================

[![npm](https://img.shields.io/npm/v/markdown-it-math.svg)](https://www.npmjs.com/package/markdown-it-math)
[![Build Status](https://travis-ci.org/runarberg/markdown-it-math.svg?branch=master)](https://travis-ci.org/runarberg/markdown-it-math)

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
<math display="block"><mi>P</mi><mfenced open="(" close=")"><mrow><mi>A</mi><mo stretchy="true" lspace="veryverythickmathspace" rspace="veryverythickmathspace">|</mo><mi>B</mi></mrow></mfenced><mo>=</mo><mfrac><mrow><mi>P</mi><mfenced open="(" close=")"><mrow><mi>B</mi><mo stretchy="true" lspace="veryverythickmathspace" rspace="veryverythickmathspace">|</mo><mi>A</mi></mrow></mfenced><mi>P</mi><mfenced open="(" close=")"><mi>A</mi></mfenced></mrow><mrow><mi>P</mi><mfenced open="(" close=")"><mi>B</mi></mfenced></mrow></mfrac></math>
```

Installation
------------

```sh
npm install markdown-it-math --save
```

Usage
-----

```javascript
var md = require('markdown-it')()
        .use(require('markdown-it-math') [, options]);
```

where options can be (with defaults)

```javascript
var options = {
    rendererOptions: {},
    inlineRenderer: require('ascii2mathml')(this.rendererOptions),
    blockRenderer: require('ascii2mathml')(Object.assign({ display: 'block' },
                                                         this.rendererOptions))
}
```

(See [ascii2mathml](http://runarberg.github.io/ascii2mathml/) for reference).


Examples
--------

Using comma as a decimal mark

```javascript
var md = require('markdown-it')()
        .use(require('markdown-it-math'), {decimalMark: ','});

md.render("$$40,2$$");
// <p><math><mn>40,2</mn></math></p>
```

Using [TeXZilla](http://fred-wang.github.io/TeXZilla/) as renderer

```javascript
var texzilla = require('texzilla');
var md = require('markdown-it')()
        .use(require('../'), {
            inlineRenderer: function(str) {
                return texzilla.toMathMLString(str);
            },
            blockRenderer: function(str) {
                return texzilla.toMathMLString(str, true);
            }
        });

md.render("$$\\sin(2\\pi)$$");
// <p><math xmlns="http://www.w3.org/1998/Math/MathML"><semantics><mrow><mo lspace="0em" rspace="0em">sin</mo><mo stretchy="false">(</mo><mn>2</mn><mi>π</mi><mo stretchy="false">)</mo></mrow><annotation encoding="TeX">\sin(2\pi)</annotation></semantics></math></p>
```
