import { test } from 'node:test';
import assert from 'node:assert/strict';
import load from './load.js';

test('every minus sign of a line loses its spaces, not only the first', async () => {
  assert.equal(await load('let a = b - c - d - e;', '/shader.wgsl'), 'let a=b-c - d - e;'); // ToDo: expected: 'let a=b-c-d-e;'
  assert.equal(await load('y = a - b; return c - d;'), 'y=a-b;return c - d;'); // ToDo: expected: 'y=a-b;return c-d;'
  assert.equal(await load('z = - a - - b;'), 'z=-a - - b;'); // ToDo: expected: 'z=-a- -b;'
});
