/** "ISO/IEC 27001:2022" → "ISO/IEC 27001": the card shows the standard, the year stays in the data. */
export function shortStandardCode(code: string): string {
  return code.replace(/:\d{4}$/, "").trim();
}
