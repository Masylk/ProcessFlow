import { themeRegistry } from './registry';
import { lightTheme } from './themes/light';
import { darkTheme } from './themes/dark';

// Register themes
themeRegistry.register(lightTheme);
themeRegistry.register(darkTheme);

// Export everything
export { themeRegistry };
export { lightTheme, darkTheme };
export * from './types';
export * from './hooks';
export * from './utils'; 