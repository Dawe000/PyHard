import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { generateChildWallet, saveChildWallet, ChildWallet } from '../utils/crypto';
import { createSubAccountRequestQR, encodeQRData, QRCodeData } from '../utils/qrCodeUtils';

interface GetStartedScreenProps {
  onQRGenerated: (qrData: QRCodeData) => void;
}

export const GetStartedScreen: React.FC<GetStartedScreenProps> = ({ onQRGenerated }) => {
  const [childName, setChildName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGetStarted = async () => {
    if (!childName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    setIsGenerating(true);

    try {
      // Generate child wallet
      console.log('🔑 Generating child wallet...');
      const wallet = generateChildWallet();
      console.log(`✅ Child wallet generated: ${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`);

      // Save wallet securely
      await saveChildWallet(wallet);

      // Create QR code data
      const qrData = createSubAccountRequestQR(wallet.address, childName.trim());
      const qrString = encodeQRData(qrData);
      console.log('📱 QR code generated for:', childName.trim());

      // Show QR code
      onQRGenerated(qrData);
    } catch (error: any) {
      console.error('❌ Error generating wallet:', error);
      Alert.alert('Error', `Failed to generate wallet: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <LinearGradient
      colors={['#0a0e27', '#001133', '#0a0e27']}
      style={styles.container}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Image 
            source={require('../assets/pyhard_silver.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>
          &gt; Set up your wallet to receive PYUSD from your parents
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>What's your name?</Text>
          <TextInput
            style={styles.input}
            value={childName}
            onChangeText={setChildName}
            placeholder="Enter your name"
            autoFocus
            maxLength={50}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, isGenerating && styles.buttonDisabled]}
          onPress={handleGetStarted}
          disabled={isGenerating}
        >
          <Text style={styles.buttonText}>
            {isGenerating ? 'Setting up...' : 'Get Started'}
          </Text>
        </TouchableOpacity>

        <View style={styles.info}>
          <Text style={styles.infoText}>
            Your wallet will be created securely on your device. 
            Only you and your parents will have access to it.
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 200,
    height: 200,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
    paddingHorizontal: 20,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0,121,193,0.3)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: 'rgba(10,14,39,0.6)',
    color: '#FFFFFF',
  },
  button: {
    backgroundColor: '#0079c1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: 'rgba(0,121,193,0.5)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  info: {
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 18,
  },
});
