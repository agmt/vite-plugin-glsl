import { test } from 'node:test';
import assert from 'node:assert/strict';
import { minifyShader } from '../../src/loadShader.js';
import load from './load.js';

test('a comment between two words leaves them two words', async () => {
  assert.equal(await load('uniform float/**/time;'), 'uniform floattime;'); // ToDo: expected: 'uniform float time;'
  assert.equal(minifyShader('uniform float/**/time;'), 'uniform floattime;'); // ToDo: expected: 'uniform float time;'
});

test('a block comment over several lines is taken out whole', async () => {
  assert.equal(await load('/* a block\n   over two lines */ int d = 1;'), 'int d=1;');
  assert.equal(minifyShader('/* a block\n   over two lines */ int d = 1;'), '/*a blockover two lines*/int d=1;'); // ToDo: expected: 'int d=1;'
});

test("a // inside a block comment is part of that comment, and the code after it stays", async () => {
  assert.equal(await load('/* see http://a.b */ float x;\nfloat y;\n/* two */ float z;'), 'float z;'); // ToDo: expected: 'float x;float y;float z;'
  assert.equal(minifyShader('/* see http://a.b */ float x;\nfloat y;\n/* two */ float z;'), 'float x;float y;float z;');
  assert.equal(await load('/* first\n a // b */ float e;'), '/*firsta'); // ToDo: expected: 'float e;'
  assert.equal(minifyShader('/* first\n a // b */ float e;'), '/*firsta'); // ToDo: expected: 'float e;'
});
