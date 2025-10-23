import 'react-native-get-random-values';
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView } from 'react-native';
import { GetStartedScreen } from './components/GetStartedScreen';
import { QRCodeDisplay } from './components/QRCodeDisplay';
import { ChildHomeScreen } from './components/ChildHomeScreen';
import { SendMoneyScreen } from './components/SendMoneyScreen';
import { ContactsScreen } from './components/ContactsScreen';
import { QRCodeData } from './utils/qrCodeUtils';
import { startSubWalletPolling, ParentWalletInfo } from './services/subWalletDetection';
import { loadChildWallet } from './utils/crypto';
import { UserProfile } from './services/userSearchService';

export default function App() {
  const [qrData, setQrData] = useState<QRCodeData | null>(null);
  const [walletInfo, setWalletInfo] = useState<ParentWalletInfo | null>(null);
  const [currentScreen, setCurrentScreen] = useState<'get-started' | 'qr-display' | 'home' | 'send-money' | 'contacts'>('get-started');
  const [selectedContact, setSelectedContact] = useState<UserProfile | null>(null);

  const handleQRGenerated = (data: QRCodeData) => {
    setQrData(data);
    setCurrentScreen('qr-display');
  };

  const handleClose = () => {
    setQrData(null);
    setCurrentScreen('get-started');
  };

  const handleBackToQR = () => {
    setCurrentScreen('qr-display');
  };

  const handleSendMoney = () => {
    setCurrentScreen('send-money');
  };

  const handleBackToHome = () => {
    setCurrentScreen('home');
  };

  const handleOpenContacts = () => {
    setCurrentScreen('contacts');
  };

  const handleBackToSend = () => {
    setCurrentScreen('send-money');
  };

  const handleSelectContact = (user: UserProfile) => {
    setSelectedContact(user);
    setCurrentScreen('send-money');
  };

  const handleSubWalletDetected = (info: ParentWalletInfo) => {
    console.log('🎉 Sub-wallet detected! Navigating to home screen.');
    setWalletInfo(info);
    setCurrentScreen('home');
  };

  // Start polling when QR is displayed
  useEffect(() => {
    if (currentScreen === 'qr-display' && qrData) {
      console.log('🔄 Starting sub-wallet polling...');
      const stopPolling = startSubWalletPolling(
        qrData.data.childEOA,
        handleSubWalletDetected,
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
      case 'home':
        return (
          <ChildHomeScreen 
            onBack={handleBackToQR}
            walletInfo={walletInfo}
            onSendMoney={handleSendMoney}
          />
        );
      case 'send-money':
        return (
          <SendMoneyScreen
            onBack={handleBackToHome}
            walletInfo={walletInfo}
            onOpenContacts={handleOpenContacts}
            selectedContact={selectedContact ? { name: selectedContact.display_name || selectedContact.username || 'Unknown', address: selectedContact.wallet_address } : null}
          />
        );
      case 'contacts':
        return (
          <ContactsScreen
            onBack={handleBackToSend}
            onSelectContact={handleSelectContact}
          />
        );
      case 'qr-display':
        return qrData ? (
          <QRCodeDisplay
            qrData={qrData}
            childName={qrData.data.childName}
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
    backgroundColor: '#fff',
  },
});
