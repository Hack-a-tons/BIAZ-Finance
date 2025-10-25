import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_STORAGE_KEY = '@auth_state';

export interface AuthState {
  isSignedIn: boolean;
}

const defaultState: AuthState = {
  isSignedIn: true,
};

export const [AuthProvider, useAuth] = createContextHook(() => {
  const [authState, setAuthState] = useState<AuthState>(defaultState);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadAuthState();
  }, []);

  const loadAuthState = async () => {
    try {
      const stored = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AuthState;
        setAuthState(parsed);
        console.log('[Auth] Loaded auth state:', parsed);
      }
    } catch (error) {
      console.error('[Auth] Failed to load auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = useCallback(async () => {
    const newState: AuthState = { isSignedIn: false };
    setAuthState(newState);
    
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
      console.log('[Auth] Signed out successfully');
    } catch (error) {
      console.error('[Auth] Failed to save auth state:', error);
    }
  }, []);

  const signIn = useCallback(async () => {
    const newState: AuthState = { isSignedIn: true };
    setAuthState(newState);
    
    try {
      await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newState));
      console.log('[Auth] Signed in successfully');
    } catch (error) {
      console.error('[Auth] Failed to save auth state:', error);
    }
  }, []);

  return useMemo(() => ({
    authState,
    isLoading,
    signOut,
    signIn,
  }), [authState, isLoading, signOut, signIn]);
});
