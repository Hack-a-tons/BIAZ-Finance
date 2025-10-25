import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform does not support push notifications');
    return false;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[Notifications] Permission not granted');
      return false;
    }

    console.log('[Notifications] Permission granted');
    return true;
  } catch (error) {
    console.error('[Notifications] Error requesting permissions:', error);
    return false;
  }
}

export async function scheduleStockAlertNotification(
  stockSymbol: string,
  currentPrice: number,
  priceChange: number,
  changePercent: number
): Promise<void> {
  if (Platform.OS === 'web') {
    console.log('[Notifications] Web platform does not support push notifications');
    return;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    const isNegative = priceChange < 0;
    const emoji = isNegative ? '📉' : '📈';
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `${emoji} ${stockSymbol} Price Alert`,
        body: `${stockSymbol} is ${isNegative ? 'down' : 'up'} ${Math.abs(changePercent).toFixed(2)}% at $${currentPrice.toFixed(2)}`,
        data: { stockSymbol, currentPrice, priceChange, changePercent },
        sound: true,
      },
      trigger: null,
    });

    console.log('[Notifications] Scheduled notification for', stockSymbol);
  } catch (error) {
    console.error('[Notifications] Error scheduling notification:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[Notifications] Cancelled all notifications');
  } catch (error) {
    console.error('[Notifications] Error cancelling notifications:', error);
  }
}
