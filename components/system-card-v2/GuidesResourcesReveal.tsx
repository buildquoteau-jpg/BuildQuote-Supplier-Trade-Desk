// Guides and Resources screen — ported byte-for-byte (aside from the type
// import) from Data Studio's System Card V2
// (components/system-card-v2/GuidesResourcesReveal.tsx). Real centred
// buttons (meta line + bold label + arrow). Resource type is derived from
// the real URL (file extension / which field it came from), not invented.

import type { SystemCardSystem } from '@/components/system-card/types'
import styles from './RevealsBody.module.css'

function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function GuidesResourcesReveal({ system }: { system: SystemCardSystem }) {
  const resources: { label: string; url: string; type: string }[] = []
  for (const l of system.install_guide_urls ?? []) resources.push({ label: l.label, url: l.url, type: 'Installation guide' })
  if (system.design_guide_url) resources.push({ label: 'Design guide', url: system.design_guide_url, type: 'Design guide' })
  if (system.tech_data_url) resources.push({ label: 'Technical guide', url: system.tech_data_url, type: 'Technical guide' })
  for (const l of system.custom_document_links ?? []) {
    const isPdf = /\.pdf(\?|#|$)/i.test(l.url)
    const isColour = /colour|color/i.test(l.label)
    const isCalculator = /calculat/i.test(l.label)
    const type = isColour ? 'Colour guide' : isCalculator ? 'Calculator' : isPdf ? 'PDF guide' : 'Resource'
    resources.push({ label: l.label, url: l.url, type })
  }
  if (system.website_url) {
    resources.push({ label: `${system.manufacturer?.name ?? 'Manufacturer'} website`, url: system.website_url, type: 'Website' })
  }

  if (resources.length === 0) {
    return <p className={styles.emptyState}>No resources listed yet.</p>
  }

  return (
    <div className={styles.resourceList}>
      {resources.map(r => (
        <a key={r.url} href={r.url} target="_blank" rel="noopener noreferrer" className={styles.resourceRow}>
          <span className={styles.resourceMeta}>{r.type} · {hostOf(r.url)}</span>
          <span className={styles.resourceLabel}>{r.label} ↗</span>
        </a>
      ))}
    </div>
  )
}
