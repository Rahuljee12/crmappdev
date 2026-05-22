import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { customerUseCases, leadUseCases } from '@/application/di/app-dependencies';
import { AppHeader } from '@/components/app-header';
import type { CustomerAccount } from '@/domain/customers/customer-account';
import type { Lead } from '@/domain/leads/lead';
import { globalStyles } from '@/theme/globalStyles';
import { Fonts } from '@/theme/theme';
import { mobileMatches, normalizeMobileNumber } from '@/core/utils/mobile';
import { newLeadModalArgs } from '@/core/navigation/lead.routes';
import { accountDetailsArgs } from '@/core/navigation/account.routes';

type CustomerTab = 'Accounts' | 'Leads';

type RouteParam = string | string[] | undefined;

function firstParam(value: RouteParam) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

function initialsFromName(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

function maskAccountId(accountId: string) {
  const compact = accountId.trim().replace(/\s+/g, '');
  const lastFour = compact.slice(-4);

  if (!lastFour) {
    return '....';
  }

  return `.... ${lastFour}`;
}

function normalizeAccountId(accountId: string) {
  return accountId.trim().replace(/\s+/g, '');
}

async function fetchLeadsForMobile(mobileNumber: string) {
  const normalized = normalizeMobileNumber(mobileNumber);
  const criteria = [normalized, `91${normalized}`];
  const seen = new Set<string>();
  const results: Lead[] = [];

  for (const candidate of criteria) {
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    try {
      const fetched = await leadUseCases.listLeads.execute({
        mobileNumber: candidate,
      });

      for (const lead of fetched) {
        if (mobileMatches(lead.mobile, normalized)) {
          results.push(lead);
        }
      }
    } catch {
      // Ignore and try the next format.
    }
  }

  const uniqueById = new Map<string, Lead>();
  for (const lead of results) {
    uniqueById.set(lead.id, lead);
  }

  return [...uniqueById.values()];
}

export default function CustomerDetailsScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    name?: RouteParam;
    phone1?: RouteParam;
    customerId?: RouteParam;
    ucic?: RouteParam;
    recordType?: RouteParam;
    matchType?: RouteParam;
    matchCount?: RouteParam;
    sourceSystem?: RouteParam;
  }>();

  const [activeTab, setActiveTab] = useState<CustomerTab>('Accounts');
  const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [accountsLoaded, setAccountsLoaded] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [leadsLoaded, setLeadsLoaded] = useState(false);

  const customerName = firstParam(params.name) || 'Customer';
  const customerPhone = firstParam(params.phone1) || '—';
  const customerId = firstParam(params.customerId);
  const customerIdentifier =
    customerId ||
    firstParam(params.ucic) ||
    '—';

  useEffect(() => {
    setAccounts([]);
    setAccountsLoaded(false);
  }, [customerId]);

  useEffect(() => {
    if (activeTab !== 'Accounts' || accountsLoaded) {
      return;
    }

    if (!customerId) {
      setAccountsLoaded(true);
      return;
    }

    let cancelled = false;
    setAccountsLoading(true);
    setAccounts([]);

    customerUseCases.listCustomerAccounts.execute(customerId)
      .then((items) => {
        if (!cancelled) {
          setAccounts(items);
          setAccountsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAccounts([]);
          setAccountsLoaded(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAccountsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, accountsLoaded, customerId]);

  useEffect(() => {
    if (activeTab !== 'Leads' || leadsLoaded) {
      return;
    }

    const mobileNumber = normalizeMobileNumber(customerPhone);
    if (!mobileNumber) {
      setLeadsLoaded(true);
      return;
    }

    let cancelled = false;
    setLeadsLoading(true);
    setLeads([]);

    fetchLeadsForMobile(customerPhone)
      .then((items) => {
        if (!cancelled) {
          setLeads(items);
          setLeadsLoaded(true);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLeads([]);
          setLeadsLoaded(true);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLeadsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, customerPhone, leadsLoaded]);

  const tabContentBottomSpacing = insets.bottom + 320;

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['left', 'right']}>
      <StatusBar style="dark" />

      <AppHeader />

      <View style={styles.screen}>
        <View style={styles.fixedTopContent}>
          <Text style={styles.pageTitle}>Customer Details</Text>

          <View style={styles.banner}>
            <View style={styles.bannerIcon}>
              <Ionicons name="checkmark" size={16} color="#15803D" />
            </View>
            <Text style={styles.bannerText}>Existing Customer</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsFromName(customerName)}</Text>
            </View>

            <View style={styles.profileCopy}>
              <Text style={styles.profileName}>{customerName}</Text>

              <View style={styles.metaRow}>
                <Ionicons name="card-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>CIF {customerIdentifier}</Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="call-outline" size={16} color="#6B7280" />
                <Text style={styles.metaText}>{customerPhone}</Text>
              </View>
            </View>
          </View>

          <View style={styles.segmentedControl}>
            {/* Insights tab temporarily disabled for now. */}
            {(['Accounts', 'Leads'] as const).map((tab) => {
              const active = tab === activeTab;

              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    styles.segmentButton,
                    active && styles.segmentButtonActive,
                  ]}>
                  <Text
                    style={[
                      styles.segmentButtonText,
                      active && styles.segmentButtonTextActive,
                    ]}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView
          style={styles.tabScroll}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.tabScrollContent,
            { paddingBottom: tabContentBottomSpacing },
          ]}>
          {activeTab === 'Accounts' ? (
            <View style={styles.cardStack}>
              {accountsLoading ? (
                <View style={styles.emptyLeadsCard}>
                  <ActivityIndicator size="small" color="#17307F" />
                  <Text style={styles.emptyLeadsText}>Loading accounts...</Text>
                </View>
              ) : null}

              {!accountsLoading && accounts.length === 0 ? (
                <View style={styles.emptyLeadsCard}>
                  <Text style={styles.emptyLeadsText}>No accounts found</Text>
                </View>
              ) : null}

              {!accountsLoading
                ? accounts.map((account, index) => (
                    <Pressable
                      key={`${account.productName}-${account.accountId}-${index}`}
                      onPress={() => {
                        const accountId = normalizeAccountId(account.accountId);
                        if (!accountId) {
                          return;
                        }

                        router.push(
                          accountDetailsArgs({
                            customerId: customerId || undefined,
                            accountId,
                            productName: account.productName,
                          }),
                        );
                      }}
                      style={({ pressed }) => [
                        styles.dataCard,
                        styles.accountCardPressable,
                        pressed && styles.accountCardPressed,
                      ]}>
                      <View style={[styles.iconWrap, { backgroundColor: '#EEF2FF' }]}>
                        <Ionicons name="wallet-outline" size={24} color="#1E3A8A" />
                      </View>

                      <View style={styles.cardBody}>
                        <Text style={styles.cardTitle}>{account.productName}</Text>
                        <Text style={styles.cardSubtitle}>{maskAccountId(account.accountId)}</Text>
                      </View>

                      <View
                        style={[
                          styles.badge,
                          account.badgeVariant === 'amber'
                            ? styles.badgeAmber
                            : styles.badgeGreen,
                        ]}>
                        <Text
                          style={[
                            styles.badgeText,
                            account.badgeVariant === 'amber'
                              ? styles.badgeTextAmber
                              : styles.badgeTextGreen,
                          ]}>
                          {account.badge}
                        </Text>
                      </View>
                    </Pressable>
                  ))
                : null}
            </View>
          ) : activeTab === 'Leads' ? (
            <View style={styles.cardStack}>
              {leadsLoading ? (
                <View style={styles.emptyLeadsCard}>
                  <ActivityIndicator size="small" color="#17307F" />
                  <Text style={styles.emptyLeadsText}>Loading leads...</Text>
                </View>
              ) : null}

              {!leadsLoading && leads.length === 0 ? (
                <View style={styles.emptyLeadsCard}>
                  <Text style={styles.emptyLeadsText}>No leads found</Text>
                </View>
              ) : null}

              {!leadsLoading ? leads.map((lead) => (
                <View key={lead.id} style={styles.dataCard}>
                  <View style={[styles.iconWrap, { backgroundColor: '#FFE4E1' }]}>
                    <Ionicons name="home-outline" size={24} color="#FF5A1F" />
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle}>{lead.product}</Text>
                    <Text style={styles.cardSubtitle}>Lead {lead.id}</Text>
                  </View>

                  <View style={[styles.badge, styles.badgeAmber]}>
                    <Text style={[styles.badgeText, styles.badgeTextAmber]}>
                      {lead.status}
                    </Text>
                  </View>
                </View>
              )) : null}
            </View>
          ) : null}
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
            onPress={() =>
              router.push(
                newLeadModalArgs({
                  mobile: normalizeMobileNumber(customerPhone),
                }),
              )
            }>
            <Ionicons name="person-add-outline" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Create New Lead</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push('/modal')}>
            <Ionicons name="document-text-outline" size={18} color="#111827" />
            <Text style={styles.secondaryButtonText}>Raise Service Request</Text>
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

  fixedTopContent: {
    paddingHorizontal: 14,
    paddingTop: 0,
    paddingBottom: 8,
    gap: 8,
  },

  tabScroll: {
    flex: 1,
  },

  tabScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 0,
    gap: 16,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    opacity: 0.16,
    marginBottom: 0,
  },

  banner: {
    minHeight: 52,
    backgroundColor: '#DDF7E5',
    borderRadius: 18,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  bannerIcon: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#15803D',
    alignItems: 'center',
    justifyContent: 'center',
  },

  bannerText: {
    color: '#15803D',
    fontSize: 15,
    fontWeight: '800',
  },

  profileCard: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
  },

  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#93C5FD',
  },

  profileCopy: {
    flex: 1,
    gap: 4,
  },

  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  metaText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '600',
  },

  segmentedControl: {
    backgroundColor: '#E7EEF7',
    borderRadius: 24,
    padding: 3,
    flexDirection: 'row',
    gap: 3,
  },

  segmentButton: {
    flex: 1,
    height: 50,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },

  segmentButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },

  segmentButtonTextActive: {
    color: '#0F172A',
  },

  cardStack: {
    gap: 12,
  },

  emptyLeadsCard: {
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  emptyLeadsText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '700',
  },

  dataCard: {
    minHeight: 92,
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  accountCardPressable: {
    overflow: 'hidden',
  },

  accountCardPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.96,
  },

  iconWrap: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBody: {
    flex: 1,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },

  cardSubtitle: {
    marginTop: 2,
    fontSize: 15,
    color: '#64748B',
    fontWeight: '600',
  },

  badge: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  badgeGreen: {
    backgroundColor: '#DCFCE7',
  },

  badgeAmber: {
    backgroundColor: '#FEF3C7',
  },

  badgeText: {
    fontSize: 12,
    fontWeight: '800',
  },

  badgeTextGreen: {
    color: '#15803D',
  },

  badgeTextAmber: {
    color: '#A16207',
  },

  actionsShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
    // borderTopWidth: 1,
    // borderTopColor: '#E5E7EB',
    paddingTop: 14,
    paddingHorizontal: 12,
    gap: 10,
  },

  primaryButton: {
    height: 70,
    borderRadius: 24,
    backgroundColor: '#17307F',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  secondaryButton: {
    height: 60,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  secondaryButtonText: {
    color: '#111827',
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
