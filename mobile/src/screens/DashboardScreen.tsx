import React, { useEffect, useState } from 'react';
import { Button, Text, View } from 'react-native';
import { apiRequest } from '../services/api/client';

export const DashboardScreen = ({ navigation }: any) => {
  const [kpis, setKpis] = useState<any>();

  useEffect(() => {
    apiRequest('/dashboard/kpis').then(setKpis).catch(() => setKpis(undefined));
  }, []);

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>Total: {kpis?.totalTickets ?? 0}</Text>
      <Text>Escalated: {kpis?.escalatedTickets ?? 0}</Text>
      <Text>Reopen: {kpis?.reopenTickets ?? 0}</Text>
      <Button title="View Cases" onPress={() => navigation.navigate('CaseList')} />
      <Button title="Create Case" onPress={() => navigation.navigate('CreateCase')} />
      <Button title="Create Proxy Case" onPress={() => navigation.navigate('CreateProxyCase')} />
    </View>
  );
};
