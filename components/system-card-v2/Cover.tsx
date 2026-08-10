'use client'

// The Cover — the first screen of the card object. Airbnb-listing pattern:
// the photo stays clean and bright -- no scrim, nothing written on top of
// it -- and manufacturer/title/category/statement sit in their own plain
// white block underneath.
//
// Two layouts, chosen once by photo count (not pure CSS breakpoint
// toggling, so a system with too few photos never renders a half-empty
// grid): under 3 images, always the single-swipe layout, at every width.
// At 3+ images, both layouts render, CSS-toggled at 1024px: the swipe
// layout below that, and a one-big-plus-four-small photo grid above it --
// a "Show all photos" pill appears on the last small cell when there are
// more than 5 photos.
//
// Tapping any photo (either layout) opens the same fullscreen lightbox
// (close/prev/next/counter) at that photo's real index.

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
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15V4" />
      <path d="M7.5 8.5 12 4l4.5 4.5" />
      <path d="M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
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

function GridIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
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
    // Trim -- some rows carry stray whitespace on image URLs that silently
    // breaks <img> loading without a normal catchable error.
    const heroUrl = system.hero_image_url?.trim()
    if (heroUrl) {
      list.push({ url: heroUrl, alt: `${system.name} by ${manufacturer.name}` })
      seen.add(heroUrl)
    }
    for (const g of system.gallery_images ?? []) {
      const url = g.url?.trim()
      if (url && !seen.has(url)) {
        list.push({ url, alt: g.alt || `${system.name} by ${manufacturer.name}` })
        seen.add(url)
      }
    }
    return list.slice(0, 10)
  })()

  const showGrid = images.length >= 3

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

  const smallImages = images.slice(1, 5)

  return (
    <section className={styles.cover} aria-label={`${system.name} — ${manufacturer.name} System Card`}>
      <div className={showGrid ? `${styles.mobileHero} ${styles.mobileHeroHidesOnWide}` : styles.mobileHero}>
        <div className={styles.mobileHeroPhoto}>
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

          <button
            type="button"
            className={styles.shareBtn}
            onClick={handleShare}
            aria-label={shareState === 'copied' ? 'Link copied' : 'Share System Card'}
          >
            {shareState === 'copied' ? <CheckIcon /> : <ShareIcon />}
          </button>
        </div>

        <div className={styles.mobileTextBlock}>
          <p className={styles.manufacturer}>{manufacturer.name}</p>
          <h1 className={styles.title}>{system.name}</h1>
          <p className={styles.category}>
            {system.category}{system.subcategory ? ` · ${system.subcategory}` : ''}
          </p>
          {statement && <p className={styles.statement}>{statement}</p>}
        </div>
      </div>

      {showGrid && (
        <div className={styles.desktopHero}>
          <div className={styles.heroGrid}>
            <button
              type="button"
              className={styles.heroGridBig}
              onClick={() => openLightbox(0)}
              aria-label={`Open ${images[0].alt} full screen`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.heroGridImg} src={images[0].url} alt={images[0].alt} style={{ objectPosition: `${posX}% ${posY}%` }} />
            </button>

            {smallImages.map((img, i) => {
              const realIndex = i + 1
              const isLastCell = i === smallImages.length - 1
              const showPill = isLastCell && images.length > 5
              return (
                <button
                  key={img.url}
                  type="button"
                  className={styles.heroGridSmall}
                  onClick={() => openLightbox(showPill ? 0 : realIndex)}
                  aria-label={showPill ? 'Show all photos' : `Open ${img.alt} full screen`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.heroGridImg} src={img.url} alt={img.alt} />
                  {showPill && (
                    <span className={styles.showAllPill}>
                      <GridIcon /> Show all photos
                    </span>
                  )}
                </button>
              )
            })}

            <button
              type="button"
              className={styles.desktopShareBtn}
              onClick={handleShare}
              aria-label={shareState === 'copied' ? 'Link copied' : 'Share System Card'}
            >
              {shareState === 'copied' ? <CheckIcon /> : <ShareIcon />}
            </button>
          </div>

          <div className={styles.desktopTextBlock}>
            <p className={styles.desktopManufacturer}>{manufacturer.name}</p>
            <p className={styles.desktopTitle}>{system.name}</p>
            <p className={styles.desktopCategory}>
              {system.category}{system.subcategory ? ` · ${system.subcategory}` : ''}
            </p>
            {statement && <p className={styles.desktopStatement}>{statement}</p>}
          </div>
        </div>
      )}

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
