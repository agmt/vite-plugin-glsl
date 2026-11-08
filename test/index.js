const app = document.getElementById('app');

app.style.backgroundColor = '#222222';
app.style.fontFamily = 'monospace';
app.style.whiteSpace = 'pre-wrap';

app.style.color = '#bbbbbb';
app.style.padding = '16px';

const compileGLSL = glsl => {
  try {
    const gl = document.createElement('canvas').getContext('webgl2');
    if (!gl) return ' WebGL2 is not available.';

    const shader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(shader, glsl);
    gl.compileShader(shader);

    return !gl.getShaderParameter(shader, gl.COMPILE_STATUS)
      && ` WebGL2 ${gl.getShaderInfoLog(shader).trim()}` || '';
  }

  catch (error) {
    return ` ${error}`;
  }
};

const compileWGSL = async wgsl => {
  const adapter = await navigator.gpu?.requestAdapter();
  const device = await adapter?.requestDevice();
  if (!device) return ' WebGPU is not available.';

  const { messages } = await device.createShaderModule({ code: wgsl }).getCompilationInfo();

  return messages.filter(({ type }) => type === 'error').map(({ lineNum, linePos, message }) =>
    ` WebGPU error at ${lineNum}:${linePos}: ${message}`).join('\n');
};

const importShaders = () =>
  location.hash.slice(1) !== 'slang'
    ? Promise.all([import('./glsl/main.frag'), import('./wgsl/main.wgsl')])
      .then(([{ default: GLSL }, { default: WGSL }]) => {
        app.textContent += `----- GLSL: -----${compileGLSL(GLSL)}\n\n`;
        app.textContent += GLSL;

        compileWGSL(WGSL).catch(error => ` ${error}`).then(error => {
          app.textContent += `\n\n----- WGSL: -----${error}\n\n`;
          app.textContent += WGSL;
        });

        console.info(`GLSL Shader Length: ${GLSL.length} characters.`);
        console.info(`WGSL Shader Length: ${WGSL.length} characters.`);

        if (import.meta.hot) {
          import.meta.hot.accept('/test/glsl/main.frag', ({ default: glsl }) => {
            console.clear();
            console.info('GLSL Shader Hot Module Replacement.');
            console.info(`GLSL Shader Length: ${glsl.length} characters.`);

            app.textContent = `----- GLSL: -----${compileGLSL(glsl)}\n\n`;
            app.textContent += glsl;
          });

          import.meta.hot.accept('/test/wgsl/main.wgsl', ({ default: wgsl }) => {
            console.clear();
            console.info('WGSL Shader Hot Module Replacement.');
            console.info(`WGSL Shader Length: ${wgsl.length} characters.`);

            compileWGSL(wgsl).catch(error => ` ${error}`).then(error => {
              app.textContent = `----- WGSL: -----${error}\n\n`;
              app.textContent += wgsl;
            });
          });
        }
      })
    : ~import('./slang/shader.slang').then(({ default: Slang }) => {
      console.info(`Slang Shader Length: ${Slang.length} characters.`);

      app.textContent += '----- Slang: -----\n\n';
      app.textContent += Slang;

      import.meta.hot?.accept('/test/slang/shader.slang', ({ default: slang }) => {
        console.clear();
        console.info('Slang Shader Hot Module Replacement.');
        console.info(`Slang Shader Length: ${slang.length} characters.`);

        app.textContent = '----- Slang: -----\n\n';
        app.textContent += slang;
      });
    });

~addEventListener('hashchange', importShaders)
  && importShaders();
