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

type TabType = 'balance' | 'transactions' | 'subaccounts' | 'send';

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
            activeTab === 'subaccounts' && styles.activeTabLabel
          ]}>
            {getTabLabel('subaccounts')}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    fontSize: 12,
    fontWeight: '500',
    color: '#8E8E93',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#0070BA',
    fontWeight: '600',
  },
});
