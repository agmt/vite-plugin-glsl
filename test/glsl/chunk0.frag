#include utils/chunk1;

/// Uses chunkRGB from #include utils/chunk1
vec4 chunkFn () {
  return vec4(chunkRGB(), 1.0);
}
