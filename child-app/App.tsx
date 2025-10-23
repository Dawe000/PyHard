import 'react-native-get-random-values';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { GetStartedScreen } from './components/GetStartedScreen';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { QRCodeData } from './utils/qrCodeUtils';

export default function App() {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);

  const handleQRGenerated = (data: QRCodeData) => {
    setQrData(data);
  };

  const handleClose = () => {
    setQrData(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {qrData ? (
        <QRCodeDisplay
          qrData={qrData}
          childName={qrData.data.childName}
          onClose={handleClose}
        />
      ) : (
        <GetStartedScreen onQRGenerated={handleQRGenerated} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
