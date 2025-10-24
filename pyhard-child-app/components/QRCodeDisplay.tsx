import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { QRCodeData } from '../utils/qrCodeUtils';

interface QRCodeDisplayProps {
  qrData: QRCodeData;
  childName: string;
  onClose: () => void;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ 
  qrData, 
  childName, 
  onClose 
}) => {
  const qrString = JSON.stringify(qrData);

  const copyAddress = async () => {
    try {
      // In a real app, you'd use Clipboard API
      Alert.alert('Copied!', 'Wallet address copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy address');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Share with Parent</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.childInfo}>
          <Text style={styles.childName}>{childName}</Text>
          <Text style={styles.instruction}>
            Ask your parent to scan this QR code
          </Text>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value={qrString}
            size={250}
            color="#000"
            backgroundColor="#fff"
          />
        </View>

        <View style={styles.addressContainer}>
          <Text style={styles.addressLabel}>Your Wallet Address:</Text>
          <Text style={styles.addressText}>
            {qrData.data.childEOA.slice(0, 6)}...{qrData.data.childEOA.slice(-4)}
          </Text>
          <TouchableOpacity style={styles.copyButton} onPress={copyAddress}>
            <Ionicons name="copy" size={16} color="#1976d2" />
            <Text style={styles.copyText}>Copy Address</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructions}>
          <Text style={styles.instructionTitle}>What happens next?</Text>
          <Text style={styles.instructionText}>
            1. Parent scans this QR code{'\n'}
            2. Parent sets your monthly allowance{'\n'}
            3. You'll get access to your wallet!
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  childInfo: {
    alignItems: 'center',
    marginBottom: 30,
  },
  childName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instruction: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  qrContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  addressLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  addressText: {
    fontSize: 16,
    fontFamily: 'monospace',
    color: '#333',
    marginBottom: 12,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e3f2fd',
    borderRadius: 20,
  },
  copyText: {
    marginLeft: 4,
    color: '#1976d2',
    fontSize: 14,
    fontWeight: '500',
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  instructionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});
