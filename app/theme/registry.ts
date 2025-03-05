import { Theme, ThemeMode } from './types';

class ThemeRegistry {
  private themes: Map<ThemeMode, Theme> = new Map();
  private defaultTheme: ThemeMode = 'light';

  constructor(defaultTheme?: ThemeMode) {
    if (defaultTheme) {
      this.defaultTheme = defaultTheme;
    }
  }

  register(theme: Theme): void {
    this.themes.set(theme.name as ThemeMode, theme);
  }

  get(mode: ThemeMode): Theme {
    const theme = this.themes.get(mode);
    if (!theme) {
      const defaultTheme = this.themes.get(this.defaultTheme);
      if (!defaultTheme) {
        throw new Error('No themes registered, including default theme');
      }
      return defaultTheme;
    }
    return theme;
  }

  getAllThemes(): Record<string, Theme> {
    return Object.fromEntries(this.themes.entries());
  }

  exists(mode: ThemeMode): boolean {
    return this.themes.has(mode);
  }

  getDefaultTheme(): Theme {
    const theme = this.themes.get(this.defaultTheme);
    if (!theme) {
      throw new Error('Default theme not found');
    }
    return theme;
  }
}

export const themeRegistry = new ThemeRegistry();
export default ThemeRegistry; 