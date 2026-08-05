// Shared share logic for System Card V2 — ported byte-for-byte from Data
// Studio's components/system-card-v2/shareCard.ts. Native share sheet where
// available, otherwise clipboard, otherwise a manual-copy prompt.

export type ShareOutcome = 'shared' | 'copied' | 'prompted'

export async function shareSystemCard(opts: { title: string; text: string; url: string }): Promise<ShareOutcome> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share(opts)
      return 'shared'
    } catch {
      // User cancelled the native share sheet — not an error, nothing to fall back to.
      return 'shared'
    }
  }
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(opts.url)
      return 'copied'
    } catch {
      // fall through to prompt
    }
  }
  if (typeof window !== 'undefined') window.prompt('Copy this link', opts.url)
  return 'prompted'
}
