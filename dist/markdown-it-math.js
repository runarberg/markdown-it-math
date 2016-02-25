/*! markdown-it-math 3.0.2 https://github.com/runarberg/markdown-it-math @license MIT */
(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.markdownitMath = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
/* Process inline math */

'use strict';
var prefix = 'mathjax-';
var divIndex = 0;
require('./lib/polyfills');


function scanDelims(state, start, delimLength) {
  var pos = start, lastChar, nextChar, count, can_open, can_close,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      left_flanking = true,
      right_flanking = true,
      max = state.posMax,
      isWhiteSpace = state.md.utils.isWhiteSpace,
      isPunctChar = state.md.utils.isPunctChar,
      isMdAsciiPunct = state.md.utils.isMdAsciiPunct;

  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : 0x20;

  if (pos >= max) {
    can_open = false;
  }

  pos += delimLength;

  count = pos - start;

  // treat end of the line as a whitespace
  nextChar = pos < max ? state.src.charCodeAt(pos) : 0x20;

  isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
  isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));

  isLastWhiteSpace = isWhiteSpace(lastChar);
  isNextWhiteSpace = isWhiteSpace(nextChar);

  if (isNextWhiteSpace) {
    left_flanking = false;
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar)) {
      left_flanking = false;
    }
  }

  if (isLastWhiteSpace) {
    right_flanking = false;
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar)) {
      right_flanking = false;
    }
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

function makeMath_block(openList, closeList, blockStartsWith, blockEndsWith) {
  return function math_block(state, startLine, endLine, silent) {
    var openDelim, len, params, nextLine, token, firstLine, lastLine, lastLinePos,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    var possibleTokens = [];
    for (var i = 0; i < openList.length; i++) {
      if (pos + openList[i].length <= max || (openList[i].endsWith('\n') && pos + openList[i].length + 1 == max)) {
        possibleTokens.push(openList[i]); 
      }
    }

    if (possibleTokens.length == 0)
      return false;

    var open = '';

    for (var i = 0; i < possibleTokens.length && open === ''; i++) {
      openDelim = state.src.slice(pos, pos + possibleTokens[i].length);
      if (openDelim === possibleTokens[i]) { open = possibleTokens[i]; }
    }
    if (open.length == 0)
      return false;

    pos += open.length;
    firstLine = state.src.slice(pos, max);

    // Since start is found, we can report success here in validation mode
    if (silent) { return true; }

    for (var i = 0; i < closeList.length; i++) {
      if (firstLine.trim().slice(-closeList[i].length) === closeList[i]) {
        // Single line expression
        firstLine = firstLine.trim().slice(0, -closeList[i].length);
        haveEndMarker = true;
      }
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

      if (pos < max && state.tShift[nextLine] < state.blkIfndent) {
        // non-empty line with negative indent should stop the list:
        break;
      }

      var close = '';
      for (var i = 0; i < closeList.length && close.length == 0; i++) {
        if (state.src.slice(pos, max).trim().slice(-closeList[i].length) === closeList[i]) {
          close = closeList[i];
        }
      }

      if (close.length == 0)
        continue;

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

    var content = (firstLine && firstLine.trim() ? firstLine + '\n' : '') +
      state.getLines(startLine + 1, nextLine, len, true) +
      (lastLine && lastLine.trim() ? lastLine : '');

    if (!content.startsWith(blockStartsWith) || !content.endsWith(blockEndsWith)) {
      return false;
    }

    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = content;
    token.info = params;
    token.map = [ startLine, state.line ];
    token.markup = open;
    return true;
  };
}

function makeInlineMathRenderer(renderingOptions, suffix) {
  return function(tokens, idx) {
      return '<span id="' + prefix + divIndex++ + suffix +
       '" class="math inline">' + tokens[idx].content + '</span>';
    };
}

function makeBlockMathRenderer(renderingOptions, suffix) {
  return function(tokens, idx) {
      return '<span id="' + prefix + divIndex++ + suffix +
       '" class="math block">' + tokens[idx].content + '</span>';
    };    
}


module.exports = function math_plugin(md, options) {
  divIndex = 0;
  // Default options
  options = typeof options === 'object' ? options : {};
  var inlineOpen = options.inlineOpen || '$$',
      inlineClose = options.inlineClose || '$$',
      blockOpen = options.blockOpen || ['$$\n'],
      blockClose = options.blockClose || ['\n$$'],
      blockStartsWith = options.blockStartsWith || '\\begin{aligned}',
      blockEndsWith = options.blockEndsWith || '\\end{aligned}\n',
      suffix = options.suffix || 'noSuffixProvided';
  var inlineRenderer = makeInlineMathRenderer(options.renderingOptions, suffix);
  var blockRenderer = makeBlockMathRenderer(options.renderingOptions, suffix);

  var math_inline = makeMath_inline(inlineOpen, inlineClose);
  var math_block = makeMath_block(blockOpen, blockClose, blockStartsWith, blockEndsWith);

 md.inline.ruler.before('escape', 'math_inline', math_inline);
 md.block.ruler.after('blockquote', 'math_block', math_block, {
    alt: [ 'paragraph', 'reference', 'blockquote', 'list' ]
  });
  md.renderer.rules.math_inline = inlineRenderer;
  md.renderer.rules.math_block = blockRenderer;
};
},{"./lib/polyfills":1}]},{},[2])(2)
});