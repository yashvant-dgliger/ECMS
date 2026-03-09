import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { apiRequest } from '../services/api/client';

export const CaseListScreen = () => {
  const [cases, setCases] = useState<any[]>([]);
  useEffect(() => {
    apiRequest<any[]>('/cases').then(setCases).catch(() => setCases([]));
  }, []);

  return (
    <FlatList
      data={cases}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <View style={{ padding: 12, borderBottomWidth: 1 }}>
          <Text>{item.caseNumber}</Text>
          <Text>{item.subject}</Text>
          <Text>Status: {item.status}</Text>
        </View>
      )}
    />
  );
};
