import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { ThemeTokens, ButtonTokens } from './types';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export function useColors() {
  const { currentTheme, themes } = useTheme();
  return themes[currentTheme].tokens.colors;
}

export function useTypography() {
  const { currentTheme, themes } = useTheme();
  return themes[currentTheme].tokens.typography;
}

export function useSpacing() {
  const { currentTheme, themes } = useTheme();
  return themes[currentTheme].tokens.spacing;
}

export function useThemeAssets() {
  const { currentTheme, themes } = useTheme();
  return themes[currentTheme].assets;
}

export function useButtonToken(token: keyof ButtonTokens) {
  const { getCssVariable } = useTheme();
  return getCssVariable(token);
} 