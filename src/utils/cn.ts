import { clsx } from 'clsx'
import type { ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** `twMerge(clsx(...))`. clsx alone leaves conflicts in the output: `cn('p-2', 'p-4')`
 *  has to resolve to `p-4` by call order, not by stylesheet order. */
export const cn = (...classes: ClassValue[]): string => twMerge(clsx(classes))
