import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useMemo, useState } from 'react';
import {
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

type CustomerTab = 'Accounts' | 'Leads' | 'Insights';

type SearchState =
  | 'idle'
  | 'existing'
  | 'ntb'
  | 'prospect';

type ExistingCustomer = {
  name: string;
  cif: string;
  mobile: string;
  initials: string;

  accounts: {
    title: string;
    masked: string;
    status: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[];

  leads: {
    title: string;
    subtitle: string;
    status: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[];

  insights: {
    text: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[];
};

const TEST_NUMBERS = [
  {
    number: '9876543210',
    label: 'Existing Customer',
  },
  {
    number: '9123456780',
    label: 'NTB Lead',
  },
  {
    number: '9999999999',
    label: 'New Prospect',
  },
];

const EXISTING_CUSTOMERS: Record<
  string,
  ExistingCustomer
> = {
  '9876543210': {
    name: 'Rajesh Kumar',
    cif: 'CIF12345',
    mobile: '9876543210',
    initials: 'RK',

    accounts: [
      {
        title: 'Savings Account',
        masked: '•••• 4421',
        status: 'Active',
        icon: 'wallet-outline',
      },
      {
        title: 'Fixed Deposit',
        masked: '•••• 7781',
        status: 'Matures 2027',
        icon: 'cash-outline',
      },
    ],

    leads: [
      {
        title: 'Home Loan',
        subtitle: 'Lead L-9821',
        status: 'Interested',
        icon: 'home-outline',
      },
    ],

    insights: [
      {
        text: 'Savings account has no nominee',
        icon: 'sparkles-outline',
      },
      {
        text: 'FD maturing soon',
        icon: 'sparkles-outline',
      },
    ],
  },
};

function digitsOnly(value: string) {
  return value.replace(/\D/g, '').slice(0, 10);
}

function resolveCustomer(number: string) {
  return EXISTING_CUSTOMERS[number] ?? null;
}

export default function CustomersScreen() {
  const insets = useSafeAreaInsets();

  const [mobile, setMobile] = useState('');

  const [selectedTab, setSelectedTab] =
    useState<CustomerTab>('Accounts');

  const [resolvedCustomer, setResolvedCustomer] =
    useState<ExistingCustomer | null>(null);

  const [searchState, setSearchState] =
    useState<SearchState>('idle');

  const formattedMobile = useMemo(
    () => digitsOnly(mobile),
    [mobile]
  );

  const resetCustomerView = useCallback(() => {
    setMobile('');
    setSelectedTab('Accounts');
    setResolvedCustomer(null);
    setSearchState('idle');
  }, []);

  useFocusEffect(
    useCallback(() => {
      return () => {
        resetCustomerView();
      };
    }, [resetCustomerView])
  );

  const handleSearch = () => {
    Keyboard.dismiss();

    if (formattedMobile.length !== 10) {
      return;
    }

    const customer =
      resolveCustomer(formattedMobile);

    if (customer) {
      setResolvedCustomer(customer);
      setSearchState('existing');
      setSelectedTab('Accounts');
      return;
    }

    if (formattedMobile === '9123456780') {
      setSearchState('ntb');
      return;
    }

    setSearchState('prospect');
  };

  const openDemo = (value: string) => {
    setMobile(value);

    const customer = resolveCustomer(value);

    if (customer) {
      setResolvedCustomer(customer);
      setSearchState('existing');
      setSelectedTab('Accounts');
      return;
    }

    if (value === '9123456780') {
      setSearchState('ntb');
      return;
    }

    setSearchState('prospect');
  };

  const showExistingCustomer =
    searchState === 'existing' &&
    resolvedCustomer;

  const showBottomActions =
    searchState === 'existing' ||
    searchState === 'ntb' ||
    searchState === 'prospect';

  return (
    <SafeAreaView
      style={styles.safeArea}
      edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.container}>
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
          {/* SEARCH SCREEN */}
          {searchState === 'idle' && (
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
                  onChangeText={(v) =>
                    setMobile(digitsOnly(v))
                  }
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
                  formattedMobile.length !== 10 &&
                    styles.disabledButton,
                ]}
                disabled={
                  formattedMobile.length !== 10
                }
                onPress={handleSearch}>
                <Ionicons
                  name="search"
                  size={18}
                  color="#FFFFFF"
                />

                <Text style={styles.searchButtonText}>
                  Search
                </Text>
              </TouchableOpacity>

              <View style={styles.testCard}>
                <View style={styles.testHeader}>
                  <Ionicons
                    name="information-circle-outline"
                    size={18}
                    color="#1D4ED8"
                  />

                  <Text style={styles.testHeaderText}>
                    Test Numbers
                  </Text>
                </View>

                {TEST_NUMBERS.map((item) => (
                  <Pressable
                    key={item.number}
                    style={styles.testRow}
                    onPress={() =>
                      openDemo(item.number)
                    }>
                    <Text style={styles.testNumber}>
                      {item.number}
                    </Text>

                    <Text style={styles.testLabel}>
                      {item.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* EXISTING CUSTOMER */}
          {showExistingCustomer && (
            <View style={styles.section}>
              <View style={styles.successBanner}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color="#15803D"
                />

                <Text style={styles.successBannerText}>
                  Existing Customer
                </Text>
              </View>

              <View style={styles.profileCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {resolvedCustomer.initials}
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>
                    {resolvedCustomer.name}
                  </Text>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="card-outline"
                      size={14}
                      color="#667085"
                    />

                    <Text style={styles.metaText}>
                      {resolvedCustomer.cif}
                    </Text>
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="call-outline"
                      size={14}
                      color="#667085"
                    />

                    <Text style={styles.metaText}>
                      {resolvedCustomer.mobile}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.tabs}>
                {(
                  [
                    'Accounts',
                    'Leads',
                    'Insights',
                  ] as CustomerTab[]
                ).map((tab) => {
                  const active =
                    selectedTab === tab;

                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.tabButton,
                        active &&
                          styles.activeTabButton,
                      ]}
                      onPress={() =>
                        setSelectedTab(tab)
                      }>
                      <Text
                        style={[
                          styles.tabText,
                          active &&
                            styles.activeTabText,
                        ]}>
                        {tab}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {selectedTab === 'Accounts' && (
                <View style={styles.cardsStack}>
                  {resolvedCustomer.accounts.map(
                    (item) => (
                      <View
                        key={item.title}
                        style={styles.dataCard}>
                        <View
                          style={styles.iconWrap}>
                          <Ionicons
                            name={item.icon}
                            size={22}
                            color="#1D4ED8"
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={
                              styles.cardTitle
                            }>
                            {item.title}
                          </Text>

                          <Text
                            style={
                              styles.cardSubtitle
                            }>
                            {item.masked}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.greenPill
                          }>
                          <Text
                            style={
                              styles.greenPillText
                            }>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    )
                  )}
                </View>
              )}

              {selectedTab === 'Leads' && (
                <View style={styles.cardsStack}>
                  {resolvedCustomer.leads.map(
                    (item) => (
                      <View
                        key={item.title}
                        style={styles.dataCard}>
                        <View
                          style={
                            styles.orangeIconWrap
                          }>
                          <Ionicons
                            name={item.icon}
                            size={22}
                            color="#EA580C"
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={
                              styles.cardTitle
                            }>
                            {item.title}
                          </Text>

                          <Text
                            style={
                              styles.cardSubtitle
                            }>
                            {item.subtitle}
                          </Text>
                        </View>

                        <View
                          style={
                            styles.orangePill
                          }>
                          <Text
                            style={
                              styles.orangePillText
                            }>
                            {item.status}
                          </Text>
                        </View>
                      </View>
                    )
                  )}
                </View>
              )}

              {selectedTab === 'Insights' && (
                <View style={styles.cardsStack}>
                  {resolvedCustomer.insights.map(
                    (item) => (
                      <View
                        key={item.text}
                        style={styles.dataCard}>
                        <View
                          style={styles.iconWrap}>
                          <Ionicons
                            name={item.icon}
                            size={20}
                            color="#1D4ED8"
                          />
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text
                            style={
                              styles.cardTitle
                            }>
                            {item.text}
                          </Text>
                        </View>
                      </View>
                    )
                  )}
                </View>
              )}
            </View>
          )}

          {/* NTB SCREEN */}
          {searchState === 'ntb' && (
            <View style={styles.section}>
              <View style={styles.ntbBanner}>
                <Ionicons
                  name="alert-circle-outline"
                  size={18}
                  color="#B45309"
                />

                <View style={{ flex: 1 }}>
                  <Text style={styles.ntbTitle}>
                    Lead Found – Customer not onboarded
                  </Text>

                  <Text style={styles.ntbSubtitle}>
                    No accounts exist for this
                    number yet.
                  </Text>
                </View>
              </View>

              <View style={styles.profileCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    PS
                  </Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>
                    Priya Sharma
                  </Text>

                  <View style={styles.metaRow}>
                    <Ionicons
                      name="call-outline"
                      size={14}
                      color="#667085"
                    />

                    <Text style={styles.metaText}>
                      {formattedMobile}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* PROSPECT */}
          {searchState === 'prospect' && (
            <View style={styles.section}>
              <View style={styles.prospectCard}>
                <View style={styles.prospectIcon}>
                  <Ionicons
                    name="person-add-outline"
                    size={28}
                    color="#1D4ED8"
                  />
                </View>

                <Text style={styles.prospectTitle}>
                  No existing customer or lead found
                </Text>

                <Text
                  style={styles.prospectSubtitle}>
                  {formattedMobile}
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* FIXED BOTTOM ACTIONS */}
        {showBottomActions && (
          <View
            style={[
              styles.actionsShell,
              {
                paddingBottom:
                  insets.bottom + 12,
              },
            ]}>
            {searchState === 'existing' && (
              <>
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={() =>
                    router.push('/modal')
                  }>
                  <Ionicons
                    name="person-add-outline"
                    size={18}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.primaryButtonText
                    }>
                    Create New Lead
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color="#111827"
                  />

                  <Text
                    style={
                      styles.secondaryButtonText
                    }>
                    Raise Service Request
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {searchState === 'ntb' && (
              <>
                <TouchableOpacity
  style={styles.primaryButton}
  onPress={() =>
    router.push({
      pathname: '/casa/open/[step]',
      params: {
        step: 'identify',
        type: 'Savings',
      },
    })
  }>
  <Text style={styles.primaryButtonText}>
    Continue Account Opening
  </Text>
</TouchableOpacity>

                <TouchableOpacity
                  style={styles.secondaryButton}>
                  <Text
                    style={
                      styles.secondaryButtonText
                    }>
                    Create New Lead
                  </Text>
                </TouchableOpacity>
              </>
            )}

            {searchState === 'prospect' && (
              <TouchableOpacity
                style={styles.primaryButton}>
                <Text
                  style={
                    styles.primaryButtonText
                  }>
                  Create New Lead
                </Text>
              </TouchableOpacity>
            )}
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

  testCard: {
    marginTop: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
  },

  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },

  testHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  testRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },

  testNumber: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },

  testLabel: {
    fontSize: 12,
    color: '#6B7280',
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