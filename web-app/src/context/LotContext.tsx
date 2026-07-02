import { createContext, useContext, useState, type ReactNode } from 'react'

const LotContext = createContext<{
  lot: string
  setLot: (lot: string) => void
}>({ lot: 'LOT-2026-0421', setLot: () => {} })

export function LotProvider({ children }: { children: ReactNode }) {
  const [lot, setLot] = useState('LOT-2026-0421')
  return <LotContext.Provider value={{ lot, setLot }}>{children}</LotContext.Provider>
}

export function useLot() {
  return useContext(LotContext)
}
