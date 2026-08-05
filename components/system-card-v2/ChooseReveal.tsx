'use client'

// Choose screen — ported byte-for-byte (aside from the type import) from
// Data Studio's System Card V2 (components/system-card-v2/ChooseReveal.tsx).
//
// Profiles are NOT alternatives to each other — a system can carry several
// distinct roles (main profile, edge board, etc.) — so selection is an
// independent toggle per row, not a radio group. Role label is derived from
// the real `name` field (falls back to "Main profile" for the first/lowest
// sort_order item, "Edge board" when the name says so, "Additional profile"
// otherwise), not hardcoded to any one manufacturer's data.

import { useState } from 'react'
import type { SystemCardColour, SystemCardProfile } from '@/components/system-card/types'
import { useSelection } from './SelectionContext'
import styles from './RevealsBody.module.css'

function SwatchImage({ url, alt }: { url: string | null; alt: string }) {
  const [errored, setErrored] = useState(false)
  if (!url || errored) {
    return <span className={styles.swatchImg} style={{ background: '#eeece6' }} />
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img className={styles.swatchImg} src={url} alt={alt} onError={() => setErrored(true)} />
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
  const name = `${p.name ?? ''} ${p.profile_name ?? ''}`.toLowerCase()
  if (name.includes('edge')) return 'Edge board'
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
                <button
                  key={c.colour_name}
                  type="button"
                  className={styles.swatch}
                  aria-pressed={pressed}
                  onClick={() => setColourName(pressed ? null : c.colour_name)}
                >
                  <span className={styles.swatchImgWrap}>
                    <SwatchImage url={c.image_url} alt="" />
                    {pressed && <span className={styles.swatchCheck}><CheckIcon /></span>}
                  </span>
                  <span className={styles.swatchLabel}>{c.colour_name}</span>
                </button>
              )
            })}
          </div>
        </>
      )}

      {profiles.length > 0 && (
        <>
          <p className={styles.groupLabel}>Profile</p>
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
                {profiles.map((p, i) => {
                  const pressed = profileNames.includes(p.profile_name ?? '')
                  const dims = [p.length_mm && `${p.length_mm}mm`, p.width_mm && `${p.width_mm}mm`, p.thickness_mm && `${p.thickness_mm}mm`]
                    .filter(Boolean).join(' × ') || p.dimensions
                  return (
                    <tr key={p.id}>
                      <td className={styles.specTableName}>
                        <span className={styles.profileRole}>{roleLabel(p, i)}</span>
                        {p.profile_name}
                      </td>
                      <td>{dims || '—'}</td>
                      <td>{p.product_code ?? '—'}</td>
                      <td>{p.uom ?? '—'}</td>
                      <td>
                        <button
                          type="button"
                          className={styles.tableCheck}
                          aria-pressed={pressed}
                          aria-label={`Select ${p.profile_name ?? 'profile'}`}
                          onClick={() => toggleProfileName(p.profile_name ?? '')}
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
        </>
      )}
    </>
  )
}
