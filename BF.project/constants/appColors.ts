/**
 * Application Color Palette
 * 
 * This file contains the centralized color scheme for BIAZ Finance.
 * All colors follow a dark-first design philosophy optimized for financial data.
 * 
 * IMPORTANT RULES:
 * 1. Always import and use these colors - never hardcode hex values
 * 2. Use semantic colors correctly (positive = green, negative = red)
 * 3. Never add custom colors without updating this file and DESIGN.md
 * 
 * Usage:
 * ```typescript
 * import { appColors } from '@/constants/appColors';
 * 
 * const styles = StyleSheet.create({
 *   container: {
 *     backgroundColor: appColors.dark,
 *     color: appColors.light,
 *   }
 * });
 * ```
 */

export const appColors = {
  /**
   * Background Colors
   */
  dark: '#0c0c0c',      // Primary background - Deep black
  cardBg: '#1a1a1a',    // Card backgrounds - Dark gray
  
  /**
   * Text Colors
   */
  light: '#fbfbfb',     // Primary text - Off-white
  
  /**
   * Semantic Colors
   * Use these for data visualization and user feedback
   */
  positive: '#10b981',  // Green - Price increases, bullish sentiment, success states
  negative: '#ef4444',  // Red - Price decreases, bearish sentiment, errors
  neutral: '#6b7280',   // Gray - Neutral data, secondary text, inactive elements
} as const;

/**
 * Type export for strict typing
 */
export type AppColors = typeof appColors;
