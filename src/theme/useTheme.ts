import { useContext, useMemo } from "react";
import { StyleSheet } from "react-native";
import { ThemeContext } from "./ThemeProvider";
import type { Theme } from "./tokens";

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

/** Theme and typeface pickers for Settings → Display. */
export function useThemeControls() {
  const { themes, setThemeId, theme, fonts, fontId, setFontId } = useContext(ThemeContext);
  return { themes, setThemeId, current: theme.id, fonts, fontId, setFontId };
}

/**
 * makeStyles((t) => ({ box: { backgroundColor: t.color.face } })) returns a hook that
 * memoises a StyleSheet per theme.
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (t: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}
