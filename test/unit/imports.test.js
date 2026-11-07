import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import load from './load.js';

test('a chunk is included though a triple-slash comment after its import names the keyword', async () => {
  const folder = mkdtempSync(join(tmpdir(), 'imports-'));
  writeFileSync(join(folder, 'b.glsl'), 'int b() { return 1; }\n');
  const main = '#include b\nvoid main() {}\n/// see what #include b brings\n';
  assert.equal(await load(main, join(folder, 'a.glsl')), 'int b(){return 1;}void main(){}');
});
