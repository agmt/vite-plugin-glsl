import { test } from 'node:test';
import assert from 'node:assert/strict';
import loadShader, { minifyShader } from '../../src/loadShader.js';
import load from './load.js';
import { tokens } from './tokens.js';

// the plugin's default, `minify` off, where the loader alone takes comments out
const loaded = async code => (await loadShader(code, '/shader.glsl', { importKeywords: ['#include'], defaultExtension: 'glsl', warnDuplicatedImports: true, removeDuplicatedImports: false, root: '/', minify: false })).outputShader;

test("a block comment's mark inside a line comment is that comment's text", async () => {
  assert.equal(await load('float a; // the /* rate\nfloat b; // */ float c;\n'), 'float a;float b;');
  assert.equal(minifyShader('float a; // the /* rate\nfloat b; // */ float c;\n'), 'float a;float b;');
});

test('a triple-slash comment stays where nothing is minified, unless it names an import', async () => {
  assert.equal(await loaded('float a; /// kept\n/// #include gone\nfloat b;'), 'float a; /// kept\n\nfloat b;');
  assert.equal(await load('float a; /// kept\nfloat b;'), 'float a;float b;');
});

test('a block comment left open, or closed without an opening, is warned of', async () => {
  await new Promise(resolve => setImmediate(resolve));
  const warnings = [];
  const listen = warning => warnings.push(warning.message);
  process.on('warning', listen);
  assert.equal(await loaded('float a; /* open\nfloat b;'), 'float a; /* open\nfloat b;');
  assert.equal(await loaded('float a; */ float b;'), 'float a; */ float b;');
  await new Promise(resolve => setImmediate(resolve));
  process.off('warning', listen);
  assert.deepEqual(warnings, ['Block comment was not closed.', 'Block comment was not opened.']);
});

test('two signs that read as two stay together, and a > that closes a template list joins what follows', async () => {
  assert.equal(await load('let a = b * *p;', '/shader.wgsl'), 'let a=b**p;');
  assert.equal(await load('x = !(a < -b);'), 'x=!(a<-b);');
  assert.equal(await load('var<private> v: vec2<f32> = vec2(0.0);', '/shader.wgsl'), 'var<private>v:vec2<f32>=vec2(0.);');
  assert.equal(await load('var<private> v: array<vec2<f32> >;', '/shader.wgsl'), 'var<private>v:array<vec2<f32>>;');
  assert.equal(await load('x %= 2; y ^= 3;'), 'x%=2;y^=3;');
});

test("a line's last sign and the next line's first stay two signs", async () => {
  assert.equal(await load('float a = b +\n+c;'), 'float a=b+ +c;');
  assert.equal(await load('let a = b -\n-c;', '/shader.wgsl'), 'let a=b- -c;');
  assert.equal(await load('let a = b /\n*p;', '/shader.wgsl'), 'let a=b/ *p;');
  assert.equal(await load('uniform float\n  \ntime;'), 'uniform float time;');
});

test('a line of signs side by side keeps its tokens', async () => {
  const line = 'a = b + +c - -d + ++e - --f;';
  assert.deepEqual(tokens(await load(line)), tokens(line));
});
