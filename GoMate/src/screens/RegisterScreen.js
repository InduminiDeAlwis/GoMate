import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform} from 'react-native';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {useDispatch} from 'react-redux';
import {register} from '../redux/authSlice';

export default function RegisterScreen({navigation}) {
  const dispatch = useDispatch();

  const schema = Yup.object().shape({
    username: Yup.string().min(3).required('Username required'),
    password: Yup.string().min(4).required('Password required'),
  });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>Create Account</Text>
      <Formik
        initialValues={{username: '', password: ''}}
        validationSchema={schema}
        onSubmit={(values) => {
          dispatch(register({username: values.username}));
        }}
      >
        {({handleChange, handleBlur, handleSubmit, values, errors, touched}) => (
          <View style={styles.form}>
            <TextInput
              placeholder="Username"
              style={styles.input}
              onChangeText={handleChange('username')}
              onBlur={handleBlur('username')}
              value={values.username}
              autoCapitalize="none"
            />
            {touched.username && errors.username && <Text style={styles.err}>{errors.username}</Text>}

            <TextInput
              placeholder="Password"
              secureTextEntry
              style={styles.input}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              value={values.password}
            />
            {touched.password && errors.password && <Text style={styles.err}>{errors.password}</Text>}

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Register</Text>
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
  container: {flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20},
  title: {fontSize: 28, fontWeight: '700', marginBottom: 20},
  form: {width: '100%'},
  input: {borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 8},
  button: {backgroundColor: '#34C759', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 8},
  buttonText: {color: 'white', fontWeight: '600'},
  row: {flexDirection: 'row', marginTop: 12, justifyContent: 'center'},
  link: {color: '#007AFF'},
  err: {color: 'red', marginBottom: 6},
});
