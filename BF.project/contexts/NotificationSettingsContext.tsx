import createContextHook from '@nkzw/create-context-hook';
import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATION_SETTINGS_KEY = '@notification_settings';

export interface NotificationSettings {
  notificationsEnabled: boolean;
  priceAlertsEnabled: boolean;
}

const defaultSettings: NotificationSettings = {
  notificationsEnabled: true,
  priceAlertsEnabled: true,
};

export const [NotificationSettingsProvider, useNotificationSettings] = createContextHook(() => {
  const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as NotificationSettings;
        setSettings(parsed);
        console.log('[NotificationSettings] Loaded settings:', parsed);
      }
    } catch (error) {
      console.error('[NotificationSettings] Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = useCallback(async (newSettings: NotificationSettings) => {
    try {
      await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(newSettings));
      console.log('[NotificationSettings] Saved settings:', newSettings);
    } catch (error) {
      console.error('[NotificationSettings] Failed to save settings:', error);
    }
  }, []);

  const setNotificationsEnabled = useCallback(async (enabled: boolean) => {
    const newSettings = { ...settings, notificationsEnabled: enabled };
    setSettings(newSettings);
    await saveSettings(newSettings);
    console.log('[NotificationSettings] Notifications enabled:', enabled);
  }, [settings, saveSettings]);

  const setPriceAlertsEnabled = useCallback(async (enabled: boolean) => {
    const newSettings = { ...settings, priceAlertsEnabled: enabled };
    setSettings(newSettings);
    await saveSettings(newSettings);
    console.log('[NotificationSettings] Price alerts enabled:', enabled);
  }, [settings, saveSettings]);

  return useMemo(() => ({
    settings,
    isLoading,
    setNotificationsEnabled,
    setPriceAlertsEnabled,
  }), [settings, isLoading, setNotificationsEnabled, setPriceAlertsEnabled]);
});
