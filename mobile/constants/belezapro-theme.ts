/**
 * Mirrors frontend semantic tokens (tailwind/theme.css in Angular web).
 */

export const BelezaproColors = {
  surfaceCanvas: '#fafaf9',
  surfaceElevated: '#ffffff',
  surfaceMuted: '#f5f5f4',
  surfaceSubtle: '#e7e5e4',
  borderSubtle: '#e7e5e4',
  borderSoft: '#f5f5f4',
  textMuted: '#a8a29e',
  textBody: '#57534e',
  textHeading: '#1c1917',
  actionPrimary: '#292524',
  actionPrimaryHover: '#44403c',
  actionOnPrimary: '#ffffff',
  error: '#b3261e',
} as const;

/** Resolved keys passed to useFonts — use as RN fontFamily */
export const FontFamilies = {
  serifItalicHeading: 'PlayfairDisplay_600SemiBold_Italic',
  sansRegular: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
} as const;

/** Matches Angular `--radius-card` (24); `--radius-control-lg` (16) */
export const BelezaproRadius = {
  card: 24,
  controlLg: 16,
  pill: 9999,
};
