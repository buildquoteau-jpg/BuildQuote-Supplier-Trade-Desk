'use client'

// Small in-memory link between the Choose screen and the Stockists screen,
// so "Add to list" reflects what was actually picked rather than being a
// disconnected button. Ported from Data Studio's System Card V2
// (components/system-card-v2/SelectionContext.tsx) — in-memory only, no
// persistence, nothing shared with ShoppingListProvider's localStorage list.
//
// Profiles and components are sets, not single values: the main profile and
// an edge board are different roles, not alternatives to each other, and a
// builder may reasonably want several components — so both follow the same
// RFQ / shopping-list convention (name, spec line, select box), independent
// toggles, not a radio group.

import { createContext, useContext, useState, type ReactNode } from 'react'

type SelectionContextValue = {
  colourName: string | null
  setColourName: (name: string | null) => void
  profileNames: string[]
  toggleProfileName: (name: string) => void
  componentIds: string[]
  toggleComponentId: (id: string) => void
  // Added for Trade Desk's real "Add to shopping list" action (the Data
  // Studio sandbox never had a persisted cart to clear after committing to).
  clearSelection: () => void
}

const SelectionContext = createContext<SelectionContextValue | null>(null)

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [colourName, setColourName] = useState<string | null>(null)
  const [profileNames, setProfileNames] = useState<string[]>([])
  const [componentIds, setComponentIds] = useState<string[]>([])

  function toggleProfileName(name: string) {
    setProfileNames(prev => prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name])
  }

  function toggleComponentId(id: string) {
    setComponentIds(prev => prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id])
  }

  function clearSelection() {
    setProfileNames([])
    setComponentIds([])
  }

  return (
    <SelectionContext.Provider value={{ colourName, setColourName, profileNames, toggleProfileName, componentIds, toggleComponentId, clearSelection }}>
      {children}
    </SelectionContext.Provider>
  )
}

export function useSelection() {
  const ctx = useContext(SelectionContext)
  if (!ctx) throw new Error('useSelection must be used within SelectionProvider')
  return ctx
}
