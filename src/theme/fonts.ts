import {
  IBMPlexSans_400Regular,
  IBMPlexSans_600SemiBold,
  useFonts,
} from "@expo-google-fonts/ibm-plex-sans";
import { FONT_BOLD, FONT_REGULAR } from "./fontNames";

export { FONT_BOLD, FONT_REGULAR };

/**
 * Loads the bundled typeface. Returns true once ready — or once loading has failed, so a font
 * problem degrades to the system face instead of hanging on the splash screen.
 */
export function useAppFonts(): boolean {
  const [loaded, error] = useFonts({
    [FONT_REGULAR]: IBMPlexSans_400Regular,
    [FONT_BOLD]: IBMPlexSans_600SemiBold,
  });
  return loaded || !!error;
}
