import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ChildHomeScreen } from "./ChildHomeScreen";
import { SendMoneyScreen } from "./SendMoneyScreen";
import { ContactsScreen } from "./ContactsScreen";
import { TransactionHistoryScreen } from "./TransactionHistoryScreen";
import { ParentWalletInfo } from "../services/subWalletDetection";

type TabType = 'home' | 'send' | 'history' | 'contacts';

interface MainNavigationProps {
  walletInfo: ParentWalletInfo | null;
  onLogout: () => void;
}

export const MainNavigation: React.FC<MainNavigationProps> = ({ walletInfo, onLogout }) => {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [previousTab, setPreviousTab] = useState<TabType>('home');
  const [selectedContact, setSelectedContact] = useState<any>(null);

  const handleTabChange = (newTab: TabType) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
    // Clear selected contact when navigating away from send screen
    if (activeTab === 'send' && newTab !== 'send') {
      setSelectedContact(null);
    }
  };

  const handleBackToHome = () => {
    setSelectedContact(null);
    setActiveTab('home');
  };

  const handleSelectContact = (user: any) => {
    // Transform UserProfile to match the expected format for SendMoneyScreen
    setSelectedContact({
      name: user.display_name || user.username,
      address: user.wallet_address
    });
    handleTabChange('send');
  };

  const renderScreen = () => {
    return (
      <>
        <View style={{ display: activeTab === 'home' ? 'flex' : 'none', flex: 1 }}>
          <ChildHomeScreen 
            onBack={onLogout}
            walletInfo={walletInfo}
            onSendMoney={() => handleTabChange('send')}
          />
        </View>
        <View style={{ display: activeTab === 'send' ? 'flex' : 'none', flex: 1 }}>
          <SendMoneyScreen
            onBack={handleBackToHome}
            walletInfo={walletInfo}
            onOpenContacts={() => handleTabChange('contacts')}
            selectedContact={selectedContact}
          />
        </View>
        <View style={{ display: activeTab === 'history' ? 'flex' : 'none', flex: 1 }}>
          <TransactionHistoryScreen
            walletAddress={walletInfo?.subWalletInfo?.childEOA}
            smartWalletAddress={walletInfo?.smartWalletAddress}
            onBack={handleBackToHome}
          />
        </View>
        <View style={{ display: activeTab === 'contacts' ? 'flex' : 'none', flex: 1 }}>
          <ContactsScreen
            onBack={handleBackToHome}
            onSelectContact={handleSelectContact}
          />
        </View>
        {/* QR Display is accessible from GetStarted screen, not from navigation */}
      </>
    );
  };

  const getTabIcon = (tab: TabType) => {
    switch (tab) {
      case 'home':
        return 'wallet';
      case 'send':
        return 'paper-plane';
      case 'history':
        return 'receipt';
      case 'contacts':
        return 'people-circle';
      default:
        return 'wallet';
    }
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'home':
        return 'Home';
      case 'send':
        return 'Send';
      case 'history':
        return 'History';
      case 'contacts':
        return 'Contacts';
      default:
        return 'Home';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={() => handleTabChange('home')}
        >
          <Ionicons 
            name={getTabIcon('home')} 
            size={24} 
            color={activeTab === 'home' ? '#0079c1' : '#8E8E93'} 
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'home' && styles.activeTabLabel
          ]}>
            {getTabLabel('home')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'send' && styles.activeTab]}
          onPress={() => handleTabChange('send')}
        >
          <Ionicons 
            name={getTabIcon('send')} 
            size={24} 
            color={activeTab === 'send' ? '#0079c1' : '#8E8E93'} 
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'send' && styles.activeTabLabel
          ]}>
            {getTabLabel('send')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => handleTabChange('history')}
        >
          <Ionicons
            name={getTabIcon('history')}
            size={24}
            color={activeTab === 'history' ? '#0079c1' : '#8E8E93'}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'history' && styles.activeTabLabel
          ]}>
            {getTabLabel('history')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'contacts' && styles.activeTab]}
          onPress={() => handleTabChange('contacts')}
        >
          <Ionicons
            name={getTabIcon('contacts')}
            size={24}
            color={activeTab === 'contacts' ? '#0079c1' : '#8E8E93'}
          />
          <Text style={[
            styles.tabLabel,
            activeTab === 'contacts' && styles.activeTabLabel
          ]}>
            {getTabLabel('contacts')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
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
});
