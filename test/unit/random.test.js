import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minifyShader } from '../../src/loadShader.js';
import load from './load.js';
import { tokens } from './tokens.js';

const WORDS = ['a', 'b1', '_c', 'fn', 'else', 'return', '2', '1.0', '0.5f', '.5', '1e5', '1e-5', '0x1F'];
const SIGNS = ['+', '-', '*', '/', '%', '&', '|', '^', '!', '~', '<', '>', '=', '?', ':', '.', ',', ';', '(', ')', '[', ']', '{', '}', '@', '++', '--', '&&', '||', '<<', '<=', '==', '!=', '+=', '-=', '->'];
const BLANKS = [' ', '  ', '\t', '\n', ' \n ', '\n\n', '/* c */', '// c\n', '/*\n*/', ''];

// the same strings every run: a linear congruential generator from a fixed seed
function* strings (count, seed = 1) {
  const next = n => (seed = (seed * 1103515245 + 12345) % 2147483648) % n;
  const pick = list => list[next(list.length)];

  for (let i = 0; i < count; i++) {
    const parts = [];
    for (let n = 1 + next(6); n--; ) parts.push(pick(next(2) ? WORDS : SIGNS), pick(BLANKS));
    yield parts.join('');
  }
}

// two signs apart that make one token together, which no shader writes (`+ =`, `! =`, `& &`, `- >`), are left out
const valid = code => !/[-+*/%&|^!<>=]\s+=|-\s+>|&\s+&|\|\s+\||\^\s+\^|<\s+<|\/\s+\//.test(code.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*/g, ' '));

test('random strings of words, signs, blank space and comments keep their tokens, through the loader and through minify', async () => {
  const changed = [];
  for (const code of [...strings(20000)].filter(valid)) {
    for (const minified of [await load(code), minifyShader(code)])
      if (JSON.stringify(tokens(minified)) !== JSON.stringify(tokens(code))) changed.push([code, minified]);
  }
  assert.deepEqual(changed.slice(0, 5), []);
});
