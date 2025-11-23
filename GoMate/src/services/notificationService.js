import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import {Platform} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications should be handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Helper to check if notifications are enabled
async function areNotificationsEnabled() {
  try {
    const prefs = await AsyncStorage.getItem('notificationPreferences');
    if (!prefs) return true; // Default to enabled
    const parsed = JSON.parse(prefs);
    return parsed.enabled !== false;
  } catch (error) {
    console.log('Error checking notification preferences:', error);
    return true; // Default to enabled on error
  }
}

// Helper to check specific notification type preference
async function isNotificationTypeEnabled(type) {
  try {
    const prefs = await AsyncStorage.getItem('notificationPreferences');
    if (!prefs) return true; // Default to enabled
    const parsed = JSON.parse(prefs);
    
    // Check if notifications are globally enabled first
    if (parsed.enabled === false) return false;
    
    // Check specific type
    switch (type) {
      case 'booking':
        return parsed.bookingNotifications !== false;
      case 'departure':
        return parsed.departureReminders !== false;
      case 'favorite':
        return parsed.favoriteNotifications !== false;
      default:
        return true;
    }
  } catch (error) {
    console.log('Error checking notification type preference:', error);
    return true; // Default to enabled on error
  }
}

// Request permission and get push token
export async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#0a7ea4',
    });
  }

  if (Device.isDevice) {
    const {status: existingStatus} = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const {status} = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }
    
    token = (await Notifications.getExpoPushTokenAsync()).data;
    console.log('Push notification token:', token);
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}

// Schedule a departure reminder notification
export async function scheduleDepartureReminder(booking, minutesBefore = 30) {
  try {
    // Check if departure reminders are enabled
    const enabled = await isNotificationTypeEnabled('departure');
    if (!enabled) {
      console.log('Departure reminders are disabled');
      return null;
    }

    const {bookedAt, user, itemId, confirmationCode} = booking;
    const departureTime = user?.schedule?.time || '09:00';
    
    // Parse the departure time (assuming format like "09:30")
    const [hours, minutes] = departureTime.split(':').map(Number);
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setHours(hours, minutes, 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    
    // Subtract reminder minutes
    const reminderTime = new Date(scheduledDate.getTime() - minutesBefore * 60 * 1000);
    
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚍 Departure Reminder',
        body: `Your ${itemId} departs in ${minutesBefore} minutes! Confirmation: ${confirmationCode}`,
        data: {bookingId: booking.id, type: 'departure_reminder'},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: reminderTime,
    });
    
    // Save notification ID to cancel later if needed
    await saveNotificationId(booking.id, notificationId);
    
    console.log(`Scheduled departure reminder for ${reminderTime.toLocaleString()}`);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling reminder:', error);
    return null;
  }
}

// Send immediate booking confirmation notification
export async function sendBookingConfirmation(booking) {
  try {
    // Check if booking notifications are enabled
    const enabled = await isNotificationTypeEnabled('booking');
    if (!enabled) {
      console.log('Booking notifications are disabled');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Booking Confirmed!',
        body: `Your trip to ${booking.itemId} is confirmed. Confirmation code: ${booking.confirmationCode}`,
        data: {bookingId: booking.id, type: 'booking_confirmation'},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
    
    console.log('Booking confirmation sent');
  } catch (error) {
    console.error('Error sending booking confirmation:', error);
  }
}

// Send delay alert notification
export async function sendDelayAlert(itemTitle, newTime, reason = 'operational reasons') {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '⚠️ Service Delayed',
        body: `${itemTitle} is delayed. New departure time: ${newTime}. Reason: ${reason}`,
        data: {type: 'delay_alert'},
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
    
    console.log('Delay alert sent');
  } catch (error) {
    console.error('Error sending delay alert:', error);
  }
}

// Send welcome notification for new users
export async function sendWelcomeNotification(username) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Welcome to GoMate!',
        body: `Hi ${username}! Start exploring and booking your favorite transport routes.`,
        data: {type: 'welcome'},
        sound: true,
      },
      trigger: {seconds: 2},
    });
    
    console.log('Welcome notification scheduled');
  } catch (error) {
    console.error('Error sending welcome notification:', error);
  }
}

// Send favorite added notification
export async function sendFavoriteAddedNotification(itemTitle) {
  try {
    // Check if favorite notifications are enabled
    const enabled = await isNotificationTypeEnabled('favorite');
    if (!enabled) {
      console.log('Favorite notifications are disabled');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '❤️ Added to Favorites',
        body: `${itemTitle} has been added to your favorites for quick access!`,
        data: {type: 'favorite_added'},
        sound: false,
      },
      trigger: {seconds: 1},
    });
  } catch (error) {
    console.error('Error sending favorite notification:', error);
  }
}

// Cancel scheduled notifications
export async function cancelNotification(notificationId) {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
    console.log('Notification cancelled:', notificationId);
  } catch (error) {
    console.error('Error cancelling notification:', error);
  }
}

// Cancel all notifications for a booking
export async function cancelBookingNotifications(bookingId) {
  try {
    const notificationIds = await getNotificationIds(bookingId);
    for (const id of notificationIds) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await AsyncStorage.removeItem(`@notifications_${bookingId}`);
    console.log('All booking notifications cancelled');
  } catch (error) {
    console.error('Error cancelling booking notifications:', error);
  }
}

// Get all scheduled notifications
export async function getAllScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

// Helper: Save notification ID
async function saveNotificationId(bookingId, notificationId) {
  try {
    const key = `@notifications_${bookingId}`;
    const existing = await AsyncStorage.getItem(key);
    const ids = existing ? JSON.parse(existing) : [];
    ids.push(notificationId);
    await AsyncStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error('Error saving notification ID:', error);
  }
}

// Helper: Get notification IDs for a booking
async function getNotificationIds(bookingId) {
  try {
    const key = `@notifications_${bookingId}`;
    const existing = await AsyncStorage.getItem(key);
    return existing ? JSON.parse(existing) : [];
  } catch (error) {
    console.error('Error getting notification IDs:', error);
    return [];
  }
}
