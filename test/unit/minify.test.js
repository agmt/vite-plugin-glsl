import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import loadShader from '../../src/loadShader.js';
import load from './load.js';
import { directives, tokens } from './tokens.js';

const options = minify => ({ importKeywords: ['#include'], defaultExtension: 'glsl', warnDuplicatedImports: true, removeDuplicatedImports: false, root: '/', minify });
const loadFile = async (file, minify) => (await loadShader(readFileSync(file, 'utf8'), `${process.cwd()}/${file}`, options(minify))).outputShader;

for (const file of ['test/glsl/main.frag', 'test/wgsl/main.wgsl']) {
  test(`${file} minified keeps every token and directive of it loaded, and no comment`, async () => {
    const [loaded, minified] = [await loadFile(file, false), await loadFile(file, true)];
    assert.deepEqual(tokens(minified), tokens(loaded));
    assert.deepEqual(directives(minified), directives(loaded));
    assert.ok(minified.length < loaded.length);
    assert.doesNotMatch(minified, /\/\/|\/\*/);
  });
}

test('the spaces around operators and brackets go, those between two words stay', async () => {
  assert.equal(await load('void main (void) {\n  gl_FragColor = vec4(a * 2.0 + b, 1.0);\n}\n'), 'void main(void){gl_FragColor=vec4(a*2.+b,1.);}');
  assert.equal(await load('fn f(x: f32) -> f32 {\n  return x - 1.0;\n}\n', '/shader.wgsl'), 'fn f(x:f32)->f32{return x-1.;}');
});

test('a directive keeps its own line', async () => {
  assert.equal(await load('#version 300 es\nprecision highp float;\n#define TWO 2.0\nout vec4 color;\n'), '#version 300 es\nprecision highp float;\n#define TWO 2.0\nout vec4 color;');
});
