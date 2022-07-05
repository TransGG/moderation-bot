// This tagged template is safe with any interpolations
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function hAddTimestamp(strs: TemplateStringsArray, ...interpols: any[]) {
  return `${strs
    .map((str, i) => str + (interpols.length > i ? interpols[i] : ''))
    .join('')
  }?v=${Date.now()}`;
}
