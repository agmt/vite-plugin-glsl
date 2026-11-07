import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { build } from 'vite';
import glsl from '../../src/index.js';

test('a WGSL file and the chunk it includes come out of a Vite build as one minified string', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'vite-'));
  writeFileSync(join(folder, 'main.js'), "import shader from './main.wgsl';\nexport default shader;\n");
  writeFileSync(join(folder, 'half.wgsl'), '/* a /* nested */ note */\nfn half(x: f32) -> f32 {\n  return x * 0.50;\n}\n');
  writeFileSync(join(folder, 'main.wgsl'), '#include half.wgsl;\n\n@fragment\nfn fs(@builtin(position) at: vec4f) -> @location(0) vec4f {\n  return vec4f(half(at.x), 0.0, 0.0, 1.0); // red\n}\n');
  const [{ output }] = [].concat(await build({
    root: folder, configFile: false, logLevel: 'silent',
    plugins: [glsl({ minify: true })],
    build: { write: false, minify: false, lib: { entry: join(folder, 'main.js'), formats: ['es'], fileName: 'main' } }
  }));
  // a file, not a data: address, which Bun's import takes as text
  writeFileSync(join(folder, 'built.mjs'), output[0].code);
  const { default: shader } = await import(pathToFileURL(join(folder, 'built.mjs')).href);
  assert.equal(shader, 'fn half(x:f32)->f32{return x*.5;}@fragment fn fs(@builtin(position)at:vec4f)->@location(0)vec4f{return vec4f(half(at.x),0.,0.,1.);}');
});
