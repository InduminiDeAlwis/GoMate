import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Switch, TextInput, FlatList, Image, ScrollView, Animated, Modal, Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LinearGradient} from 'expo-linear-gradient';
import {Feather} from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {logout, updateProfile} from '../redux/authSlice';
import {setTheme} from '../redux/themeSlice';
import {loadBookings} from '../redux/bookingsSlice';
import {getAllScheduledNotifications} from '../services/notificationService';

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const theme = useSelector((s) => s.theme.mode);
  const isDark = theme === 'dark';
  const bookings = useSelector((s) => s.bookings.bookings || []);
  const navigation = useNavigation();

  const [imageUrl, setImageUrl] = useState(user?.imageUrl || '');
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [avatarPickerVisible, setAvatarPickerVisible] = useState(false);

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [bookingNotifications, setBookingNotifications] = useState(true);
  const [departureReminders, setDepartureReminders] = useState(true);
  const [favoriteNotifications, setFavoriteNotifications] = useState(true);
  const [scheduledNotificationsCount, setScheduledNotificationsCount] = useState(0);
  
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [avatarScale] = useState(new Animated.Value(1));
  const [compassRotate] = useState(new Animated.Value(0));
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successScale] = useState(new Animated.Value(0));
  const [successOpacity] = useState(new Animated.Value(0));
  const [checkmarkScale] = useState(new Animated.Value(0));
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [logoutScale] = useState(new Animated.Value(0));
  const [logoutOpacity] = useState(new Animated.Value(0));

  // Pre-made avatar options
  const avatarOptions = [
    { id: '1', emoji: '😊', color: '#FFD93D' },
    { id: '2', emoji: '😎', color: '#6BCB77' },
    { id: '3', emoji: '🚀', color: '#4D96FF' },
    { id: '4', emoji: '🎉', color: '#FF6B9D' },
    { id: '5', emoji: '🌟', color: '#9D84B7' },
    { id: '6', emoji: '🎨', color: '#FF8C42' },
    { id: '7', emoji: '🎭', color: '#FF6B6B' },
    { id: '8', emoji: '🎯', color: '#4ECDC4' },
    { id: '9', emoji: '🏆', color: '#FFE66D' },
    { id: '10', emoji: '💎', color: '#A8DADC' },
    { id: '11', emoji: '🔥', color: '#F77F00' },
    { id: '12', emoji: '⚡', color: '#FCBF49' },
  ];

  useEffect(() => {
    // Set navigation header
    navigation.setOptions({
      title: '',
      headerStyle: {
        backgroundColor: isDark ? '#1a1a2e' : '#667eea',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: '800',
        fontSize: 20,
      },
      headerLeft: () => (
        <View style={{marginLeft: 16, flexDirection: 'row', alignItems: 'center'}}>
          <Animated.View style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 8,
            transform: [{
              rotate: compassRotate.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              })
            }],
          }}>
            <Feather name="compass" size={20} color="#fff" />
          </Animated.View>
          <Text style={{color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 0.5}}>Profile</Text>
        </View>
      ),
      headerRight: () => (
        <View style={{marginRight: 16, flexDirection: 'row', alignItems: 'center'}}>
          <View style={{
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            width: 36,
            height: 36,
            borderRadius: 18,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Feather name="settings" size={18} color="#fff" />
          </View>
        </View>
      ),
    });
    
    dispatch(loadBookings());
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7
      })
    ]).start();
    
    // Continuous compass rotation
    Animated.loop(
      Animated.timing(compassRotate, {
        toValue: 1,
        duration: 8000,
        useNativeDriver: true,
      })
    ).start();
  }, [dispatch, navigation, compassRotate]);

  // Animate success modal
  useEffect(() => {
    if (successModalVisible) {
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
      
      setTimeout(() => {
        Animated.spring(checkmarkScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 5
        }).start();
      }, 200);
    } else {
      successScale.setValue(0);
      successOpacity.setValue(0);
      checkmarkScale.setValue(0);
    }
  }, [successModalVisible]);

  // Animate logout modal
  useEffect(() => {
    if (logoutModalVisible) {
      Animated.parallel([
        Animated.spring(logoutScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.timing(logoutOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      logoutScale.setValue(0);
      logoutOpacity.setValue(0);
    }
  }, [logoutModalVisible]);

  // Animate logout modal
  useEffect(() => {
    if (logoutModalVisible) {
      Animated.parallel([
        Animated.spring(logoutScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7
        }),
        Animated.timing(logoutOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true
        })
      ]).start();
    } else {
      logoutScale.setValue(0);
      logoutOpacity.setValue(0);
    }
  }, [logoutModalVisible]);

  const pickImageFromLibrary = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }
    
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
      setImageModalVisible(false);
      // Pulse animation on avatar change
      Animated.sequence([
        Animated.timing(avatarScale, {toValue: 1.1, duration: 200, useNativeDriver: true}),
        Animated.timing(avatarScale, {toValue: 1, duration: 200, useNativeDriver: true})
      ]).start();
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions');
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8
    });

    if (!result.canceled && result.assets[0]) {
      setImageUrl(result.assets[0].uri);
      setImageModalVisible(false);
      Animated.sequence([
        Animated.timing(avatarScale, {toValue: 1.1, duration: 200, useNativeDriver: true}),
        Animated.timing(avatarScale, {toValue: 1, duration: 200, useNativeDriver: true})
      ]).start();
    }
  };

  const setImageFromUrl = () => {
    if (tempImageUrl.trim()) {
      setImageUrl(tempImageUrl.trim());
      setImageModalVisible(false);
      Animated.sequence([
        Animated.timing(avatarScale, {toValue: 1.1, duration: 200, useNativeDriver: true}),
        Animated.timing(avatarScale, {toValue: 1, duration: 200, useNativeDriver: true})
      ]).start();
    }
  };

  const handleSaveProfile = () => {
    dispatch(updateProfile({firstName: firstName.trim(), lastName: lastName.trim(), imageUrl: imageUrl || ''}));
    setSuccessModalVisible(true);
  };

  const selectAvatar = (avatar) => {
    setImageUrl(`avatar_${avatar.id}_${avatar.emoji}`);
    setAvatarPickerVisible(false);
    Animated.sequence([
      Animated.timing(avatarScale, {toValue: 1.1, duration: 200, useNativeDriver: true}),
      Animated.timing(avatarScale, {toValue: 1, duration: 200, useNativeDriver: true})
    ]).start();
  };

  const isEmojiAvatar = (url) => {
    return url && url.startsWith('avatar_');
  };

  const getEmojiFromUrl = (url) => {
    if (isEmojiAvatar(url)) {
      const parts = url.split('_');
      return parts[2] || '👤';
    }
    return null;
  };

  const getAvatarColor = (url) => {
    if (isEmojiAvatar(url)) {
      const parts = url.split('_');
      const id = parts[1];
      const avatar = avatarOptions.find(a => a.id === id);
      return avatar?.color || '#667eea';
    }
    return '#667eea';
  };

  // Load notification preferences
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      try {
        const prefs = await AsyncStorage.getItem('notificationPreferences');
        if (prefs) {
          const parsed = JSON.parse(prefs);
          setNotificationsEnabled(parsed.enabled !== false);
          setBookingNotifications(parsed.bookingNotifications !== false);
          setDepartureReminders(parsed.departureReminders !== false);
          setFavoriteNotifications(parsed.favoriteNotifications !== false);
        }
        
        // Load scheduled notifications count
        const scheduled = await getAllScheduledNotifications();
        setScheduledNotificationsCount(scheduled.length);
      } catch (error) {
        console.log('Error loading notification preferences:', error);
      }
    };
    
    loadNotificationPreferences();
  }, []);

  // Save notification preferences
  const saveNotificationPreferences = async () => {
    try {
      const prefs = {
        enabled: notificationsEnabled,
        bookingNotifications,
        departureReminders,
        favoriteNotifications
      };
      await AsyncStorage.setItem('notificationPreferences', JSON.stringify(prefs));
    } catch (error) {
      console.log('Error saving notification preferences:', error);
    }
  };

  // Save preferences whenever they change
  useEffect(() => {
    saveNotificationPreferences();
  }, [notificationsEnabled, bookingNotifications, departureReminders, favoriteNotifications]);

  // View scheduled notifications
  const viewScheduledNotifications = async () => {
    try {
      const scheduled = await getAllScheduledNotifications();
      if (scheduled.length === 0) {
        Alert.alert('No Scheduled Notifications', 'You have no upcoming notifications.');
      } else {
        const notificationsList = scheduled
          .map(n => `• ${n.content.title}\n  ${new Date(n.trigger.value).toLocaleString()}`)
          .join('\n\n');
        Alert.alert(
          `Scheduled Notifications (${scheduled.length})`,
          notificationsList,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Could not load scheduled notifications.');
    }
  };

  return (
    <ScrollView style={[styles.container, isDark && styles.containerDark]}>
      <Animated.View style={{opacity: fadeAnim, transform: [{scale: scaleAnim}]}}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={isDark ? ['#1a1a2e', '#16213e', '#533483'] : ['#667eea', '#764ba2', '#f093fb']}
          start={{x: 0, y: 0}}
          end={{x: 1, y: 1}}
          style={styles.gradientHeader}
        >
          <View style={styles.headerTopRow}>
            <View style={styles.compassContainer}>
              <Animated.View style={{
                transform: [{
                  rotate: compassRotate.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                  })
                }]
              }}>
                <Feather name="compass" size={24} color="#fff" />
              </Animated.View>
            </View>
            <Text style={styles.profileBadge}>Traveler Profile</Text>
            <View style={[styles.travelIconBadge, isDark && styles.travelIconBadgeDark]}>
              <Feather name="globe" size={20} color={isDark ? '#64b5f6' : '#667eea'} />
            </View>
          </View>
          <View style={styles.headerContent}>
            {/* Avatar */}
            <TouchableOpacity 
              onPress={() => setImageModalVisible(true)}
              activeOpacity={0.8}
            >
              <Animated.View style={[styles.avatarContainer, {transform: [{scale: avatarScale}]}]}>
                {isEmojiAvatar(imageUrl) ? (
                  <View style={[styles.emojiAvatar, {backgroundColor: getAvatarColor(imageUrl)}]}>
                    <Text style={styles.emojiAvatarText}>{getEmojiFromUrl(imageUrl)}</Text>
                  </View>
                ) : imageUrl ? (
                  <Image source={{uri: imageUrl}} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarInitials}>
                      {(user?.firstName || user?.username || 'U').slice(0,1).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.cameraIcon}>
                  <Feather name="camera" size={16} color="#fff" />
                </View>
              </Animated.View>
            </TouchableOpacity>
            
            {/* User Info */}
            <Text style={styles.userName}>
              {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username || 'User'}
            </Text>
            <Text style={styles.userHandle}>@{user?.username ?? 'user'}</Text>
          </View>
        </LinearGradient>

        {/* Profile Form Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Feather name="user" size={20} color={isDark ? '#64b5f6' : '#667eea'} />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Personal Information</Text>
          </View>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>First Name</Text>
            <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
              <Feather name="user" size={16} color={isDark ? '#888' : '#999'} style={{marginRight: 8}} />
              <TextInput 
                style={[styles.input, isDark && styles.inputDark]} 
                value={firstName} 
                onChangeText={setFirstName} 
                placeholder="Enter first name"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, isDark && styles.inputLabelDark]}>Last Name</Text>
            <View style={[styles.inputContainer, isDark && styles.inputContainerDark]}>
              <Feather name="user" size={16} color={isDark ? '#888' : '#999'} style={{marginRight: 8}} />
              <TextInput 
                style={[styles.input, isDark && styles.inputDark]} 
                value={lastName} 
                onChangeText={setLastName} 
                placeholder="Enter last name"
                placeholderTextColor={isDark ? '#666' : '#999'}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSaveProfile}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#667eea', '#764ba2']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.saveButtonGradient}
            >
              <Feather name="check-circle" size={18} color="#fff" style={{marginRight: 8}} />
              <Text style={styles.saveButtonText}>Save Changes</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Settings Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Feather name="settings" size={20} color={isDark ? '#64b5f6' : '#667eea'} />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Preferences</Text>
          </View>
          
          <View style={styles.settingRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Feather name="moon" size={18} color={isDark ? '#888' : '#666'} style={{marginRight: 12}} />
              <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Dark Mode</Text>
            </View>
            <Switch 
              value={theme === 'dark'} 
              onValueChange={(v) => dispatch(setTheme(v ? 'dark' : 'light'))}
              trackColor={{false: '#e0e0e0', true: '#667eea'}}
              thumbColor="#fff"
            />
          </View>

          <View style={[styles.divider, isDark && styles.dividerDark]} />

          {/* Notification Preferences Section */}
          <View style={styles.notificationSection}>
            <View style={styles.notificationHeader}>
              <Feather name="bell" size={18} color={isDark ? '#64b5f6' : '#667eea'} />
              <Text style={[styles.notificationSectionTitle, isDark && styles.settingLabelDark]}>Notifications</Text>
              {scheduledNotificationsCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{scheduledNotificationsCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.settingRow}>
              <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <Feather name="bell" size={18} color={isDark ? '#888' : '#666'} style={{marginRight: 12}} />
                <View style={{flex: 1}}>
                  <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Enable Notifications</Text>
                  <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                    Receive alerts and updates
                  </Text>
                </View>
              </View>
              <Switch 
                value={notificationsEnabled} 
                onValueChange={setNotificationsEnabled}
                trackColor={{false: '#e0e0e0', true: '#667eea'}}
                thumbColor="#fff"
              />
            </View>

            {notificationsEnabled && (
              <>
                <View style={styles.settingRow}>
                  <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Feather name="check-circle" size={18} color={isDark ? '#888' : '#666'} style={{marginRight: 12}} />
                    <View style={{flex: 1}}>
                      <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Booking Confirmations</Text>
                      <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                        Get instant booking confirmations
                      </Text>
                    </View>
                  </View>
                  <Switch 
                    value={bookingNotifications} 
                    onValueChange={setBookingNotifications}
                    trackColor={{false: '#e0e0e0', true: '#667eea'}}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Feather name="clock" size={18} color={isDark ? '#888' : '#666'} style={{marginRight: 12}} />
                    <View style={{flex: 1}}>
                      <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Departure Reminders</Text>
                      <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                        Reminder 30 minutes before departure
                      </Text>
                    </View>
                  </View>
                  <Switch 
                    value={departureReminders} 
                    onValueChange={setDepartureReminders}
                    trackColor={{false: '#e0e0e0', true: '#667eea'}}
                    thumbColor="#fff"
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                    <Feather name="heart" size={18} color={isDark ? '#888' : '#666'} style={{marginRight: 12}} />
                    <View style={{flex: 1}}>
                      <Text style={[styles.settingLabel, isDark && styles.settingLabelDark]}>Favorite Updates</Text>
                      <Text style={[styles.settingDescription, isDark && styles.settingDescriptionDark]}>
                        Alerts when you add favorites
                      </Text>
                    </View>
                  </View>
                  <Switch 
                    value={favoriteNotifications} 
                    onValueChange={setFavoriteNotifications}
                    trackColor={{false: '#e0e0e0', true: '#667eea'}}
                    thumbColor="#fff"
                  />
                </View>

                <TouchableOpacity 
                  style={[styles.viewNotificationsButton, isDark && styles.viewNotificationsButtonDark]}
                  onPress={viewScheduledNotifications}
                  activeOpacity={0.7}
                >
                  <Feather name="list" size={18} color={isDark ? '#64b5f6' : '#667eea'} />
                  <Text style={[styles.viewNotificationsText, isDark && styles.viewNotificationsTextDark]}>
                    View Scheduled Notifications
                  </Text>
                  {scheduledNotificationsCount > 0 && (
                    <View style={styles.notificationCountBadge}>
                      <Text style={styles.notificationCountText}>{scheduledNotificationsCount}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Recent Bookings Card */}
        <View style={[styles.card, isDark && styles.cardDark]}>
          <View style={styles.cardHeader}>
            <Feather name="clock" size={20} color={isDark ? '#64b5f6' : '#667eea'} />
            <Text style={[styles.cardTitle, isDark && styles.cardTitleDark]}>Recent Bookings</Text>
          </View>
          
          {bookings.slice(0, 3).length > 0 ? (
            bookings.slice(0, 3).map((item, idx) => (
              <View key={item.id} style={styles.bookingItem}>
                <View style={styles.bookingIconCircle}>
                  <Feather name="check-circle" size={20} color="#4CAF50" />
                </View>
                <View style={{flex: 1}}>
                  <Text style={styles.bookingCode}>{item.confirmationCode}</Text>
                  <Text style={styles.bookingDate}>
                    {item.bookedAt ? new Date(item.bookedAt).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <Feather name="chevron-right" size={20} color="#ccc" />
              </View>
            ))
          ) : (
            <View style={styles.emptyBookings}>
              <Feather name="inbox" size={48} color="#ddd" />
              <Text style={styles.emptyText}>No bookings yet</Text>
            </View>
          )}

          {bookings.length > 0 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('RecentBookings')}
              activeOpacity={0.7}
            >
              <Text style={styles.viewAllText}>View All Bookings</Text>
              <Feather name="arrow-right" size={16} color="#667eea" />
            </TouchableOpacity>
          )}
        </View>

        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton}
          onPress={() => setLogoutModalVisible(true)}
          activeOpacity={0.8}
        >
          <Feather name="log-out" size={18} color="#fff" style={{marginRight: 8}} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Image Picker Modal */}
      <Modal visible={imageModalVisible} transparent animationType="slide" onRequestClose={() => setImageModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.imageModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Profile Picture</Text>
              <TouchableOpacity onPress={() => setImageModalVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.imageOption}
              onPress={takePhoto}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconCircle}>
                <Feather name="camera" size={24} color="#667eea" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.optionTitle}>Take Photo</Text>
                <Text style={styles.optionSubtitle}>Use your camera</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageOption}
              onPress={pickImageFromLibrary}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconCircle}>
                <Feather name="image" size={24} color="#667eea" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.optionTitle}>Choose from Library</Text>
                <Text style={styles.optionSubtitle}>Select from gallery</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.imageOption}
              onPress={() => {
                setImageModalVisible(false);
                setTimeout(() => setAvatarPickerVisible(true), 300);
              }}
              activeOpacity={0.7}
            >
              <View style={styles.optionIconCircle}>
                <Feather name="smile" size={24} color="#667eea" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.optionTitle}>Choose Avatar</Text>
                <Text style={styles.optionSubtitle}>Select from emoji avatars</Text>
              </View>
              <Feather name="chevron-right" size={20} color="#ccc" />
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.urlInputSection}>
              <Text style={styles.inputLabel}>Enter Image URL</Text>
              <View style={styles.inputContainer}>
                <Feather name="link" size={16} color="#999" style={{marginRight: 8}} />
                <TextInput 
                  style={styles.input} 
                  value={tempImageUrl} 
                  onChangeText={setTempImageUrl} 
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor="#999"
                />
              </View>
              <TouchableOpacity 
                style={styles.urlButton}
                onPress={setImageFromUrl}
                activeOpacity={0.8}
              >
                <Text style={styles.urlButtonText}>Use URL</Text>
              </TouchableOpacity>
            </View>

            {imageUrl && (
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => {
                  setImageUrl('');
                  setImageModalVisible(false);
                }}
                activeOpacity={0.8}
              >
                <Feather name="trash-2" size={16} color="#FF3B30" style={{marginRight: 6}} />
                <Text style={styles.removeButtonText}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* Avatar Picker Modal */}
      <Modal visible={avatarPickerVisible} transparent animationType="slide" onRequestClose={() => setAvatarPickerVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.avatarPickerModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Your Avatar</Text>
              <TouchableOpacity onPress={() => setAvatarPickerVisible(false)}>
                <Feather name="x" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.avatarGrid}>
              {avatarOptions.map((avatar) => (
                <TouchableOpacity
                  key={avatar.id}
                  style={[styles.avatarOption, {backgroundColor: avatar.color}]}
                  onPress={() => selectAvatar(avatar)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.avatarOptionEmoji}>{avatar.emoji}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={successModalVisible} transparent animationType="none" onRequestClose={() => setSuccessModalVisible(false)}>
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.successModal, {
            opacity: successOpacity,
            transform: [{scale: successScale}]
          }]}>
            {/* Success Icon */}
            <Animated.View style={[styles.successIconContainer, {
              transform: [{scale: checkmarkScale}]
            }]}>
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.successIconGradient}
              >
                <Feather name="check" size={48} color="#fff" />
              </LinearGradient>
            </Animated.View>
            
            {/* Success Title */}
            <Text style={styles.successTitle}>Profile Updated!</Text>
            <Text style={styles.successSubtitle}>Your changes have been saved successfully</Text>
            
            {/* Close Button */}
            <TouchableOpacity
              style={styles.successButton}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.successButtonText}>Great!</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={logoutModalVisible} transparent animationType="none" onRequestClose={() => setLogoutModalVisible(false)}>
        <View style={styles.successOverlay}>
          <Animated.View style={[styles.logoutModal, {
            opacity: logoutOpacity,
            transform: [{scale: logoutScale}]
          }]}>
            {/* Warning Icon */}
            <View style={styles.logoutIconContainer}>
              <View style={styles.logoutIconCircle}>
                <Feather name="log-out" size={48} color="#FF3B30" />
              </View>
            </View>
            
            {/* Logout Title */}
            <Text style={styles.logoutTitle}>Logout Confirmation</Text>
            <Text style={styles.logoutSubtitle}>Are you sure you want to logout from your account?</Text>
            
            {/* Action Buttons */}
            <View style={styles.logoutActions}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setLogoutModalVisible(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.confirmLogoutButton}
                onPress={() => {
                  setLogoutModalVisible(false);
                  dispatch(logout());
                }}
                activeOpacity={0.8}
              >
                <Feather name="log-out" size={18} color="#fff" style={{marginRight: 8}} />
                <Text style={styles.confirmLogoutText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  gradientHeader: {paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30},
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  compassContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  profileBadge: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  travelIconBadge: {
    marginLeft: 12,
    backgroundColor: '#fff',
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerContent: {alignItems: 'center'},
  avatarContainer: {position: 'relative', marginBottom: 16},
  avatar: {width: 120, height: 120, borderRadius: 60, borderWidth: 4, borderColor: '#fff'},
  avatarPlaceholder: {width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff'},
  avatarInitials: {fontSize: 48, fontWeight: '800', color: '#667eea'},
  emojiAvatar: {width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: '#fff'},
  emojiAvatarText: {fontSize: 56},
  cameraIcon: {position: 'absolute', bottom: 0, right: 0, backgroundColor: '#667eea', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#fff'},
  userName: {fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 4},
  userHandle: {fontSize: 16, color: '#f0e6ff', fontWeight: '500'},
  card: {backgroundColor: '#fff', margin: 16, marginTop: 16, borderRadius: 16, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: {width: 0, height: 2}},
  cardHeader: {flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'},
  cardTitle: {fontSize: 18, fontWeight: '700', color: '#333', marginLeft: 12},
  inputGroup: {marginBottom: 16},
  inputLabel: {fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 8},
  inputContainer: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8f9fa', borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e0e0e0'},
  input: {flex: 1, paddingVertical: 14, fontSize: 15, color: '#1a1a1a', fontWeight: '500'},
  saveButton: {marginTop: 8, borderRadius: 12, overflow: 'hidden', elevation: 3, shadowColor: '#667eea', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}},
  saveButtonGradient: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16},
  saveButtonText: {fontSize: 16, fontWeight: '700', color: '#fff'},
  settingRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12},
  settingLabel: {fontSize: 16, fontWeight: '600', color: '#333'},
  bookingItem: {flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5'},
  bookingIconCircle: {width: 44, height: 44, borderRadius: 22, backgroundColor: '#e8f5e9', justifyContent: 'center', alignItems: 'center', marginRight: 12},
  bookingCode: {fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4},
  bookingDate: {fontSize: 14, color: '#999'},
  emptyBookings: {alignItems: 'center', paddingVertical: 32},
  emptyText: {fontSize: 16, color: '#999', marginTop: 12},
  viewAllButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginTop: 8, borderTopWidth: 1, borderTopColor: '#f0f0f0'},
  viewAllText: {fontSize: 15, fontWeight: '700', color: '#667eea', marginRight: 6},
  logoutButton: {flexDirection: 'row', backgroundColor: '#FF3B30', margin: 16, marginTop: 8, marginBottom: 32, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#FF3B30', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}},
  logoutText: {fontSize: 16, fontWeight: '700', color: '#fff'},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'},
  imageModal: {backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24},
  modalTitle: {fontSize: 20, fontWeight: '800', color: '#333'},
  imageOption: {flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 12, backgroundColor: '#f8f9fa', borderRadius: 12, marginBottom: 12},
  optionIconCircle: {width: 48, height: 48, borderRadius: 24, backgroundColor: '#e8eaf6', justifyContent: 'center', alignItems: 'center', marginRight: 12},
  optionTitle: {fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 2},
  optionSubtitle: {fontSize: 13, color: '#999'},
  divider: {flexDirection: 'row', alignItems: 'center', marginVertical: 24},
  dividerLine: {flex: 1, height: 1, backgroundColor: '#e0e0e0'},
  dividerText: {marginHorizontal: 16, fontSize: 13, color: '#999', fontWeight: '600'},
  urlInputSection: {marginBottom: 16},
  urlButton: {backgroundColor: '#667eea', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 12},
  urlButtonText: {fontSize: 15, fontWeight: '700', color: '#fff'},
  removeButton: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: '#FF3B30', marginTop: 8},
  removeButtonText: {fontSize: 15, fontWeight: '700', color: '#FF3B30'},
  avatarPickerModal: {backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '70%'},
  avatarGrid: {flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingBottom: 20},
  avatarOption: {width: '22%', aspectRatio: 1, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, shadowOffset: {width: 0, height: 3}},
  avatarOptionEmoji: {fontSize: 40},
  successOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center', padding: 20},
  successModal: {width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: {width: 0, height: 10}},
  successIconContainer: {marginBottom: 24},
  successIconGradient: {width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#4CAF50', shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: {width: 0, height: 4}},
  successTitle: {fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center'},
  successSubtitle: {fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center'},
  successButton: {width: '100%', backgroundColor: '#4CAF50', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 3, shadowColor: '#4CAF50', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}},
  successButtonText: {fontSize: 18, fontWeight: '700', color: '#fff'},
  logoutModal: {width: '100%', maxWidth: 400, backgroundColor: '#fff', borderRadius: 24, padding: 32, alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: {width: 0, height: 10}},
  logoutIconContainer: {marginBottom: 24},
  logoutIconCircle: {width: 96, height: 96, borderRadius: 48, backgroundColor: '#ffebee', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#FF3B30', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: {width: 0, height: 4}},
  logoutTitle: {fontSize: 26, fontWeight: '800', color: '#1a1a1a', marginBottom: 8, textAlign: 'center'},
  logoutSubtitle: {fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center'},
  logoutActions: {flexDirection: 'row', width: '100%', gap: 12},
  cancelButton: {flex: 1, backgroundColor: '#f5f5f5', paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0'},
  cancelButtonText: {fontSize: 16, fontWeight: '700', color: '#666'},
  confirmLogoutButton: {flex: 1, flexDirection: 'row', backgroundColor: '#FF3B30', paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', elevation: 3, shadowColor: '#FF3B30', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}},
  confirmLogoutText: {fontSize: 16, fontWeight: '700', color: '#fff'},
  // Dark mode styles
  containerDark: {
    backgroundColor: '#0f0f1e',
  },
  travelIconBadgeDark: {
    backgroundColor: '#2a2a3e',
  },
  cardDark: {
    backgroundColor: '#1a1a2e',
    borderColor: '#2a2a3e',
  },
  cardTitleDark: {
    color: '#e0e0e0',
  },
  inputLabelDark: {
    color: '#b0b0b0',
  },
  inputContainerDark: {
    backgroundColor: '#16213e',
    borderColor: '#2a2a3e',
  },
  inputDark: {
    color: '#e0e0e0',
  },
  settingLabelDark: {
    color: '#e0e0e0',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 16,
  },
  dividerDark: {
    backgroundColor: '#2a2a3e',
  },
  notificationSection: {
    marginTop: 8,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
    flex: 1,
  },
  notificationBadge: {
    backgroundColor: '#ff6b9d',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  settingDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  settingDescriptionDark: {
    color: '#999',
  },
  viewNotificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
  },
  viewNotificationsButtonDark: {
    backgroundColor: '#16213e',
  },
  viewNotificationsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
    marginLeft: 8,
    flex: 1,
  },
  viewNotificationsTextDark: {
    color: '#64b5f6',
  },
  notificationCountBadge: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  notificationCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
