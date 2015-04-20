/* Process inline math */

'use strict';

var repeat = require('repeat-string'),
    ascii2mathml = require('ascii2mathml');
require('./lib/polyfills');


function scanDelims(state, start) {
  var pos = state.pos, lastChar, nextChar, count,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      can_open = true,
      can_close = true,
      max = state.posMax,
      isWhiteSpace = state.md.utils.isWhiteSpace,
      isPunctChar = state.md.utils.isPunctChar,
      isMdAsciiPunct = state.md.utils.isMdAsciiPunct;
  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : 0x20;
  if (pos >= max) {
    can_open = false;
  }
  count = pos - start;
  // treat end of the line as a whitespace
  nextChar = pos < max ? state.src.charCodeAt(pos) : 0x20;
  isLastPunctChar = isMdAsciiPunct(lastChar) || isPunctChar(String.fromCharCode(lastChar));
  isNextPunctChar = isMdAsciiPunct(nextChar) || isPunctChar(String.fromCharCode(nextChar));
  isLastWhiteSpace = isWhiteSpace(lastChar);
  isNextWhiteSpace = isWhiteSpace(nextChar);
  if (isNextWhiteSpace) {
    can_open = false;
  } else if (isNextPunctChar) {
    if (!(isLastWhiteSpace || isLastPunctChar)) {
      can_open = false;
    }
  }
  if (isLastWhiteSpace) {
    can_close = false;
  } else if (isLastPunctChar) {
    if (!(isNextWhiteSpace || isNextPunctChar)) {
      can_close = false;
    }
  }
  return {
    can_open: can_open,
    can_close: can_close,
    delims: count
  };
}


function makeMath_inline(open, close) {
  return function math_inline(state, silent) {
    var startCount,
        count,
        tagCount,
        found,
        stack,
        res,
        token,
        closeDelim,
        max = state.posMax,
        start = state.pos,
        openDelim = state.src.slice(start, start + open.length);

    if (openDelim !== open) { return false; }
    if (silent) { return false; }    // Don’t run any pairs in validation mode

    res = scanDelims(state, start+open.length);
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
        res = scanDelims(state, state.pos + close.length);
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
    var openDelim, closeDelim, len, params, nextLine, mem, token, markup,
        haveEndMarker = false,
        pos = state.bMarks[startLine] + state.tShift[startLine],
        max = state.eMarks[startLine];

    if (pos + open.length > max) { return false; }

    openDelim = state.src.slice(pos, pos + open.length);

    if (openDelim !== open) { return false; }

    // Since start is found, we can report success here in validation mode
    if (silent) { return true; }

    // search end of block
    nextLine = startLine;

    for (;;) {
      nextLine++;
      if (nextLine >= endLine) {
        // unclosed block should be autoclosed by end of document.
        // also block seems to be autoclosed by end of parent
        break;
      }

      pos = mem = state.bMarks[nextLine] + state.tShift[nextLine];
      max = state.eMarks[nextLine];

      if (pos < max && state.tShift[nextLine] < state.blkIndent) {
        // non-empty line with negative indent should stop the list:
        break;
      }

      if (state.src.slice(pos, pos + close.length) !== close) { continue; }

      if (state.tShift[nextLine] - state.blkIndent >= 4) {
        // closing block math should be indented less then 4 spaces
        continue;
      }

      pos += close.length;

      // make sure tail has spaces only
      pos = state.skipSpaces(pos);

      if (pos < max) { continue; }
      haveEndMarker = true;
      // found!
      break;
    }

    // If math block has heading spaces, the should be removed from its inner block
    len = state.tShift[startLine];

    state.line = nextLine + (haveEndMarker ? 1 : 0);

    token = state.push('math_block', 'math', 0);
    token.block = true;
    token.content = state.getLines(startLine + 1, nextLine, len, true);
    token.info = params;
    token.map = [ startLine, state.line ];
    token.markup = markup;

    return true;
  };
}

function makeMathRenderer(options) {
  var mathml = ascii2mathml(Object.assign({}, options));

  return (options && options.display === 'block') ?
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
  var inlineOpen = options.inlineOpen || "$$",
      inlineClose = options.inlineClose || "$$",
      blockOpen = options.blockOpen || "$$$",
      blockClose = options.blockClose || "$$$";
  var inlineRenderer = options.inlineRenderer ?
        function(tokens, idx) {
          return options.inlineRenderer(tokens[idx].content);
        } :
      makeMathRenderer(options.renderingOptions);
  var blockRenderer = options.blockRenderer ?
        function(tokens, idx) {
          return options.blockRenderer(tokens[idx].content) + '\n';
        } :
      makeMathRenderer(Object.assign({ display: 'block' },
                                     options.renderingOptions));

  var math_inline = makeMath_inline(inlineOpen, inlineClose);
  var math_block = makeMath_block(blockOpen, blockClose);

  md.inline.ruler.before('escape', 'math_inline', math_inline);
  md.block.ruler.after('blockquote', 'math_block', math_block);
  md.renderer.rules.math_inline = inlineRenderer;
  md.renderer.rules.math_block = blockRenderer;
};
