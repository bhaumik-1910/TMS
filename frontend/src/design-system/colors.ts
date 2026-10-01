/**
 * Centralized Enterprise Design System Colors
 * Restrained palette: Slate neutrals with Blue brand primary and strictly semantic accents.
 */
export const colors = {
  background: {
    light: 'bg-slate-50',
    dark: 'dark:bg-slate-950',
  },
  surface: {
    light: 'bg-white',
    dark: 'dark:bg-slate-900',
  },
  text: {
    primary: 'text-slate-900 dark:text-slate-50',
    secondary: 'text-slate-600 dark:text-slate-400',
    muted: 'text-slate-400 dark:text-slate-500',
    inverse: 'text-white dark:text-slate-950',
  },
  border: {
    default: 'border-slate-200 dark:border-slate-800',
    subtle: 'border-slate-100 dark:border-slate-800/60',
    focus: 'focus:border-blue-600 dark:focus:border-blue-500',
  },
  brand: {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    subtle: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    border: 'border-blue-600',
  },
  semantic: {
    success: {
      solid: 'bg-emerald-600 text-white hover:bg-emerald-700',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
    },
    warning: {
      solid: 'bg-amber-600 text-white hover:bg-amber-700',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
    },
    danger: {
      solid: 'bg-red-600 text-white hover:bg-red-700',
      badge: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800',
      text: 'text-red-600 dark:text-red-400',
    },
    info: {
      solid: 'bg-sky-600 text-white hover:bg-sky-700',
      badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-800',
      text: 'text-sky-600 dark:text-sky-400',
    },
    neutral: {
      solid: 'bg-slate-700 text-white hover:bg-slate-800',
      badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-400',
    },
  },
} as const;
