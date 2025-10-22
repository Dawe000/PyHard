import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BalanceScreen } from "./BalanceScreen";
import { TransactionsScreen } from "./TransactionsScreen";
import { SubAccountsScreen } from "./SubAccountsScreen";
import SendScreen from "./SendScreen";
import { ProfileScreen } from "./ProfileScreen";
import { QRScannerScreen } from "./QRScannerScreen";
import { PaymentConfirmationScreen } from "./PaymentConfirmationScreen";

type TabType = 'balance' | 'transactions' | 'subaccounts' | 'profile' | 'send' | 'scan';

export const MainNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('balance');
  const [scannedQRData, setScannedQRData] = useState<any>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [previousTab, setPreviousTab] = useState<TabType>('balance');

  const handleTabChange = (newTab: TabType) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  const handleQRScanned = (qrData: any) => {
    setScannedQRData(qrData);
    setActiveTab('payment-confirmation' as any);
  };

  const handlePaymentComplete = () => {
    setScannedQRData(null);
    setActiveTab('transactions');
  };

  const handlePaymentCancel = () => {
    setScannedQRData(null);
    setActiveTab('scan');
  };

  const renderScreen = () => {
    if (scannedQRData) {
      return (
        <PaymentConfirmationScreen
          qrData={scannedQRData}
          onPaymentComplete={handlePaymentComplete}
          onCancel={handlePaymentCancel}
        />
      );
    }

    return (
      <>
        <View style={{ display: activeTab === 'balance' ? 'flex' : 'none', flex: 1 }}>
          <BalanceScreen navigation={{
            navigate: (screen: string, params?: any) => {
              if (screen === 'transactions' && params?.transaction) {
                setSelectedTransaction(params.transaction);
              }
              handleTabChange(screen as TabType);
            }
          }} />
        </View>
        <View style={{ display: activeTab === 'transactions' ? 'flex' : 'none', flex: 1 }}>
          <TransactionsScreen initialTransaction={selectedTransaction} />
        </View>
        <View style={{ display: activeTab === 'subaccounts' ? 'flex' : 'none', flex: 1 }}>
          <SubAccountsScreen />
        </View>
        <View style={{ display: activeTab === 'profile' ? 'flex' : 'none', flex: 1 }}>
          <ProfileScreen />
        </View>
        <View style={{ display: activeTab === 'send' ? 'flex' : 'none', flex: 1 }}>
          <SendScreen onBack={() => handleTabChange(previousTab)} />
        </View>
        <View style={{ display: activeTab === 'scan' ? 'flex' : 'none', flex: 1 }}>
          <QRScannerScreen
            onQRScanned={handleQRScanned}
            onClose={() => setActiveTab('balance')}
          />
        </View>
      </>
    );
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'balance':
        return 'wallet';
      case 'transactions':
        return 'receipt';
      case 'subaccounts':
        return 'people';
      case 'profile':
        return 'person-circle';
      case 'scan':
        return 'qr-code';
      default:
        return 'wallet';
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'balance':
        return 'Balance';
      case 'transactions':
        return 'Activity';
      case 'subaccounts':
        return 'Sub-Accounts';
      case 'profile':
        return 'Profile';
      case 'scan':
        return 'Scan';
      default:
        return 'Balance';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'balance' && styles.activeTab]}
          onPress={() => {
            if (activeTab !== 'balance') {
              setSelectedTransaction(null);
              handleTabChange('balance');
            }
          }}
        >
          <Ionicons 
            name={getTabIcon('balance')} 
            size={24} 
            color={activeTab === 'balance' ? '#0070BA' : '#8E8E93'} 
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'balance' && styles.activeTabLabel
          ]}>
            {getTabLabel('balance')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => {
            if (activeTab !== 'transactions') {
              setSelectedTransaction(null);
              handleTabChange('transactions');
            }
          }}
        >
          <Ionicons 
            name={getTabIcon('transactions')} 
            size={24} 
            color={activeTab === 'transactions' ? '#0070BA' : '#8E8E93'} 
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'transactions' && styles.activeTabLabel
          ]}>
            {getTabLabel('transactions')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'subaccounts' && styles.activeTab]}
          onPress={() => {
            if (activeTab !== 'subaccounts') {
              handleTabChange('subaccounts');
            }
          }}
        >
          <Ionicons
            name={getTabIcon('subaccounts')}
            size={24}
            color={activeTab === 'subaccounts' ? '#0070BA' : '#8E8E93'}
          />
          <Text style={[
            styles.tabLabel,
            styles.subAccountsLabel,
            activeTab === 'subaccounts' && styles.activeTabLabel
          ]}>
            {getTabLabel('subaccounts')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'scan' && styles.activeTab]}
          onPress={() => {
            if (activeTab !== 'scan') {
              handleTabChange('scan');
            }
          }}
        >
          <Ionicons
            name={getTabIcon('scan')}
            size={24}
            color={activeTab === 'scan' ? '#0070BA' : '#8E8E93'}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'scan' && styles.activeTabLabel
          ]}>
            {getTabLabel('scan')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => {
            if (activeTab !== 'profile') {
              handleTabChange('profile');
            }
          }}
        >
          <Ionicons
            name={getTabIcon('profile')}
            size={24}
            color={activeTab === 'profile' ? '#0070BA' : '#8E8E93'}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'profile' && styles.activeTabLabel
          ]}>
            {getTabLabel('profile')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10,14,39,0.95)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,121,193,0.2)',
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#0079c1',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeTab: {
    // Active tab styling is handled by icon and text colors
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.5)',
    marginTop: 4,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  activeTabLabel: {
    color: '#0079c1',
    fontWeight: '700',
  },
  subAccountsLabel: {
    fontSize: 8,
  },
});
