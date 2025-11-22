import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {loginUser} from '../redux/authSlice';
import {Feather} from '@expo/vector-icons';

export default function LoginScreen({navigation}) {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const schema = Yup.object().shape({
    username: Yup.string().min(3).required('Username required'),
    password: Yup.string().min(4).required('Password required'),
  });

  useEffect(() => {
    if (auth.isLoggedIn) {
      // Navigation handled by root navigator, no explicit navigate needed
    }
  }, [auth.isLoggedIn]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.logo}>GoMate</Text>
        <Text style={styles.subtitle}>Find and favorite travel items</Text>
      </View>

      <Formik
        initialValues={{username: '', password: ''}}
        validationSchema={schema}
        onSubmit={(values) => {
          dispatch(loginUser(values));
        }}
      >
        {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
          <View style={styles.card}>
            <View style={styles.inputRow}>
              <Feather name="user" size={18} color="#666" style={{marginRight: 8}} />
              <TextInput
                placeholder="Username"
                style={styles.input}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {touched.username && errors.username && <Text style={styles.err}>{errors.username}</Text>}

            <View style={styles.inputRow}>
              <Feather name="lock" size={18} color="#666" style={{marginRight: 8}} />
              <TextInput
                placeholder="Password"
                secureTextEntry={!showPassword}
                style={styles.input}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                value={values.password}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={{padding: 6}}>
                <Feather name={showPassword ? 'eye' : 'eye-off'} size={16} color="#666" />
              </TouchableOpacity>
            </View>
            {touched.password && errors.password && <Text style={styles.err}>{errors.password}</Text>}

            {auth.error ? <Text style={styles.err}>{auth.error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={auth.loading}>
              {auth.loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Login</Text>}
            </TouchableOpacity>

            <View style={styles.row}>
              <Text>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.link}> Register</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </Formik>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f6f8fb', padding: 20, justifyContent: 'center'},
  header: {alignItems: 'center', marginBottom: 18},
  logo: {fontSize: 36, fontWeight: '800', color: '#0a84ff'},
  subtitle: {color: '#666', marginTop: 6},
  card: {backgroundColor: 'white', padding: 16, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.05},
  inputRow: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 8},
  input: {flex: 1, padding: 0, color: '#111'},
  button: {backgroundColor: '#0a84ff', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8},
  buttonText: {color: 'white', fontWeight: '700'},
  row: {flexDirection: 'row', marginTop: 12, justifyContent: 'center'},
  link: {color: '#0a84ff'},
  err: {color: '#ff3b30', marginBottom: 6},
});
