'use client'

// Reusable expandable "layer" of the System Card — a horizontal bar that
// reveals its content directly beneath itself, independent of every other
// section's open/closed state. Ported byte-for-byte from Data Studio's
// components/system-card-v2/SystemCardSection.tsx. Uses the CSS grid
// 0fr -> 1fr technique (see RevealsBody.module.css: .sectionGrid/
// .sectionInner/.sectionPanel) rather than a fixed max-height, since section
// content varies a lot in length.
//
// Content stays mounted at all times (just visually collapsed to 0 height)
// so the grid transition has something to measure on first open, and so
// in-progress state inside a section (e.g. Choose's colour/profile
// selection) survives closing it.
//
// `inert` is set imperatively on the panel (rather than as a JSX prop) so
// this doesn't depend on the installed @types/react version recognising
// `inert` as a valid attribute.

import { useEffect, useRef } from 'react'
import styles from './RevealsBody.module.css'

function ChevronDownIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

export function SystemCardSection({ id, title, subtitle, open, onToggle, disabled, children }: {
  id: string
  title: string
  subtitle?: string
  open: boolean
  onToggle: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const barRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(false)

  // Keep closed-section content out of the tab order / a11y tree.
  useEffect(() => {
    const el = panelRef.current
    if (el) (el as HTMLDivElement & { inert: boolean }).inert = !open
  }, [open])

  // Gentle, minimal scroll so a newly opened section isn't left off-screen —
  // never on close, never past the heading, never to the top of the page.
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return }
    if (!open) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    barRef.current?.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' })
  }, [open])

  const panelId = `sc-panel-${id}`
  const barId = `sc-bar-${id}`

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionHeading}>
        <button
          ref={barRef}
          type="button"
          id={barId}
          className={styles.sectionBar}
          aria-expanded={open}
          aria-controls={panelId}
          disabled={disabled}
          onClick={onToggle}
        >
          <span className={styles.sectionBarText}>
            <span className={styles.sectionBarTitle}>{title}</span>
            {subtitle && <span className={styles.sectionBarSubtitle}>{subtitle}</span>}
          </span>
          <span className={styles.sectionChevron} aria-hidden="true"><ChevronDownIcon /></span>
        </button>
      </h2>
      <div className={styles.sectionGrid} data-open={open}>
        <div className={styles.sectionInner}>
          <div
            ref={panelRef}
            id={panelId}
            role="region"
            aria-labelledby={barId}
            className={styles.sectionPanel}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
