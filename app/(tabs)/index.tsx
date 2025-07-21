import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { startScan, connectAndRead } from '../../components/BleManager';

export default function App() {
  const [device, setDevice] = useState<any>(null);

  const handleScan = () => {
    console.log('Iniciando escaneamento...');
    startScan(setDevice);
  };

  const handleConnect = () => {
    if (device) connectAndRead(device);
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Escanear" onPress={handleScan} />
      {device && (
        <>
          <Text>Dispositivo encontrado tet: {device.name}</Text>
          <Button title="Conectar e ler frequência" onPress={handleConnect} />
        </>
      )}
    </View>
  );
}
