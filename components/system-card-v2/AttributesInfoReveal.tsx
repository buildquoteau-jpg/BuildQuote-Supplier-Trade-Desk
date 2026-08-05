// Attributes and Information screen — ported from Data Studio's System
// Card V2 (components/system-card-v2/AttributesInfoReveal.tsx), retyped
// against this app's own SystemCardSystem. Every real, non-null technical
// attribute the data model holds; fields that don't exist for a given
// system are correctly absent rather than printed as filler.
//
// One field from the Data Studio source is intentionally dropped: this
// repo's local SystemCardSystem (components/system-card/types.ts) has no
// `applications` column (a Data-Studio-only addition not mirrored here) —
// so there's no Applications block. Nothing else changed.

import type { SystemCardSystem } from '@/components/system-card/types'
import styles from './RevealsBody.module.css'

export function hasAttributesContent(system: SystemCardSystem): boolean {
  if (system.description) return true
  if (system.moisture_resistant || system.bal_rating || system.fire_rating || system.acoustic_rating || system.structural_grade || system.australian_made != null) return true
  if (system.custom_technical_attributes && system.custom_technical_attributes.length > 0) return true
  if (system.notes) return true
  return false
}

export function AttributesInfoReveal({ system }: { system: SystemCardSystem }) {
  const ratings: { label: string; value: string }[] = []
  if (system.moisture_resistant) ratings.push({ label: 'Moisture resistance', value: 'Resistant' })
  if (system.bal_rating) ratings.push({ label: 'BAL rating', value: system.bal_rating })
  if (system.fire_rating) ratings.push({ label: 'Fire rating', value: system.fire_rating })
  if (system.acoustic_rating) ratings.push({ label: 'Acoustic rating', value: system.acoustic_rating })
  if (system.structural_grade) ratings.push({ label: 'Structural grade', value: system.structural_grade })
  if (system.australian_made != null) ratings.push({ label: 'Australian made', value: system.australian_made ? 'Yes' : 'No' })

  const badges: { label: string; tone: 'performance' | 'neutral' }[] = []
  if (system.moisture_resistant) badges.push({ label: 'Moisture resistant', tone: 'performance' })
  if (system.system_colours.length > 0) {
    badges.push({ label: `${system.system_colours.length} colourway${system.system_colours.length !== 1 ? 's' : ''}`, tone: 'neutral' })
  }

  return (
    <>
      {badges.length > 0 && (
        <div className={styles.badgeRow}>
          {badges.map(b => <span key={b.label} className={styles.badge} data-tone={b.tone}>{b.label}</span>)}
        </div>
      )}

      {system.description && (
        <div className={styles.specGroup}>
          <p className={styles.specGroupLabel}>Description</p>
          <div className={styles.specBox}>
            <p className={styles.descriptionText}>{system.description}</p>
          </div>
        </div>
      )}

      {ratings.length > 0 && (
        <div className={styles.specGroup}>
          <p className={styles.specGroupLabel}>Performance</p>
          <div className={styles.specBox}>
            {ratings.map(r => (
              <div key={r.label} className={styles.specRow}>
                <span className={styles.specRowLabel}>{r.label}</span>
                <span className={styles.specRowValue}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {system.custom_technical_attributes && system.custom_technical_attributes.length > 0 && (
        <div className={styles.specGroup}>
          <p className={styles.specGroupLabel}>Additional specification</p>
          <div className={styles.specBox}>
            {system.custom_technical_attributes.map(a => (
              <div key={a.label} className={styles.specRow}>
                <span className={styles.specRowLabel}>{a.label}</span>
                <span className={styles.specRowValue}>{a.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {system.notes && (
        <div className={styles.specGroup}>
          <p className={styles.specGroupLabel}>Notes</p>
          <p className={styles.descriptionText}>{system.notes}</p>
        </div>
      )}
    </>
  )
}
