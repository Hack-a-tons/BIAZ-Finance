/**
 * 404 Not Found Screen
 * 
 * Displayed when user navigates to a non-existent route.
 * Provides a link to return to the home screen.
 */

import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

// Application color palette
const appColors = {
  dark: '#0c0c0c',    // Dark background
  light: '#fbfbfb',   // Light text
  positive: '#10b981', // Green for links/accents
} as const;

/**
 * NotFoundScreen Component
 * 
 * Error screen shown for invalid routes
 */
export default function NotFoundScreen() {
  return (
    <>
      {/* Header configuration */}
      <Stack.Screen
        options={{
          title: "Error",
          headerStyle: { backgroundColor: appColors.dark },
          headerTintColor: appColors.light,
        }}
      />
      
      {/* Error message container */}
      <View style={styles.container}>
        {/* Error message */}
        <Text style={styles.title}>This page does not exist</Text>

        {/* Link back to home screen */}
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go back to home</Text>
        </Link>
      </View>
    </>
  );
}

// ==========================================
// STYLES
// ==========================================

const styles = StyleSheet.create({
  // Main container centered on screen
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: appColors.dark,
  },
  
  // Error message title
  title: {
    fontSize: 20,
    fontWeight: "bold" as const,
    color: appColors.light,
  },
  
  // Link wrapper with spacing
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  
  // Link text styled in accent color
  linkText: {
    fontSize: 14,
    color: appColors.positive,
  },
});
