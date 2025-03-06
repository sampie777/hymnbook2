import React, { PropsWithChildren, useEffect, useRef, useState } from "react";
import { Appearance, NativeEventSubscription } from "react-native";
import { darkColors, defaultFontFamilies, lightColors, ThemeColors, ThemeFontFamilies } from "../../../logic/theme";
import Settings from "../../../settings";

export interface ThemeContextProps {
  isDark: boolean;
  colors: ThemeColors;
  reload: () => void;
  fontFamily: ThemeFontFamilies;
}

export const ThemeContext = React.createContext<ThemeContextProps>({
  isDark: false,
  colors: lightColors,
  reload: () => undefined,
  fontFamily: defaultFontFamilies
});

const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const appearanceEventSubscription = useRef<NativeEventSubscription>();

  const getDefaultTheme = () => {
    if (Settings.theme !== "") {
      return Settings.theme;
    }
    return Appearance.getColorScheme();
  };

  const [isDark, setIsDark] = useState(getDefaultTheme() === "dark");

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    appearanceEventSubscription.current = Appearance.addChangeListener(handleSystemThemeChange);
  };

  const onExit = () => {
    appearanceEventSubscription.current?.remove();
  };

  const handleSystemThemeChange = () => {
    loadTheme();
  };

  const loadTheme = () => {
    setIsDark(getDefaultTheme() === "dark");
  };

  const defaultContext: ThemeContextProps = {
    isDark: isDark,
    colors: isDark ? darkColors : lightColors,
    reload: () => loadTheme(),
    fontFamily: defaultFontFamilies
  };

  return (
    <ThemeContext.Provider value={defaultContext}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

export const useTheme = () => React.useContext(ThemeContext);
