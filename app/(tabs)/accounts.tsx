import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

import { openCasaOpenStepArgs } from '@/core/navigation/casa.routes';

type AccountProduct = {
  title: string;
  type: 'Savings' | 'Current' | 'Term Deposit' | 'Recurring Deposit' | 'Term Loan' | 'Demand Loan';
  icon: keyof typeof Ionicons.glyphMap;
  tone: 'blue' | 'red';
};

const ACCOUNT_PRODUCTS: AccountProduct[] = [
  { title: 'Savings\nAccount', type: 'Savings', icon: 'wallet-outline', tone: 'blue' },
  { title: 'Current\nAccount', type: 'Current', icon: 'briefcase-outline', tone: 'red' },
  { title: 'Term\nDeposits', type: 'Term Deposit', icon: 'cash-outline', tone: 'blue' },
  { title: 'Recurring\nDeposits', type: 'Recurring Deposit', icon: 'repeat-outline', tone: 'red' },
  { title: 'Term\nLoan', type: 'Term Loan', icon: 'business-outline', tone: 'blue' },
  { title: 'Demand\nLoan', type: 'Demand Loan', icon: 'hand-left-outline', tone: 'red' },
];

export default function AccountsScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = Math.floor((width - 40 - 12) / 2);

  return (
    <SafeAreaViewContext style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {ACCOUNT_PRODUCTS.map((item) => (
            <Pressable
              key={item.title}
              onPress={() => router.push(openCasaOpenStepArgs({ step: 'identify', type: item.type }))}
              style={({ pressed }) => [
                styles.card,
                { width: cardWidth },
                item.tone === 'blue' ? styles.cardBlue : styles.cardRed,
                pressed && styles.cardPressed,
              ]}>
              <View style={styles.cardIconWrap}>
                <Ionicons name={item.icon} size={24} color="#FFFFFF" />
              </View>
              <View style={styles.cardTextWrap}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Ionicons name="chevron-forward" size={22} color="rgba(255,255,255,0.95)" />
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaViewContext>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
    gap: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
    columnGap: 12,
    paddingTop: 10,
  },
  card: {
    minHeight: 156,
    borderRadius: 30,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#0F172A',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  cardBlue: {
    backgroundColor: '#1A57A8',
  },
  cardRed: {
    backgroundColor: '#D72631',
  },
  cardPressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  cardIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  cardTitle: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
  },
});