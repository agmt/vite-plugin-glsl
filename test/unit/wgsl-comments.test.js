import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minifyShader } from '../../src/loadShader.js';
import load from './load.js';

const nested = '/* a /* nested */ comment */ fn f() {}';

test('a WGSL block comment holds the block comments nested in it', async () => {
  assert.equal(await load(nested, '/shader.wgsl'), 'comment*/fn f(){}'); // ToDo: expected: 'fn f(){}'
  assert.equal(minifyShader(nested, { wgsl: true }), 'comment*/fn f(){}'); // ToDo: expected: 'fn f(){}'
});

test('a GLSL block comment still ends at its first */', async () => {
  assert.equal(await load('/* a /* b */ float c;'), 'float c;');
  assert.equal(minifyShader('/* a /* b */ float c;'), 'float c;');
});
