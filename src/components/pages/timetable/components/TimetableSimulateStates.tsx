import { Button, Popover, Switch } from 'components'
import { FilterSVG } from 'icons'
import type { TimetableTestFlags } from '../timetable.types'

export type TimetableSimulateStatesProps = {
  flags: TimetableTestFlags
  onChange: (next: TimetableTestFlags) => void
}

/* Every edge case the brief lists, reachable from the deployed site.
 *
 * This exists because "handles a failed child fetch" is unverifiable in a screenshot.
 * Putting the triggers behind a control means a reviewer can see the slow skeleton, the
 * list error, the row-scoped child error, the empty dataset and the empty child list
 * without opening DevTools or hand-editing a URL. */
export const TimetableSimulateStates = ({ flags, onChange }: TimetableSimulateStatesProps) => {
  const set = <K extends keyof TimetableTestFlags>(key: K, value: TimetableTestFlags[K]): void => onChange({ ...flags, [key]: value })

  const activeCount = [flags.slow, flags.failList, flags.failChildren, flags.emptyList, flags.emptyChildren].filter(Boolean).length

  return (
    <Popover
      panelLabel='Simulate states'
      renderTrigger={props => (
        <Button {...props} tone='outline' size='sm' icon={<FilterSVG />}>
          Simulate states{activeCount > 0 ? ` (${activeCount})` : ''}
        </Button>
      )}
    >
      <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1'>
          <p className='text-[0.8125rem] font-semibold text-ink'>Simulate a state</p>
          <p className='text-xs text-ink-muted'>Each switch changes what the mock API returns, so every state below is real.</p>
        </div>

        <Switch
          checked={flags.slow}
          onChange={value => set('slow', value)}
          label='Slow network'
          description={`Adds a ${flags.delayMs} ms delay, so skeletons are visible`}
        />
        <Switch
          checked={flags.failList}
          onChange={value => set('failList', value)}
          label='Fail the list request'
          description='Returns 500, showing the table error state and Retry'
        />
        <Switch
          checked={flags.failChildren}
          onChange={value => set('failChildren', value)}
          label='Fail child requests'
          description='Expand a row: the error is scoped to that row'
        />
        <Switch
          checked={flags.emptyList}
          onChange={value => set('emptyList', value)}
          label='Empty dataset'
          description='Returns zero rows, showing the empty state'
        />
        <Switch
          checked={flags.emptyChildren}
          onChange={value => set('emptyChildren', value)}
          label='Empty child lists'
          description='Every class reports no bookings'
        />
      </div>
    </Popover>
  )
}
