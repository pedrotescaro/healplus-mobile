import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

export const ThemeColors = {
  light: {
    background: '#F2F2F7',
    surface: '#FFFFFF',
    surfaceAlt: '#E5E5EA',
    text: '#1C1C1E',
    textSecondary: '#6B6B70',
    primary: '#3B82F6',
    primaryLight: 'rgba(59, 130, 246, 0.12)',
    primaryText: '#2563EB',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#C7C7CC',
    borderLight: '#E5E5EA',
    inputBg: '#EFEFF4',
    navBg: '#FFFFFF',
    navBorder: '#E5E5EA',
    androidNavSpacer: '#E5E5EA',
    icon: '#6B6B70',
    avatarBg: '#DBEAFE',
    switchTrackFalse: '#D1D1D6',
    overlay: 'rgba(0,0,0,0.4)',
    placeholder: '#A0A0A5',
    gridLine: '#D1D1D6',
  },
  dark: {
    background: '#1E1E20',
    surface: '#2A2A2C',
    surfaceAlt: '#1E1E20',
    text: '#FFFFFF',
    textSecondary: '#8E8E93',
    primary: '#3B82F6',
    primaryLight: 'rgba(59, 130, 246, 0.15)',
    primaryText: '#5B9CFF',
    secondary: '#10B981',
    warning: '#F59E0B',
    danger: '#EF4444',
    border: '#4A4A4C',
    borderLight: '#2A2A2C',
    inputBg: '#1E1E20',
    navBg: '#1E1E20',
    navBorder: '#2A2A2C',
    androidNavSpacer: '#141416',
    icon: '#8E8E93',
    avatarBg: '#273C5B',
    switchTrackFalse: '#4A4A4C',
    overlay: 'rgba(0,0,0,0.7)',
    placeholder: '#6A6A70',
    gridLine: '#3A3A3C',
  },
};

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [userOverride, setUserOverride] = useState(null);

  const theme = userOverride ?? 'dark';
  const isDark = theme === 'dark';
  const colors = ThemeColors[theme];

  const toggleTheme = useCallback(() => {
    setUserOverride(prev => {
      const current = prev ?? 'dark';
      return current === 'dark' ? 'light' : 'dark';
    });
  }, []);

  const value = useMemo(
    () => ({ theme, colors, isDark, toggleTheme }),
    [theme, colors, isDark, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
