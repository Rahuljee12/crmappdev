import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import type { SRItem, SRStatus } from '@/domain/sr/sr-item';

const SR_STATUS_STYLES: Record<SRStatus, { backgroundColor: string; textColor: string; borderColor: string }> = {
  Open: {
    backgroundColor: '#E0ECFF',
    textColor: '#2563EB',
    borderColor: '#BFDBFE',
  },
  'In Progress': {
    backgroundColor: '#FEF3C7',
    textColor: '#B45309',
    borderColor: '#FCD34D',
  },
  Completed: {
    backgroundColor: '#DCFCE7',
    textColor: '#15803D',
    borderColor: '#86EFAC',
  },
  Rejected: {
    backgroundColor: '#FFE4E6',
    textColor: '#E11D48',
    borderColor: '#FDA4AF',
  },
};

const SR_ITEMS: SRItem[] = [
  {
    id: 'SR-1001',
    srNo: 'SR001',
    customer: 'Anjali R Suresh',
    phone: '9876543210',
    type: 'KYC Update',
    date: 'Today, 10:30 AM',
    status: 'Open',
  },
  {
    id: 'SR-1002',
    srNo: 'SR002',
    customer: 'Rohit Kumar',
    phone: '9123456780',
    type: 'Loan Follow-up',
    date: 'Yesterday',
    status: 'In Progress',
  },
  {
    id: 'SR-1003',
    srNo: 'SR003',
    customer: 'Mohammed Ali',
    phone: '9988776655',
    type: 'Documentation',
    date: '2 days ago',
    status: 'Completed',
  },
];

type SegmentKey = SRStatus | 'All';

export function SrDashboardScreen() {
  const segments: SegmentKey[] = ['All', 'Open', 'In Progress', 'Completed', 'Rejected'];

  const counts = useMemo(() => {
    const c: Record<SegmentKey, number> = {
      All: SR_ITEMS.length,
      Open: 0,
      'In Progress': 0,
      Completed: 0,
      Rejected: 0,
    };

    for (const item of SR_ITEMS) {
      c[item.status]++;
    }
    return c;
  }, []);

  return (
    <ScrollView style={styles.safeArea} contentContainerStyle={styles.content}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Service Requests</Text>
        <View style={styles.metaPill}>
          <Ionicons name="headset-outline" size={14} color="#667085" />
          <Text style={styles.metaText}>{SR_ITEMS.length} SR</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        {segments.map((seg) => {
          const style = seg === 'All' ? { backgroundColor: '#FFFFFF', textColor: '#111827', borderColor: '#E5E7EB' } : SR_STATUS_STYLES[seg];
          return (
            <View
              key={seg}
              style={[styles.summaryCard, { backgroundColor: style.backgroundColor, borderColor: style.borderColor }]}>
              <Text style={[styles.summaryLabel, { color: style.textColor }]}>{seg}</Text>
              <Text style={[styles.summaryValue, { color: style.textColor }]}>{counts[seg]}</Text>
            </View>
          );
        })}
      </View>

      <View style={styles.list}>
        {SR_ITEMS.map((item) => {
          const stage = SR_STATUS_STYLES[item.status];
          return (
            <View key={item.id} style={[styles.srCard]}>
              <View style={styles.topRow}>
                <View style={styles.infoLeft}>
                  <Text style={styles.srNo}>{item.srNo}</Text>
                  <Text style={styles.customer}>{item.customer}</Text>
                  <Text style={styles.sub}>{item.type}</Text>
                </View>

                <View style={[styles.statusPill, { backgroundColor: stage.backgroundColor, borderColor: stage.borderColor }]}>
                  <Text style={[styles.statusText, { color: stage.textColor }]}>{item.status}</Text>
                </View>
              </View>

              <View style={styles.bottomRow}>
                <View style={styles.bottomCell}>
                  <Ionicons name="calendar-outline" size={14} color="#667085" />
                  <Text style={styles.bottomText}>{item.date}</Text>
                </View>

                <View style={styles.bottomCell}>
                  <Ionicons name="call-outline" size={14} color="#667085" />
                  <Text style={styles.bottomText}>{item.phone}</Text>
                </View>
              </View>
            </View>
          );
        })}
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
  summaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flexGrow: 1,
    minWidth: 140,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '900',
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: 26,
    fontWeight: '900',
    marginTop: 6,
  },
  list: {
    gap: 12,
  },
  srCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(15,23,42,0.06)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLeft: {
    flex: 1,
    gap: 4,
  },
  srNo: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 14,
  },
  customer: {
    color: '#111827',
    fontWeight: '900',
    fontSize: 16,
  },
  sub: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '900',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },
  bottomCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bottomText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  footerSpacer: {
    height: 40,
  },
});

