"use strict";

var assert = require('assert');

describe("Options", function() {
  it('Should allow different options', function() {
    var md = require('markdown-it')()
          .use(require('../'), {decimalMark: ','});

    var res1 = md.render("$$40,2$$");
    assert.equal(res1, '<p><math><mn>40,2</mn></math></p>\n');

    var res2 = md.render("$$$\n40,2\n$$$");
    assert.equal(res2, '<math display="block">\n<mn>40,2</mn></math>\n');
  });
});

describe("Renderer", function() {
  it('Should allow another renderer', function() {
    var texzilla = require('../node_modules/texzilla/TeXZilla');
    var md = require('markdown-it')()
          .use(require('../'), function(str) {
            // we need to strip the root element, a bit hacky
            return texzilla.toMathMLString(str).slice(49, -7);
          });

    var res1 = md.render("$$1+1 = 2$$");
    assert.equal(res1, '<p><math><semantics><mrow><mn>1</mn><mo>+</mo><mn>1</mn><mo>=</mo><mn>2</mn></mrow><annotation encoding="TeX">1+1 = 2</annotation></semantics></math></p>\n');

    var res2 = md.render("$$$\n\\sin(2\\pi)\n$$$");
    assert.equal(res2, '<math display="block">\n<semantics><mrow><mo lspace="0em" rspace="0em">sin</mo><mo stretchy="false">(</mo><mn>2</mn><mi>π</mi><mo stretchy="false">)</mo></mrow><annotation encoding="TeX">\\sin(2\\pi)\n</annotation></semantics></math>\n');
  });
});
