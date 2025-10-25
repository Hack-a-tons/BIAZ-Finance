/**
 * Root Layout Component
 * 
 * This is the main layout component for the BIAZ Finance application.
 * It sets up:
 * - React Query for server state management
 * - Gesture Handler for smooth interactions
 * - Stack navigation for the app
 * - Splash screen handling
 */

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { NotificationSettingsProvider } from "@/contexts/NotificationSettingsContext";
import { AuthProvider } from "@/contexts/AuthContext";

// Prevent the splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

// Initialize React Query client for managing server state and caching
const queryClient = new QueryClient();

/**
 * RootLayoutNav Component
 * 
 * Defines the main navigation structure with Stack Navigator.
 * Contains routes for:
 * - index: Main news feed screen
 * - profile: User profile and portfolio management
 * - settings: App settings and preferences
 */
function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="index" options={{ headerShown: true }} />
      <Stack.Screen name="profile" options={{ headerShown: true }} />
      <Stack.Screen name="settings" options={{ headerShown: true }} />
    </Stack>
  );
}

/**
 * RootLayout Component
 * 
 * Main app wrapper that:
 * 1. Hides splash screen once the app is ready
 * 2. Wraps the app with React Query provider for state management
 * 3. Wraps the app with GestureHandlerRootView for gesture support
 */
export default function RootLayout() {
  // Hide the splash screen after the component mounts
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <NotificationSettingsProvider>
            <FavoritesProvider>
              <PortfolioProvider>
                <GestureHandlerRootView>
                  <RootLayoutNav />
                </GestureHandlerRootView>
              </PortfolioProvider>
            </FavoritesProvider>
          </NotificationSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
