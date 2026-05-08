import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { ExistingCustomer } from '@/domain/customers/customer';

const EXISTING_CUSTOMERS: ExistingCustomer[] = [
  {
    name: 'Anjali R Suresh',
    cif: 'CIF-10492',
    mobile: '9876543210',
    initials: 'ARS',
    accounts: [
      {
        title: 'Savings Account',
        masked: '•••• 2481',
        status: 'Active',
        icon: 'wallet-outline',
      },
      {
        title: 'Current Account',
        masked: '•••• 1207',
        status: 'Active',
        icon: 'briefcase-outline',
      },
    ],
    leads: [
      { title: 'Home Loan', subtitle: 'Top up', status: 'Hot', icon: 'trending-up-outline' },
      { title: 'Salary Account', subtitle: 'Upgrade', status: 'Warm', icon: 'trending-up-outline' },
    ],
    insights: [
      { text: 'Likely to opt for additional FD within 30 days.', icon: 'sparkles-outline' },
      { text: 'KYC valid until next year.', icon: 'shield-checkmark-outline' },
    ],
  },
  {
    name: 'Rohit Kumar',
    cif: 'CIF-22110',
    mobile: '9123456780',
    initials: 'RK',
    accounts: [
      {
        title: 'CASA - Premium',
        masked: '•••• 7712',
        status: 'Active',
        icon: 'wallet-outline',
      },
    ],
    leads: [{ title: 'Business Loan', subtitle: 'Negotiation', status: 'In Progress', icon: 'hourglass-outline' }],
    insights: [{ text: 'Spending pattern stable; offer for credit card suitable.', icon: 'analytics-outline' }],
  },
];

type SegmentKey = 'accounts' | 'leads' | 'insights';

function segmentLabel(key: SegmentKey) {
  switch (key) {
    case 'accounts':
      return 'Accounts';
    case 'leads':
      return 'Leads';
    case 'insights':
      return 'Insights';
  }
}

export function CustomersDashboardScreen() {
  // For now: render a clean static dashboard similar in layout to Leads.
  // Tab switching can be added later; this keeps routing integration separate.
  const primaryCustomer = EXISTING_CUSTOMERS[0];

  const segments = useMemo(
    () =>
      (['accounts', 'leads', 'insights'] as SegmentKey[]).map((key) => ({
        key,
        label: segmentLabel(key),
      })),
    [],
  );

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Customers</Text>
        <View style={styles.metaPill}>
          <Ionicons name="person-outline" size={14} color="#667085" />
          <Text style={styles.metaText}>{EXISTING_CUSTOMERS.length} customers</Text>
        </View>
      </View>

      <View style={styles.customerCard}>
        <View style={styles.customerTop}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{primaryCustomer.initials}</Text>
          </View>

          <View style={styles.customerInfo}>
            <Text style={styles.customerName}>{primaryCustomer.name}</Text>
            <Text style={styles.customerSub}>CIF: {primaryCustomer.cif}</Text>
          </View>

          <View style={styles.phonePill}>
            <Ionicons name="call-outline" size={14} color="#1D4ED8" />
            <Text style={styles.phoneText}>{primaryCustomer.mobile}</Text>
          </View>
        </View>

        <View style={styles.segmentGrid}>
          {segments.map((seg) => (
            <View key={seg.key} style={styles.segmentCard}>
              <Text style={styles.segmentLabel}>{seg.label}</Text>

              {seg.key === 'accounts'
                ? primaryCustomer.accounts.map((a, idx) => (
                    <View key={idx} style={styles.row}>
                      <View style={styles.iconWrap}>
                        <Ionicons name={a.icon as any} size={16} color="#2563EB" />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{a.title}</Text>
                        <Text style={styles.rowSub}>{a.masked} • {a.status}</Text>
                      </View>
                    </View>
                  ))
                : null}

              {seg.key === 'leads'
                ? primaryCustomer.leads.map((l, idx) => (
                    <View key={idx} style={styles.row}>
                      <View style={styles.iconWrap}>
                        <Ionicons name={l.icon as any} size={16} color="#E11D48" />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{l.title}</Text>
                        <Text style={styles.rowSub}>{l.subtitle} • {l.status}</Text>
                      </View>
                    </View>
                  ))
                : null}

              {seg.key === 'insights'
                ? primaryCustomer.insights.map((i, idx) => (
                    <View key={idx} style={styles.row}>
                      <View style={styles.iconWrap}>
                        <Ionicons name={i.icon as any} size={16} color="#127A36" />
                      </View>
                      <View style={styles.rowText}>
                        <Text style={styles.rowTitle}>{i.text}</Text>
                      </View>
                    </View>
                  ))
                : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footerSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 140,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    color: '#101828',
    fontSize: 20,
    fontWeight: '900',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  customerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  customerTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#E0EBFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '900',
  },
  customerInfo: {
    flex: 1,
    gap: 4,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  customerSub: {
    fontSize: 12,
    color: '#667085',
    fontWeight: '600',
  },
  phonePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EEF2FF',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  phoneText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '800',
  },
  segmentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  segmentCard: {
    width: '100%',
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#EEF2F6',
  },
  segmentLabel: {
    fontSize: 14,
    color: '#142A60',
    fontWeight: '900',
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 3,
  },
  rowTitle: {
    color: '#111827',
    fontSize: 13,
    fontWeight: '900',
  },
  rowSub: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
  },
  footerSpacer: {
    height: 40,
  },
});

