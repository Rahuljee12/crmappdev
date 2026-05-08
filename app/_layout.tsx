import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from '@react-navigation/native';

import { Stack } from 'expo-router';

import { StatusBar } from 'expo-status-bar';

import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import 'react-native-reanimated';

import { Fonts } from '@/theme/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

import logo from '@/assets/images/icon.png';

export const unstable_settings = {
  anchor: '(tabs)',
};

const textDefaultProps = {
  style: {
    fontFamily: Fonts.sans,
  },
};

Text.defaultProps = {
  ...Text.defaultProps,
  ...textDefaultProps,
};

TextInput.defaultProps = {
  ...TextInput.defaultProps,
  ...textDefaultProps,
};

function AppHeader() {
  return (
    <View style={styles.header}>
      <Image
        source={logo}
        resizeMode="contain"
        style={styles.logo}
      />

      <View style={styles.statusDot} />
    </View>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider
      value={
        colorScheme === 'dark'
          ? DarkTheme
          : DefaultTheme
      }>
      
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

const styles = StyleSheet.create({
  header: {
    height: 120,
    paddingTop: 52,
    paddingHorizontal: 20,
    backgroundColor: '#F5F7FB',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  logo: {
    width: 90,
    height: 28,
  },

  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#FF6B35',
  },
});