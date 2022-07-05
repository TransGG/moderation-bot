export default function hAddTimestamp(strs: TemplateStringsArray, ...interpols: any[]) {
  return `${strs
    .map((str, i) => str + (interpols.length > i ? interpols[i] : ''))
    .join('')
  }?v=${Date.now()}`;
}