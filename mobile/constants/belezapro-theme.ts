/**
 * Semantic tokens (B&W): light = papel claro, dark = preto/cinza.
 */

export type AppColorScheme = 'light' | 'dark';

const light = {
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
  overlayScrim: 'rgba(28, 25, 23, 0.45)',
  stateActiveMutedBg: '#e7e7e7',
  stateActiveIcon: '#171717',
  financePaidAccent: '#047857',
  financePaidBg: '#ecfdf5',
  financePendingAccent: '#c2410c',
  financePendingBg: '#fff7ed',
} as const;

const dark = {
  surfaceCanvas: '#0a0a0a',
  surfaceElevated: '#141414',
  surfaceMuted: '#1a1a1a',
  surfaceSubtle: '#2a2a2a',
  borderSubtle: '#3f3f3f',
  borderSoft: '#262626',
  textMuted: '#8c8c8c',
  textBody: '#d4d4d4',
  textHeading: '#fafafa',
  actionPrimary: '#fafafa',
  actionPrimaryHover: '#e5e5e5',
  actionOnPrimary: '#0a0a0a',
  error: '#fca5a5',
  overlayScrim: 'rgba(0, 0, 0, 0.72)',
  stateActiveMutedBg: '#262626',
  stateActiveIcon: '#fafafa',
  financePaidAccent: '#6ee7b7',
  financePaidBg: '#14532d',
  financePendingAccent: '#fdba74',
  financePendingBg: '#422006',
} as const;

export type BelezaproColorTokens = { [K in keyof typeof light]: string };

export const BelezaproLightColors = light as BelezaproColorTokens;

export const BelezaproDarkColors = dark as BelezaproColorTokens;

/** @deprecated Prefer useAppTheme().colors — kept for gradual migration */
export const BelezaproColors: BelezaproColorTokens = BelezaproLightColors;

export function getBelezaproColors(scheme: AppColorScheme): BelezaproColorTokens {
  return scheme === 'dark' ? BelezaproDarkColors : BelezaproLightColors;
}

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
