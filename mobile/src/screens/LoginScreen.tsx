import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { loginWithFirebase } from '../features/auth/auth.service';

export const LoginScreen = ({ navigation }: any) => {
  const [token, setToken] = useState('demo-firebase-token');

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <TextInput value={token} onChangeText={setToken} placeholder="Firebase ID token" />
      <Button
        title="Login"
        onPress={async () => {
          await loginWithFirebase(token);
          navigation.navigate('Dashboard');
        }}
      />
    </View>
  );
};
