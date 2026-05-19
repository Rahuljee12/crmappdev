import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import type { Lead } from '@/domain/leads/lead';
import { globalStyles } from '@/theme/globalStyles';
import { Fonts } from '@/theme/theme';

type RouteParam = string | string[] | undefined;

function firstParam(value: RouteParam) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function parseLeads(value: RouteParam): Lead[] {
  const raw = firstParam(value);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    return Array.isArray(parsed) ? parsed.slice(0, 2) : [];
  } catch {
    return [];
  }
}

export default function LeadDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    mobile?: RouteParam;
    leads?: RouteParam;
  }>();

  const mobile = firstParam(params.mobile);
  const leads = parseLeads(params.leads);

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 340 },
          ]}>
          <Text style={styles.pageTitle}>Lead Details</Text>

          <View style={styles.warningBanner}>
            <Ionicons name="warning-outline" size={22} color="#A16207" />
            <View style={styles.warningCopy}>
              <Text style={styles.warningTitle}>Lead Found - Customer not onboarded</Text>
              <Text style={styles.warningSubtitle}>No accounts exist for this number yet.</Text>
            </View>
          </View>

          {leads.map((lead) => (
            <View key={lead.id} style={styles.detailCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>NAME</Text>
                <Text style={styles.detailValue}>{lead.name}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>MOBILE</Text>
                <Text style={styles.detailValue}>{lead.mobile !== '—' ? lead.mobile : mobile}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>LEAD ID</Text>
                <Text style={styles.detailValue}>{lead.id}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>INTERESTED PRODUCT</Text>
                <Text style={styles.detailValue}>{lead.product}</Text>
              </View>
            </View>
          ))}

          <View style={styles.noAccountsCard}>
            <Text style={styles.noAccountsText}>No active accounts</Text>
          </View>
        </ScrollView>

        <View
          style={[
            styles.actionsShell,
            {
              bottom: insets.bottom + 102,
            },
          ]}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.push('/(tabs)/accounts')}>
            <Text style={styles.primaryButtonText}>Continue Account Opening</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => {
              router.push({
                pathname: '/modal',
                params: { mobile },
              });
            }}>
            <Text style={styles.secondaryButtonText}>Create New Lead (Different Product)</Text>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.bottomTabBar,
            {
              paddingBottom: insets.bottom + 8,
            },
          ]}>
          {[
            { key: 'dashboard', label: 'Dashboard', icon: 'grid-outline', activeIcon: 'grid' },
            { key: 'customers', label: 'Customers', icon: 'people-outline', activeIcon: 'people', active: true },
            { key: 'leads', label: 'Leads', icon: 'radio-button-on-outline', activeIcon: 'radio-button-on' },
            { key: 'accounts', label: 'Accounts', icon: 'wallet-outline', activeIcon: 'wallet-outline' },
            { key: 'sr', label: 'SR', icon: 'headset-outline', activeIcon: 'headset-outline' },
            { key: 'more', label: 'More', icon: 'ellipsis-horizontal', activeIcon: 'ellipsis-horizontal' },
          ].map((item) => {
            const active = item.active ?? false;
            return (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.85}
                onPress={() => {
                  if (item.key === 'customers') {
                    return;
                  }

                  if (item.key === 'leads') {
                    router.replace('/');
                    return;
                  }

                  router.replace(`/(tabs)/${item.key}` as never);
                }}
                style={styles.bottomTabItem}>
                <View style={[styles.bottomTabIconWrap, active && styles.bottomTabIconWrapActive]}>
                  <Ionicons
                    name={(active ? item.activeIcon : item.icon) as any}
                    size={24}
                    color={active ? '#FFFFFF' : '#667085'}
                  />
                </View>
                <Text style={[styles.bottomTabLabel, active && styles.bottomTabLabelActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    padding: 14,
    gap: 26,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    opacity: 0.2,
    marginBottom: 36,
  },

  warningBanner: {
    backgroundColor: '#FFF7E6',
    borderWidth: 1,
    borderColor: '#FED78A',
    borderRadius: 24,
    paddingHorizontal: 18,
    paddingVertical: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },

  warningCopy: {
    flex: 1,
    gap: 4,
  },

  warningTitle: {
    color: '#92400E',
    fontSize: 16,
    fontWeight: '800',
  },

  warningSubtitle: {
    color: '#A16207',
    fontSize: 15,
    fontWeight: '500',
  },

  detailCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingVertical: 24,
    gap: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
  },

  detailLabel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 1.4,
  },

  detailValue: {
    flex: 1,
    textAlign: 'right',
    color: '#0F172A',
    fontSize: 18,
    fontWeight: '800',
  },

  noAccountsCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#D7DEE8',
    borderRadius: 24,
    minHeight: 66,
    alignItems: 'center',
    justifyContent: 'center',
  },

  noAccountsText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '600',
  },

  actionsShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 14,
    paddingHorizontal: 12,
    gap: 10,
  },

  primaryButton: {
    height: 64,
    borderRadius: 22,
    backgroundColor: '#17307F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryButton: {
    height: 60,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  bottomTabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },

  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
  },

  bottomTabIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  bottomTabIconWrapActive: {
    width: 72,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#17307F',
  },

  bottomTabLabel: {
    fontFamily: Fonts.sans,
    fontSize: 11,
    color: '#667085',
    fontWeight: '700',
  },

  bottomTabLabelActive: {
    color: '#17307F',
  },
});
