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

type TabType = 'balance' | 'transactions' | 'subaccounts' | 'profile' | 'send';

export const MainNavigation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('balance');

  const renderScreen = () => {
    switch (activeTab) {
      case 'balance':
        return <BalanceScreen navigation={{ navigate: (screen: string) => setActiveTab(screen as TabType) }} />;
      case 'transactions':
        return <TransactionsScreen />;
      case 'subaccounts':
        return <SubAccountsScreen />;
      case 'profile':
        return <ProfileScreen />;
      case 'send':
        return <SendScreen />;
      default:
        return <BalanceScreen navigation={{ navigate: (screen: string) => setActiveTab(screen as TabType) }} />;
    }
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
          onPress={() => setActiveTab('balance')}
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
          onPress={() => setActiveTab('transactions')}
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
          onPress={() => setActiveTab('subaccounts')}
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
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={() => setActiveTab('profile')}
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
