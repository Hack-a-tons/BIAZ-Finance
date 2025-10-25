/**
 * Layout Constants
 * 
 * Centralized dimensions, spacing, and responsive breakpoints.
 * 
 * Usage:
 * ```typescript
 * import { spacing, borderRadius, breakpoints, isDesktop } from '@/constants/layout';
 * 
 * const styles = StyleSheet.create({
 *   card: {
 *     borderRadius: borderRadius.large,
 *     padding: spacing.medium,
 *   }
 * });
 * ```
 */

import { Dimensions, Platform } from 'react-native';

/**
 * Screen Dimensions
 * Note: Use Dimensions.addEventListener to listen for changes in responsive apps
 */
export const getScreenDimensions = () => Dimensions.get('window');

export const SCREEN_WIDTH = getScreenDimensions().width;
export const SCREEN_HEIGHT = getScreenDimensions().height;

/**
 * Spacing System
 * 
 * Use these values for consistent spacing across the app.
 * Based on 4px baseline grid.
 */
export const spacing = {
  xs: 4,      // Extra small - Tight spacing in small elements
  sm: 8,      // Small - Default gap between related items
  md: 12,     // Medium - Card margins, section spacing
  lg: 16,     // Large - Screen padding (horizontal)
  xl: 20,     // Extra large - Large section padding
  xxl: 24,    // 2x Extra large - Major section dividers
  xxxl: 32,   // 3x Extra large - Screen section padding
} as const;

/**
 * Border Radius System
 */
export const borderRadius = {
  sm: 8,      // Small - Inputs, small buttons
  md: 12,     // Medium - Cards, standard buttons
  lg: 16,     // Large - Modals
  xl: 20,     // Extra large - Chips
  xxl: 24,    // 2x Extra large - Large cards
  round: 999, // Fully rounded - Circular buttons
} as const;

/**
 * Responsive Breakpoints
 */
export const breakpoints = {
  mobile: 0,      // 0px - 767px
  tablet: 768,    // 768px - 1023px
  desktop: 1024,  // 1024px+
} as const;

/**
 * Responsive Utilities
 */
export const isDesktop = (): boolean => {
  return Platform.OS === 'web' && getScreenDimensions().width >= breakpoints.desktop;
};

export const isTablet = (): boolean => {
  const width = getScreenDimensions().width;
  return width >= breakpoints.tablet && width < breakpoints.desktop;
};

export const isMobile = (): boolean => {
  return getScreenDimensions().width < breakpoints.tablet;
};

/**
 * Mobile News Card Layout (percentage-based)
 */
export const newsCardLayout = {
  headerHeight: 110,           // Fixed header height
  stocksWindowHeight: 110,     // Fixed stocks section height
  predictionWindowHeight: 220, // Fixed predictions section height
} as const;

/**
 * Desktop Layout Proportions
 */
export const desktopLayout = {
  newsFeedWidth: 0.5,        // 50% of screen
  sidebarWidth: 0.5,         // 50% of screen
  stocksHeightRatio: 0.4,    // 40% of sidebar
  predictionHeightRatio: 0.6, // 60% of sidebar
} as const;
