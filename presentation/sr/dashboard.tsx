import { Ionicons } from '@expo/vector-icons';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

type SRItem = {
  id: string;
  srNo: string;
  customer: string;
  phone: string;
  type: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Rejected';
};

const serviceTypes = ['PAN Update', 'Address Change', 'Cheque Book Request', 'Mobile Number Update'];

const initialRequests: SRItem[] = [
  {
    id: '1',
    srNo: 'SR-2410-0091',
    customer: 'Anjali Menon',
    phone: '+91 98470 12345',
    type: 'PAN Update',
    date: '02 May 2026, 10:42 AM',
    status: 'In Progress',
  },
  {
    id: '2',
    srNo: 'SR-2410-0090',
    customer: 'Rahul Pillai',
    phone: '+91 99461 22210',
    type: 'Address Change',
    date: '02 May 2026, 09:15 AM',
    status: 'Open',
  },
  {
    id: '3',
    srNo: 'SR-2410-0088',
    customer: 'Suma Ravi',
    phone: '+91 90370 55821',
    type: 'Cheque Book Request',
    date: '01 May 2026, 04:20 PM',
    status: 'Completed',
  },
  {
    id: '4',
    srNo: 'SR-2410-0087',
    customer: 'Mohammed Irfan',
    phone: '+91 95620 88412',
    type: 'Mobile Number Update',
    date: '01 May 2026, 11:08 AM',
    status: 'Rejected',
  },
  {
    id: '5',
    srNo: 'SR-2410-0085',
    customer: 'Meera Nair',
    phone: '+91 98950 11002',
    type: 'PAN Update',
    date: '01 May 2026, 10:12 AM',
    status: 'In Progress',
  },
  {
    id: '6',
    srNo: 'SR-2410-0083',
    customer: 'Arun Kumar',
    phone: '+91 98765 43210',
    type: 'Address Change',
    date: '30 Apr 2026, 05:48 PM',
    status: 'Open',
  },
];

const statusStyles: Record<SRItem['status'], { bg: string; fg: string }> = {
  Open: { bg: '#EDF2FF', fg: '#1B348B' },
  'In Progress': { bg: '#FFF4E6', fg: '#B45309' },
  Completed: { bg: '#E9F9EE', fg: '#0F7A3A' },
  Rejected: { bg: '#FDECEC', fg: '#B42318' },
};

function formatNextSr(existing: SRItem[]) {
  const max = existing.reduce((acc, item) => {
    const match = item.srNo.match(/SR-(\d+)-(\d+)/);
    if (!match) return acc;
    return Math.max(acc, Number(match[2]));
  }, 0);

  return `SR-2410-${String(max + 1).padStart(4, '0')}`;
}

export function SrDashboardScreen() {
  const [requests, setRequests] = useState(initialRequests);
  const [view, setView] = useState<'list' | 'create'>('list');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [selectedType, setSelectedType] = useState(serviceTypes[0]);
  const [mobileNumber, setMobileNumber] = useState('');
  const [cifNumber, setCifNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const tabBarHeight = useBottomTabBarHeight();

  const srCount = requests.length;
  const latestSr = useMemo(() => formatNextSr(requests), [requests]);
  const bottomSpacing = tabBarHeight + 24;

  const resetForm = useCallback(() => {
    setMobileNumber('');
    setCifNumber('');
    setAccountNumber('');
    setRemarks('');
    setSelectedType(serviceTypes[0]);
    setShowTypeMenu(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      setView('list');
      resetForm();
    }, [resetForm]),
  );

  const handleCreatePress = () => {
    resetForm();
    setView('create');
  };

  const handleSubmit = () => {
    const newRequest: SRItem = {
      id: `${Date.now()}`,
      srNo: latestSr,
      customer: 'New Customer',
      phone: mobileNumber || '+91 -',
      type: selectedType,
      date: 'Just now',
      status: 'Open',
    };

    setRequests((current) => [newRequest, ...current]);
    resetForm();
    setView('list');
  };

  if (view === 'create') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        <ScrollView
          contentContainerStyle={[styles.formScreen, { paddingBottom: bottomSpacing }]}
          showsVerticalScrollIndicator
          keyboardShouldPersistTaps="handled">

          <Text style={styles.pageTitle}>Create Service Request</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Customer Identification</Text>
            <Text style={styles.cardSubtitle}>Enter at least one identifier</Text>

            <Text style={styles.fieldLabel}>Mobile Number</Text>
            <TextInput
              style={styles.input}
              placeholder="+91 ..."
              placeholderTextColor="#8090B0"
              value={mobileNumber}
              onChangeText={setMobileNumber}
              keyboardType="phone-pad"
            />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={styles.fieldLabel}>CIF Number</Text>
            <TextInput
              style={styles.input}
              placeholder="CIF ID"
              placeholderTextColor="#8090B0"
              value={cifNumber}
              onChangeText={setCifNumber}
            />

            <View style={styles.orRow}>
              <View style={styles.orLine} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.orLine} />
            </View>

            <Text style={styles.fieldLabel}>Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="13-digit account number"
              placeholderTextColor="#8090B0"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Service Request Type</Text>
            <Text style={styles.cardSubtitle}>Select Service Request Type</Text>
            <Pressable style={styles.selectField} onPress={() => setShowTypeMenu(true)}>
              <Text style={styles.selectValue}>{selectedType}</Text>
              <Ionicons name="chevron-down" size={20} color="#1B348B" />
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Additional Details</Text>
            <Text style={styles.fieldLabel}>Remarks</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Add notes for this request"
              placeholderTextColor="#8090B0"
              multiline
              value={remarks}
              onChangeText={setRemarks}
              textAlignVertical="top"
            />
          </View>

          <Pressable style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Submit Service Request</Text>
          </Pressable>
        </ScrollView>

        <Modal visible={showTypeMenu} transparent animationType="fade" onRequestClose={() => setShowTypeMenu(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTypeMenu(false)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Choose request type</Text>
              {serviceTypes.map((type) => (
                <Pressable
                  key={type}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypeMenu(false);
                  }}>
                  <Text style={styles.modalOptionText}>{type}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={[ 'left', 'right']}>
      <View style={styles.listScreen}>
        <View style={styles.hero}>
          <View style={styles.heroTitleRow}>
            <View>
              <Text style={styles.pageTitle}>Service Requests</Text>
              <Text style={styles.countText}>{srCount} service requests</Text>
            </View>
            <Pressable style={styles.searchButton} accessibilityRole="button" onPress={() => {}}>
              <Ionicons name="search" size={28} color="#1B348B" />
            </Pressable>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.listContent, { paddingBottom: bottomSpacing + 72 }]}
          showsVerticalScrollIndicator
          bounces={false}
          keyboardShouldPersistTaps="handled">
          {requests.map((request) => {
            const badge = statusStyles[request.status];

            return (
              <View key={request.id} style={styles.requestCard}>
                <View style={styles.requestTopRow}>
                  <View style={styles.requestTopLeft}>
                    <Text style={styles.srNo}>{request.srNo}</Text>
                    <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                      <Text style={[styles.badgeText, { color: badge.fg }]}>{request.status}</Text>
                    </View>
                  </View>
                  <Pressable style={styles.iconButton}>
                    <Ionicons name="eye-outline" size={22} color="#1B348B" />
                  </Pressable>
                </View>

                <Text style={styles.customerName}>{request.customer}</Text>
                <Text style={styles.phoneText}>{request.phone}</Text>
                <Text style={styles.typeText}>{request.type}</Text>
                <Text style={styles.dateText}>{request.date}</Text>
              </View>
            );
          })}
          <View style={styles.spacer} />
        </ScrollView>

        <Pressable style={[styles.fab, { bottom: bottomSpacing }]} onPress={handleCreatePress}>
          <Ionicons name="add" size={26} color="#FFFFFF" />
          <Text style={styles.fabText}>New SR</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  listScreen: {
    flex: 1,
    backgroundColor: '#F4F7FB',
  },
  hero: {
  paddingHorizontal: 20,
  paddingTop: 0,
  paddingBottom: 12,
  backgroundColor: '#F8FAFC',
},
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 92,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0F172A',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  brandShort: {
    fontSize: 19,
    fontWeight: '900',
    color: '#E53A2F',
    letterSpacing: 0.6,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#C8D4EA',
  },
  brandSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: '#D8E2F4',
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#F97316',
    marginTop: 12,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#142A60',
    paddingBottom: 10,
  },
  countText: {
    marginTop: 8,
    fontSize: 17,
    color: '#667085',
    fontWeight: '500',
  },
  searchButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E9EFFA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    shadowColor: '#0F172A',
    shadowOpacity: 0.03,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  requestTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  requestTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    maxWidth: '78%',
  },
  srNo: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1B348B',
    letterSpacing: 0.2,
  },
  badge: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '700',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 26,
    backgroundColor: '#EDF3FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerName: {
    marginTop: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  phoneText: {
    marginTop: 4,
    fontSize: 16,
    color: '#667085',
    fontWeight: '600',
  },
  typeText: {
    marginTop: 8,
    fontSize: 16,
    color: '#667085',
  },
  dateText: {
    marginTop: 8,
    fontSize: 15,
    color: '#667085',
  },
  spacer: {
    height: 40,
  },
  fab: {
    position: 'absolute',
    right: 18,
    backgroundColor: '#F97316',
    borderRadius: 30,
    minHeight: 58,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#0F172A',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  formScreen: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 42,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginTop: 4,
    marginBottom: 14,
    gap: 2,
  },
  backText: {
    fontSize: 18,
    color: '#1B348B',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E6EAF2',
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#142A60',
  },
  cardSubtitle: {
    marginTop: 8,
    fontSize: 16,
    color: '#667085',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 16,
    color: '#667085',
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7DEEA',
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 17,
    color: '#142A60',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#D7DEEA',
  },
  orText: {
    fontSize: 14,
    color: '#667085',
    fontWeight: '700',
  },
  selectField: {
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7DEEA',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  selectValue: {
    fontSize: 17,
    color: '#142A60',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 146,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7DEEA',
    paddingHorizontal: 16,
    paddingTop: 14,
    backgroundColor: '#FFFFFF',
    fontSize: 17,
    color: '#142A60',
  },
  submitButton: {
    minHeight: 62,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 28,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#142A60',
    marginBottom: 12,
  },
  modalOption: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEF2F7',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#1B348B',
    fontWeight: '600',
  },
});