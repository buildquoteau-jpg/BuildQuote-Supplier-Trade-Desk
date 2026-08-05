'use client'

// Stockists — the closing screen. Ported from Data Studio's System Card V2
// (components/system-card-v2/StockistsReveal.tsx) — the live materials-list
// preview and flat stockist list are unchanged — plus two additions this
// repo's real cards need that the Data Studio sandbox never did:
//
// - A real "Add to shopping list" button (V2's sandbox only ever filled the
//   preview table and stopped at Share). Only rendered when `onAddToList`
//   is provided (Trade Desk has a real cart via ShoppingListProvider; My
//   Products doesn't, so its card stays browse/select/Share-only). UOM
//   formatting (fmtUom) matches the existing SystemCardRenderer.tsx
//   convention so cart items look the same regardless of which card added
//   them.
// - A `showStockists` prop (default true) mirroring SystemCardRenderer's
//   existing prop of the same name — Trade Desk passes false ("staff are
//   the local stockist"), so only the materials-list half of this section
//   is reachable there today.

import { useState } from 'react'
import type { SystemCardSystem, SystemCardStockist } from '@/components/system-card/types'
import { useSelection } from './SelectionContext'
import styles from './RevealsBody.module.css'

export type ShoppingListItem = {
  id: string
  name: string
  sku: string
  desc: string
  uom: string
  qty: number
}

function fmtUom(uom: string | null): string {
  if (!uom) return ''
  const map: Record<string, string> = {
    sheet: 'SHEET', roll: 'ROLL', ea: 'EACH', each: 'EACH',
    lm: 'LIN.M', m2: 'M²', kg: 'KG', box: 'BOX', pack: 'PACK', length: 'LENGTH',
  }
  return map[uom.toLowerCase()] ?? uom.toUpperCase()
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

type Row = { name: string; spec: string | null; sku: string | null; uom: string | null }

export function StockistsReveal({ system, stockists, showStockists = true, onAddToList }: {
  system: SystemCardSystem
  stockists: SystemCardStockist[]
  showStockists?: boolean
  onAddToList?: (items: ShoppingListItem[]) => void
}) {
  const { colourName, profileNames, componentIds, clearSelection } = useSelection()
  const [justAdded, setJustAdded] = useState(0)

  const profileRows: Row[] = system.system_profiles
    .filter(p => profileNames.includes(p.profile_name ?? ''))
    .map(p => ({
      name: p.profile_name ?? p.name ?? 'Profile',
      spec: [p.length_mm && `${p.length_mm}mm`, p.width_mm && `${p.width_mm}mm`, p.thickness_mm && `${p.thickness_mm}mm`].filter(Boolean).join(' × ') || p.dimensions,
      sku: p.product_code,
      uom: p.uom,
    }))

  const componentRows: Row[] = system.system_components
    .filter(c => componentIds.includes(c.id))
    .map(c => ({
      name: c.components?.name ?? 'Component',
      spec: c.components?.description ?? null,
      sku: c.components?.sku ?? null,
      uom: c.components?.uom ?? null,
    }))

  const rows = [...profileRows, ...componentRows]

  function handleAddToList() {
    if (!onAddToList || rows.length === 0) return
    const items: ShoppingListItem[] = rows.map((r, i) => ({
      id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
      name: r.name,
      sku: r.sku ?? '',
      desc: r.spec ?? '',
      uom: fmtUom(r.uom) || 'EA',
      qty: 1,
    }))
    onAddToList(items)
    setJustAdded(items.length)
    clearSelection()
    window.setTimeout(() => setJustAdded(0), 2000)
  }

  return (
    <>
      <div className={styles.specGroup}>
        <p className={styles.specGroupLabel}>Your materials list</p>
        {colourName && <p className={styles.selectionColourNote}>Colour: {colourName}</p>}

        {rows.length === 0 && justAdded === 0 ? (
          <p className={styles.emptyState}>Select a profile or component to add it here.</p>
        ) : (
          <>
            {rows.length > 0 && (
              <div className={styles.specTableScroll}>
                <table className={styles.specTable}>
                  <thead>
                    <tr><th>#</th><th>Profile &amp; specs</th><th>SKU</th><th>UOM</th><th>Qty</th></tr>
                  </thead>
                  <tbody>
                    {rows.map((r, i) => (
                      <tr key={`${r.name}-${i}`}>
                        <td className={styles.specTableNum}>{i + 1}</td>
                        <td className={styles.specTableName}>
                          {r.name}
                          {r.spec && <span className={styles.specTableSub}>{r.spec}</span>}
                        </td>
                        <td>{r.sku ?? '—'}</td>
                        <td>{r.uom ?? '—'}</td>
                        <td>1</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {onAddToList && (
              <button
                type="button"
                className={styles.addToListBtn}
                onClick={handleAddToList}
                disabled={rows.length === 0}
                data-state={justAdded > 0 ? 'success' : undefined}
              >
                {justAdded > 0 ? (
                  <><CheckIcon /> Added {justAdded} item{justAdded !== 1 ? 's' : ''} — see your list below ↓</>
                ) : (
                  `Add ${rows.length} item${rows.length !== 1 ? 's' : ''} to shopping list`
                )}
              </button>
            )}
          </>
        )}
      </div>

      {showStockists && (
        stockists.length === 0 ? (
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
      )}
    </>
  )
}
