import { test } from 'node:test';
import assert from 'node:assert/strict';
import load from './load.js';

test("the spaces around WGSL's attributes and the : of its declarations go", async () => {
  assert.equal(await load('@group(0) @binding(0) var<uniform> u: U;', '/shader.wgsl'), '@group(0)@binding(0)var<uniform>u:U;');
  assert.equal(await load('@compute @workgroup_size(64) fn main() {}', '/shader.wgsl'), '@compute@workgroup_size(64)fn main(){}');
  assert.equal(await load('@fragment fn f(@builtin(position) at: vec4f) -> @location(0) vec4f { return at; }', '/shader.wgsl'), '@fragment fn f(@builtin(position)at:vec4f)->@location(0)vec4f{return at;}');
});

test('the spaces around % ^ ~ ? and : go', async () => {
  assert.equal(await load('x = a % b ^ ~c;'), 'x=a%b^~c;');
  assert.equal(await load('y = a ? b : c;'), 'y=a?b:c;');
});
