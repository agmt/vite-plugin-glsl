import { test } from 'node:test';
import assert from 'node:assert/strict';
import load from './load.js';

test("a line's last word and the next line's first stay two words", async () => {
  assert.equal(await load('uniform float\ntime;'), 'uniform float time;');
  assert.equal(await load('uniform float\n  \ntime;'), 'uniform floattime;'); // ToDo: expected: 'uniform float time;'
  assert.equal(await load('@must_use\nfn f() -> f32 { return x; }', '/shader.wgsl'), '@must_use fn f()->f32{return x;}');
  assert.equal(await load('#define A 1\nfloat\nb;\n#define B 2\n'), '#define A 1\nfloat b;\n#define B 2\n');
});

test("a line's last sign and the next line's first stay two signs", async () => {
  assert.equal(await load('float a = b +\n+c;'), 'float a=b++c;'); // ToDo: expected: 'float a=b+ +c;'
  assert.equal(await load('float a = b +\n++c;'), 'float a=b+++c;'); // ToDo: expected: 'float a=b+ ++c;'
  assert.equal(await load('let a = b -\n-c;', '/shader.wgsl'), 'let a=b--c;'); // ToDo: expected: 'let a=b- -c;'
  assert.equal(await load('let a = b /\n*p;', '/shader.wgsl'), 'let a=b/*p;'); // ToDo: expected: 'let a=b/ *p;'
  assert.equal(await load('let a = b *\n*p;', '/shader.wgsl'), 'let a=b**p;');
  assert.equal(await load('x = a\n-b;'), 'x=a-b;');
});

test('an entry point, a return and an else at a line end still part from what follows', async () => {
  assert.equal(await load('@vertex\nfn main() -> @builtin(position) vec4f { return p; }', '/shader.wgsl'), '@vertex fn main()->@builtin(position)vec4f{return p;}');
  assert.equal(await load('if (a) { return\nb; } else\nif (c) {}\nelse\n{ d(); }'), 'if(a){return b;}else if(c){}else{d();}');
});
