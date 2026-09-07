import { TimetableOverview } from 'components/pages/timetable'

/* Route file, so it default-exports: the one carve-out to the named-export rule.
   Thin by design, with no logic and no data loading of its own. */
export default function TimetableRoute() {
  return <TimetableOverview />
}
