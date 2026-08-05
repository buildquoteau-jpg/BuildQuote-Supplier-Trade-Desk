'use client'

// The Cover — the first screen of the card object. Ported from Data
// Studio's System Card V2 (components/system-card-v2/Cover.tsx), retyped
// against this app's own SystemCardSystem (components/system-card/types.ts
// — byte-identical to Data Studio's). Real photography only:
// hero_image_url + gallery_images, deduplicated and capped at 10, swipeable
// via native horizontal scroll-snap. Tapping a gallery photo opens a real
// fullscreen lightbox (close/prev/next/counter).

import { useEffect, useRef, useState } from 'react'
import type { SystemCardSystem } from '@/components/system-card/types'
import { shareSystemCard } from './shareCard'
import styles from './Cover.module.css'

function firstSentence(text: string | null): string | null {
  if (!text) return null
  const match = text.match(/^[^.!?]*[.!?]/)
  return (match ? match[0] : text).trim()
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" /><line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  const points = direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={points} />
    </svg>
  )
}

export function Cover({ manufacturer, system }: {
  manufacturer: { name: string }
  system: SystemCardSystem
}) {
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')
  const shareResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const images = (() => {
    const seen = new Set<string>()
    const list: { url: string; alt: string }[] = []
    if (system.hero_image_url) {
      list.push({ url: system.hero_image_url, alt: `${system.name} by ${manufacturer.name}` })
      seen.add(system.hero_image_url)
    }
    for (const g of system.gallery_images ?? []) {
      if (g.url && !seen.has(g.url)) {
        list.push({ url: g.url, alt: g.alt || `${system.name} by ${manufacturer.name}` })
        seen.add(g.url)
      }
    }
    return list.slice(0, 10)
  })()

  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const rafRef = useRef<number | null>(null)

  function handleTrackScroll() {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const el = trackRef.current
      if (!el || el.clientWidth === 0) return
      const idx = Math.round(el.scrollLeft / el.clientWidth)
      setActiveIndex(Math.max(0, Math.min(images.length - 1, idx)))
    })
  }

  function goToSlide(i: number) {
    const el = trackRef.current
    if (!el) return
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollTo({ left: i * el.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' })
  }

  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  function openLightbox(i: number) {
    setLightboxIndex(i)
    setLightboxOpen(true)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setLightboxOpen(false)
      if (e.key === 'ArrowRight') setLightboxIndex(i => Math.min(images.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setLightboxIndex(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, images.length])

  const statement = firstSentence(system.description)
  const posX = system.hero_image_position_x ?? 50
  const posY = system.hero_image_position_y ?? 50

  async function handleShare() {
    const outcome = await shareSystemCard({
      title: `${system.name} — ${manufacturer.name} System Card`,
      text: statement ?? system.name,
      url: window.location.href,
    })
    if (outcome === 'copied') {
      setShareState('copied')
      shareResetTimer.current = setTimeout(() => setShareState('idle'), 2000)
    }
  }

  return (
    <section className={styles.cover} aria-label={`${system.name} — ${manufacturer.name} System Card`}>
      {images.length > 0 ? (
        <div ref={trackRef} className={styles.gallery} onScroll={handleTrackScroll}>
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              className={styles.galleryImgBtn}
              onClick={() => openLightbox(i)}
              aria-label={`Open ${img.alt} full screen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className={styles.galleryImg}
                src={img.url}
                alt={img.alt}
                style={i === 0 ? { objectPosition: `${posX}% ${posY}%` } : undefined}
              />
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.galleryFallback} />
      )}
      <div className={styles.scrim} />

      {images.length > 1 && (
        <div className={styles.galleryNav} role="tablist" aria-label="Product photos">
          {images.map((img, i) => (
            <button
              key={img.url}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              aria-label={`Photo ${i + 1} of ${images.length}`}
              className={styles.galleryDot}
              data-active={i === activeIndex}
              onClick={() => goToSlide(i)}
            />
          ))}
        </div>
      )}

      <button type="button" className={styles.shareBtn} onClick={handleShare}>
        <ShareIcon />
        {shareState === 'copied' ? 'Link copied' : 'Share System Card'}
      </button>

      <div className={styles.content}>
        <div className={styles.contentInner}>
          <p className={styles.manufacturer}>{manufacturer.name}</p>
          <h1 className={styles.title}>{system.name}</h1>
          <p className={styles.category}>
            {system.category}{system.subcategory ? ` · ${system.subcategory}` : ''}
          </p>
          {statement && <p className={styles.statement}>{statement}</p>}
        </div>
      </div>

      {lightboxOpen && images[lightboxIndex] && (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${system.name} photos`}
          onClick={(e) => { if (e.target === e.currentTarget) setLightboxOpen(false) }}
        >
          <button type="button" className={styles.lightboxClose} onClick={() => setLightboxOpen(false)} aria-label="Close">
            <CloseIcon />
          </button>

          {lightboxIndex > 0 && (
            <button
              type="button"
              className={styles.lightboxNav}
              data-side="left"
              onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
              aria-label="Previous photo"
            >
              <ChevronIcon direction="left" />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className={styles.lightboxImg} src={images[lightboxIndex].url} alt={images[lightboxIndex].alt} />

          {lightboxIndex < images.length - 1 && (
            <button
              type="button"
              className={styles.lightboxNav}
              data-side="right"
              onClick={() => setLightboxIndex(i => Math.min(images.length - 1, i + 1))}
              aria-label="Next photo"
            >
              <ChevronIcon direction="right" />
            </button>
          )}

          {images.length > 1 && (
            <div className={styles.lightboxCounter}>{lightboxIndex + 1} / {images.length}</div>
          )}
        </div>
      )}
    </section>
  )
}
