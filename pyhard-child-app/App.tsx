import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { GetStartedScreen } from './components/GetStartedScreen';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { MainNavigation } from './components/MainNavigation';
import { QRCodeData } from './utils/qrCodeUtils';
import { startSubWalletPolling, ParentWalletInfo } from './services/subWalletDetection';
import { loadChildWallet } from './utils/crypto';

export default function App() {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [walletInfo, setWalletInfo] = useState<ParentWalletInfo | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'get-started' | 'qr-display' | 'main'>('get-started');

  const handleQRGenerated = (data: QRCodeData) => {
    setQrData(data);
    setCurrentScreen('qr-display');
  };

  const handleClose = () => {
    setQrData(null);
    setCurrentScreen('get-started');
  };

  const handleLogout = () => {
    setWalletInfo(null);
    setCurrentScreen('get-started');
  };

  const handleSubWalletDetected = (info: ParentWalletInfo) => {
    console.log('🎉 Sub-wallet detected! Navigating to main screen.');
    setWalletInfo(info);
    setCurrentScreen('main');
  };

  const handleSubWalletDeactivated = () => {
    console.log('⚠️ Sub-wallet deactivated! Logging out...');
    setWalletInfo(null);
    setCurrentScreen('get-started');
  };

  // Start polling when QR is displayed
  useEffect(() => {
    if (currentScreen === 'qr-display' && qrData && qrData.type === 'subaccount_request') {
      console.log('🔄 Starting sub-wallet polling...');
      const stopPolling = startSubWalletPolling(
        (qrData.data as any).childEOA,
        handleSubWalletDetected,
        handleSubWalletDeactivated,
        5000 // Poll every 5 seconds
      );

      return () => {
        console.log('🛑 Cleaning up polling...');
        stopPolling();
      };
    }
  }, [currentScreen, qrData]);

  // Check if wallet already exists on app start
  useEffect(() => {
    const checkExistingWallet = async () => {
      try {
        const wallet = await loadChildWallet();
        if (wallet) {
          console.log('👶 Existing wallet found, starting polling...');
          const stopPolling = startSubWalletPolling(
            wallet.address,
            handleSubWalletDetected,
            handleSubWalletDeactivated,
            5000
          );

          return () => {
            stopPolling();
          };
        }
      } catch (error) {
        console.error('❌ Error checking existing wallet:', error);
      }
    };

    checkExistingWallet();
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'main':
        return (
          <MainNavigation 
            walletInfo={walletInfo}
            onLogout={handleLogout}
          />
        );
      case 'qr-display':
        return qrData && qrData.type === 'subaccount_request' ? (
          <QRCodeDisplay
            qrData={qrData}
            childName={(qrData.data as any).childName}
            onClose={handleClose}
          />
        ) : (
          <GetStartedScreen onQRGenerated={handleQRGenerated} />
        );
      default:
        return (
          <GetStartedScreen onQRGenerated={handleQRGenerated} />
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {renderScreen()}
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
});
