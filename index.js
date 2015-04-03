/* Process inline math */

'use strict';

var repeat = require('repeat-string');
require('./lib/polyfills');


function scanDelims(state, start) {
  var pos = start, lastChar, nextChar, count,
      isLastWhiteSpace, isLastPunctChar,
      isNextWhiteSpace, isNextPunctChar,
      can_open = true,
      can_close = true,
      max = state.posMax,
      marker = state.src.charCodeAt(start),
      isWhiteSpace = state.md.utils.isWhiteSpace,
      isPunctChar = state.md.utils.isPunctChar,
      isMdAsciiPunct = state.md.utils.isMdAsciiPunct;
  // treat beginning of the line as a whitespace
  lastChar = start > 0 ? state.src.charCodeAt(start - 1) : 0x20;
  while (pos < max && state.src.charCodeAt(pos) === marker) { pos++; }
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


function math_inline(state, silent) {
  var startCount,
      count,
      tagCount,
      found,
      stack,
      res,
      token,
      max = state.posMax,
      start = state.pos,
      marker = state.src.charCodeAt(start);

  if (marker !== 0x24/* $ */) { return false; }
  if (silent) { return false; }    // Don’t run any pairs in validation mode

  res = scanDelims(state, start);
  startCount = res.delims;

  if (!res.can_open) {
    state.pos += startCount;
    // Earlier we checked !silent, but this implementation does not need it
    state.pending += state.src.slice(start, state.pos);
    return true;
  }

  stack = Math.floor(startCount / 2);
  if (stack <= 0) { return false; }
  state.pos = start + startCount;

  while (state.pos < max) {
    if (state.src.charCodeAt(state.pos) === marker) {
      res = scanDelims(state, state.pos);
      count = res.delims;
      tagCount = Math.floor(count / 2);
      if (res.can_close) {
        if (tagCount >= stack) {
          state.pos += count - 2;
          found = true;
          break;
        }
        stack -= tagCount;
        state.pos += count;
        continue;
      }

      if (res.can_open) { stack += tagCount; }
      state.pos += count;
      continue;
    }

    state.md.inline.skipToken(state);
  }

  if (!found) {
    // Parser failed to find ending tag, so it is not a valid emphasis
    state.pos = start;
    return false;
  }

  // Found!
  state.posMax = state.pos;
  state.pos = start + 2;

  // Earlier we checked !silent, but this implementation does not need it
  token = state.push('math_inline_open', 'math', 1);
  token.markup = repeat(String.fromCharCode(marker), 2);

  token = state.push('math', '', 0);
  token.content = state.src.slice(state.pos, state.posMax);

  token = state.push('math_inline_close', 'math', -1);
  token.markup = repeat(String.fromCharCode(marker), 2);

  state.pos = state.posMax + 2;
  state.posMax = max;

  return true;
}


function math_block(state, startLine, endLine, silent) {
  var marker, len, params, nextLine, mem, token, markup,
      haveEndMarker = false,
      pos = state.bMarks[startLine] + state.tShift[startLine],
      max = state.eMarks[startLine];

  if (pos + 3 > max) { return false; }

  marker = state.src.charCodeAt(pos);

  if (marker !== 0x24/* $ */) { return false; }

  // scan marker length
  mem = pos;
  pos = state.skipChars(pos, marker);

  len = pos - mem;

  if (len < 3) { return false; }

  markup = state.src.slice(mem, pos);
  params = state.src.slice(pos, max);

  if (params.indexOf('$') >= 0) { return false; }

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
      // - $$$
      // test
      break;
    }

    if (state.src.charCodeAt(pos) !== marker) { continue; }

    if (state.tShift[nextLine] - state.blkIndent >= 4) {
      // closing block math should be indented less then 4 spaces
      continue;
    }

    pos = state.skipChars(pos, marker);

    // Closing block math should be at least as long as the open one
    if (pos - mem < len) { continue; }

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

  token = state.push('math_block_open', 'math', 1);
  token.attrPush([ 'display', 'block' ]);
  token.markup = markup;
  token.block = true;
  token.info = params;
  token.map = [ startLine, state.line ];

  token = state.push('math', '', 0);
  token.content = state.getLines(startLine + 1, nextLine, len, true);

  token = state.push('math_block_close', 'math', -1);
  token.markup = markup;
  token.block = true;

  return true;
}


function makeMathRenderer(options) {
  var mathml = require('ascii2mathml')(Object.assign({ bare: true }, options));

  return function(tokens, idx) {
    return mathml(tokens[idx].content);
  };
}


module.exports = function math_plugin(md, renderer) {
  var mathRenderer;
  if (typeof renderer !== 'function') {
    mathRenderer = makeMathRenderer(renderer);
  } else {
    mathRenderer = function(tokens, idx) {
      return renderer(tokens[idx].content);
    };
  }

  md.inline.ruler.before('emphasis', 'math_inline', math_inline);
  md.block.ruler.after('blockquote', 'math_block', math_block);
  md.renderer.rules.math = mathRenderer;
};
