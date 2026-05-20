import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { customerUseCases } from '@/application/di/app-dependencies';
import type { CustomerAccountDetails } from '@/domain/customers/customer-account-details';
import { globalStyles } from '@/theme/globalStyles';

type RouteParam = string | string[] | undefined;

function firstParam(value: RouteParam) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function formatMoney(value: number | null) {
  if (typeof value !== 'number') {
    return '—';
  }

  return `₹ ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function badgeTone(status: string) {
  const normalized = status.trim().toLowerCase();

  if (normalized === 'active') {
    return {
      backgroundColor: '#E0F2FE',
      borderColor: '#BAE6FD',
      textColor: '#1E3A8A',
      icon: 'checkmark-circle-outline' as const,
    };
  }

  return {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    textColor: '#92400E',
    icon: 'alert-circle-outline' as const,
  };
}

export default function AccountDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    customerId?: RouteParam;
    accountId?: RouteParam;
    productName?: RouteParam;
  }>();

  const customerId = firstParam(params.customerId);
  const accountId = firstParam(params.accountId);
  const productName = firstParam(params.productName) || 'Account';

  const [details, setDetails] = useState<CustomerAccountDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDetails(null);
    setLoaded(false);
  }, [accountId]);

  useEffect(() => {
    if (!accountId || loaded) {
      return;
    }

    let cancelled = false;
    setLoading(true);

    customerUseCases
      .fetchCustomerAccountDetails.execute(accountId)
      .then((response) => {
        if (!cancelled) {
          setDetails(response);
          setLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setDetails(null);
          setLoaded(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [accountId, loaded]);

  const viewModel = details ?? {
    accountHolder: '—',
    accountNumber: accountId || '—',
    availableBalance: null,
    branchCode: '—',
    branchName: '—',
    ifscCode: '—',
    interestRate: '—',
    modeOfOperation: '—',
    nominee: '—',
    openedOn: '—',
    productCategory: '—',
    productName,
    statementCycle: '—',
    status: 'Loading',
  };

  const tone = badgeTone(viewModel.status);

  const basicInfoRows = [
    { label: 'ACCOUNT HOLDER', value: viewModel.accountHolder },
    { label: 'ACCOUNT NUMBER', value: viewModel.accountNumber },
    { label: 'IFSC', value: viewModel.ifscCode },
    { label: 'BRANCH', value: viewModel.branchName },
    { label: 'PRODUCT', value: viewModel.productName },
    { label: 'INTEREST RATE', value: viewModel.interestRate },
    { label: 'OPENED ON', value: viewModel.openedOn },
    { label: 'NOMINEE', value: viewModel.nominee },
    { label: 'MODE OF OPERATION', value: viewModel.modeOfOperation },
    { label: 'STATEMENT CYCLE', value: viewModel.statementCycle },
  ];

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 160 },
          ]}>
          <View style={styles.topRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={20} color="#0F172A" />
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
            <Text style={styles.pageTitle}>Account Details</Text>
            <View style={styles.spacer} />
          </View>

          <View style={styles.heroBanner}>
            <Text style={styles.heroBannerText}>ES Smart Banking</Text>
          </View>

          <View style={styles.heroCard}>
            {loading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#17307F" />
                <Text style={styles.loadingText}>Loading account details...</Text>
              </View>
            ) : null}

            <View style={styles.heroHeader}>
              <View style={styles.heroIconWrap}>
                <Ionicons name="wallet-outline" size={26} color="#1E3A8A" />
              </View>

              <View style={styles.heroCopy}>
                <Text style={styles.heroTitle}>{viewModel.productName}</Text>
                <Text style={styles.heroSubtitle}>{viewModel.accountNumber}</Text>
              </View>

              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: tone.backgroundColor,
                    borderColor: tone.borderColor,
                  },
                ]}>
                <Ionicons name={tone.icon} size={16} color={tone.textColor} />
                <Text style={[styles.statusText, { color: tone.textColor }]}>
                  {viewModel.status}
                </Text>
              </View>
            </View>

            <Text style={styles.balanceLabel}>AVAILABLE BALANCE</Text>
            <Text style={styles.balanceValue}>{formatMoney(viewModel.availableBalance)}</Text>
          </View>

          <Text style={styles.sectionTitle}>BASIC INFORMATION</Text>

          <View style={styles.infoCard}>
            {basicInfoRows.map((row, index) => (
              <View
                key={row.label}
                style={[
                  styles.infoRow,
                  index === basicInfoRows.length - 1 && styles.infoRowLast,
                ]}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.branchCard}>
            <View style={styles.branchIconWrap}>
              <Ionicons name="business-outline" size={24} color="#F97316" />
            </View>

            <View style={styles.branchCopy}>
              <Text style={styles.branchTitle}>{viewModel.branchName}</Text>
              <Text style={styles.branchSubtitle}>
                Branch Code: {viewModel.branchCode} · Customer ID: {customerId || '—'}
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
  },
  backButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#F8FAFC',
    opacity: 0.18,
    fontSize: 22,
    fontWeight: '800',
  },
  spacer: {
    width: 74,
  },
  heroBanner: {
    minHeight: 128,
    borderRadius: 22,
    paddingHorizontal: 22,
    paddingVertical: 20,
    justifyContent: 'center',
    backgroundColor: '#6D1A7E',
  },
  heroBannerText: {
    fontSize: 28,
    lineHeight: 32,
    color: '#FACC15',
    fontWeight: '800',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    gap: 18,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroIconWrap: {
    width: 78,
    height: 78,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    flex: 1,
    gap: 4,
  },
  heroTitle: {
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#64748B',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '800',
  },
  balanceLabel: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  balanceValue: {
    color: '#0F172A',
    fontSize: 34,
    fontWeight: '900',
  },
  sectionTitle: {
    color: '#6B7280',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 1,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  infoRow: {
    minHeight: 64,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    gap: 12,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    flex: 1,
    color: '#6B7280',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  infoValue: {
    flex: 1,
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'right',
  },
  branchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  branchIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFF1E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  branchCopy: {
    flex: 1,
    gap: 4,
  },
  branchTitle: {
    color: '#0F172A',
    fontSize: 17,
    fontWeight: '800',
  },
  branchSubtitle: {
    color: '#64748B',
    fontSize: 14,
    fontWeight: '600',
  },
});
