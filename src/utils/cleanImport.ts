export default async function cleanImport(module: string) {
  return await import(`${module}?timestamp=${Date.now()}`)
}
