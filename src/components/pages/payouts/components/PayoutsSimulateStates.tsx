import { Button, Popover, Switch } from 'components'
import { FilterSVG } from 'icons'
import type { PayoutsTestFlags } from '../payouts.types'

export type PayoutsSimulateStatesProps = {
  flags: PayoutsTestFlags
  onChange: (next: PayoutsTestFlags) => void
}

/* The timetable's controls with the copy this page's modes need: the failures here are
   the server sort and page requests, and the child failure is the session fetch. Not
   lifted into a shared component, because the two share a shape but not a vocabulary. */
export const PayoutsSimulateStates = ({ flags, onChange }: PayoutsSimulateStatesProps) => {
  const set = <K extends keyof PayoutsTestFlags>(key: K, value: PayoutsTestFlags[K]): void => onChange({ ...flags, [key]: value })

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
          <p className='text-xs text-ink-muted'>This table sorts and pages on the server, so each switch affects a real request.</p>
        </div>

        <Switch
          checked={flags.slow}
          onChange={value => set('slow', value)}
          label='Slow network'
          description={`Adds ${flags.delayMs} ms, so the stale-rows-with-progress treatment is visible`}
        />
        <Switch
          checked={flags.failList}
          onChange={value => set('failList', value)}
          label='Fail the payouts request'
          description='Returns 500 on the next sort or page change'
        />
        <Switch
          checked={flags.failChildren}
          onChange={value => set('failChildren', value)}
          label='Fail session requests'
          description='Expand a row: the error and its Retry stay inside that row'
        />
        <Switch
          checked={flags.emptyList}
          onChange={value => set('emptyList', value)}
          label='Empty dataset'
          description='Zero rows, so the empty state and "Page 1 of 1" are visible'
        />
        <Switch
          checked={flags.emptyChildren}
          onChange={value => set('emptyChildren', value)}
          label='Empty session lists'
          description='Every payout reports no sessions'
        />
      </div>
    </Popover>
  )
}
