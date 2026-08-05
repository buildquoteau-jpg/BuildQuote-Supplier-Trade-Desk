'use client'

// Components and Accessories screen — ported byte-for-byte (aside from the
// type import) from Data Studio's System Card V2
// (components/system-card-v2/ComponentsAccessoriesReveal.tsx). Each
// category group is a real column table — name/description, specs, part
// no, UOM, select. Components have no dimensions in the data model, so
// Specs reads "—" for every row, honestly, not hidden. Selection is
// independent per item, shared via SelectionContext so Stockists reflects
// what was picked here.

import type { SystemCardSystem } from '@/components/system-card/types'
import { useSelection } from './SelectionContext'
import styles from './RevealsBody.module.css'

function ClipGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4v6a5 5 0 0 0 5 5h5" />
      <path d="M7 20v-6a5 5 0 0 1 5-5h5" />
    </svg>
  )
}

function ScrewGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="3" />
      <line x1="10.3" y1="5" x2="13.7" y2="5" />
      <line x1="12" y1="3.3" x2="12" y2="6.7" />
      <line x1="12" y1="8.3" x2="12" y2="21" />
      <line x1="9.5" y1="11" x2="14.5" y2="11" />
      <line x1="9.5" y1="14.5" x2="14.5" y2="14.5" />
      <line x1="10.3" y1="18" x2="13.7" y2="18" />
    </svg>
  )
}

function ToolGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a4 4 0 1 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.1 2.1-2-2z" />
    </svg>
  )
}

function DotGlyph() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="4" /></svg>
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function glyphFor(category: string) {
  const c = category.toLowerCase()
  if (c.includes('clip')) return <ClipGlyph />
  if (c.includes('screw')) return <ScrewGlyph />
  if (c.includes('tool')) return <ToolGlyph />
  return <DotGlyph />
}

export function ComponentsAccessoriesReveal({ system }: { system: SystemCardSystem }) {
  const { componentIds, toggleComponentId } = useSelection()

  const order: string[] = []
  const byCategory: Record<string, typeof system.system_components> = {}
  for (const c of system.system_components) {
    const key = c.components?.category ?? c.role ?? 'Component'
    if (!byCategory[key]) {
      byCategory[key] = []
      order.push(key)
    }
    byCategory[key].push(c)
  }

  return (
    <div className={styles.systemGroups}>
      {order.map((category, i) => (
        <div key={category}>
          <div className={styles.systemGroupHead}>
            <span className={styles.systemGroupNum}>{i + 1}</span>
            <span className={styles.systemGroupIcon}>{glyphFor(category)}</span>
            <p className={styles.systemGroupLabel}>{category}</p>
          </div>
          <div className={styles.specTableScroll}>
            <table className={styles.specTable}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Specs</th>
                  <th>Part no</th>
                  <th>UOM</th>
                  <th>Select</th>
                </tr>
              </thead>
              <tbody>
                {byCategory[category].map(c => {
                  const pressed = componentIds.includes(c.id)
                  return (
                    <tr key={c.id}>
                      <td className={styles.specTableName}>
                        {c.components?.name}
                        {c.components?.description && <span className={styles.specTableSub}>{c.components.description}</span>}
                      </td>
                      <td>—</td>
                      <td>{c.components?.sku ?? '—'}</td>
                      <td>{c.components?.uom ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.tableCheck}
                          aria-pressed={pressed}
                          aria-label={`Select ${c.components?.name ?? 'item'}`}
                          onClick={() => toggleComponentId(c.id)}
                        >
                          <CheckIcon />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}
