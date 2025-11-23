import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, FlatList, TouchableOpacity, Animated, Modal} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Feather} from '@expo/vector-icons';
import {useDispatch, useSelector} from 'react-redux';
import {loadBookings} from '../redux/bookingsSlice';

export default function RecentBookingsScreen() {
  const dispatch = useDispatch();
  const bookings = useSelector((s) => s.bookings.bookings || []);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [clockRotate] = useState(new Animated.Value(0));

  useEffect(() => {
    dispatch(loadBookings());
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
    
    // Clock tick animation
    Animated.loop(
      Animated.timing(clockRotate, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [dispatch]);

  const openDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const getStatusColor = (booking) => {
    // You can customize this based on your booking status logic
    return '#4CAF50'; // Green for confirmed
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#0a7ea4', '#1e90ff', '#4db8ff']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradientHeader}
      >
        <Animated.View style={{opacity: fadeAnim, transform: [{translateY: slideAnim}]}}>
          <View style={styles.headerContent}>
            <View style={styles.headerRow}>
              <View style={styles.clockContainer}>
                <Animated.View style={{
                  transform: [{
                    rotate: clockRotate.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '30deg'],
                    })
                  }]
                }}>
                  <Feather name="clock" size={28} color="#fff" />
                </Animated.View>
              </View>
              <Text style={styles.headerTitle}>My Bookings</Text>
              <View style={styles.ticketBadge}>
                <Feather name="map" size={16} color="#0a7ea4" />
              </View>
            </View>
            <Text style={styles.headerSubtitle}>
              {bookings.length} {bookings.length === 1 ? 'booking' : 'bookings'} found
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      {/* Bookings List */}
      <Animated.View style={{flex: 1, opacity: fadeAnim}}>
        <FlatList
          data={bookings}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.listContent}
          renderItem={({item, index}) => (
            <Animated.View 
              style={{
                opacity: fadeAnim,
                transform: [{
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 50],
                    outputRange: [0, 50 + index * 10]
                  })
                }]
              }}
            >
              <TouchableOpacity
                style={styles.bookingCard}
                onPress={() => openDetails(item)}
                activeOpacity={0.7}
              >
                {/* Status Badge */}
                <View style={[styles.statusBadge, {backgroundColor: getStatusColor(item)}]}>
                  <Feather name="check-circle" size={16} color="#fff" />
                  <Text style={styles.statusText}>Confirmed</Text>
                </View>

                {/* Booking Info */}
                <View style={styles.cardContent}>
                  <View style={styles.iconCircle}>
                    <Feather name="ticket" size={24} color="#0a7ea4" />
                  </View>
                  
                  <View style={styles.bookingInfo}>
                    <Text style={styles.confirmationCode}>
                      {item.confirmationCode || 'N/A'}
                    </Text>
                    <View style={styles.detailRow}>
                      <Feather name="map-pin" size={14} color="#666" />
                      <Text style={styles.itemId}>{item.itemId || 'Unknown'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Feather name="calendar" size={14} color="#666" />
                      <Text style={styles.dateText}>{formatDate(item.bookedAt)}</Text>
                    </View>
                    {item.user?.seats && (
                      <View style={styles.detailRow}>
                        <Feather name="users" size={14} color="#666" />
                        <Text style={styles.seatsText}>{item.user.seats} seat(s)</Text>
                      </View>
                    )}
                  </View>

                  <Feather name="chevron-right" size={24} color="#ccc" />
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={64} color="#ddd" />
              <Text style={styles.emptyTitle}>No Bookings Yet</Text>
              <Text style={styles.emptyText}>Your travel history will appear here</Text>
            </View>
          )}
        />
      </Animated.View>

      {/* Booking Detail Modal */}
      <Modal 
        visible={detailModalVisible} 
        transparent 
        animationType="slide" 
        onRequestClose={() => setDetailModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModal}>
            {/* Modal Header */}
            <LinearGradient
              colors={['#0a7ea4', '#1e90ff']}
              start={{x: 0, y: 0}}
              end={{x: 1, y: 0}}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>Booking Details</Text>
              <TouchableOpacity onPress={() => setDetailModalVisible(false)}>
                <Feather name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            {selectedBooking && (
              <View style={styles.modalContent}>
                {/* Confirmation Code */}
                <View style={styles.codeSection}>
                  <Feather name="award" size={32} color="#0a7ea4" />
                  <View style={{marginLeft: 16, flex: 1}}>
                    <Text style={styles.codeLabel}>Confirmation Code</Text>
                    <Text style={styles.codeValue}>{selectedBooking.confirmationCode}</Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailSection}>
                  <View style={styles.detailItem}>
                    <Feather name="map-pin" size={20} color="#666" />
                    <View style={{marginLeft: 12, flex: 1}}>
                      <Text style={styles.detailLabel}>Destination</Text>
                      <Text style={styles.detailValue}>{selectedBooking.itemId}</Text>
                    </View>
                  </View>

                  <View style={styles.detailItem}>
                    <Feather name="calendar" size={20} color="#666" />
                    <View style={{marginLeft: 12, flex: 1}}>
                      <Text style={styles.detailLabel}>Booked On</Text>
                      <Text style={styles.detailValue}>{formatDate(selectedBooking.bookedAt)}</Text>
                    </View>
                  </View>

                  {selectedBooking.user?.passengerName && (
                    <View style={styles.detailItem}>
                      <Feather name="user" size={20} color="#666" />
                      <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.detailLabel}>Passenger</Text>
                        <Text style={styles.detailValue}>{selectedBooking.user.passengerName}</Text>
                      </View>
                    </View>
                  )}

                  {selectedBooking.user?.seats && (
                    <View style={styles.detailItem}>
                      <Feather name="users" size={20} color="#666" />
                      <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.detailLabel}>Seats</Text>
                        <Text style={styles.detailValue}>{selectedBooking.user.seats}</Text>
                      </View>
                    </View>
                  )}

                  {selectedBooking.user?.schedule?.time && (
                    <View style={styles.detailItem}>
                      <Feather name="clock" size={20} color="#666" />
                      <View style={{marginLeft: 12, flex: 1}}>
                        <Text style={styles.detailLabel}>Departure Time</Text>
                        <Text style={styles.detailValue}>{selectedBooking.user.schedule.time}</Text>
                      </View>
                    </View>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setDetailModalVisible(false)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f5f5f5'},
  gradientHeader: {paddingTop: 60, paddingBottom: 30, paddingHorizontal: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 8, shadowOffset: {width: 0, height: 4}},
  headerContent: {alignItems: 'center'},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  clockContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  ticketBadge: {
    marginLeft: 12,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitle: {fontSize: 28, fontWeight: '800', color: '#fff'},
  headerSubtitle: {fontSize: 14, color: '#e6f7ff', fontWeight: '600'},
  listContent: {padding: 16, paddingTop: 20},
  bookingCard: {backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: {width: 0, height: 2}, overflow: 'hidden'},
  statusBadge: {flexDirection: 'row', alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12, gap: 6},
  statusText: {fontSize: 12, fontWeight: '700', color: '#fff'},
  cardContent: {flexDirection: 'row', alignItems: 'center', padding: 16},
  iconCircle: {width: 56, height: 56, borderRadius: 28, backgroundColor: '#e6f7ff', justifyContent: 'center', alignItems: 'center', marginRight: 16},
  bookingInfo: {flex: 1},
  confirmationCode: {fontSize: 18, fontWeight: '800', color: '#1a1a1a', marginBottom: 8},
  detailRow: {flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6},
  itemId: {fontSize: 14, color: '#666', fontWeight: '600'},
  dateText: {fontSize: 13, color: '#666'},
  seatsText: {fontSize: 13, color: '#666'},
  emptyState: {alignItems: 'center', paddingVertical: 60, paddingHorizontal: 32},
  emptyTitle: {fontSize: 20, fontWeight: '700', color: '#999', marginTop: 16, marginBottom: 8},
  emptyText: {fontSize: 15, color: '#bbb', textAlign: 'center'},
  modalOverlay: {flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end'},
  detailModal: {backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%'},
  modalHeader: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopLeftRadius: 24, borderTopRightRadius: 24},
  modalTitle: {fontSize: 20, fontWeight: '800', color: '#fff'},
  modalContent: {padding: 24},
  codeSection: {flexDirection: 'row', alignItems: 'center', backgroundColor: '#e6f7ff', padding: 20, borderRadius: 12, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#0a7ea4'},
  codeLabel: {fontSize: 12, color: '#666', marginBottom: 4, textTransform: 'uppercase', fontWeight: '600'},
  codeValue: {fontSize: 22, fontWeight: '800', color: '#0a7ea4', letterSpacing: 1},
  detailSection: {marginBottom: 24},
  detailItem: {flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0'},
  detailLabel: {fontSize: 12, color: '#999', marginBottom: 4, textTransform: 'uppercase', fontWeight: '600'},
  detailValue: {fontSize: 16, fontWeight: '700', color: '#1a1a1a'},
  closeButton: {backgroundColor: '#0a7ea4', paddingVertical: 16, borderRadius: 12, alignItems: 'center', elevation: 3, shadowColor: '#0a7ea4', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: {width: 0, height: 4}},
  closeButtonText: {fontSize: 16, fontWeight: '700', color: '#fff'},
});
