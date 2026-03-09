import React, { useState } from 'react';
import { Button, TextInput, View } from 'react-native';
import { apiRequest } from '../services/api/client';

export const CreateProxyCaseScreen = ({ navigation }: any) => {
  const [beneficiaryId, setBeneficiaryId] = useState('benef-1');

  const createProxyCase = async () => {
    const consent = await apiRequest<{ id: string }>('/consents', {
      method: 'POST',
      body: JSON.stringify({
        beneficiaryId,
        proxyCreatorId: 'user-rm-1',
        consentType: 'DIGITAL_SIGNATURE',
        proofDocumentId: 'doc-proof-1',
        validUntil: new Date(Date.now() + 86400000).toISOString()
      })
    });

    await apiRequest('/cases', {
      method: 'POST',
      body: JSON.stringify({
        customerId: beneficiaryId,
        category: 'CLAIMS',
        priority: 'MEDIUM',
        subject: 'Proxy case created',
        description: 'Created by relationship manager with consent proof',
        isProxy: true,
        consentId: consent.id
      })
    });

    navigation.navigate('CaseList');
  };

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <TextInput value={beneficiaryId} onChangeText={setBeneficiaryId} placeholder="Beneficiary ID" />
      <Button title="Create Proxy Case" onPress={createProxyCase} />
    </View>
  );
};
