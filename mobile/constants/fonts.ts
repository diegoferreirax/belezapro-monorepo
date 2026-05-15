import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { PlayfairDisplay_600SemiBold_Italic } from '@expo-google-fonts/playfair-display';
import { useFonts } from 'expo-font';

import { FontFamilies } from '@/constants/belezapro-theme';

/** Fonts keyed so RN uses FontFamilies strings exactly */
export const belezaproFontAssets = {
  [FontFamilies.serifItalicHeading]: PlayfairDisplay_600SemiBold_Italic,
  [FontFamilies.sansRegular]: Inter_400Regular,
  [FontFamilies.sansMedium]: Inter_500Medium,
  [FontFamilies.sansSemiBold]: Inter_600SemiBold,
};

export function useBelezaproFonts(): [boolean, Error | null] {
  return useFonts(belezaproFontAssets);
}
