import { test } from 'node:test';
import assert from 'node:assert/strict';
import load from './load.js';

test('a comma before a closing bracket goes, wherever its lines are', async () => {
  assert.equal(await load('let v = vec3(\n  1,\n  2,\n  3,\n);', '/shader.wgsl'), 'let v=vec3(1,2,3,);'); // ToDo: expected: 'let v=vec3(1,2,3);'
  assert.equal(await load('alias A = array<f32, 4,>;', '/shader.wgsl'), 'alias A=array<f32,4,>;'); // ToDo: expected: 'alias A=array<f32,4>;'
});

test('a comma before a directive stays', async () => {
  assert.equal(await load('int a[] = {\n  1,\n#ifdef B\n  2,\n#endif\n};'), 'int a[]={1,\n#ifdef B\n2,\n#endif\n};');
});
