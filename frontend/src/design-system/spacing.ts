/**
 * Enterprise Spacing, Radius, and Shadow Tokens
 */
export const spacing = {
  headerHeight: 'h-16', // 64px
  sidebarWidth: 'w-60', // 240px
  sidebarCollapsedWidth: 'w-18', // 72px
  containerMax: 'max-w-7xl mx-auto',
  pagePadding: 'p-4 sm:p-6 lg:p-8',
  cardPadding: 'p-4 sm:p-5',
} as const;

export const radius = {
  sm: 'rounded-sm', // 4px
  md: 'rounded-md', // 6-8px default
  lg: 'rounded-lg', // 10px
  full: 'rounded-full', // for avatars and status dots only
} as const;

export const shadows = {
  none: 'shadow-none',
  card: 'shadow-sm',
  dropdown: 'shadow-md',
  dialog: 'shadow-lg',
} as const;
