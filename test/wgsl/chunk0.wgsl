#include utils/chunk1.wgsl;

fn chunkFn() -> vec4f {
  return vec4f(chunkRGB(), 1.0);
}

fn chunkScale(value: f32, scale: ptr<function, f32>) -> f32 {
  return value / *scale;
}
