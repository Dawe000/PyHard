import React, { useState } from "react";
import {
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  View,
  Pressable,
} from "react-native";
import { YStack, XStack, Text } from "tamagui";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { BlockscoutTokenTransfer, formatTimestamp, formatAddress, getTransactionURL } from "@/services/blockscoutService";
import * as Linking from 'expo-linking';
import * as Clipboard from 'expo-clipboard';

const { width } = Dimensions.get('window');

interface TransactionDetailsModalProps {
  visible: boolean;
  transaction: BlockscoutTokenTransfer | null;
  onClose: () => void;
  smartWalletAddress: string | null;
}

export const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({
  visible,
  transaction,
  onClose,
  smartWalletAddress,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  if (!transaction) return null;

  const isSent = transaction.from.toLowerCase() === smartWalletAddress?.toLowerCase();
  const amount = (parseInt(transaction.value) / Math.pow(10, parseInt(transaction.tokenDecimal))).toFixed(2);
  const otherAddress = isSent ? transaction.to : transaction.from;

  const copyToClipboard = async (text: string, label: string) => {
    await Clipboard.setStringAsync(text);
    // You can add a toast notification here if needed
  };

  const openInBlockscout = () => {
    const url = getTransactionURL(transaction.hash);
    Linking.openURL(url);
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.modalOverlay}>
        <Pressable style={styles.modalBackground} onPress={onClose} />
        <View style={styles.modalContainer}>
          {/* Header */}
          <XStack justifyContent="space-between" alignItems="center" padding={20} borderBottomWidth={1} borderBottomColor="rgba(0,121,193,0.2)">
            <YStack>
              <Text fontSize={20} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold">
                TRANSACTION DETAILS
              </Text>
              <Text fontSize={12} color="rgba(255,255,255,0.5)" fontFamily="SpaceMono_400Regular" marginTop={4}>
                &gt; {isSent ? 'Sent' : 'Received'} PYUSD
              </Text>
            </YStack>
            <TouchableOpacity onPress={onClose}>
              <YStack
                width={36}
                height={36}
                borderRadius={18}
                backgroundColor="rgba(255,255,255,0.1)"
                alignItems="center"
                justifyContent="center"
              >
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.7)" />
              </YStack>
            </TouchableOpacity>
          </XStack>

          <ScrollView style={styles.scrollView}>
            {/* Amount Card */}
            <YStack marginHorizontal={20} marginTop={20}>
              <LinearGradient
                colors={isSent ? ['rgba(255,59,48,0.3)', 'rgba(255,59,48,0.15)'] : ['rgba(52,199,89,0.3)', 'rgba(52,199,89,0.15)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 20, padding: 2 }}
              >
                <YStack
                  backgroundColor="rgba(10,14,39,0.8)"
                  borderRadius={18}
                  padding={24}
                  alignItems="center"
                  borderWidth={1}
                  borderColor={isSent ? 'rgba(255,59,48,0.3)' : 'rgba(52,199,89,0.3)'}
                >
                  <YStack
                    width={60}
                    height={60}
                    borderRadius={30}
                    backgroundColor={isSent ? 'rgba(255,59,48,0.2)' : 'rgba(52,199,89,0.2)'}
                    alignItems="center"
                    justifyContent="center"
                    marginBottom={16}
                  >
                    <Ionicons
                      name={isSent ? 'arrow-up' : 'arrow-down'}
                      size={30}
                      color={isSent ? '#FF3B30' : '#34C759'}
                    />
                  </YStack>
                  <Text fontSize={48} fontWeight="700" color={isSent ? '#FF3B30' : '#34C759'} fontFamily="SpaceGrotesk_700Bold" marginBottom={8}>
                    {isSent ? '-' : '+'}${amount}
                  </Text>
                  <Text fontSize={14} color="rgba(255,255,255,0.6)" fontFamily="SpaceMono_400Regular">
                    {transaction.tokenSymbol}
                  </Text>
                </YStack>
              </LinearGradient>
            </YStack>

            {/* Transaction Info */}
            <YStack marginHorizontal={20} marginTop={20}>
              <LinearGradient
                colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 1 }}
              >
                <YStack
                  backgroundColor="rgba(10,14,39,0.6)"
                  borderRadius={15}
                  padding={20}
                  borderWidth={1}
                  borderColor="rgba(0,121,193,0.2)"
                  gap={16}
                >
                  {/* Status */}
                  <YStack>
                    <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
                      STATUS
                    </Text>
                    <YStack backgroundColor="rgba(52,199,89,0.2)" paddingHorizontal={12} paddingVertical={6} borderRadius={12} alignSelf="flex-start">
                      <Text fontSize={12} fontWeight="600" color="#34C759" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                        CONFIRMED
                      </Text>
                    </YStack>
                  </YStack>

                  {/* Time */}
                  <YStack>
                    <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
                      TIME
                    </Text>
                    <Text fontSize={14} color="#FFFFFF" fontFamily="SpaceMono_400Regular">
                      {formatTimestamp(transaction.timeStamp)}
                    </Text>
                  </YStack>

                  {/* From */}
                  <YStack>
                    <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
                      FROM
                    </Text>
                    <XStack alignItems="center" justifyContent="space-between">
                      <Text fontSize={13} color={isSent ? "#0079c1" : "#FFFFFF"} fontFamily="SpaceMono_400Regular" flex={1}>
                        {isSent ? 'You' : formatAddress(transaction.from)}
                      </Text>
                      <TouchableOpacity onPress={() => copyToClipboard(transaction.from, 'From address')}>
                        <YStack padding={8} backgroundColor="rgba(0,121,193,0.15)" borderRadius={8}>
                          <Ionicons name="copy-outline" size={16} color="#0079c1" />
                        </YStack>
                      </TouchableOpacity>
                    </XStack>
                  </YStack>

                  {/* To */}
                  <YStack>
                    <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
                      TO
                    </Text>
                    <XStack alignItems="center" justifyContent="space-between">
                      <Text fontSize={13} color={!isSent ? "#0079c1" : "#FFFFFF"} fontFamily="SpaceMono_400Regular" flex={1}>
                        {!isSent ? 'You' : formatAddress(transaction.to)}
                      </Text>
                      <TouchableOpacity onPress={() => copyToClipboard(transaction.to, 'To address')}>
                        <YStack padding={8} backgroundColor="rgba(0,121,193,0.15)" borderRadius={8}>
                          <Ionicons name="copy-outline" size={16} color="#0079c1" />
                        </YStack>
                      </TouchableOpacity>
                    </XStack>
                  </YStack>
                </YStack>
              </LinearGradient>
            </YStack>

            {/* View Advanced Toggle */}
            <YStack marginHorizontal={20} marginTop={16}>
              <TouchableOpacity onPress={() => setShowAdvanced(!showAdvanced)}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.04)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12, padding: 1 }}
                >
                  <YStack
                    backgroundColor="rgba(10,14,39,0.5)"
                    borderRadius={11}
                    paddingVertical={14}
                    paddingHorizontal={16}
                    borderWidth={1}
                    borderColor="rgba(0,121,193,0.15)"
                  >
                    <XStack alignItems="center" justifyContent="space-between">
                      <XStack alignItems="center" gap={8}>
                        <Ionicons name="code-slash" size={16} color="rgba(255,255,255,0.6)" />
                        <Text fontSize={12} fontWeight="600" color="rgba(255,255,255,0.8)" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                          VIEW ADVANCED
                        </Text>
                      </XStack>
                      <Ionicons
                        name={showAdvanced ? "chevron-up" : "chevron-down"}
                        size={20}
                        color="rgba(255,255,255,0.5)"
                      />
                    </XStack>
                  </YStack>
                </LinearGradient>
              </TouchableOpacity>
            </YStack>

            {/* Advanced Section */}
            {showAdvanced && (
              <YStack marginHorizontal={20} marginTop={12}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 16, padding: 1 }}
                >
                  <YStack
                    backgroundColor="rgba(10,14,39,0.6)"
                    borderRadius={15}
                    padding={20}
                    borderWidth={1}
                    borderColor="rgba(0,121,193,0.2)"
                    gap={16}
                  >
                    {/* Transaction Hash */}
                    <YStack>
                      <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
                        TRANSACTION HASH
                      </Text>
                      <XStack alignItems="center" justifyContent="space-between">
                        <Text fontSize={13} color="rgba(255,255,255,0.7)" fontFamily="SpaceMono_400Regular" flex={1} numberOfLines={1}>
                          {transaction.hash}
                        </Text>
                        <TouchableOpacity onPress={() => copyToClipboard(transaction.hash, 'Transaction hash')}>
                          <YStack padding={8} backgroundColor="rgba(0,121,193,0.15)" borderRadius={8}>
                            <Ionicons name="copy-outline" size={16} color="#0079c1" />
                          </YStack>
                        </TouchableOpacity>
                      </XStack>
                    </YStack>

                    {/* Block Number */}
                    <YStack>
                      <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
                        BLOCK NUMBER
                      </Text>
                      <Text fontSize={14} color="#FFFFFF" fontFamily="SpaceMono_400Regular">
                        #{transaction.blockNumber}
                      </Text>
                    </YStack>

                    {/* Token Contract */}
                    <YStack>
                      <Text fontSize={11} color="rgba(255,255,255,0.5)" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1} marginBottom={8}>
                        TOKEN CONTRACT
                      </Text>
                      <XStack alignItems="center" justifyContent="space-between">
                        <Text fontSize={13} color="rgba(255,255,255,0.7)" fontFamily="SpaceMono_400Regular" flex={1}>
                          {transaction.tokenName} ({transaction.tokenSymbol})
                        </Text>
                      </XStack>
                    </YStack>
                  </YStack>
                </LinearGradient>
              </YStack>
            )}

            {/* View on Blockscout Button */}
            <YStack marginHorizontal={20} marginTop={20} marginBottom={30}>
              <TouchableOpacity onPress={openInBlockscout}>
                <LinearGradient
                  colors={['rgba(0,121,193,0.2)', 'rgba(0,121,193,0.1)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ borderRadius: 12, padding: 1 }}
                >
                  <YStack
                    backgroundColor="rgba(10,14,39,0.6)"
                    borderRadius={11}
                    paddingVertical={16}
                    paddingHorizontal={20}
                    borderWidth={1}
                    borderColor="rgba(0,121,193,0.3)"
                  >
                    <XStack alignItems="center" justifyContent="center" gap={12}>
                      <Ionicons name="open-outline" size={20} color="#0079c1" />
                      <Text fontSize={14} fontWeight="600" color="#0079c1" fontFamily="SpaceGrotesk_600SemiBold" letterSpacing={0.5}>
                        VIEW ON BLOCKSCOUT
                      </Text>
                    </XStack>
                  </YStack>
                </LinearGradient>
              </TouchableOpacity>

              <XStack alignItems="center" justifyContent="center" gap={8} marginTop={12}>
                <Ionicons name="shield-checkmark" size={14} color="rgba(0,121,193,0.5)" />
                <Text fontSize={10} color="rgba(255,255,255,0.4)" fontFamily="SpaceMono_400Regular">
                  Verified on Arbitrum Sepolia
                </Text>
              </XStack>
            </YStack>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: '#0a0e27',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: '85%',
    paddingBottom: 0,
    overflow: 'hidden',
  },
  scrollView: {
    flex: 1,
  },
});
