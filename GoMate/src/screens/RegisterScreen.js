import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch, useSelector} from 'react-redux';
import {registerUser} from '../redux/authSlice';
import {Feather} from '@expo/vector-icons';

export default function RegisterScreen({navigation}) {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth);
  const [showPassword, setShowPassword] = useState(false);

  const schema = Yup.object().shape({
    username: Yup.string().min(3).required('Username required'),
    password: Yup.string().min(4).required('Password required'),
    firstName: Yup.string().optional(),
    lastName: Yup.string().optional(),
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Create Account</Text>
      <Formik
        initialValues={{username: '', password: '', firstName: '', lastName: ''}}
        validationSchema={schema}
        onSubmit={(values) => {
          dispatch(registerUser(values));
        }}
      >
        {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
          <View style={styles.form}>
            <View style={styles.inputRow}>
              <Feather name="user" size={18} color="#666" style={{marginRight: 8}} />
              <TextInput
                placeholder="Username"
                style={styles.input}
                onChangeText={handleChange('username')}
                onBlur={handleBlur('username')}
                value={values.username}
                autoCapitalize="none"
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

            <View style={styles.rowSmall}>
              <View style={{flex: 1, marginRight: 6}}>
                <TextInput placeholder="First name" style={styles.inputSimple} onChangeText={handleChange('firstName')} value={values.firstName} />
              </View>
              <View style={{flex: 1, marginLeft: 6}}>
                <TextInput placeholder="Last name" style={styles.inputSimple} onChangeText={handleChange('lastName')} value={values.lastName} />
              </View>
            </View>

            {auth.error ? <Text style={styles.err}>{auth.error}</Text> : null}

            <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={auth.loading}>
              {auth.loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Register</Text>}
            </TouchableOpacity>

            <View style={styles.row}>
              <Text>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.link}> Login</Text>
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
  title: {fontSize: 28, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: '#0a84ff'},
  form: {width: '100%'},
  inputRow: {flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#eee', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 8},
  input: {flex: 1, padding: 0, color: '#111'},
  inputSimple: {borderWidth: 1, borderColor: '#eee', padding: 10, borderRadius: 8, backgroundColor: 'white'},
  rowSmall: {flexDirection: 'row', marginTop: 8},
  button: {backgroundColor: '#0a84ff', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8},
  buttonText: {color: 'white', fontWeight: '700'},
  row: {flexDirection: 'row', marginTop: 12, justifyContent: 'center'},
  link: {color: '#0a84ff'},
  err: {color: '#ff3b30', marginBottom: 6},
});
