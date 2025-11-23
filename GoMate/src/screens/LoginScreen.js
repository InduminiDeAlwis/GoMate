import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Animated, ScrollView} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {loginUser} from '../redux/authSlice';
import {Feather} from '@expo/vector-icons';

export default function LoginScreen({navigation}) {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [logoScale] = useState(new Animated.Value(0.8));
  const [compassRotate] = useState(new Animated.Value(0));

  const schema = Yup.object().shape({
    username: Yup.string().min(3).required('Username required'),
    password: Yup.string().min(4).required('Password required'),
  });

  useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Compass rotation animation
    Animated.loop(
      Animated.timing(compassRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    if (auth.isLoggedIn) {
      // On successful login, reset navigation stack to the main tabs so user cannot go back to Login
      navigation.reset({index: 0, routes: [{name: 'Main'}]});
    }
  }, [auth.isLoggedIn]);

  const rotateInterpolate = compassRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={{flex: 1}}>
      <LinearGradient
        colors={['#0a7ea4', '#1e90ff', '#4db8ff']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.gradient}>
        <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
            {/* Animated Header */}
            <Animated.View style={[styles.header, {opacity: fadeAnim, transform: [{scale: logoScale}]}]}>
              <View style={styles.logoContainer}>
                <Animated.View style={{transform: [{rotate: rotateInterpolate}]}}>
                  <Feather name="compass" size={64} color="#fff" />
                </Animated.View>
              </View>
              <Text style={styles.logo}>GoMate</Text>
              <Text style={styles.subtitle}>Your Journey Begins Here</Text>
              <View style={styles.taglineRow}>
                <Feather name="map" size={16} color="rgba(255, 255, 255, 0.9)" />
                <Text style={styles.tagline}>Explore • Travel • Discover</Text>
              </View>
            </Animated.View>

            {/* Form Card */}
            <Formik
              initialValues={{username: '', password: ''}}
              validationSchema={schema}
              onSubmit={(values) => {
                dispatch(loginUser(values));
              }}
            >
              {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
                <Animated.View style={[styles.card, {opacity: fadeAnim, transform: [{translateY: slideAnim}]}]}>
                  <Text style={styles.cardTitle}>Welcome Back!</Text>
                  
                  <View style={styles.inputContainer}>
                    <View style={styles.iconCircle}>
                      <Feather name="user" size={18} color="#0a7ea4" />
                    </View>
                    <TextInput
                      placeholder="Username"
                      placeholderTextColor="#999"
                      style={styles.input}
                      onChangeText={handleChange('username')}
                      onBlur={handleBlur('username')}
                      value={values.username}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                  {touched.username && errors.username && <Text style={styles.err}>{errors.username}</Text>}

                  <View style={styles.inputContainer}>
                    <View style={styles.iconCircle}>
                      <Feather name="lock" size={18} color="#0a7ea4" />
                    </View>
                    <TextInput
                      placeholder="Password"
                      placeholderTextColor="#999"
                      secureTextEntry={!showPassword}
                      style={styles.input}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      value={values.password}
                      autoCapitalize="none"
                    />
                    <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeButton}>
                      <Feather name={showPassword ? 'eye' : 'eye-off'} size={18} color="#0a7ea4" />
                    </TouchableOpacity>
                  </View>
                  {touched.password && errors.password && <Text style={styles.err}>{errors.password}</Text>}

                  {auth.error ? <Text style={styles.err}>{auth.error}</Text> : null}

                  <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={auth.loading}>
                    <LinearGradient
                      colors={['#0a7ea4', '#1e90ff']}
                      start={{x: 0, y: 0}}
                      end={{x: 1, y: 0}}
                      style={styles.buttonGradient}>
                      {auth.loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        <View style={styles.buttonContent}>
                          <Text style={styles.buttonText}>Login</Text>
                          <Feather name="arrow-right" size={20} color="#fff" />
                        </View>
                      )}
                    </LinearGradient>
                  </TouchableOpacity>

                  <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                      <Text style={styles.link}> Sign Up</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </Formik>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {flex: 1},
  container: {flexGrow: 1, padding: 24, justifyContent: 'center', paddingTop: 60},
  header: {alignItems: 'center', marginBottom: 40},
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 1, marginBottom: 8},
  subtitle: {color: 'rgba(255, 255, 255, 0.95)', marginTop: 4, fontSize: 16, fontWeight: '600'},
  taglineRow: {flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8},
  tagline: {color: 'rgba(255, 255, 255, 0.9)', fontSize: 14, fontWeight: '500'},
  card: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
  },
  cardTitle: {fontSize: 24, fontWeight: '800', color: '#1a1a1a', marginBottom: 24, textAlign: 'center'},
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f7fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e6f7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  input: {flex: 1, fontSize: 16, color: '#1a1a1a', fontWeight: '500'},
  eyeButton: {padding: 8},
  button: {
    marginTop: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#0a7ea4',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: {width: 0, height: 4},
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {flexDirection: 'row', alignItems: 'center', gap: 8},
  buttonText: {color: 'white', fontWeight: '800', fontSize: 16, letterSpacing: 0.5},
  footer: {flexDirection: 'row', marginTop: 20, justifyContent: 'center', alignItems: 'center'},
  footerText: {color: '#666', fontSize: 14},
  link: {color: '#0a7ea4', fontWeight: '700', fontSize: 14},
  err: {color: '#ff3b30', marginBottom: 8, fontSize: 13, marginLeft: 4},
});
