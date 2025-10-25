/**
 * Typography System
 * 
 * Centralized font sizes and weights for consistent typography.
 * 
 * Usage:
 * ```typescript
 * import { fontSize, fontWeight } from '@/constants/typography';
 * 
 * const styles = StyleSheet.create({
 *   title: {
 *     fontSize: fontSize.heading1,
 *     fontWeight: fontWeight.bold,
 *   }
 * });
 * ```
 */

/**
 * Font Sizes
 * 
 * Semantic naming for easier maintenance and understanding
 */
export const fontSize = {
  // Headlines
  display: 28,        // Expanded news title, large headings
  heading1: 24,       // App title, modal titles
  heading2: 22,       // Section titles
  heading3: 20,       // News card title, prominent elements
  heading4: 18,       // Stock symbols, insight titles
  
  // Body
  body: 17,           // Button text, primary labels
  bodyLarge: 16,      // Standard body text, descriptions
  bodySmall: 14,      // Secondary text, stock details
  
  // Small
  caption: 13,        // Setting descriptions
  small: 12,          // Timestamps, meta info
  tiny: 11,           // Small badges, compact info
} as const;

/**
 * Font Weights
 * 
 * Use 'as const' assertion for proper TypeScript typing
 */
export const fontWeight = {
  regular: '400' as const,    // Body text, descriptions
  medium: '500' as const,     // Buttons, labels
  semiBold: '600' as const,   // Subheadings, important data
  bold: '700' as const,       // Headlines, titles, emphasis
} as const;

/**
 * Line Heights
 * 
 * Calculated based on font sizes for optimal readability
 */
export const lineHeight = {
  display: 36,        // 28 * 1.28
  heading1: 32,       // 24 * 1.33
  heading2: 30,       // 22 * 1.36
  heading3: 28,       // 20 * 1.4
  heading4: 26,       // 18 * 1.44
  body: 24,           // 17 * 1.41
  bodyLarge: 26,      // 16 * 1.625
  bodySmall: 22,      // 14 * 1.57
  caption: 20,        // 13 * 1.54
  small: 18,          // 12 * 1.5
} as const;

/**
 * Letter Spacing
 * 
 * Subtle spacing for improved readability
 */
export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
} as const;

/**
 * Typography Presets
 * 
 * Commonly used text style combinations
 */
export const textPresets = {
  displayTitle: {
    fontSize: fontSize.display,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.display,
  },
  heading1: {
    fontSize: fontSize.heading1,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading1,
  },
  heading2: {
    fontSize: fontSize.heading2,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading2,
  },
  heading3: {
    fontSize: fontSize.heading3,
    fontWeight: fontWeight.bold,
    lineHeight: lineHeight.heading3,
  },
  body: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.body,
  },
  bodyBold: {
    fontSize: fontSize.body,
    fontWeight: fontWeight.semiBold,
    lineHeight: lineHeight.body,
  },
  caption: {
    fontSize: fontSize.caption,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.caption,
  },
  small: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.regular,
    lineHeight: lineHeight.small,
  },
  badge: {
    fontSize: fontSize.tiny,
    fontWeight: fontWeight.bold,
    letterSpacing: letterSpacing.wide,
  },
} as const;
