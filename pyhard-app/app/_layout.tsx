import Constants from "expo-constants";
import { Stack } from "expo-router";
import { PrivyProvider } from "@privy-io/expo";
import { PrivyElements } from "@privy-io/expo/ui";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  SpaceMono_400Regular,
  SpaceMono_700Bold,
} from "@expo-google-fonts/space-mono";
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from "@expo-google-fonts/space-grotesk";
import { useFonts } from "expo-font";
import { arbitrumSepolia } from "viem/chains";
import { TamaguiProvider } from 'tamagui';
import { useColorScheme } from 'react-native';
import tamaguiConfig from '../tamagui.config';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SpaceMono_400Regular,
    SpaceMono_700Bold,
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
  });

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme={colorScheme === 'dark' ? 'dark' : 'light'}>
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
    </TamaguiProvider>
  );
}
