export function htmlToPlainText(value: string | null | undefined): string {
  if (!value) return ''

  const withBreaks = value.replace(
    /<\s*\/?(?:p|div|li|h[1-6])\b[^>]*>|<\s*br\s*\/?\s*>/gi,
    '\n',
  )

  if (typeof DOMParser === 'undefined') {
    return withBreaks.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  }

  const text = new DOMParser().parseFromString(withBreaks, 'text/html').body.textContent || ''
  return text
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}
