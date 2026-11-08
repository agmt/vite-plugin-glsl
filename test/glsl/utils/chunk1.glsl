#include 'chunk2.frag';
#include "../chunk3.frag";

/* Shader chunks test: https://github.com/UstymUkhman/vite-plugin-glsl */
vec3 chunkRGB () {
  return vec3(chunkRed(), chunkGreen(), /* blue */ 0.0);
}
