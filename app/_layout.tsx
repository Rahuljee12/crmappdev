import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';

import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import { Image, Text, TextInput, View } from 'react-native';

import 'react-native-reanimated';

import { globalStyles } from '@/theme/globalStyles';
import { Fonts } from '@/theme/theme';

import { useColorScheme } from '@/hooks/use-color-scheme';

import logo from '@/assets/images/icon.png';

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

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
        }}>

        {/* TABS */}
        <Stack.Screen
          name="(tabs)"
          options={{
            header: () => <AppHeader />,
          }}
        />


        {/* CASA FLOW */}
        <Stack.Screen
          name="casa"
          options={{
            headerShown: false,
          }}
        />

        {/* MODALS */}
        <Stack.Screen
          name="modal"
          options={{
            presentation: 'modal',
            headerShown: false,
          }}
        />
      </Stack>

      <StatusBar style="dark" />
    </ThemeProvider>
  );
}


