import type { DemoZone } from '../demo.types'

/* A fixed literal rather than a seeded generator: the minimal example is about the
   component's configuration, so its data should be readable at a glance. */
export const DEMO_ZONES: readonly DemoZone[] = [
  { id: 'z1', label: 'The Cave', grade: 'V4 to V8', problems: 34, setOn: '2026-08-28T09:00:00.000Z' },
  { id: 'z2', label: 'Slab Wall', grade: 'V0 to V4', problems: 41, setOn: '2026-09-01T09:00:00.000Z' },
  { id: 'z3', label: 'Comp Wall', grade: 'V5 to V10', problems: 18, setOn: '2026-08-14T09:00:00.000Z' },
  { id: 'z4', label: 'Training Room', grade: 'V2 to V6', problems: 27, setOn: '2026-08-21T09:00:00.000Z' },
  { id: 'z5', label: 'The Arch', grade: 'V6 to V11', problems: 12, setOn: '2026-09-02T09:00:00.000Z' },
]
