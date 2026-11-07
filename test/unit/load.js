import loadShader from '../../src/loadShader.js';

// loadShader with the plugin's default options and `minify` on, as Vite runs it
export default async (code, file = '/shader.glsl') => (await loadShader(code, file, {
  importKeywords: ['#include'], defaultExtension: 'glsl', warnDuplicatedImports: true,
  removeDuplicatedImports: false, root: '/', minify: true
})).outputShader;
