import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="wallet" size={80} color="#1976d2" />
        </View>

        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>
          Let's set up your digital wallet so you can receive money from your parents.
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  form: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  button: {
    backgroundColor: '#1976d2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  info: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#1976d2',
    textAlign: 'center',
    lineHeight: 20,
  },
});
