/** A fourth row shape, deliberately unlike the other three: no children, no currency, no
 *  nullable dates. It exists so the minimal example stays readable. */
export type DemoZone = {
  readonly id: string
  readonly label: string
  readonly grade: string
  readonly problems: number
  readonly setOn: string
}
