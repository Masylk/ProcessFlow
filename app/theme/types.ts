export type ThemeMode = 'light' | 'dark' | 'system';

export type ColorToken = {
  [key: string]: string;
};

export type TypographyToken = {
  fontSize: string;
  lineHeight: string;
  fontWeight: number | string;
};

export type SpacingToken = {
  [key: string]: string;
};

export type BreadcrumbTokens = {
  'breadcrumb-active-bg': string;
  'breadcrumb-active-fg': string;
  'breadcrumb-inactive-fg': string;
  'breadcrumb-separator': string;
  'breadcrumb-hover-opacity': string;
};

export type InputTokens = {
  // Default input tokens
  'input-bg': string;
  'input-fg': string;
  'input-border': string;
  'input-bg-hover': string;
  'input-fg-hover': string;
  'input-border-hover': string;
  'input-bg-focus': string;
  'input-fg-focus': string;
  'input-border-focus': string;
  'input-placeholder': string;
  'input-label': string;
  'input-hint': string;
  'input-icon': string;
  'input-prefix': string;

  // Destructive input tokens
  'input-destructive-bg': string;
  'input-destructive-fg': string;
  'input-destructive-border': string;
  'input-destructive-bg-hover': string;
  'input-destructive-fg-hover': string;
  'input-destructive-border-hover': string;
  'input-destructive-bg-focus': string;
  'input-destructive-fg-focus': string;
  'input-destructive-border-focus': string;
  'input-destructive-label': string;
  'input-destructive-hint': string;
  'input-destructive-icon': string;

  // Disabled input tokens
  'input-disabled-bg': string;
  'input-disabled-fg': string;
  'input-disabled-border': string;
  'input-disabled-placeholder': string;
  'input-disabled-label': string;
};

export type ButtonTokens = {
  // Primary button tokens
  'button-primary-bg': string;
  'button-primary-fg': string;
  'button-primary-border': string;
  'button-primary-bg-hover': string;
  'button-primary-fg-hover': string;
  'button-primary-border-hover': string;
  
  // Secondary button tokens
  'button-secondary-bg': string;
  'button-secondary-fg': string;
  'button-secondary-border': string;
  'button-secondary-bg-hover': string;
  'button-secondary-fg-hover': string;
  'button-secondary-border-hover': string;
  
  // Secondary color button tokens
  'button-secondary-color-bg': string;
  'button-secondary-color-fg': string;
  'button-secondary-color-border': string;
  'button-secondary-color-bg-hover': string;
  'button-secondary-color-fg-hover': string;
  'button-secondary-color-border-hover': string;
  
  // Tertiary button tokens
  'button-tertiary-bg': string;
  'button-tertiary-fg': string;
  'button-tertiary-border': string;
  'button-tertiary-bg-hover': string;
  'button-tertiary-fg-hover': string;
  'button-tertiary-border-hover': string;
  
  // Tertiary color button tokens
  'button-tertiary-color-bg': string;
  'button-tertiary-color-fg': string;
  'button-tertiary-color-border': string;
  'button-tertiary-color-bg-hover': string;
  'button-tertiary-color-fg-hover': string;
  'button-tertiary-color-border-hover': string;
  
  // Destructive button tokens
  'button-destructive-primary-bg': string;
  'button-destructive-primary-fg': string;
  'button-destructive-primary-border': string;
  'button-destructive-primary-bg-hover': string;
  'button-destructive-primary-fg-hover': string;
  'button-destructive-primary-border-hover': string;

  'button-destructive-secondary-bg': string;
  'button-destructive-secondary-fg': string;
  'button-destructive-secondary-border': string;
  'button-destructive-secondary-bg-hover': string;
  'button-destructive-secondary-fg-hover': string;
  'button-destructive-secondary-border-hover': string;

  'button-destructive-tertiary-bg': string;
  'button-destructive-tertiary-fg': string;
  'button-destructive-tertiary-border': string;
  'button-destructive-tertiary-bg-hover': string;
  'button-destructive-tertiary-fg-hover': string;
  'button-destructive-tertiary-border-hover': string;
  
  // Loading spinner
  'button-loading-spinner': string;
};

export type IconTokens = {
  'icon-default': string;
  'icon-default-hover': string;
  'icon-primary': string;
  'icon-primary-hover': string;
  'icon-secondary': string;
  'icon-secondary-hover': string;
  'icon-tertiary': string;
  'icon-tertiary-hover': string;
  'icon-success': string;
  'icon-success-hover': string;
  'icon-warning': string; 
  'icon-warning-hover': string;
  'icon-error': string;
  'icon-error-hover': string;
  'icon-info': string;
  'icon-info-hover': string;
};

export type CSSVariables = {
  [K in keyof (ButtonTokens & InputTokens & BreadcrumbTokens & IconTokens) as `--${K}`]: string;
};

export type ThemeTokens = {
  colors: ColorToken & ButtonTokens & InputTokens & BreadcrumbTokens & IconTokens;
  typography: Record<string, TypographyToken>;
  spacing: SpacingToken;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  // Add more token categories as needed
};

export type ThemeAssets = {
  icons: Record<string, string>;
  images: Record<string, string>;
};

export type Theme = {
  name: string;
  label: string;
  tokens: ThemeTokens;
  assets: ThemeAssets;
};

export type ThemeContextType = {
  currentTheme: ThemeMode;
  themes: Record<string, Theme>;
  setTheme: (mode: ThemeMode) => void;
  getCssVariable: (token: keyof (ButtonTokens & InputTokens & BreadcrumbTokens & IconTokens)) => string;
}; 