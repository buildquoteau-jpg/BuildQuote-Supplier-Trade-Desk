'use client'

// System grid tile — ported from BuildQuote v6's SystemCardTileUI so the
// manufacturer-page grid in Studio previews matches the public library
// pixel-for-pixel. Differences from the v6 source:
//   - plain <img> instead of next/image (static-package friendly)
//   - navigation is host-controlled: pass `href` (public pages) or `onClick`
//     (Studio preview opens the card in-page instead of routing)

import { useRef, useState } from 'react'
import type { SystemCardSystem } from './types'

const FONT_HEADING = "'Barlow Condensed', 'Barlow', sans-serif"

function ChevronGlyph({ direction }: { direction: 'left' | 'right' }) {
  const points = direction === 'left' ? '15 18 9 12 15 6' : '9 18 15 12 9 6'
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c1a17" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points={points} />
    </svg>
  )
}

export const CATEGORY_COLOURS: Record<string, { bg: string; color: string }> = {
  'Cladding':                      { bg: '#dbeafe', color: '#1e40af' },
  'Flooring':                      { bg: '#d1fae5', color: '#065f46' },
  'Decking':                       { bg: '#d1fae5', color: '#065f46' },
  'Waterproofing':                 { bg: '#e0f2fe', color: '#0369a1' },
  'Interior Linings':              { bg: '#ede9fe', color: '#5b21b6' },
  'Soffit & Eaves':                { bg: '#fce7f3', color: '#9d174d' },
  'Pergolas & Outdoor Structures': { bg: '#fef3c7', color: '#92400e' },
  'Roofing':                       { bg: '#fee2e2', color: '#991b1b' },
  'Framing':                       { bg: '#f3f4f6', color: '#374151' },
  'Screening & Fencing':           { bg: '#fef9c3', color: '#713f12' },
  'Window Hood':                   { bg: '#f0fdf4', color: '#166534' },
}

export function SystemCardTile({
  system,
  addedCount = 0,
  href,
  onClick,
}: {
  system: SystemCardSystem
  addedCount?: number
  href?: string
  onClick?: () => void
}) {
  const [hovered, setHovered] = useState(false)

  const profileCount   = system.system_profiles.length
  const componentCount = system.system_components.filter(c => c.components != null).length
  const posX = system.hero_image_position_x ?? 50
  const posY = system.hero_image_position_y ?? 50

  // A swipeable mini-carousel instead of one static photo, when there's a
  // real gallery to show — matches Airbnb's own search-tile treatment
  // (dots + hover arrows), the thing that made these look premium.
  const images = (() => {
    const seen = new Set<string>()
    const list: { url: string; alt: string }[] = []
    if (system.hero_image_url?.trim()) {
      list.push({ url: system.hero_image_url.trim(), alt: system.name })
      seen.add(system.hero_image_url.trim())
    }
    for (const g of system.gallery_images ?? []) {
      if (g.url && !seen.has(g.url)) {
        list.push({ url: g.url, alt: g.alt || system.name })
        seen.add(g.url)
      }
    }
    return list
  })()
  const hasCarousel = images.length >= 2

  const trackRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function goToSlide(i: number) {
    const el = trackRef.current
    if (!el) return
    setActiveIndex(i)
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' })
  }

  function handleTrackScroll() {
    const el = trackRef.current
    if (!el || el.clientWidth === 0) return
    const idx = Math.round(el.scrollLeft / el.clientWidth)
    setActiveIndex(Math.max(0, Math.min(images.length - 1, idx)))
  }

  return (
    <a
      href={href ?? '#'}
      onClick={onClick ? (e) => { e.preventDefault(); onClick() } : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', textAlign: 'left', width: '100%',
        background: '#ffffff',
        border: hovered ? '1.5px solid #185D7A' : '1px solid #d1d5db',
        borderRadius: '14px', overflow: 'hidden',
        textDecoration: 'none',
        boxShadow: hovered ? '0 8px 28px rgba(24,93,122,0.18)' : '0 2px 10px rgba(0,0,0,0.07)',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
        transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
        cursor: 'pointer',
      }}
    >
      {/* Hero — name + category overlaid on image(s) */}
      <div style={{
        height: '220px', flexShrink: 0, position: 'relative', overflow: 'hidden',
        background: images.length > 0 ? undefined : 'linear-gradient(135deg, #185D7A 0%, #0f3d52 100%)',
      }}>
        {hasCarousel ? (
          <div
            ref={trackRef}
            onScroll={handleTrackScroll}
            style={{
              position: 'absolute', inset: 0, display: 'flex', overflowX: 'auto', overflowY: 'hidden',
              scrollSnapType: 'x mandatory', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch',
            }}
          >
            {images.map((img, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.url}
                src={img.url}
                alt={img.alt}
                loading="lazy"
                style={{
                  flex: '0 0 100%', width: '100%', height: '100%', objectFit: 'cover',
                  objectPosition: i === 0 ? `${posX}% ${posY}%` : undefined,
                  scrollSnapAlign: 'start', scrollSnapStop: 'always',
                }}
              />
            ))}
          </div>
        ) : images.length > 0 && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[0].url}
            alt={system.name}
            loading="lazy"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: `${posX}% ${posY}%`,
            }}
          />
        )}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,30,45,0.88) 0%, rgba(15,30,45,0.18) 55%, transparent 100%)' }} />

        {hasCarousel && (
          <>
            {hovered && (
              <>
                {activeIndex > 0 && (
                  <button
                    type="button"
                    aria-label="Previous photo"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(activeIndex - 1) }}
                    style={{
                      position: 'absolute', top: '50%', left: '8px', transform: 'translateY(-50%)', zIndex: 2,
                      width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                      background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    }}
                  >
                    <ChevronGlyph direction="left" />
                  </button>
                )}
                {activeIndex < images.length - 1 && (
                  <button
                    type="button"
                    aria-label="Next photo"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(activeIndex + 1) }}
                    style={{
                      position: 'absolute', top: '50%', right: '8px', transform: 'translateY(-50%)', zIndex: 2,
                      width: '28px', height: '28px', borderRadius: '50%', border: 'none',
                      background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                    }}
                  >
                    <ChevronGlyph direction="right" />
                  </button>
                )}
              </>
            )}
            <div style={{ position: 'absolute', top: '10px', left: 0, right: 0, zIndex: 2, display: 'flex', justifyContent: 'center', gap: '5px' }}>
              {images.map((img, i) => (
                <button
                  key={img.url}
                  type="button"
                  aria-label={`Photo ${i + 1} of ${images.length}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); goToSlide(i) }}
                  style={{ width: '16px', height: '16px', padding: 0, border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <span style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: i === activeIndex ? '#ffffff' : 'rgba(255,255,255,0.5)',
                    transform: i === activeIndex ? 'scale(1.3)' : 'scale(1)',
                    transition: 'transform 0.15s, background-color 0.15s',
                  }} />
                </button>
              ))}
            </div>
          </>
        )}

        {addedCount > 0 && (
          <span style={{
            position: 'absolute', top: '10px', right: '10px',
            fontSize: '11px', fontWeight: 700, background: '#166534', color: '#ffffff',
            padding: '3px 9px', borderRadius: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
          }}>
            ✓ {addedCount} added
          </span>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 14px 14px' }}>
          {system.manufacturer && (
            <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', marginBottom: '3px' }}>
              {system.manufacturer.name}
            </div>
          )}
          <h3 style={{
            margin: 0, fontSize: '16px', fontWeight: 800, color: '#ffffff',
            lineHeight: 1.2, letterSpacing: '-0.01em',
            textShadow: '0 1px 6px rgba(0,0,0,0.3)',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
            fontFamily: FONT_HEADING,
          }}>
            {system.name}
          </h3>
          <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            {system.category}{system.subcategory ? ` · ${system.subcategory}` : ''}
          </div>
        </div>
      </div>

      {/* Content strip */}
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {system.description && (
          <p style={{
            margin: 0, fontSize: '13px', color: '#6b7280', lineHeight: 1.5,
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical' as const, overflow: 'hidden',
          }}>
            {system.description}
          </p>
        )}
        <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>
            {profileCount > 0 ? `${profileCount} profile${profileCount !== 1 ? 's' : ''}` : ''}
            {profileCount > 0 && componentCount > 0 ? ' · ' : ''}
            {componentCount > 0 ? `${componentCount} component${componentCount !== 1 ? 's' : ''}` : ''}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#185D7A', display: 'flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap' }}>
            View details
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4.5 2.5L8 6L4.5 9.5" stroke="#185D7A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </span>
        </div>
      </div>
    </a>
  )
}
