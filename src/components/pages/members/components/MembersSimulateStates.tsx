import { Button, Popover, Switch } from 'components'
import { FilterSVG } from 'icons'
import type { MembersTestFlags } from '../members.types'

export type MembersSimulateStatesProps = {
  flags: MembersTestFlags
  onChange: (next: MembersTestFlags) => void
}

/* Fewer switches than the other two pages, and that is the point: this table has no
   expansion, so there are no child-fetch failures to force. The controls describe what
   this configuration can actually do. */
export const MembersSimulateStates = ({ flags, onChange }: MembersSimulateStatesProps) => {
  const set = <K extends keyof MembersTestFlags>(key: K, value: MembersTestFlags[K]): void => onChange({ ...flags, [key]: value })

  const activeCount = [flags.slow, flags.failList, flags.emptyList].filter(Boolean).length

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
          <p className='text-xs text-ink-muted'>This roster sorts and pages on the server, so each switch affects a real request.</p>
        </div>

        <Switch
          checked={flags.slow}
          onChange={value => set('slow', value)}
          label='Slow network'
          description={`Adds ${flags.delayMs} ms, so the skeleton and the stale-rows treatment are both visible`}
        />
        <Switch
          checked={flags.failList}
          onChange={value => set('failList', value)}
          label='Fail the request'
          description='Returns 500 on the next sort, page or search'
        />
        <Switch
          checked={flags.emptyList}
          onChange={value => set('emptyList', value)}
          label='Empty dataset'
          description='Zero rows, so the empty state and "Page 1 of 1" are visible'
        />
      </div>
    </Popover>
  )
}
