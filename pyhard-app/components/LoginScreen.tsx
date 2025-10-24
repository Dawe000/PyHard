import React from "react";
import {
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useLogin } from "@privy-io/expo/ui";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { YStack, XStack, Text } from "tamagui";

export default function LoginScreen() {
  const { login } = useLogin();

  const handleLogin = () => {
    login({
      loginMethods: ["email"],
      appearance: {
        logo: undefined,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0a0e27', '#001133', '#0a0e27']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <YStack flex={1} justifyContent="space-between" paddingHorizontal={24} paddingVertical={40}>
          {/* Header */}
          <YStack alignItems="center" marginTop={60}>
            <Image 
              source={require('../assets/images/pyhard_silver.png')} 
              style={{ width: 200, height: 200, marginBottom: 32 }}
              resizeMode="contain"
            />

            <Text fontSize={14} color="rgba(255,255,255,0.6)" textAlign="center" lineHeight={22} paddingHorizontal={20} fontFamily="SpaceMono_400Regular">
              &gt; Secure, fast, and easy PYUSD management
            </Text>
            <Text fontSize={14} color="rgba(255,255,255,0.6)" textAlign="center" lineHeight={22} paddingHorizontal={20} fontFamily="SpaceMono_400Regular" marginTop={8}>
              &gt; Powered by EIP-7702 and Smart Wallets
            </Text>
          </YStack>

          {/* Login Button */}
          <YStack alignItems="center" gap={16}>
            <TouchableOpacity
              style={{ width: '100%', maxWidth: 300 }}
              onPress={handleLogin}
            >
              <LinearGradient
                colors={['rgba(0,121,193,0.8)', 'rgba(0,48,135,0.8)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 16, padding: 2 }}
              >
                <YStack
                  backgroundColor="rgba(10,14,39,0.6)"
                  borderRadius={14}
                  paddingVertical={18}
                  paddingHorizontal={32}
                  borderWidth={1}
                  borderColor="rgba(0,121,193,0.5)"
                >
                  <XStack alignItems="center" justifyContent="center" gap={12}>
                    <Ionicons name="log-in" size={24} color="#0079c1" />
                    <Text fontSize={18} fontWeight="700" color="#FFFFFF" fontFamily="SpaceGrotesk_700Bold" letterSpacing={1}>
                      GET STARTED
                    </Text>
                  </XStack>
                </YStack>
              </LinearGradient>
            </TouchableOpacity>

            <Text fontSize={12} color="rgba(255,255,255,0.4)" textAlign="center" fontFamily="SpaceMono_400Regular">
              &gt; Sign in with email to continue
            </Text>
          </YStack>
        </YStack>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  gradient: {
    flex: 1,
  },
});
