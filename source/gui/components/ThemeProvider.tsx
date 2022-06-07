import React, { useEffect, useState } from "react";
import { Appearance } from "react-native";
import { darkColors, lightColors, ThemeColors } from "../../logic/theme";
import Settings from "../../settings";

export interface ThemeContextProps {
  isDark: boolean;
  colors: ThemeColors;
  reload: () => void;
}

export const ThemeContext = React.createContext<ThemeContextProps>({
  isDark: false,
  colors: lightColors,
  reload: () => undefined
});

const ThemeProvider: React.FC = ({ children }) => {
  const getDefaultTheme = () => {
    if (Settings.theme !== "") {
      return Settings.theme
    }
    return Appearance.getColorScheme();
  };

  const [isDark, setIsDark] = useState(getDefaultTheme() === "dark");

  useEffect(() => {
    onLaunch();
    return onExit;
  }, []);

  const onLaunch = () => {
    Appearance.addChangeListener(handleSystemThemeChange);
  };

  const onExit = () => {
    Appearance.removeChangeListener(handleSystemThemeChange);
  };

  const handleSystemThemeChange = () => {
    loadTheme();
  };

  const loadTheme = () => {
    setIsDark(getDefaultTheme() === "dark");
  }

  const defaultContext: ThemeContextProps = {
    isDark: isDark,
    colors: isDark ? darkColors : lightColors,
    reload: () => loadTheme()
  };

  return (
    <ThemeContext.Provider value={defaultContext}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

export const useTheme = () => React.useContext(ThemeContext);
