import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { apiRequest } from '../services/api/client';

export const CreateCaseScreen = ({ navigation }: any) => {
  const [subject, setSubject] = useState('Policy issuance delay');
  const [description, setDescription] = useState('Customer waiting for policy issuance for 5 days');

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <TextInput value={subject} onChangeText={setSubject} placeholder="Subject" />
      <TextInput value={description} onChangeText={setDescription} placeholder="Description" multiline />
      <Button
        title="Submit Case"
        onPress={async () => {
          await apiRequest('/cases', {
            method: 'POST',
            body: JSON.stringify({
              customerId: 'cust-1',
              category: 'INSURANCE',
              priority: 'HIGH',
              subject,
              description
            })
          });
          navigation.navigate('CaseList');
        }}
      />
    </View>
  );
};
