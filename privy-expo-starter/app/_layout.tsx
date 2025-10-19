import Constants from "expo-constants";
import { Stack } from "expo-router";
import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import { useFonts } from "expo-font";
import { arbitrumSepolia } from "viem/chains";

export default function RootLayout() {
  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
  return (
    <PrivyProvider
      appId={Constants.expoConfig?.extra?.privyAppId}
      clientId={Constants.expoConfig?.extra?.privyClientId}
      defaultChain={arbitrumSepolia}
      supportedChains={[arbitrumSepolia]}
      config={{
        embedded: {
          ethereum: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{
            title: "PYUSD Wallet",
            headerShown: false
          }} 
        />
      </Stack>
      <PrivyElements />
    </PrivyProvider>
  );
}
