export function parseJson(s: any) {
  try { return typeof s === "string" ? JSON.parse(s) : s } catch { return {} }
}
