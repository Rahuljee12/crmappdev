import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import 'react-native-reanimated';

import { AppHeader } from '@/components/app-header';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { queryClient } from '@/core/query/query-client';
import { usePrefetchAuthToken } from '@/hooks/use-prefetch-auth-token';
import { initializeEkycAesKeyFromBootstrapEnv } from '@/core/security/ekyc-init';
import { log } from '@/core/utils/logger';

export const unstable_settings = {
  anchor: '(tabs)',
};

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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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

        <Stack.Screen
          name="account-details"
          options={{
            headerShown: false,
          }}
        />
      </Stack>

      <StatusBar style="dark" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
