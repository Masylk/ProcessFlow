/**
 * Theme transition utilities for better performance
 */

/**
 * Class name for components that should have smooth theme transitions
 * Use this sparingly, only on components where the transition is visually important
 */
export const THEME_TRANSITION_CLASS = 'theme-transition';

/**
 * Class name for components that should NOT have transitions (for performance)
 * Use this on icons, charts, or other performance-sensitive elements
 */
export const NO_TRANSITION_CLASS = 'no-transition';

/**
 * Hook to get theme transition class names
 * @param enableTransition - Whether to enable smooth transitions for this component
 * @returns className string
 */
export function useThemeTransition(enableTransition: boolean = false): string {
  return enableTransition ? THEME_TRANSITION_CLASS : '';
}

/**
 * Utility to temporarily disable all theme transitions (useful for bulk updates)
 */
export function disableThemeTransitions(): () => void {
  const root = document.documentElement;
  root.style.setProperty('--theme-transition-duration', '0ms');
  
  return () => {
    root.style.setProperty('--theme-transition-duration', '150ms');
  };
}

/**
 * Data attribute for components that should transition
 */
export const themeTransitionAttr = { 'data-theme-transition': 'true' };

/**
 * Data attribute for components that should NOT transition
 */
export const noTransitionAttr = { 'data-no-transition': 'true' };