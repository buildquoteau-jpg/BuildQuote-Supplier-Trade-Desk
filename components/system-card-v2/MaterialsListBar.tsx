'use client'

// Always-visible "Your materials list" + "Add to shopping list" -- pulled
// out of the Stockists accordion tab so it's never hidden behind a
// collapsed bar. Rendered directly under the accordion bars, not inside
// any of them -- Stockists itself now holds only the local stockist list.

import { useState } from 'react'
import type { SystemCardSystem } from '@/components/system-card/types'
import { useMaterialsListRows, type ShoppingListItem } from './useMaterialsListRows'
import styles from './RevealsBody.module.css'

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function MaterialsListBar({ system, onAddToList }: {
  system: SystemCardSystem
  onAddToList?: (items: ShoppingListItem[]) => void
}) {
  const { colourName, rows, buildShoppingListItems, clearSelection } = useMaterialsListRows(system)
  const [justAdded, setJustAdded] = useState(0)

  function handleAddToList() {
    if (!onAddToList || rows.length === 0) return
    const items = buildShoppingListItems()
    onAddToList(items)
    setJustAdded(items.length)
    clearSelection()
    window.setTimeout(() => setJustAdded(0), 2000)
  }

  return (
    <div className={styles.materialsListBar}>
      <p className={styles.specGroupLabel}>Your materials list</p>
      {colourName && <p className={styles.selectionColourNote}>Colour: {colourName}</p>}

      {rows.length === 0 && justAdded === 0 ? (
        <p className={styles.emptyState}>Select a profile or component above to add it here.</p>
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
  )
}
