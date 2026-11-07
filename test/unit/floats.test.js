import { test } from 'node:test';
import assert from 'node:assert/strict';
import load from './load.js';

test('a float literal loses the zeros that carry nothing, and stays a float', async () => {
  assert.equal(await load('let a = vec4(0.50, 1.0, 10.0, 0.0);', '/shader.wgsl'), 'let a=vec4(.5,1.,10.,0.);');
  assert.equal(await load('let b = vec4(0.5f, 1.0f, 2.50e-3f, .0f);', '/shader.wgsl'), 'let b=vec4(.5f,1.f,2.5e-3f,0.f);');
  assert.equal(await load('#define HALF 0.50\nfloat h = 0.50;'), '#define HALF 0.50\nfloat h=.5;');
});

test('names with digits, hexadecimal and whole numbers stay as written', async () => {
  assert.equal(await load('let c = v.x + a1.y + _e10.z + 0x1.8p1 + 1e5 + 1.05;\nlet i = 2u;', '/shader.wgsl'), 'let c=v.x+a1.y+_e10.z+0x1.8p1+1e5+1.05;let i=2u;');
});
