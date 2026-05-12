import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { useLeadsQuery } from '@/hooks/use-leads';
import { useLeadsCriteria } from '@/hooks/use-leads-criteria';
import type { LeadStatus } from '@/domain/leads/lead';

const stageStyles: Record<
  LeadStatus,
  { backgroundColor: string; textColor: string }
> = {
  Hot: {
    backgroundColor: '#f7e4e7',
    textColor: '#ca030d',
  },
  Warm: {
    backgroundColor: '#f6eee0',
    textColor: '#a36100',
  },
  Cold: {
    backgroundColor: '#e1e6f0',
    textColor: '#112A74',
  },
};

export function LeadsDashboardScreen() {
  const insets = useSafeAreaInsets();
  const criteria = useLeadsCriteria();
  const leadsQuery = useLeadsQuery();
  const leads = leadsQuery.data;
  const isLoading = criteria.isLoading || leadsQuery.isLoading;
  const isError = criteria.isError || leadsQuery.isError;
  const errorMessage =
    (criteria.error instanceof Error ? criteria.error.message : null) ??
    (leadsQuery.error instanceof Error ? leadsQuery.error.message : null) ??
    'Unable to load leads.';

  const summaryCards = useMemo(() => {
    const byStatus: Record<LeadStatus, number> = {
      Hot: 0,
      Warm: 0,
      Cold: 0,
    };

    for (const lead of leads ?? []) {
      byStatus[lead.status]++;
    }

    const ordered: LeadStatus[] = ['Hot', 'Warm', 'Cold'];
    return ordered.map((status) => ({
      label: status,
      value: byStatus[status],
      background: stageStyles[status].backgroundColor,
      color: stageStyles[status].textColor,
    }));
  }, [leads]);


  return (
   <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>

  <View style={styles.container}>

    <FlatList
  data={isError ? [] : (leads ?? [])}
  keyExtractor={(item) => item.id}
  showsVerticalScrollIndicator={false}
  removeClippedSubviews
  initialNumToRender={6}
  maxToRenderPerBatch={8}
  windowSize={10}
  contentContainerStyle={[
    styles.scrollContent,
    {
      flexGrow: 1,
    },
  ]}
  ListHeaderComponent={
    <>
      {/* Summary Cards */}
      <View style={styles.summaryRow}>
        {summaryCards.map((card) => (
          <View
            key={card.label}
            style={[
              styles.summaryCard,
              { backgroundColor: card.background },
            ]}>
            <Text
              style={[
                styles.summaryLabel,
                { color: card.color },
              ]}>
              {card.label}
            </Text>

            <Text
              style={[
                styles.summaryValue,
                { color: card.color },
              ]}>
              {card.value}
            </Text>
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Active Leads
        </Text>

        <TouchableOpacity activeOpacity={0.8}>
          <Text style={styles.sortLabel}>
            Sort: Newest
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading && (
        <View style={styles.stateRow}>
          <ActivityIndicator
            size="small"
            color="#667085"
          />

          <Text style={styles.stateText}>
            Loading leads…
          </Text>
        </View>
      )}

      {!isLoading && isError && (
        <View style={styles.stateRow}>
          <Text style={styles.stateText}>
            {errorMessage}
          </Text>
        </View>
      )}
    </>
  }
      renderItem={({ item: lead }) => (
        <View style={styles.leadCard}>
          <View style={styles.leadTopRow}>
            <View style={styles.leadInfo}>
              <Text style={styles.leadName}>
                {lead.name}
              </Text>

              <Text style={styles.leadProduct}>
                {lead.product}
              </Text>
            </View>

            <View
              style={[
                styles.stageBadge,
                {
                  backgroundColor:
                    stageStyles[lead.status].backgroundColor,
                },
              ]}>
              <Text
                style={[
                  styles.stageText,
                  {
                    color:
                      stageStyles[lead.status].textColor,
                  },
                ]}>
                {lead.status}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <View style={styles.amountLeft}>
              <Ionicons
                name="trending-up-outline"
                size={16}
                color="#F97316"
              />

              <Text style={styles.amountText}>
                {lead.amount}
              </Text>
            </View>

            <Text style={styles.sourceText}>
             {lead.source}
            </Text>
          </View>

          <View style={styles.footerRow}>
            <View style={styles.followUpRow}>
              <Ionicons
                name="calendar-outline"
                size={14}
                color="#667085"
              />

              <Text style={styles.followUpText}>
                {lead.time}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.callButton}>
              <Ionicons
                name="call-outline"
                size={14}
                color="#FFFFFF"
              />

              <Text style={styles.callButtonText}>
                Call
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      ListEmptyComponent={
    !isLoading ? (
      isError ? (
        <View style={styles.centerErrorContainer}>
          <Ionicons
            name="cloud-offline-outline"
            size={52}
            color="#98A2B3"
          />

          <Text style={styles.errorTitle}>
            Unable to load leads
          </Text>

          <Text style={styles.errorSubtitle}>
            Please check your internet connection
            or try again later.
          </Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.retryButton}
            onPress={() => leadsQuery.refetch()}>
            <Text style={styles.retryButtonText}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.centerErrorContainer}>
          <Text style={styles.emptyText}>
            No leads found.
          </Text>
        </View>
      )
    ) : null
  }
    />

    {/* FAB */}
  <TouchableOpacity
    activeOpacity={0.9}
    style={[styles.fab, { bottom: insets.bottom + 90 }]}
    onPress={() => router.push('/modal')}>
    <Ionicons name="add" size={28} color="#FFFFFF" />
  </TouchableOpacity>

  </View>
</SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
  flex: 1,
  backgroundColor: '#F5F7FB',
},

container: {
  flex: 1,
  backgroundColor: '#F5F7FB',
},

scrollContent: {
  paddingHorizontal: 20,
  paddingTop: 8,
  paddingBottom: 140,
},

  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 22,
  },

  summaryCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.85,
  },

  summaryValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 8,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
  },

  sortLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#112A74',
  },

  leadCard: {
  backgroundColor: '#FFFFFF',
  borderRadius: 24,
  padding: 16,
  marginBottom: 12,

  borderWidth: 1,
  borderColor: 'rgba(15,23,42,0.06)',

  shadowColor: '#000',
  shadowOpacity: 0.03,
  shadowRadius: 6,
  shadowOffset: {
    width: 0,
    height: 4,
  },

  elevation: 1,
},

  leadTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  leadInfo: {
    flex: 1,
    paddingRight: 10,
  },

  leadName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },

  leadProduct: {
    fontSize: 14,
    color: '#667085',
    marginTop: 2,
  },

  stageBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  stageText: {
    fontSize: 12,
    fontWeight: '700',
  },

  amountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
  },

  amountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  amountText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },

  sourceText: {
    marginLeft: 'auto',
    fontSize: 12,
    color: '#434957',
  },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F6',
  },

  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  followUpText: {
    fontSize: 14,
    color: '#667085',
    fontWeight: '500',
  },

  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#112A74',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },

  callButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  fab: {
  position: 'absolute',
  right: 20,
  width: 56,
  height: 56,
  borderRadius: 28,
  backgroundColor: '#F97316',

  alignItems: 'center',
  justifyContent: 'center',

  shadowColor: '#F97316',
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: {
    width: 0,
    height: 6,
  },

  elevation: 30,
  zIndex: 999,
},
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
  },
  stateText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWrap: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
  },
  errorTitle: {
  marginTop: 16,
  fontSize: 18,
  fontWeight: '700',
  color: '#111827',
  textAlign: 'center',
},
centerErrorContainer: {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  paddingHorizontal: 32,
  paddingBottom: 120,
},

errorSubtitle: {
  marginTop: 8,
  fontSize: 14,
  lineHeight: 22,
  color: '#6B7280',
  textAlign: 'center',
},
retryButton: {
  marginTop: 24,
  height: 48,
  paddingHorizontal: 28,
  borderRadius: 14,
  backgroundColor: '#112A74',
  alignItems: 'center',
  justifyContent: 'center',
},

retryButtonText: {
  color: '#FFFFFF',
  fontSize: 14,
  fontWeight: '700',
},
});
