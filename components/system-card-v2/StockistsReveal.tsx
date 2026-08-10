'use client'

// Stockists — the closing screen. The materials-list preview and "Add to
// shopping list" action moved to MaterialsListBar, rendered always-visible
// outside the accordion — see useMaterialsListRows.ts for the shared
// row-building logic both use. This file now holds only the local
// stockist list.
//
// A `showStockists` prop (default true) mirrors SystemCardRenderer's
// existing prop of the same name — Trade Desk passes false ("staff are
// the local stockist"), so only the materials-list bar is reachable there.

import type { SystemCardStockist } from '@/components/system-card/types'
import styles from './RevealsBody.module.css'

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function StockistsReveal({ stockists, showStockists = true }: {
  stockists: SystemCardStockist[]
  showStockists?: boolean
}) {
  if (!showStockists) return null

  return stockists.length === 0 ? (
    <p className={styles.emptyState}><PinIcon /> No local stockists listed yet.</p>
  ) : (
    <div className={styles.resourceList}>
      {stockists.map(s => (
        <div key={s.id} className={styles.resourceRow}>
          {(s.suburb || s.state) && <span className={styles.resourceMeta}>{[s.suburb, s.state].filter(Boolean).join(', ')}</span>}
          <span className={styles.resourceLabel}>{s.name}</span>
        </div>
      ))}
    </div>
  )
}
