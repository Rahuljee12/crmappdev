import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { Image, View } from 'react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';

import 'react-native-reanimated';

import { globalStyles } from '@/theme/globalStyles';

import { useColorScheme } from '@/hooks/use-color-scheme';

import logo from '@/assets/images/appicon.png';
import { queryClient } from '@/core/query/query-client';
import { usePrefetchAuthToken } from '@/hooks/use-prefetch-auth-token';
import { initializeEkycAesKeyFromBootstrapEnv } from '@/core/security/ekyc-init';
import { log } from '@/core/utils/logger';

export const unstable_settings = {
  anchor: '(tabs)',
};

// If you later want app-wide default fontFamily for Text/TextInput,
// keep it in theme/theme.ts (already implemented there).
function AppHeader() {
  return (
    <View style={globalStyles.navHeader}>
      <Image
        source={logo}
        resizeMode="contain"
        style={globalStyles.navHeaderLogo}
      />

      <View style={globalStyles.navHeaderStatusDot} />
    </View>
  );
}

function AppContent() {
  usePrefetchAuthToken();
  // Initialize EKYC AES key early (release builds won't have EXPO_PUBLIC key anymore).
  useEffect(() => {
    initializeEkycAesKeyFromBootstrapEnv().catch((error) => {
      log.error('[EKYC] AES key init failed', error);
    });
  }, []);

  const colorScheme = useColorScheme();

  return (
    <>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
        }}>

        <Stack.Screen
          name="(tabs)"
          options={{
            header: () => <AppHeader />,
          }}
        />


          {/* CASA FLOW */}
          <Stack.Screen
            name="(casa)"
            options={{
              headerShown: false,
            }}
          />

        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="new-customer"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="lead-details"
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="customer-details"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
