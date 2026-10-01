/**
 * Enterprise Typography Scale (MUI & shadcn standards)
 */
export const typography = {
  fontFamily: {
    sans: 'font-sans',
    mono: 'font-mono',
  },
  scale: {
    pageTitle: 'text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50',
    sectionTitle: 'text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100',
    cardTitle: 'text-sm font-semibold text-slate-900 dark:text-slate-100',
    body: 'text-sm text-slate-700 dark:text-slate-300 leading-normal',
    secondary: 'text-[13px] text-slate-500 dark:text-slate-400 leading-normal',
    metadata: 'text-xs text-slate-400 dark:text-slate-500 leading-none',
    code: 'font-mono text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
  },
} as const;
