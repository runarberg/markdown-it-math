/*! markdown-it-math 4.1.1 https://github.com/runarberg/markdown-it-math @license MIT */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitMath = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
'use strict';

/* Object.assign
 *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/
 * Global_Objects/Object/assign
 *
 * This polyfill doesn't support symbol properties, since ES5 doesn't
 * have symbols anyway:
 */

if (!Object.assign) {
  Object.defineProperty(Object, 'assign', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(target) {
      if (typeof target === 'undefined' || target === null) {
        throw new TypeError('Cannot convert first argument to object');
      }

      var to = Object(target);
      for (var i = 1; i < arguments.length; i++) {
        var nextSource = arguments[i];
        if (typeof nextSource === 'undefined' || nextSource === null) {
          continue;
        }

        var keysArray = Object.keys(Object(nextSource));
        for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
          var nextKey = keysArray[nextIndex];
          var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
          if (typeof desc !== 'undefined' && desc.enumerable) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
      return to;
    }
  });
}

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ascii2mathml = ascii2mathml;
exports.default = void 0;

var _parser = _interopRequireDefault(require("./lib/parser"));

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function ascii2mathml(asciimath, options) {
  // Curry
  if (typeof asciimath === "object") {
    return function (str, options2) {
      var opts = Object.assign({}, asciimath, options2);
      return ascii2mathml(str, opts);
    };
  }

  options = typeof options === "object" ? options : {};
  options.annotate = options.annotate || false;
  options.bare = options.bare || false;
  options.display = options.display || "inline";
  options.standalone = options.standalone || false;
  options.dir = options.dir || "ltr";
  options.decimalMark = options.decimalMark || ".";
  options.colSep = options.colSep || ",";
  options.rowSep = options.rowSep || ";";

  if (options.decimalMark === "," && options.colSep === ",") {
    options.colSep = ";";
  }

  if (options.colSep === ";" && options.rowSep === ";") {
    options.rowSep = ";;";
  }

  if (options.bare) {
    if (options.standalone) {
      throw new Error("Can't output a valid HTML without a root <math> element");
    }

    if (options.display && options.display.toLowerCase() !== "inline") {
      throw new Error("Can't display block without root element.");
    }

    if (options.dir && options.dir.toLowerCase() !== "ltr") {
      throw new Error("Can't have right-to-left direction without root element.");
    }
  }

  var parse = (0, _parser.default)(options);
  var out;
  var math = options.bare ? function (expr) {
    return expr;
  } : function (expr) {
    return "<math".concat(options.display !== "inline" ? " display=\"".concat(options.display, "\"") : "").concat(options.dir !== "ltr" ? " dir=\"".concat(options.dir, "\"") : "", ">").concat(expr, "</math>");
  };

  if (options.annotate) {
    // Make sure the all presentational part is the first element
    var parsed = parse(asciimath.trim(), ""),
        mathml = parsed === _parser.default.getlastel(parsed) ? parsed : "<mrow>".concat(parsed, "</mrow>");
    out = math("<semantics>" + mathml + '<annotation encoding="application/AsciiMath">' + asciimath + "</annotation>" + "</semantics>");
  } else {
    out = math(parse(asciimath.trim(), ""));
  }

  if (options.standalone) {
    out = "<!DOCTYPE html><html><head><title>" + asciimath + "</title></head>" + "<body>" + out + "</body></html>";
  }

  return out;
}

var _default = ascii2mathml;
exports.default = _default;

},{"./lib/parser":4}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.accents = exports.fonts = exports.groupings = exports.operators = exports.identifiers = exports.numbers = void 0; // Numbers
// =======

var numbers = {};
exports.numbers = numbers;
var digitRange = "[\u0030-\u0039\u00B2\u00B3\u00B9\u00BC-\u00BE" + "\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9" + "\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9" + "\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2" + "\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0E50-\u0E59" + "\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C" + "\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819" + "\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99" + "\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59" + "\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u218B" + "\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD" + "\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195" + "\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF" + "零一二三四五六七八九十百千万億兆京垓𥝱秭穣溝澗正載割分厘毛糸忽微繊沙塵埃" + "\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835" + "\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9" + "\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]";
var digitRE = new RegExp(digitRange);
Object.defineProperties(numbers, {
  digitRange: {
    value: digitRange
  },
  digitRE: {
    value: digitRE
  },
  isdigit: {
    value: function value(char) {
      return char.match(digitRE);
    }
  }
}); // Identifiers
// ===========

var funs = ["sin", "cos", "tan", "csc", "sec", "cot", "sinh", "cosh", "tanh", "log", "ln", "det", "dim", "lim", "mod", "gcd", "lcm", "min", "max"];
var identifiers = {
  // Greek uppercase
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  // Greek lowercase
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ɛ",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  // Special symbols
  "oo": "∞",
  "O/": "∅",
  // Blackboard
  CC: "ℂ",
  NN: "ℕ",
  QQ: "ℚ",
  RR: "ℝ",
  ZZ: "ℤ"
};
exports.identifiers = identifiers;
funs.forEach(function (fun) {
  identifiers[fun] = fun;
});
Object.defineProperty(identifiers, "contains", {
  value: function value(char) {
    return typeof identifiers[char] !== "undefined";
  }
});
Object.defineProperty(identifiers, "funs", {
  value: funs
});
Object.defineProperty(identifiers, "isfun", {
  value: function value(str) {
    return funs.indexOf(str) >= 0;
  }
}); // Operators
// =========

var operators = {
  // Operational
  "*": "·",
  "**": "∗",
  "***": "⋆",
  "//": "/",
  "|": "|",
  ":": ":",
  "'": "′",
  "''": "″",
  "'''": "‴",
  "''''": "⁗",
  "xx": "×",
  "-:": "÷",
  "|><": "⋉",
  "><|": "⋊",
  "|><|": "⋈",
  "@": "∘",
  "o+": "⊕",
  "ox": "⊗",
  "o.": "⊙",
  "!": "!",
  "sum": "∑",
  "prod": "∏",
  "^^": "∧",
  "^^^": "⋀",
  "vv": "∨",
  "vvv": "⋁",
  "nn": "∩",
  "nnn": "⋂",
  "uu": "∪",
  "uuu": "⋃",
  // Miscellaneous
  "int": "∫",
  "oint": "∮",
  "dint": "∬",
  "+-": "±",
  "del": "∂",
  "grad": "∇",
  "aleph": "ℵ",
  "/_": "∠",
  "diamond": "⋄",
  "square": "□",
  "|__": "⌊",
  "__|": "⌋",
  "|~": "⌈",
  "~|": "⌉",
  // Relational
  "=": "=",
  "!=": "≠",
  "<": "&lt;",
  ">": "&gt;",
  "<=": "≤",
  ">=": "≥",
  "-<": "≺",
  "-<=": "⪯",
  ">-": "≻",
  ">-=": "⪰",
  "in": "∈",
  "!in": "∉",
  "sub": "⊂",
  "sup": "⊃",
  "sube": "⊆",
  "supe": "⊇",
  "-=": "≡",
  "==": "≡",
  "~=": "≅",
  "~~": "≈",
  "prop": "∝",
  // Arrows
  "<-": "←",
  "->": "→",
  "=>": "⇒",
  "<=>": "⇔",
  "|->": "↦",
  ">->": "↣",
  "->>": "↠",
  ">->>": "⤖",
  "uarr": "↑",
  "darr": "↓",
  "larr": "←",
  "rarr": "→",
  "harr": "↔",
  "lArr": "⇐",
  "rArr": "⇒",
  "hArr": "⇔",
  "iff": "⇔",
  // Punctuations
  ",": ",",
  ":.": "∴",
  "...": "…",
  "cdots": "⋯",
  "ddots": "⋱",
  "vdots": "⋮",
  // Logical
  "if": "if",
  "otherwise": "otherwise",
  "and": "and",
  "or": "or",
  "not": "¬",
  "AA": "∀",
  "EE": "∃",
  "_|_": "⊥",
  "TT": "⊤",
  "|--": "⊢",
  "|==": "⊨"
};
exports.operators = operators;
Object.defineProperty(operators, "contains", {
  value: function value(char) {
    return typeof operators[char] !== "undefined";
  }
});
Object.defineProperty(operators, "get", {
  value: function value(char) {
    return operators[char] || char;
  }
});
Object.defineProperty(operators, "regexp", {
  value: new RegExp("(" + Object.keys(operators).sort(function (a, b) {
    return b.length - a.length;
  }).map(regexpEscape).join("|") + "|[+\-<=>|~¬±×÷ϐϑϒϕϰϱϴϵ϶؆؇؈‖′″‴⁀⁄⁒\u2061-\u2064" + "\u207A-\u207E\u208A-\u208E★☆♠♡♢♣♭♮♯﬩\uFF61-\uFF68" + "＋＜＝＞＼＾｜～￢￩￪￫￬" + "\u2200-\u22FF\u2A00-\u2AFF\u27C0-\u27E5\u2980-\u2982" + "\u2999-\u29FF\u2301-\u23FF\u25A0-\u25FF\u2B00-\u2BFF" + "\u2190-\u21FF\u27F0-\u27FF\u2900-\u297F\u20D0-\u20EF]" + ")")
});

function regexpEscape(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
} // Groupings
// =========


var groupings = {
  open: {
    "(:": "⟨",
    "{:": ""
  },
  close: {
    ":)": "⟩",
    ":}": ""
  },
  complex: {
    abs: {
      open: "|",
      close: "|"
    },
    floor: {
      open: "⌊",
      close: "⌋"
    },
    ceil: {
      open: "⌈",
      close: "⌉"
    },
    norm: {
      open: "∥",
      close: "∥"
    }
  }
};
exports.groupings = groupings;
Object.defineProperty(groupings.open, "regexp", {
  value: /([[⟦⟨⟪⟬⟮⦃⦅⦇⦉⦋⦍⦏⦑⦓⦕⦗]|[({]:?)/
});
Object.defineProperty(groupings.close, "regexp", {
  value: /([\]⟧⟩⟫⟭⟯⦄⦆⦈⦊⦌⦎⦐⦒⦔⦖⦘]|:?[)}])/
});
Object.defineProperty(groupings.open, "get", {
  value: function value(str) {
    var match = groupings.open[str];
    return typeof match === "string" ? match : str;
  }
});
Object.defineProperty(groupings.close, "get", {
  value: function value(str) {
    var match = groupings.close[str];
    return typeof match === "string" ? match : str;
  }
});
Object.defineProperty(groupings.complex, "contains", {
  value: function value(str) {
    return Object.keys(groupings.complex).indexOf(str) >= 0;
  }
});
Object.defineProperty(groupings.complex, "get", {
  value: function value(str) {
    return groupings.complex[str];
  }
});
Object.freeze(groupings.open);
Object.freeze(groupings.close);
Object.freeze(groupings.complex); // Font
// ====

var fonts = {
  rm: "normal",
  bf: "bold",
  it: "italic",
  bb: "double-struck",
  cc: "script",
  tt: "monospace",
  fr: "fraktur",
  sf: "sans-serif"
};
exports.fonts = fonts;
Object.defineProperty(fonts, "get", {
  value: function value(str) {
    return fonts[str];
  }
});
Object.defineProperty(fonts, "regexp", {
  value: new RegExp("(" + Object.keys(fonts).join("|") + ")")
}); // Accents
// =======

var accents = {
  hat: {
    type: "over",
    accent: "^"
  },
  bar: {
    type: "over",
    accent: "‾"
  },
  ul: {
    type: "under",
    accent: "_"
  },
  vec: {
    type: "over",
    accent: "→"
  },
  dot: {
    type: "over",
    accent: "⋅"
  },
  ddot: {
    type: "over",
    accent: "⋅⋅"
  },
  tilde: {
    type: "over",
    accent: "˜"
  },
  cancel: {
    type: "enclose",
    attrs: {
      notation: "updiagonalstrike"
    }
  }
};
exports.accents = accents;
Object.defineProperty(accents, "contains", {
  value: function value(str) {
    return Object.keys(accents).indexOf(str) >= 0;
  }
});
Object.defineProperty(accents, "get", {
  value: function value(str) {
    return accents[str];
  }
});
Object.defineProperty(accents, "regexp", {
  value: new RegExp("(" + Object.keys(accents).join("|") + ")")
});

},{}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _syntax = _interopRequireDefault(require("./syntax"));

var _lexicon = require("./lexicon");

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function tag(tagname) {
  return function fn(content, attr) {
    if (typeof content === "object") {
      // Curry
      return function (str) {
        return fn(str, content);
      };
    }

    if (typeof attr !== "object") {
      return "<".concat(tagname, ">").concat(content, "</").concat(tagname, ">");
    } else {
      var attrstr = Object.keys(attr).map(function (key) {
        return "".concat(key, "=\"").concat(attr[key], "\"");
      }).join(" ");
      return "<".concat(tagname, " ").concat(attrstr, ">").concat(content, "</").concat(tagname, ">");
    }
  };
}

var mi = tag("mi"),
    mn = tag("mn"),
    mo = tag("mo"),
    mfrac = tag("mfrac"),
    msup = tag("msup"),
    msub = tag("msub"),
    msubsup = tag("msubsup"),
    munder = tag("munder"),
    mover = tag("mover"),
    munderover = tag("munderover"),
    menclose = tag("menclose"),
    mrow = tag("mrow"),
    msqrt = tag("msqrt"),
    mroot = tag("mroot"),
    mfenced = tag("mfenced"),
    mtable = tag("mtable"),
    mtr = tag("mtr"),
    mtd = tag("mtd");

function parser(options) {
  var decimalMarkRE = options.decimalMark === "." ? "\\." : options.decimalMark,
      numberRegexp = new RegExp("^".concat(_lexicon.numbers.digitRange, "+(").concat(decimalMarkRE).concat(_lexicon.numbers.digitRange, "+)?")),
      colsplit = splitby(options.colSep),
      rowsplit = splitby(options.rowSep),
      newlinesplit = splitby("\n");

  function splitby(sep) {
    return function (str) {
      var split = [],
          inners = 0,
          index = 0;

      for (var i = 0; i < str.length; i += 1) {
        var rest = str.slice(i),
            char = str[i];

        if (rest.startsWith(sep) && !str.slice(0, i).match(/\\(\\{2})*$/)) {
          if (inners === 0) {
            split.push(str.slice(index, i));
            index = i + sep.length;
          }
        } else if (char.match(_lexicon.groupings.open.regexp)) {
          inners += 1;
        } else if (char.match(_lexicon.groupings.close.regexp)) {
          inners -= 1;
        }
      }

      split.push(str.slice(index));
      return split;
    };
  }

  var parse = function parse(ascii, mathml, space, grouped) {
    if (!ascii) {
      return mathml;
    }

    if (ascii.match(/^\s/)) {
      // Dont include the space it if there is a binary infix becoming
      // a prefix
      if (ascii.match(/^\s+(\/[^\/]|^[^\^]|_[^_|])/)) {
        return parse(ascii.trim(), mathml, true);
      } // Count the number of leading spaces


      var spaces = ascii.match(/^ +/),
          spacecount = spaces ? spaces[0].length : 0;

      if (spacecount > 1) {
        // spacewidth is a linear function of spacecount
        var spaceel = "<mspace width=\"".concat(spacecount - 1, "ex\" />");
        return parse(ascii.trim(), mathml + spaceel, true);
      }

      return parse(ascii.trim(), mathml, true);
    }

    var _parseone = parseone(ascii, grouped),
        _parseone2 = _slicedToArray(_parseone, 2),
        el = _parseone2[0],
        rest = _parseone2[1]; // ## Binary infixes ##
    // ### Fraction ###


    if ((rest && rest.trimLeft().startsWith("/") || rest.trimLeft().startsWith("./")) && !rest.trimLeft().match(/^\.?\/\//)) {
      var _splitNextFraction = splitNextFraction(el, rest);

      var _splitNextFraction2 = _slicedToArray(_splitNextFraction, 2);

      el = _splitNextFraction2[0];
      rest = _splitNextFraction2[1];
    }

    return parse(rest, mathml + el, false);
  };

  function parsegroup(ascii) {
    // Takes one asciiMath string and returns mathml in one group
    if (ascii.trim().length === 0) {
      return "";
    }

    var mathml = parse(ascii, "", false, true);
    return mathml === getlastel(mathml) ? mathml : mrow(mathml);
  }

  function parseone(ascii, grouped, lastel) {
    /**
     Return a split of the first element parsed to MathML and the rest
     of the string unparsed.
     */
    // TODO: split this up into smaller more readable code
    if (!ascii) {
      return ["", ""];
    }

    var el, rest;
    var head = ascii[0],
        tail = ascii.slice(1),
        nextsymbol = head + (tail.match(/^[A-Za-z]+/) || "");

    if (ascii.startsWith("sqrt")) {
      // ## Roots ##
      var split = parseone(ascii.slice(4).trim(), grouped);
      el = msqrt(split[0] ? removeSurroundingBrackets(split[0]) : mrow(""));
      rest = split[1];
    } else if (ascii.startsWith("root")) {
      var one = parseone(ascii.slice(4).trimLeft(), grouped),
          index = one[0] ? removeSurroundingBrackets(one[0]) : mrow(""),
          two = parseone(one[1].trimLeft(), grouped),
          base = two[0] ? removeSurroundingBrackets(two[0]) : mrow("");
      el = mroot(base + index);
      rest = two[1];
    } else if (head === "\\" && ascii.length > 1) {
      // ## Forced opperator ##
      if (ascii[1].match(/[(\[]/)) {
        var stop = findmatching(tail);
        el = mo(ascii.slice(2, stop));
        rest = ascii.slice(stop + 1);
      } else {
        el = mo(ascii[1]);
        rest = ascii.slice(2);
      }
    } else if (_lexicon.accents.contains(nextsymbol)) {
      // ## Accents ##
      var accent = _lexicon.accents.get(nextsymbol),
          next = ascii.slice(nextsymbol.length).trimLeft(),
          ijmatch = next.match(/^\s*\(?([ij])\)?/),
          _split = parseone(next);

      switch (accent.type) {
        // ## Accents on top ##
        case "over":
          if (ijmatch) {
            // use non-dotted i and j glyphs as to not clutter
            el = mover(mi(ijmatch[1] === "i" ? "ı" : "ȷ") + mo(accent.accent, {
              accent: true
            }));
            rest = next.slice(ijmatch[0].length);
          } else {
            el = mover(removeSurroundingBrackets(_split[0]) + mo(accent.accent, {
              accent: true
            }));
            rest = _split[1];
          }

          break;
        // ## Accents below ##

        case "under":
          el = munder(removeSurroundingBrackets(_split[0]) + mo(accent.accent));
          rest = _split[1];
          break;
        // ## Enclosings

        case "enclose":
          el = menclose(removeSurroundingBrackets(_split[0]), accent.attrs);
          rest = _split[1];
          break;

        default:
          throw new Error("Invalid config for accent " + nextsymbol);
      }
    } else if (_syntax.default.isfontCommand(ascii)) {
      // ## Font Commands ##
      var _split2 = _syntax.default.splitfont(ascii);

      el = tag(_split2.tagname)(_split2.text, _split2.font && {
        mathvariant: _split2.font
      });
      rest = _split2.rest;
    } else if (_lexicon.groupings.complex.contains(nextsymbol)) {
      // ## Complex groupings ##
      var grouping = _lexicon.groupings.complex.get(nextsymbol),
          _next = ascii.slice(nextsymbol.length).trimLeft(),
          _split3 = parseone(_next);

      el = mfenced(removeSurroundingBrackets(_split3[0]), grouping);
      rest = _split3[1];
    } else if (_syntax.default.isgroupStart(ascii) || _syntax.default.isvertGroupStart(ascii)) {
      // ## Groupings ##
      var _ref = _syntax.default.isgroupStart(ascii) ? _syntax.default.splitNextGroup(ascii) : _syntax.default.splitNextVert(ascii),
          _ref2 = _slicedToArray(_ref, 5),
          open = _ref2[1],
          group = _ref2[2],
          close = _ref2[3],
          after = _ref2[4];

      rest = _lexicon.groupings.open.get(after);

      var rows = function () {
        var lines = newlinesplit(group);
        return lines.length > 1 ? lines : rowsplit(group);
      }();

      if (_syntax.default.ismatrixInterior(group.trim(), options.colSep, options.rowSep)) {
        // ### Matrix ##
        if (group.trim().endsWith(options.colSep)) {
          // trailing row break
          group = group.trimRight().slice(0, -1);
        }

        var cases = open === "{" && close === "",
            table = parsetable(group, cases && {
          columnalign: "center left"
        });
        el = mfenced(table, {
          open: open,
          close: close
        });
      } else if (rows.length > 1) {
        // ### Column vector ###
        if (rows.length === 2 && open === "(" && close === ")") {
          // #### Binomial Coefficient ####
          // Experimenting with the binomial coefficient
          // Perhaps I'll remove this later
          var binom = mfrac(rows.map(parsegroup).join(""), {
            linethickness: 0
          });
          el = mfenced(binom, {
            open: open,
            close: close
          });
        } else {
          // #### Single column vector ####
          var vector = rows.map(colsplit);

          if (last(vector).length === 1 && last(vector)[0].match(/^\s*$/)) {
            // A trailing rowbreak
            vector = vector.slice(0, -1);
          }

          var matrix = vector.map(function (row) {
            return mtr(row.map(compose(mtd, parsegroup)).join(""));
          }).join("");
          el = mfenced(mtable(matrix), {
            open: open,
            close: close
          });
        }
      } else {
        // ### A fenced group ###
        var cols = colsplit(group),
            els = cols.map(parsegroup).join(""),
            attrs = {
          open: open,
          close: close
        };

        if (options.colSep !== ",") {
          attrs.separators = options.colSep;
        }

        el = mfenced(els, attrs);
      }
    } else if (!grouped && _syntax.default.isgroupable(ascii, options)) {
      // ## Whitespace ##
      // treat whitespace separated subexpressions as a group
      var _split4 = splitNextWhitespace(ascii);

      el = parsegroup(_split4[0]);
      rest = _split4[1];
    } else if (_lexicon.numbers.isdigit(head)) {
      // ## Number ##
      var number = ascii.match(numberRegexp)[0];
      el = mn(number);
      rest = tail.slice(number.length - 1);
    } else if (ascii.match(/^#`[^`]+`/)) {
      // ## Forced number ##
      var _number = ascii.match(/^#`([^`]+)`/)[1];
      el = mn(_number);
      rest = ascii.slice(_number.length + 3);
    } else if (ascii.match(new RegExp("^" + _lexicon.operators.regexp.source)) && !_lexicon.identifiers.contains(nextsymbol)) {
      // ## Operators ##
      var _syntax$splitNextOper = _syntax.default.splitNextOperator(ascii),
          _syntax$splitNextOper2 = _slicedToArray(_syntax$splitNextOper, 2),
          op = _syntax$splitNextOper2[0],
          _next2 = _syntax$splitNextOper2[1],
          derivative = ascii.startsWith("'"),
          prefix = contains(["∂", "∇"], op),
          stretchy = contains(["|"], op),
          mid = ascii.startsWith("| "),
          attr = {};

      if (derivative) {
        attr.lspace = 0;
        attr.rspace = 0;
      }

      if (prefix) {
        attr.rspace = 0;
      }

      if (stretchy) {
        attr.stretchy = true;
      }

      if (mid) {
        attr.lspace = "veryverythickmathspace";
        attr.rspace = "veryverythickmathspace";
      }

      el = mo(op, !isempty(attr) && attr);
      rest = _next2;
    } else if (_lexicon.identifiers.contains(nextsymbol)) {
      // Perhaps a special identifier character
      var ident = _lexicon.identifiers[nextsymbol]; // Uppercase greeks are roman font variant

      var uppercase = ident.match(/[\u0391-\u03A9\u2100-\u214F\u2200-\u22FF]/);
      el = uppercase ? mi(ident, {
        mathvariant: "normal"
      }) : mi(ident);
      rest = tail.slice(nextsymbol.length - 1);
    } else if (head === "O" && tail[0] === "/") {
      // The special case of the empty set. I suppose there is no
      // dividing by the latin capital letter O
      el = mi(_lexicon.identifiers["O/"], {
        mathvariant: "normal"
      });
      rest = tail.slice(1);
    } else {
      el = mi(head);
      rest = tail;
    }

    if (rest && rest.trimLeft().match(/\.?[\^_]/)) {
      if ((lastel ? !lastel.match(/m(sup|over)/) : true) && rest.trim().startsWith("_") && (rest.trim().length <= 1 || !rest.trim()[1].match(/[|_]/))) {
        // ### Subscript ###
        var _splitNextSubscript = splitNextSubscript(el, rest);

        var _splitNextSubscript2 = _slicedToArray(_splitNextSubscript, 2);

        el = _splitNextSubscript2[0];
        rest = _splitNextSubscript2[1];
      } else if (lastel !== "mover" && rest.trim().startsWith("._") && (rest.trim().length <= 2 || !rest.trim()[2].match(/[|_]/))) {
        // ### Underscript ###
        var _splitNextUnderscript = splitNextUnderscript(el, rest);

        var _splitNextUnderscript2 = _slicedToArray(_splitNextUnderscript, 2);

        el = _splitNextUnderscript2[0];
        rest = _splitNextUnderscript2[1];
      } else if ((lastel ? !lastel.match(/m(sub|under)/) : true) && rest.trim().startsWith("^") && (rest.trim().length <= 1 || rest.trim()[1] !== "^")) {
        // ### Superscript ###
        var _splitNextSuperscript = splitNextSuperscript(el, rest);

        var _splitNextSuperscript2 = _slicedToArray(_splitNextSuperscript, 2);

        el = _splitNextSuperscript2[0];
        rest = _splitNextSuperscript2[1];
      } else if (lastel !== "munder" && rest.trim().startsWith(".^") && (rest.trim().length <= 2 || rest.trim()[2] !== "^")) {
        // ### Overscript ###
        var _splitNextOverscript = splitNextOverscript(el, rest);

        var _splitNextOverscript2 = _slicedToArray(_splitNextOverscript, 2);

        el = _splitNextOverscript2[0];
        rest = _splitNextOverscript2[1];
      }
    }

    return [el, rest];
  }

  function splitNextSubscript(el, rest) {
    var next = parseone(rest.trim().slice(1).trim(), true, "msub"),
        sub = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    var ml,
        ascii = next[1]; // ### Supersubscript ###

    if (ascii && ascii.trim().startsWith("^") && (ascii.trim().length <= 1 || !ascii.trim()[1] !== "^")) {
      var next2 = parseone(ascii.trim().slice(1).trim(), true),
          sup = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow(""),
          tagfun = _syntax.default.shouldGoUnder(el) ? munderover : msubsup;
      ml = tagfun(el + sub + sup);
      ascii = next2[1];
    } else {
      var _tagfun = _syntax.default.shouldGoUnder(el) ? munder : msub;

      ml = _tagfun(el + sub);
    }

    return [ml, ascii];
  }

  function splitNextSuperscript(el, rest) {
    var next = parseone(rest.trim().slice(1).trim(), true, "msup"),
        sup = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    var ml,
        ascii = next[1]; // ### Super- subscript ###

    if (ascii.trim().startsWith("_") && (ascii.trim().length <= 1 || !ascii.trim()[1].match(/[|_]/))) {
      var next2 = parseone(ascii.trim().slice(1).trim(), true),
          sub = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow(""),
          tagfun = _syntax.default.shouldGoUnder(el) ? munderover : msubsup;
      ml = tagfun(el + sub + sup);
      ascii = next2[1];
    } else {
      var _tagfun2 = _syntax.default.shouldGoUnder(el) ? mover : msup;

      ml = _tagfun2(el + sup);
    }

    return [ml, ascii];
  }

  function splitNextUnderscript(el, rest) {
    var next = parseone(rest.trim().slice(2).trim(), true, "munder"),
        under = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    var ml,
        ascii = next[1]; // ### Under- overscript ###

    var overmatch = ascii.match(/^(\.?\^)[^\^]/);

    if (overmatch) {
      var next2 = parseone(ascii.trim().slice(overmatch[1].length).trim(), true),
          over = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow("");
      ml = munderover(el + under + over);
      ascii = next2[1];
    } else {
      ml = munder(el + under);
    }

    return [ml, ascii];
  }

  function splitNextOverscript(el, rest) {
    var next = parseone(rest.trim().slice(2).trim(), true, "mover"),
        over = next[0] ? removeSurroundingBrackets(next[0]) : mrow("");
    var ml,
        ascii = next[1]; // ### Under- overscript ###

    var undermatch = ascii.match(/^(\.?_)[^_|]/);

    if (undermatch) {
      var next2 = parseone(ascii.trim().slice(undermatch[1].length).trim(), true),
          under = next2[0] ? removeSurroundingBrackets(next2[0]) : mrow("");
      ml = munderover(el + under + over);
      ascii = next2[1];
    } else {
      ml = mover(el + over);
    }

    return [ml, ascii];
  }

  function splitNextFraction(el, rest) {
    var bevelled = rest.trim().startsWith("./"),
        rem = rest.trim().slice(bevelled ? 2 : 1);
    var next, ml, ascii;

    if (rem.startsWith(" ")) {
      var split = rem.trim().split(" ");
      next = parsegroup(split[0]);
      ascii = rem.trimLeft().slice(split[0].length + 1);
    } else {
      var _parseone3 = parseone(rem);

      var _parseone4 = _slicedToArray(_parseone3, 2);

      next = _parseone4[0];
      ascii = _parseone4[1];
    }

    next = next || mrow("");
    ml = mfrac(removeSurroundingBrackets(el) + removeSurroundingBrackets(next), bevelled && {
      bevelled: true
    });

    if (ascii && ascii.trim().startsWith("/") || ascii.trim().startsWith("./")) {
      return splitNextFraction(ml, ascii);
    }

    return [ml, ascii];
  }

  function splitNextWhitespace(str) {
    var re = new RegExp("(\\s|".concat(options.colSep, "|").concat(options.rowSep, "|$)"));
    var match = str.match(re),
        head = str.slice(0, match.index),
        sep = match[0],
        tail = str.slice(match.index + 1);
    var next = head,
        rest = sep + tail;

    if (!_syntax.default.isgroupStart(tail.trim()) && _syntax.default.endsInFunc(head)) {
      var newsplit = splitNextWhitespace(tail);
      next += sep + newsplit[0];
      rest = newsplit[1];
    } else if (head.match(/root$/)) {
      var split1 = splitNextWhitespace(tail),
          split2 = splitNextWhitespace(split1[1].trimLeft());
      next += sep + split1[0] + " " + split2[0];
      rest = sep + split2[1];
    }

    return [next, rest];
  }

  function parsetable(matrix, attrs) {
    var rows = function () {
      var lines = colsplit(matrix);
      return lines.length > 1 ? lines : newlinesplit(matrix);
    }().map(function (el) {
      return el.trim().slice(1, -1);
    });

    return mtable(rows.map(parserow).join(""), attrs);
  }

  function parserow(row, acc) {
    acc = typeof acc === "string" ? acc : "";

    if (!row || row.length === 0) {
      return mtr(acc);
    }

    var _parsecell = parsecell(row.trim(), ""),
        _parsecell2 = _slicedToArray(_parsecell, 2),
        mathml = _parsecell2[0],
        rest = _parsecell2[1];

    return parserow(rest.trim(), acc + mathml);
  }

  function parsecell(cell, acc) {
    if (!cell || cell.length === 0) {
      return [mtd(acc), ""];
    }

    if (cell[0] === options.colSep) {
      return [mtd(acc), cell.slice(1).trim()];
    }

    var _parseone5 = parseone(cell),
        _parseone6 = _slicedToArray(_parseone5, 2),
        mathml = _parseone6[0],
        rest = _parseone6[1];

    return parsecell(rest.trim(), acc + mathml);
  }

  return parse;
}

function splitlast(mathml) {
  /**
   Return a pair of all but last eliment and the last eliment
   */
  var lastel = getlastel(mathml),
      prewels = mathml.slice(0, mathml.lastIndexOf(lastel));
  return [prewels, lastel];
}

function removeSurroundingBrackets(mathml) {
  var inside = mathml.replace(/^<mfenced[^>]*>/, "").replace(/<\/mfenced>$/, "");

  if (splitlast(inside)[1] === inside) {
    return inside;
  } else {
    return mrow(inside);
  }
}

function getlastel(xmlstr) {
  // This breaks the linearity of the implimentation
  // optimation possible, perhaps an XML parser
  var tagmatch = xmlstr.match(/<\/(m[a-z]+)>$/);

  if (!tagmatch) {
    var spacematch = xmlstr.match(/<mspace\s*([a-z]+="[a-z]")*\s*\?>/);

    if (spacematch) {
      var _i2 = spacematch.match[0].length;
      return xmlstr.slice(_i2);
    } else {
      return "";
    }
  }

  var tagname = tagmatch[1];
  var i = xmlstr.length - (tagname.length + 3),
      inners = 0;

  for (i; i >= 0; i -= 1) {
    if (xmlstr.slice(i).startsWith("<".concat(tagname))) {
      if (inners === 0) {
        break;
      }

      inners -= 1;
    }

    if (xmlstr.slice(i - 2).startsWith("</".concat(tagname))) {
      inners += 1;
    }
  }

  return xmlstr.slice(i);
}

function findmatching(str) {
  var open = str[0],
      close = open === "(" ? ")" : open === "[" ? "]" : str[0];
  var inners = 0,
      index = 0;

  for (var i = 0; i < str.length; i += 1) {
    var char = str[i];
    index += 1;

    if (char === close) {
      inners -= 1;

      if (inners === 0) {
        break;
      }
    } else if (char === open) {
      inners += 1;
    }
  }

  return index;
}

function isempty(obj) {
  return Object.keys(obj).length === 0;
}

function contains(arr, el) {
  return arr.indexOf(el) >= 0;
}

function last(arr) {
  return arr.slice(-1)[0];
}

function compose(f, g) {
  return function (x) {
    return f(g(x));
  };
}

parser.getlastel = getlastel;
var _default = parser;
exports.default = _default;

},{"./lexicon":3,"./syntax":5}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lexicon = require("./lexicon");

function splitNextOperator(str) {
  var re = new RegExp("^" + _lexicon.operators.regexp.source),
      match = re.exec(str),
      op = match[0];
  return [_lexicon.operators.get(op), str.slice(op.length)];
}

function isgroupStart(str) {
  var re = new RegExp("^" + _lexicon.groupings.open.regexp.source);
  return str.match(re);
}

function isgroupable(str, options) {
  var re = new RegExp("^[0-9A-Za-z+\\-!]{2,}(\\s|".concat(options.colSep, "|").concat(options.rowSep, ")"));
  return str.match(re);
}

function ismatrixInterior(str, colSep, rowSep) {
  if (!isgroupStart(str)) {
    return false;
  }

  var rest = splitNextGroup(str)[4];

  if (!(rest.trim().startsWith(colSep) || rest.match(/^\s*\n/) && isgroupStart(rest.trim()))) {
    return false;
  } // Make sure we are building the matrix with parenthesis, as opposed
  // to rowSeps.


  while (rest && rest.trim()) {
    rest = (splitNextGroup(rest) || [])[4];

    if (rest && (rest.startsWith(rowSep) || rest.match(/^\s*\n/))) {
      // `rowSep` delimited matrices are handled elsewhere.
      return false;
    }
  }

  return true;
}

var funcEndingRe = new RegExp("(" + _lexicon.identifiers.funs.concat(Object.keys(_lexicon.accents)).concat(["sqrt"]).sort(function (a, b) {
  return a.length - b.length;
}).join("|") + ")$");

function endsInFunc(str) {
  return str.match(funcEndingRe);
}

function splitNextGroup(str) {
  /** Split the string into `[before, open, group, close, after]` */
  var openRE = new RegExp("^" + _lexicon.groupings.open.regexp.source),
      closeRE = new RegExp("^" + _lexicon.groupings.close.regexp.source);
  var start,
      stop,
      open,
      close,
      inners = 0,
      i = 0;

  while (i < str.length) {
    var rest = str.slice(i),
        openMatch = rest.match(openRE),
        closeMatch = rest.match(closeRE);

    if (openMatch) {
      if (typeof start !== "number") {
        start = i;
        open = openMatch[0];
      }

      inners += 1;
      i += openMatch[0].length;
    } else if (closeMatch) {
      inners -= 1;

      if (inners === 0) {
        close = closeMatch[0];
        stop = i + (close.length - 1);
        break;
      }

      i += closeMatch[0].length;
    } else {
      i += 1;
    }
  }

  if (!open) {
    return null;
  }

  return [start === 0 ? "" : str.slice(0, start), _lexicon.groupings.open.get(open), str.slice(start + open.length, close ? stop - (close.length - 1) : str.length), close ? _lexicon.groupings.close.get(close) : "", stop ? str.slice(stop + 1) : ""];
}

function isvertGroupStart(str) {
  if (!str.startsWith("|")) {
    return false;
  }

  var split = splitNextVert(str);
  return split && split[0] === "";
}

function splitNextVert(str) {
  function retval(start, stop, double) {
    return [start === 0 ? "" : str.slice(0, start), double ? "‖" : "|", str.slice(start + (double ? 2 : 1), stop), double ? "‖" : "|", str.slice(stop + (double ? 2 : 1))];
  }

  var start = str.indexOf("|"),
      stop = start + 1,
      rest = str.slice(start + 1),
      double = rest.startsWith("|"),
      re = double ? /\|\|/ : /\|/;

  if (double) {
    rest = rest.slice(1);
    stop += 1;
  }

  if (rest.indexOf("|") === -1) {
    return null;
  }

  if (rest.match(/^\.?[_\^]/)) {
    return null;
  }

  while (rest.length > 0) {
    var split = splitNextGroup(rest),
        head = split ? split[0] : rest,
        tail = split ? split[4] : "",
        match = re.exec(head);

    if (match) {
      return retval(start, stop + match.index, double);
    }

    stop += split.slice(0, -1).map(dot("length")).reduce(plus); // adjust for slim brackets

    if (split[1] === "") {
      stop += 2;
    } else if (split[1] === "〈") {
      stop += 1;
    }

    if (split[3] === "") {
      stop += 2;
    } else if (split[3] === "〉") {
      stop += 1;
    }

    rest = tail;
  }

  return null;
}

function dot(attr) {
  return function (obj) {
    return obj[attr];
  };
}

function plus(a, b) {
  return a + b;
} // Fonts
// =====


function isforcedEl(reEnd) {
  var re = new RegExp("^(" + _lexicon.fonts.regexp.source + " ?)?" + reEnd);
  return function (str) {
    return re.exec(str);
  };
}

var isforcedIdentifier = isforcedEl("(`)\\w+`");
var isforcedText = isforcedEl('(")');

function isfontCommand(str) {
  return isforcedIdentifier(str) || isforcedText(str);
}

function splitfont(ascii) {
  var typematch = isforcedIdentifier(ascii) || isforcedText(ascii),
      font = typematch && typematch[2],
      type = typematch && typematch[3],
      tagname = type === '"' ? "mtext" : type === "`" ? "mi" : "";
  var start = ascii.indexOf(type),
      stop = start + 1 + ascii.slice(start + 1).indexOf(type),
      fontvariant = start > 0 ? _lexicon.fonts.get(font) : "";
  return {
    tagname: tagname,
    text: ascii.slice(start + 1, stop),
    font: fontvariant,
    rest: ascii.slice(stop + 1)
  };
}

var underEls = ["<mi>lim</mi>", "<mo>∑</mo>", "<mo>∏</mo>"];

function shouldGoUnder(el) {
  return underEls.indexOf(el) >= 0;
}

var syntax = {
  endsInFunc: endsInFunc,
  isgroupStart: isgroupStart,
  isgroupable: isgroupable,
  isvertGroupStart: isvertGroupStart,
  splitNextGroup: splitNextGroup,
  splitNextVert: splitNextVert,
  splitNextOperator: splitNextOperator,
  ismatrixInterior: ismatrixInterior,
  isfontCommand: isfontCommand,
  splitfont: splitfont,
  shouldGoUnder: shouldGoUnder
};
var _default = syntax;
exports.default = _default;

},{"./lexicon":3}],6:[function(require,module,exports){
/* Process inline math */

'use strict';

var ascii2mathml = null;
require('./lib/polyfills');


function scanDelims(state, start, delimLength) {
  var pos = start, lastChar, nextChar, count, can_open, can_close,
      isLastWhiteSpace, isNextWhiteSpace,
      left_flanking = true,
      right_flanking = true,
      max = state.posMax,
      isWhiteSpace = state.md.utils.isWhiteSpace;

  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : 0x20;

  if (pos >= max) {
    can_open = false;
  }

  pos += delimLength;

  count = pos - start;

  // treat end of the line as a whitespace
  nextChar = pos < max ? state.src.charCodeAt(pos) : 0x20;

  isLastWhiteSpace = isWhiteSpace(lastChar);
  isNextWhiteSpace = isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    left_flanking = false;
  }

  if (isLastWhiteSpace) {
    right_flanking = false;
  }

  can_open = left_flanking;
  can_close = right_flanking;

  return {
    can_open: can_open,
    can_close: can_close,
    delims: count
  };
}


function makeMath_inline(open, close) {
  return function math_inline(state, silent) {
    var startCount,
        found,
        res,
        token,
        closeDelim,
        max = state.posMax,
        start = state.pos,
        openDelim = state.src.slice(start, start + open.length);

    if (openDelim !== open) { return false; }
    if (silent) { return false; }    // Don’t run any pairs in validation mode

    res = scanDelims(state, start, openDelim.length);
    startCount = res.delims;

    if (!res.can_open) {
      state.pos += startCount;
      // Earlier we checked !silent, but this implementation does not need it
      state.pending += state.src.slice(start, state.pos);
      return true;
    }

    state.pos = start + open.length;

    while (state.pos < max) {
      closeDelim = state.src.slice(state.pos, state.pos + close.length);
      if (closeDelim === close) {
        res = scanDelims(state, state.pos, close.length);
        if (res.can_close) {
          found = true;
          break;
        }
      }

      state.md.inline.skipToken(state);
    }

    if (!found) {
      // Parser failed to find ending tag, so it is not a valid math
      state.pos = start;
      return false;
    }

    // Found!
    state.posMax = state.pos;
    state.pos = start + close.length;

    // Earlier we checked !silent, but this implementation does not need it
    token = state.push('math_inline', 'math', 0);
    token.content = state.src.slice(state.pos, state.posMax);
    token.markup = open;

    state.pos = state.posMax + close.length;
    state.posMax = max;

    return true;
  };
}

function makeMath_block(open, close) {
  return function math_block(state, startLine, endLine, silent) {
    var openDelim, len, params, nextLine, token, firstLine, lastLine, lastLinePos,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    if (pos + open.length > max) { return false; }

    openDelim = state.src.slice(pos, pos + open.length);

    if (openDelim !== open) { return false; }

    pos += open.length;
    firstLine = state.src.slice(pos, max);

    // Since start is found, we can report success here in validation mode
    if (silent) { return true; }

    if (firstLine.trim().slice(-close.length) === close) {
      // Single line expression
      firstLine = firstLine.trim().slice(0, -close.length);
      haveEndMarker = true;
    }

    // search end of block
    nextLine = startLine;

    for (;;) {
      if (haveEndMarker) { break; }

      nextLine++;

      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      pos = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.tShift[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        break;
      }

      if (state.src.slice(pos, max).trim().slice(-close.length) !== close) {
        continue;
      }

      if (state.tShift[nextLine] - state.blkIndent >= 4) {
        // closing block math should be indented less then 4 spaces
        continue;
      }

      lastLinePos = state.src.slice(0, max).lastIndexOf(close);
      lastLine = state.src.slice(pos, lastLinePos);

      pos += lastLine.length + close.length;

      // make sure tail has spaces only
      pos = state.skipSpaces(pos);

      if (pos < max) { continue; }

      // found!
      haveEndMarker = true;
    }

    // If math block has heading spaces, they should be removed from its inner block
    len = state.tShift[startLine];

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
      state.getLines(startLine + 1, nextLine, len, true) +
      (lastLine && lastLine.trim() ? lastLine : '');
    token.info = params;
    token.map = [ startLine, state.line ];
    token.markup = open;

    return true;
  };
}

function makeMathRenderer(renderingOptions) {
  if (ascii2mathml === null) {
    try {
      ascii2mathml = require('ascii2mathml').default;
    } catch (e) {
      return renderingOptions && renderingOptions.display === 'block' ?
        function(tokens, idx) {
          return '<div class="math block">' + tokens[idx].content + '</div>';
        } :
        function(tokens, idx) {
          return '<span class="math inline">' + tokens[idx].content + '</span>';
        };
    }
  }

  var mathml = ascii2mathml(Object.assign({}, renderingOptions));

  return renderingOptions && renderingOptions.display === 'block' ?
    function(tokens, idx) {
      return mathml(tokens[idx].content) + '\n';
    } :
    function(tokens, idx) {
      return mathml(tokens[idx].content);
    };
}


module.exports = function math_plugin(md, options) {
  // Default options
  options = typeof options === 'object' ? options : {};
  var inlineOpen = options.inlineOpen || '$$',
      inlineClose = options.inlineClose || '$$',
      blockOpen = options.blockOpen || '$$$',
      blockClose = options.blockClose || '$$$';
  var inlineRenderer = options.inlineRenderer ?
        function(tokens, idx) {
          return options.inlineRenderer(tokens[idx].content, tokens[idx]);
        } :
      makeMathRenderer(options.renderingOptions);
  var blockRenderer = options.blockRenderer ?
        function(tokens, idx) {
          return options.blockRenderer(tokens[idx].content, tokens[idx]) + '\n';
        } :
      makeMathRenderer(Object.assign({ display: 'block' },
                                     options.renderingOptions));

  var math_inline = makeMath_inline(inlineOpen, inlineClose);
  var math_block = makeMath_block(blockOpen, blockClose);

  md.inline.ruler.before('escape', 'math_inline', math_inline);
  md.block.ruler.after('blockquote', 'math_block', math_block, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules.math_inline = inlineRenderer;
  md.renderer.rules.math_block = blockRenderer;
};

},{"./lib/polyfills":1,"ascii2mathml":2}]},{},[6])(6)
});
