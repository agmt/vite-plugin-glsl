import { test } from 'node:test';
import assert from 'node:assert/strict';
import load from './load.js';

test("a line's last word and the next line's first stay two words", async () => {
  assert.equal(await load('uniform float\ntime;'), 'uniform float time;');
  assert.equal(await load('@must_use\nfn f() -> f32 { return x; }', '/shader.wgsl'), '@must_use fn f()->f32{return x;}');
  assert.equal(await load('#define A 1\nfloat\nb;\n#define B 2\n'), '#define A 1\nfloat b;\n#define B 2\n');
});

test('an entry point, a return and an else at a line end still part from what follows', async () => {
  assert.equal(await load('@vertex\nfn main() -> @builtin(position) vec4f { return p; }', '/shader.wgsl'), '@vertex fn main()->@builtin(position)vec4f{return p;}');
  assert.equal(await load('if (a) { return\nb; } else\nif (c) {}\nelse\n{ d(); }'), 'if(a){return b;}else if(c){}else{d();}');
});
