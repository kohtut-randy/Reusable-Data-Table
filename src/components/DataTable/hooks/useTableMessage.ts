import { useEffect, useState } from 'react'
import type { SortState, TableStatus } from '../DataTable.types'
import { LIVE_REGION_DEBOUNCE_MS } from '../constants'

export type UseTableMessageOptions = {
  readonly status: TableStatus
  readonly sort: SortState
  readonly sortLabel: string | null
  readonly from: number
  readonly to: number
  readonly total: number
  /** Plural noun for the rows, e.g. 'classes'. Comes from the caption's domain. */
  readonly noun: string
}

/**
 * The single polite live-region message per table. Debounced because sorting also resets
 * the page, so one header click would otherwise announce twice and cut itself off. It
 * describes state ("Sorted by Class, ascending"), not events, so a screen reader user who
 * arrives late still hears something meaningful.
 */
export const useTableMessage = ({ status, sort, sortLabel, from, to, total, noun }: UseTableMessageOptions): string => {
  const [message, setMessage] = useState('')

  useEffect(() => {
    const build = (): string => {
      if (status === 'loading') return `Loading ${noun}`
      if (status === 'error') return `Could not load ${noun}`
      if (status === 'empty') return `No ${noun} match the current filters`

      const range = total === 0 ? `No ${noun}` : `Showing ${from} to ${to} of ${total} ${noun}`
      if (!sort || !sortLabel) return range
      return `${range}. Sorted by ${sortLabel}, ${sort.direction === 'asc' ? 'ascending' : 'descending'}`
    }

    const timer = window.setTimeout(() => setMessage(build()), LIVE_REGION_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [status, sort, sortLabel, from, to, total, noun])

  return message
}
