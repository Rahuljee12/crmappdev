import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { globalStyles } from '@/theme/globalStyles';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFindCustomerMutation } from '@/hooks/use-find-customer';
import { leadUseCases } from '@/application/di/app-dependencies';
import type { Lead } from '@/domain/leads/lead';
import { digitsOnly, mobileMatches, normalizeMobileNumber } from '@/core/utils/mobile';
import { newLeadModalArgs } from '@/core/navigation/lead.routes';

type SearchState =
  | 'idle'
  | 'searching'
  | 'empty';

function encodeLeads(leads: Lead[]) {
  return encodeURIComponent(JSON.stringify(leads.slice(0, 2)));
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

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();
  const findCustomer = useFindCustomerMutation();

  const [mobile, setMobile] = useState('');

  const [searchState, setSearchState] =
    useState<SearchState>('idle');

  const formattedMobile = useMemo(
    () => digitsOnly(mobile),
    [mobile]
  );

  useFocusEffect(
    useCallback(() => {
      return () => {
        setMobile('');
        setSearchState('idle');
      };
    }, [])
  );

  const handleSearch = () => {
    Keyboard.dismiss();

    if (formattedMobile.length !== 10) {
      return;
    }

    setSearchState('searching');
    findCustomer.reset();

    findCustomer.mutate(formattedMobile, {
      onSuccess: async (customers) => {
        const etbCustomer =
          customers.find(
            (customer) =>
              Number(customer.matchCount) > 0 &&
              customer.recordType !== 'INPUT'
          ) ??
          customers.find((customer) => Number(customer.matchCount) > 0);

        if (etbCustomer) {
          router.push({
            pathname: '/customer-details',
            params: {
              name: etbCustomer.name,
              phone1: etbCustomer.phone1,
              customerId: etbCustomer.customerId,
              ucic: etbCustomer.ucic,
              recordType: etbCustomer.recordType,
              matchType: etbCustomer.matchType,
              matchCount: etbCustomer.matchCount,
              sourceSystem: etbCustomer.sourceSystem,
            },
          });
          return;
        }

        if (!etbCustomer) {
          const leads = await fetchLeadsForMobile(formattedMobile);

          if (leads.length > 0) {
            router.replace({
              pathname: '/lead-details',
              params: {
                mobile: formattedMobile,
                leads: encodeLeads(leads),
              },
            });
            return;
          }

          const newCustomer = customers.find((customer) => Number(customer.matchCount) <= 0);
          if (newCustomer) {
            router.replace({
              pathname: '/new-customer',
              params: {
                mobile: formattedMobile,
              },
            });
            return;
          }

          setSearchState('empty');
          return;
        }
      },
      onError: () => {
        setSearchState('empty');
      },
    });
  };

  const showBottomActions = searchState === 'empty';

  return (
    <SafeAreaView
      style={globalStyles.safeArea}
      edges={['top', 'left', 'right']}>

      <StatusBar style="dark" />

      <View style={globalStyles.screenBase}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom: showBottomActions
                ? insets.bottom + 190
                : insets.bottom + 40,
            },
          ]}>
          <View>
            <Text style={styles.pageTitle}>
              Find a customer
            </Text>

            <Text style={styles.pageSubtitle}>
              Search by mobile number to continue
            </Text>

            <Text style={styles.label}>
              MOBILE NUMBER
            </Text>

            <View style={styles.inputContainer}>
              <Ionicons
                name="call-outline"
                size={18}
                color="#667085"
              />

              <TextInput
                value={mobile}
                onChangeText={(v) => setMobile(digitsOnly(v))}
                keyboardType="number-pad"
                maxLength={10}
                placeholder="Enter Mobile Number"
                placeholderTextColor="#98A2B3"
                style={styles.input}
              />
            </View>

            <TouchableOpacity
              activeOpacity={0.9}
              style={[
                styles.searchButton,
                formattedMobile.length !== 10 && styles.disabledButton,
              ]}
              disabled={formattedMobile.length !== 10 || findCustomer.isPending}
              onPress={handleSearch}>
              {findCustomer.isPending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Ionicons name="search" size={18} color="#FFFFFF" />
              )}

              <Text style={styles.searchButtonText}>
                {findCustomer.isPending ? 'Searching…' : 'Search'}
              </Text>
            </TouchableOpacity>

            <View style={styles.testNumbersCard}>
              <View style={styles.testNumbersHeader}>
                <View style={styles.testNumbersIcon}>
                  <Ionicons name="information-circle-outline" size={18} color="#1E3A8A" />
                </View>
                <Text style={styles.testNumbersTitle}>Test Numbers</Text>
              </View>

              <View style={styles.testNumbersRow}>
                <Text style={styles.testNumbersLabel}>8310266934</Text>
                <Text style={styles.testNumbersValue}>Existing Customer</Text>
              </View>

              <View style={styles.testNumbersRow}>
                <Text style={styles.testNumbersLabel}>9818236314</Text>
                <Text style={styles.testNumbersValue}>NTB Lead</Text>
              </View>

              <View style={styles.testNumbersRow}>
                <Text style={styles.testNumbersLabel}>Any other</Text>
                <Text style={styles.testNumbersValue}>New Prospect</Text>
              </View>
            </View>
          </View>

          {searchState === 'searching' ? (
            <View style={styles.statusCard}>
              <ActivityIndicator size="small" color="#1D4ED8" />
              <Text style={styles.statusText}>Searching customer...</Text>
            </View>
          ) : null}

          {searchState === 'empty' ? (
            <View style={styles.emptyCard}>
              <Ionicons name="person-outline" size={26} color="#B45309" />
              <Text style={styles.emptyTitle}>No customer found</Text>
              <Text style={styles.emptySubtitle}>
                We could not find any matching customer for {formattedMobile}.
              </Text>
            </View>
          ) : null}
        </ScrollView>

        {/* FIXED BOTTOM ACTIONS */}
        {showBottomActions && (
          <View
            style={[
              styles.actionsShell,
              {
                paddingBottom: insets.bottom + 12,
              },
            ]}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() =>
                router.push(
                  newLeadModalArgs({
                    mobile: formattedMobile,
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
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  scrollContent: {
    padding: 20,
  },

  section: {
    gap: 16,
  },

  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },

  pageSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 28,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    marginBottom: 8,
  },

  inputContainer: {
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },

  searchButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1D4ED8',
    marginTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  disabledButton: {
    opacity: 0.5,
  },

  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  testNumbersCard: {
    marginTop: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    gap: 12,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  testNumbersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  testNumbersIcon: {
    width: 26,
    height: 26,
    borderRadius: 999,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  testNumbersTitle: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '800',
  },

  testNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },

  testNumbersLabel: {
    flex: 1,
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },

  testNumbersValue: {
    flex: 1,
    textAlign: 'right',
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },

  successBanner: {
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  successBannerText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '700',
  },

  ntbBanner: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    gap: 10,
  },

  ntbTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#92400E',
  },

  ntbSubtitle: {
    marginTop: 4,
    fontSize: 12,
    color: '#B45309',
  },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },

  avatar: {
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },

  profileName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 5,
  },

  metaText: {
    fontSize: 12,
    color: '#6B7280',
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },

  tabButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },

  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },

  activeTabText: {
    color: '#111827',
  },

  cardsStack: {
    gap: 12,
  },

  dataCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },

  orangeIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  cardSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: '#6B7280',
  },

  greenPill: {
    backgroundColor: '#DCFCE7',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  greenPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
  },

  orangePill: {
    backgroundColor: '#FFEDD5',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  orangePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C2410C',
  },

  prospectCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 26,
    alignItems: 'center',
  },

  prospectIcon: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  prospectTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  prospectSubtitle: {
    marginTop: 8,
    fontSize: 12,
    color: '#6B7280',
  },

  statusCard: {
    minHeight: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1D4ED8',
  },

  emptyCard: {
    minHeight: 96,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FCD34D',
    padding: 16,
    justifyContent: 'center',
    gap: 4,
  },

  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400E',
  },

  emptySubtitle: {
    fontSize: 12,
    color: '#B45309',
  },

  actionsShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    elevation: 20,
    paddingTop: 14,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 10,
  },

  primaryButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1D4ED8',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  secondaryButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  secondaryButtonText: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
});
