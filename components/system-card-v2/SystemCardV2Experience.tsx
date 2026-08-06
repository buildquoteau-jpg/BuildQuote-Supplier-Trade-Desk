'use client'

// System Card V2 — a compact card object that unfolds. The cover is always
// visible at the top; beneath it, independent labelled bars reveal their
// content directly underneath themselves when tapped, and fold back up when
// tapped again. Any number can be open at once. Ported from Data Studio's
// System Card V2 (components/system-card-v2/SystemCardV2Experience.tsx),
// retyped against this repo's own SystemCardSystem/SystemCardStockist
// (components/system-card/types.ts — byte-identical to Data Studio's) and
// wired to the real ShoppingListProvider via the optional onAddToList prop
// (see StockistsReveal.tsx) instead of the sandbox's placeholder-only
// selection preview. Same call signature as the existing
// SystemCardRenderer.tsx (system/stockists/showStockists/onAddToList) so it
// drops into TradeDeskTab.tsx's SystemDetailModal and MyProductsTab.tsx
// with no other changes needed at the call site.

import { useState } from 'react'
import type { SystemCardSystem, SystemCardStockist } from '@/components/system-card/types'
import { Cover } from './Cover'
import { SelectionProvider } from './SelectionContext'
import { SystemCardSection } from './SystemCardSection'
import { ChooseReveal } from './ChooseReveal'
import { AttributesInfoReveal, hasAttributesContent } from './AttributesInfoReveal'
import { GuidesResourcesReveal } from './GuidesResourcesReveal'
import { ComponentsAccessoriesReveal } from './ComponentsAccessoriesReveal'
import { StockistsReveal, type ShoppingListItem } from './StockistsReveal'
import { shareSystemCard } from './shareCard'
import styles from './RevealsBody.module.css'

function ShareIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="10.6" x2="15.4" y2="6.4" /><line x1="8.6" y1="13.4" x2="15.4" y2="17.6" />
    </svg>
  )
}


// One-line live previews shown on each closed bar.
function chooseSubtitle(system: SystemCardSystem): string | undefined {
  const parts: string[] = []
  if (system.system_colours.length > 0) parts.push(`${system.system_colours.length} colour${system.system_colours.length !== 1 ? 's' : ''}`)
  if (system.system_profiles.length > 0) parts.push(`${system.system_profiles.length} profile${system.system_profiles.length !== 1 ? 's' : ''}`)
  return parts.length > 0 ? parts.join(' · ') : undefined
}
function attributesSubtitle(system: SystemCardSystem): string | undefined {
  const parts: string[] = []
  if (system.moisture_resistant) parts.push('Moisture resistant')
  if (system.bal_rating) parts.push(`BAL ${system.bal_rating}`)
  if (system.fire_rating) parts.push(`Fire ${system.fire_rating}`)
  if (system.australian_made) parts.push('Australian made')
  return parts.length > 0 ? parts.slice(0, 2).join(' · ') : undefined
}
function guidesSubtitle(system: SystemCardSystem): string | undefined {
  const count = (system.install_guide_urls?.length ?? 0) + (system.design_guide_url ? 1 : 0) +
    (system.tech_data_url ? 1 : 0) + (system.custom_document_links?.length ?? 0) + (system.website_url ? 1 : 0)
  return count > 0 ? `${count} resource${count !== 1 ? 's' : ''}` : undefined
}
function componentsSubtitle(system: SystemCardSystem): string | undefined {
  const count = system.system_components.length
  if (count === 0) return undefined
  const categories = new Set(system.system_components.map(c => c.components?.category ?? c.role ?? 'Component'))
  return `${count} item${count !== 1 ? 's' : ''} · ${categories.size} categor${categories.size !== 1 ? 'ies' : 'y'}`
}
// Trade Desk sets showStockists=false ("staff are the local stockist") —
// showing a count there but hiding the list it refers to would be a
// confusing mismatch, so this subtitle is gated on the same flag.
function stockistsSubtitle(stockists: SystemCardStockist[], showStockists: boolean): string | undefined {
  if (!showStockists) return undefined
  return stockists.length > 0 ? `${stockists.length} local stockist${stockists.length !== 1 ? 's' : ''}` : undefined
}

const SECTION_IDS = ['choose', 'attributes', 'guides', 'components', 'stockists'] as const
type SectionId = typeof SECTION_IDS[number]

export function SystemCardV2Experience({ system, stockists = [], showStockists = true, onAddToList }: {
  system: SystemCardSystem
  stockists?: SystemCardStockist[]
  showStockists?: boolean
  onAddToList?: (items: ShoppingListItem[]) => void
}) {
  const manufacturer = { name: system.manufacturer?.name ?? 'Manufacturer' }

  // A Set of open section ids, not one currentStep — several sections must
  // be able to stay open simultaneously. Starts empty: the card's resting/
  // shareable state is fully closed.
  const [openSections, setOpenSections] = useState<Set<SectionId>>(new Set())
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle')

  function toggleSection(id: SectionId) {
    setOpenSections(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleShare() {
    const outcome = await shareSystemCard({
      title: `${system.name} — ${manufacturer.name} System Card`,
      text: system.description ?? system.name,
      url: window.location.href,
    })
    if (outcome === 'copied') {
      setShareState('copied')
      setTimeout(() => setShareState('idle'), 2000)
    }
  }

  const noProfiles = system.system_colours.length === 0 && system.system_profiles.length === 0
  const noComponents = system.system_components.length === 0

  return (
    <SelectionProvider>
      <div style={{ fontFamily: 'var(--font-barlow), sans-serif' }}>
        <div className={styles.page}>
          <div className={styles.card}>
            <Cover manufacturer={manufacturer} system={system} />

            <div className={styles.sectionsList}>
              <SystemCardSection
                id="choose"
                title="Colours. Profiles. Finishes."
                subtitle={chooseSubtitle(system)}
                open={openSections.has('choose')}
                onToggle={() => toggleSection('choose')}
                disabled={noProfiles}
              >
                <ChooseReveal colours={system.system_colours} profiles={system.system_profiles} />
              </SystemCardSection>

              <SystemCardSection
                id="attributes"
                title="Attributes and Information"
                subtitle={attributesSubtitle(system)}
                open={openSections.has('attributes')}
                onToggle={() => toggleSection('attributes')}
                disabled={!hasAttributesContent(system)}
              >
                <AttributesInfoReveal system={system} />
              </SystemCardSection>

              <SystemCardSection
                id="guides"
                title="Guides and Resources"
                subtitle={guidesSubtitle(system)}
                open={openSections.has('guides')}
                onToggle={() => toggleSection('guides')}
              >
                <GuidesResourcesReveal system={system} />
              </SystemCardSection>

              <SystemCardSection
                id="components"
                title="Components and Accessories"
                subtitle={componentsSubtitle(system)}
                open={openSections.has('components')}
                onToggle={() => toggleSection('components')}
                disabled={noComponents}
              >
                <ComponentsAccessoriesReveal system={system} />
              </SystemCardSection>

              <SystemCardSection
                id="stockists"
                title="Stockists"
                subtitle={stockistsSubtitle(stockists, showStockists)}
                open={openSections.has('stockists')}
                onToggle={() => toggleSection('stockists')}
              >
                <StockistsReveal system={system} stockists={stockists} showStockists={showStockists} onAddToList={onAddToList} />
              </SystemCardSection>

              <div className={styles.cardClose}>
                <button type="button" className={styles.barNext} onClick={handleShare}>
                  <ShareIcon />
                  {shareState === 'copied' ? 'Link copied' : 'Share System Card'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SelectionProvider>
  )
}
