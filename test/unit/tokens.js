// a GLSL block comment ends at its first */, whatever it holds
const COMMENT = /\/\*[\s\S]*?\*\/|\/\/[^\n\r]*/y;
// `>` stands alone, as WGSL reads it where it closes a template list: `vec2<f32>=v` is `vec2<f32> = v`
const OPERATOR = /<<=|\+\+|--|&&|\|\||\^\^|<<|<=|==|!=|\+=|-=|\*=|\/=|%=|&=|\|=|\^=|->|[^\s\w]/y;
const NUMBER = /(?:0[xX][\da-fA-F]*\.?[\da-fA-F]*(?:[pP][+-]?\d+)?|\d+\.\d*(?:[eE][+-]?\d+)?|\.\d+(?:[eE][+-]?\d+)?|\d+(?:[eE][+-]?\d+)?)\w*/y;
const WORD = /[A-Za-z_]\w*/y;
const BLANK = /\s+/y;

// the tokens as the compiler takes them: a float literal by its value and suffix, an optional comma left out
export const tokens = code => written(code)
  .filter((token, at, all) => token !== ',' || !/^[)\]}>]$/.test(all[at + 1]))
  .map(token => token.replace(/^(\d*\.\d*(?:[eE][+-]?\d+)?)(\w*)$/, (_, number, suffix) => `${Number(number)}.${suffix}`));

export function written(code) {
  const found = [];
  for (let at = 0; at < code.length; ) {
    let match = null;
    for (const rule of [BLANK, COMMENT, NUMBER, WORD, OPERATOR]) {
      rule.lastIndex = at;
      if ((match = rule.exec(code))) {
        if (rule !== BLANK && rule !== COMMENT) found.push(match[0]);
        break;
      }
    }
    at += match[0].length;
  }
  return found;
}

export const directives = code => code.split(/\r?\n/).map(line => line.trim().replace(/\s+/g, ' ')).filter(line => line.startsWith('#'));
