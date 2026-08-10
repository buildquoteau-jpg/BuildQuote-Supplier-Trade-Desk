'use client'

// Choose screen. Profiles are NOT alternatives to each other — a system
// can carry several distinct roles (main profile, edge board, etc.) — so
// selection is an independent toggle per row, not a radio group. Role
// label is derived from the real `name` field (falls back to "Main
// profile" for the first/lowest sort_order item, "Edge board" when the
// name says so, "Additional profile" otherwise), not hardcoded to any one
// manufacturer's data.

import { useState } from 'react'
import type { SystemCardColour, SystemCardProfile } from '@/components/system-card/types'
import { useSelection } from './SelectionContext'
import styles from './RevealsBody.module.css'

// Real photo when there's a usable image_url; otherwise a compact name
// pill instead of an empty placeholder box.
function ColourOption({ colour, pressed, onToggle }: {
  colour: SystemCardColour
  pressed: boolean
  onToggle: () => void
}) {
  const [errored, setErrored] = useState(false)
  // Some rows carry invisible leading/trailing whitespace on image_url
  // (e.g. a BOM from a spreadsheet-based import) which silently breaks the
  // <img> load in the browser — trim before use, not just the check.
  const imageUrl = colour.image_url?.trim()

  if (!imageUrl || errored) {
    return (
      <button type="button" className={styles.swatchPill} aria-pressed={pressed} onClick={onToggle}>
        {colour.colour_name}
      </button>
    )
  }

  return (
    <button type="button" className={styles.swatch} aria-pressed={pressed} onClick={onToggle}>
      <span className={styles.swatchImgWrap}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className={styles.swatchImg} src={imageUrl} alt="" onError={() => setErrored(true)} />
        {pressed && <span className={styles.swatchCheck}><CheckIcon /></span>}
      </span>
      <span className={styles.swatchLabel}>{colour.colour_name}</span>
    </button>
  )
}

function CheckIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function roleLabel(p: SystemCardProfile, index: number): string {
  if (p.name?.trim()) return p.name.trim()
  const text = (p.profile_name ?? '').toLowerCase()
  if (text.includes('edge')) return 'Edge board'
  if (index === 0) return 'Main profile'
  return 'Additional profile'
}

export function ChooseReveal({ colours, profiles }: {
  colours: SystemCardColour[]
  profiles: SystemCardProfile[]
}) {
  const { colourName, setColourName, profileNames, toggleProfileName } = useSelection()

  return (
    <>
      <p className={styles.chooseHint}>Select colours and profiles to add them to your shopping list.</p>

      {colours.length > 0 && (
        <>
          <p className={styles.groupLabel}>Select colour</p>
          <div className={styles.swatchRow}>
            {colours.map(c => {
              const pressed = colourName === c.colour_name
              return (
                <ColourOption
                  key={c.colour_name}
                  colour={c}
                  pressed={pressed}
                  onToggle={() => setColourName(pressed ? null : c.colour_name)}
                />
              )
            })}
          </div>
        </>
      )}

      {profiles.length > 0 && (
        <>
          <p className={styles.groupLabel}>Profile</p>
          <div className={styles.itemList}>
            {profiles.map((p, i) => {
              const pressed = profileNames.includes(p.profile_name ?? '')
              const dims = [p.length_mm && `${p.length_mm}mm`, p.width_mm && `${p.width_mm}mm`, p.thickness_mm && `${p.thickness_mm}mm`]
                .filter(Boolean).join(' × ') || p.dimensions
              return (
                <div className={styles.itemRow} data-selected={pressed} key={p.id}>
                  <div className={styles.itemRowText}>
                    <span className={styles.profileRole}>{roleLabel(p, i)}</span>
                    <span className={styles.itemRowName}>{p.profile_name}</span>
                    <div className={styles.itemMetaRow}>
                      <span className={styles.itemMetaField}>
                        <span className={styles.itemMetaLabel}>Specs</span>
                        <span className={styles.itemMetaValue}>{dims || '—'}</span>
                      </span>
                      <span className={styles.itemMetaField}>
                        <span className={styles.itemMetaLabel}>Part no</span>
                        <span className={styles.itemMetaValue}>{p.product_code ?? '—'}</span>
                      </span>
                      <span className={styles.itemMetaField}>
                        <span className={styles.itemMetaLabel}>UOM</span>
                        <span className={styles.itemMetaValue}>{p.uom ?? '—'}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={styles.tableCheck}
                    aria-pressed={pressed}
                    aria-label={`Select ${p.profile_name ?? 'profile'}`}
                    onClick={() => toggleProfileName(p.profile_name ?? '')}
                  >
                    <CheckIcon />
                  </button>
                </div>
              )
            })}
          </div>
        </>
      )}
    </>
  )
}
