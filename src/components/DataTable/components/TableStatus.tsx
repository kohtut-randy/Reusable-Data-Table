export type TableStatusProps = { message: string }

/* One polite live region per table. `aria-atomic` so the whole sentence is re-read
   rather than only the changed words, which would announce a bare "3" on a page change. */
export const TableStatus = ({ message }: TableStatusProps) => (
  <div aria-live='polite' aria-atomic='true' className='sr-only'>
    {message}
  </div>
)
