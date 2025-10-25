/**
 * Color Constants
 * 
 * This file contains the default template color scheme.
 * Note: The main app uses a custom dark theme color palette defined inline.
 * This file is kept for potential future theme switching functionality.
 */

// Primary tint color for light theme
const tintColorLight = "#2f95dc";

// Light theme color scheme (currently not in use)
export default {
  light: {
    text: "#000",               // Text color
    background: "#fff",        // Background color
    tint: tintColorLight,      // Primary tint/accent color
    tabIconDefault: "#ccc",    // Inactive tab icon color
    tabIconSelected: tintColorLight,  // Active tab icon color
  },
};
