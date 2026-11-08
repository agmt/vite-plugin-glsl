import { test } from 'node:test';
import assert from 'node:assert/strict';
import load from './load.js';

test('two signs that would read as one token keep the space between them', async () => {
  assert.equal(await load('a = b + +c;'), 'a=b++c;'); // ToDo: expected: 'a=b+ +c;'
  assert.equal(await load('a = b + ++c;'), 'a=b+++c;'); // ToDo: expected: 'a=b+ ++c;'
  assert.equal(await load('a = b++ + +c;'), 'a=b++++c;'); // ToDo: expected: 'a=b+++ +c;'
  assert.equal(await load('let a = b / *p;', '/shader.wgsl'), 'let a=b/*p;'); // ToDo: expected: 'let a=b/ *p;'
});

test('two signs that read the same joined lose the space between them', async () => {
  assert.equal(await load('a = b++ + c;'), 'a=b+++c;');
  assert.equal(await load('a = b + -c;'), 'a=b+-c;');
  assert.equal(await load('a = b - +c;'), 'a=b-+c;');
  assert.equal(await load('let a = b * *p;', '/shader.wgsl'), 'let a=b**p;');
  assert.equal(await load('let a = b + *p;', '/shader.wgsl'), 'let a=b+*p;');
  assert.equal(await load('x /= *p;', '/shader.wgsl'), 'x/=*p;');
});

test('two minus signs keep the space between them', async () => {
  assert.equal(await load('a = b - -c;'), 'a=b- -c;');
  assert.equal(await load('a = b - --c;'), 'a=b- --c;');
});

test('every two-character token stays one token', async () => {
  for (const [code, minified] of [
    ['x = a == b;', 'x=a==b;'], ['x = a != b;', 'x=a!=b;'], ['x = a <= b;', 'x=a<=b;'], ['x = a >= b;', 'x=a>=b;'],
    ['x = a && b;', 'x=a&&b;'], ['x = a || b;', 'x=a||b;'], ['x = a << b;', 'x=a<<b;'], ['x = a >> b;', 'x=a>>b;'],
    ['x += a;', 'x+=a;'], ['x -= a;', 'x-=a;'], ['x *= a;', 'x*=a;'], ['x /= a;', 'x/=a;'],
    ['x &= a;', 'x&=a;'], ['x |= a;', 'x|=a;'], ['i++;', 'i++;'], ['i--;', 'i--;']
  ]) assert.equal(await load(code), minified);
  assert.equal(await load('fn f() -> f32 { return x; }', '/shader.wgsl'), 'fn f()->f32{return x;}');
});
