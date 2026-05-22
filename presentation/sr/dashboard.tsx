import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useCreateSrMutation } from '@/hooks/use-create-sr';
import type { CreateSrParams } from '@/domain/sr/create-sr-params';

type SRItem = {
  id: string;
  srNo: string;
  customer: string;
  phone: string;
  type: string;
  date: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Rejected';
};

const serviceTypes: { label: string; value: CreateSrParams['type'] }[] = [
  { label: 'Mobile Number Update', value: 'MOBILE_NUMBER_UPDATE' },
  { label: 'Issue New Debit Card', value: 'DEBIT_CARD_NEW' },
  { label: 'Cheque Book Request', value: 'CHEQUE_BOOK_REQUEST' },
  { label: 'PAN Updation', value: 'PAN_UPDATION' },
  { label: 'Aadhaar Updation', value: 'AADHAAR_UPDATION' },
  { label: 'Issue Certificate Updation', value: 'ISSUE_CERTIFICATE_UPDATION' },
];

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

function pad2(value: number) {
  return String(value).padStart(2, '0');
}

function formatMonthCode(now = new Date()) {
  const yy = String(now.getFullYear()).slice(-2);
  const mm = pad2(now.getMonth() + 1);
  return `${yy}${mm}`;
}

function formatReferenceNumber(params: { dateCreated?: string; serviceRequestNumber: string }) {
  const digits = (params.serviceRequestNumber ?? '').replace(/\D/g, '');
  const last3 = String(Number(digits || '0')).slice(-3).padStart(3, '0');
  const dateCreated = params.dateCreated;
  const monthCode = dateCreated && dateCreated.length >= 6 ? dateCreated.slice(2, 6) : formatMonthCode();
  return `SR-${monthCode}-${last3}`;
}

function formatNextLocalSr(existing: SRItem[]) {
  const monthCode = formatMonthCode();
  const max = existing.reduce((acc, item) => {
    const match = item.srNo.match(/SR-(\d{4})-(\d{3,4})/);
    if (!match) return acc;
    if (match[1] !== monthCode) return acc;
    return Math.max(acc, Number(match[2]));
  }, 0);
  return `SR-${monthCode}-${String(max + 1).padStart(3, '0')}`;
}

export function SrDashboardScreen() {
  const [requests, setRequests] = useState(initialRequests);
  const [view, setView] = useState<'list' | 'create' | 'success'>('list');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [selectedType, setSelectedType] = useState(serviceTypes[0]!);
  const [mobileNumber, setMobileNumber] = useState('');
  const [cifNumber, setCifNumber] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [remarks, setRemarks] = useState('');
  const [srFieldValue, setSrFieldValue] = useState('');
  const [showFieldMenu, setShowFieldMenu] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);
  const [uploadedDoc, setUploadedDoc] = useState<{
    uri: string;
    fileName: string;
    base64: string;
  } | null>(null);
  const insets = useSafeAreaInsets();
  const createSr = useCreateSrMutation();

  const srCount = requests.length;
  const latestSr = useMemo(() => formatNextLocalSr(requests), [requests]);
  const bottomSpacing = (insets.bottom || 0) + 24;
  const fabBottomSpacing = (insets.bottom || 0) + 10 + 88 + 16;

  const resetForm = useCallback(() => {
    setMobileNumber('');
    setCifNumber('');
    setAccountNumber('');
    setRemarks('');
    setSelectedType(serviceTypes[0]!);
    setShowTypeMenu(false);
    setSrFieldValue('');
    setShowFieldMenu(false);
    setSuccessRef(null);
    setUploadedDoc(null);
  }, []);

  const prepareBase64Image = async (asset: ImagePicker.ImagePickerAsset) => {
    const maxDimension = 1600;
    const width = asset.width ?? 0;
    const height = asset.height ?? 0;
    const scale = width && height ? Math.min(1, maxDimension / Math.max(width, height)) : 1;
    const targetWidth = width && scale < 1 ? Math.round(width * scale) : undefined;
    const targetHeight = height && scale < 1 ? Math.round(height * scale) : undefined;

    const result = await manipulateAsync(
      asset.uri,
      targetWidth && targetHeight ? [{ resize: { width: targetWidth, height: targetHeight } }] : [],
      { compress: 0.9, format: SaveFormat.JPEG, base64: true },
    );

    if (!result.base64) throw new Error('Unable to read image as base64');

    const fileName = asset.fileName || `document-${Date.now()}.jpg`;
    setUploadedDoc({ uri: result.uri, fileName, base64: result.base64 });
  };

  const pickFromGallery = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow photo library access to upload documents.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (!asset) return;
    await prepareBase64Image(asset);
  };

  const captureWithCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Allow camera access to capture documents.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 1, allowsEditing: true });
    if (res.canceled) return;
    const asset = res.assets?.[0];
    if (!asset) return;
    await prepareBase64Image(asset);
  };

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
    const mobileNo = mobileNumber.trim();
    const cifId = cifNumber.trim();
    const accNo = accountNumber.trim();
    if (!mobileNo && !cifId && !accNo) {
      Alert.alert('Missing details', 'Provide at least one: Mobile, CIF or Account number.');
      return;
    }

    if (
      selectedType.value === 'PAN_UPDATION' ||
      selectedType.value === 'AADHAAR_UPDATION' ||
      selectedType.value === 'ISSUE_CERTIFICATE_UPDATION'
    ) {
      if (!cifId) {
        Alert.alert('Missing CIF', 'CIF Number is required for this service request.');
        return;
      }
      const refValue = srFieldValue.trim();
      if (!refValue) {
        Alert.alert('Missing details', `Enter ${srFieldConfig.label}.`);
        return;
      }
      // if (!uploadedDoc?.base64 || !uploadedDoc.fileName) {
      //   Alert.alert('Document required', 'Capture or upload an image before submitting.');
      //   return;
      // }
        // document: { fileName: uploadedDoc.fileName, fileContentBase64: uploadedDoc.base64 },

      const common = {
        cifId
      } as const;

      const params: CreateSrParams =
        selectedType.value === 'PAN_UPDATION'
          ? { type: 'PAN_UPDATION', ...common, panNumber: refValue }
          : selectedType.value === 'AADHAAR_UPDATION'
            ? { type: 'AADHAAR_UPDATION', ...common, aadhaarNumber: refValue }
            : { type: 'ISSUE_CERTIFICATE_UPDATION', ...common, certificateRef: refValue };

      createSr.mutate(params, {
        onSuccess: (result) => {
          const srNo = formatReferenceNumber({
            dateCreated: result.dateCreated,
            serviceRequestNumber: result.serviceRequestNumber,
          });

          const newRequest: SRItem = {
            id: `${Date.now()}`,
            srNo,
            customer: 'New Customer',
            phone: mobileNumber || '+91 -',
            type: selectedType.label,
            date: 'Just now',
            status: 'Open',
          };

          setRequests((current) => [newRequest, ...current]);
          setSuccessRef(srNo);
          setView('success');
        },
        onError: (error) => {
          const message = error instanceof Error ? error.message : 'Please try again.';
          Alert.alert('Service request failed', message);
        },
      });
      return;
    }

    if (selectedType.value === 'CHEQUE_BOOK_REQUEST') {
      const noOfLeaves = (srFieldValue.trim() as '10' | '25' | '50' | '100') || '10';
      createSr.mutate(
        {
          type: 'CHEQUE_BOOK_REQUEST',
          accountNumber: "53240002254206",
          cifId,
          noOfLeaves,
        },
        {
          onSuccess: (result) => {
            const srNo = formatReferenceNumber({
              dateCreated: result.dateCreated,
              serviceRequestNumber: result.serviceRequestNumber,
            });

            const newRequest: SRItem = {
              id: `${Date.now()}`,
              srNo,
              customer: 'New Customer',
              phone: mobileNumber || '+91 -',
              type: 'Cheque Book Request',
              date: 'Just now',
              status: 'Open',
            };

            setRequests((current) => [newRequest, ...current]);
            setSuccessRef(srNo);
            setView('success');
          },
          onError: (error) => {
            const message = error instanceof Error ? error.message : 'Please try again.';
            Alert.alert('Service request failed', message);
          },
        },
      );
      return;
    }

    const newRequest: SRItem = {
      id: `${Date.now()}`,
      srNo: latestSr,
      customer: 'New Customer',
      phone: mobileNumber || '+91 -',
      type: selectedType.label,
      date: 'Just now',
      status: 'Open',
    };

    setRequests((current) => [newRequest, ...current]);
    resetForm();
    setView('list');
  };

  const srFieldConfig = useMemo(() => {
    if (selectedType.value === 'MOBILE_NUMBER_UPDATE') {
      return { label: 'New mobile number', kind: 'text' as const, keyboardType: 'number-pad' as const, options: [] as string[] };
    }
    if (selectedType.value === 'DEBIT_CARD_NEW') {
      return { label: 'Card variant', kind: 'select' as const, keyboardType: 'default' as const, options: ['Classic', 'Platinum', 'Business'] };
    }
    if (selectedType.value === 'CHEQUE_BOOK_REQUEST') {
      return { label: 'Number of leaves', kind: 'select' as const, keyboardType: 'default' as const, options: ['10', '25', '50', '100'] };
    }
    if (selectedType.value === 'PAN_UPDATION') {
      return { label: 'PAN Number', kind: 'text' as const, keyboardType: 'default' as const, options: [] as string[] };
    }
    if (selectedType.value === 'AADHAAR_UPDATION') {
      return { label: 'Aadhaar Number', kind: 'text' as const, keyboardType: 'number-pad' as const, options: [] as string[] };
    }
    if (selectedType.value === 'ISSUE_CERTIFICATE_UPDATION') {
      return { label: 'Certificate Reference', kind: 'text' as const, keyboardType: 'default' as const, options: [] as string[] };
    }
    return { label: 'Request detail', kind: 'text' as const, keyboardType: 'default' as const, options: [] as string[] };
  }, [selectedType.value]);

  React.useEffect(() => {
    if (srFieldValue) return;
    if (selectedType.value === 'CHEQUE_BOOK_REQUEST') setSrFieldValue('10');
    if (selectedType.value === 'DEBIT_CARD_NEW') setSrFieldValue('Classic');
  }, [selectedType.value, srFieldValue]);

  if (view === 'success') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
        
        <View style={[styles.formScreen, { paddingBottom: bottomSpacing }]}>
          <View style={styles.successIconWrap}>
            <View style={styles.successIconCircle}>
              <Ionicons name="checkmark" size={44} color="#0F7A3A" />
            </View>
          </View>

          <Text style={styles.successTitle}>Service Request Created Successfully</Text>
          <Text style={styles.successSubtitle}>Reference Number</Text>
          <Text style={styles.successRef}>{successRef ?? 'SR-—'}</Text>

          <Pressable
            style={[styles.submitButton, { marginTop: 28 }]}
            onPress={() => {
              resetForm();
              setView('create');
            }}>
            <Text style={styles.submitButtonText}>Create Another</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => {
              resetForm();
              setView('list');
            }}>
            <Text style={styles.secondaryButtonText}>Go to Service Requests</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.selectValue}>{selectedType.label}</Text>
              <Ionicons name="chevron-down" size={20} color="#1B348B" />
            </Pressable>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Additional Details</Text>
            <Text style={styles.fieldLabel}>{srFieldConfig.label}</Text>
            {srFieldConfig.kind === 'select' ? (
              <Pressable style={styles.selectField} onPress={() => setShowFieldMenu(true)}>
                <Text style={styles.selectValue}>{srFieldValue || 'Select'}</Text>
                <Ionicons name="chevron-down" size={20} color="#1B348B" />
              </Pressable>
            ) : (
              <TextInput
                style={styles.input}
                placeholder="Enter value"
                placeholderTextColor="#8090B0"
                value={srFieldValue}
                onChangeText={setSrFieldValue}
                keyboardType={srFieldConfig.keyboardType}
              />
            )}

            {(selectedType.value === 'PAN_UPDATION' ||
              selectedType.value === 'AADHAAR_UPDATION' ||
              selectedType.value === 'ISSUE_CERTIFICATE_UPDATION') ? (
              <View style={{ marginTop: 14 }}>
                <Text style={styles.fieldLabel}>Upload document image</Text>

                <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                  <Pressable
                    style={[styles.secondaryButton, { flex: 1, marginTop: 0 }]}
                    onPress={() => {
                      captureWithCamera().catch((e) => {
                        const message = e instanceof Error ? e.message : 'Please try again.';
                        Alert.alert('Camera failed', message);
                      });
                    }}>
                    <Text style={styles.secondaryButtonText}>Capture</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.secondaryButton, { flex: 1, marginTop: 0 }]}
                    onPress={() => {
                      pickFromGallery().catch((e) => {
                        const message = e instanceof Error ? e.message : 'Please try again.';
                        Alert.alert('Upload failed', message);
                      });
                    }}>
                    <Text style={styles.secondaryButtonText}>Upload</Text>
                  </Pressable>
                </View>

                {uploadedDoc ? (
                  <View style={{ marginTop: 12 }}>
                    <Text style={{ color: '#0F172A', fontWeight: '700' }}>{uploadedDoc.fileName}</Text>
                    <View
                      style={{
                        marginTop: 8,
                        borderRadius: 12,
                        overflow: 'hidden',
                        borderWidth: 1,
                        borderColor: '#E2E8F0',
                      }}>
                      <Image
                        source={{ uri: uploadedDoc.uri }}
                        style={{ width: '100%', height: 180 }}
                        resizeMode="cover"
                      />
                    </View>
                    <Pressable
                      style={[styles.secondaryButton, { marginTop: 10 }]}
                      onPress={() => setUploadedDoc(null)}>
                      <Text style={styles.secondaryButtonText}>Remove</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null}

            <Text style={[styles.fieldLabel, { marginTop: 16 }]}>Remarks</Text>
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

          <Pressable style={[styles.submitButton, {marginBottom: bottomSpacing}]} onPress={handleSubmit} disabled={createSr.isPending}>
            <Text style={styles.submitButtonText}>
              {createSr.isPending ? 'Submitting…' : 'Submit Service Request'}
            </Text>
          </Pressable>
        </ScrollView>

        <Modal visible={showTypeMenu} transparent animationType="fade" onRequestClose={() => setShowTypeMenu(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowTypeMenu(false)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Choose request type</Text>
              {serviceTypes.map((type) => (
                <Pressable
                  key={type.value}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedType(type);
                    setShowTypeMenu(false);
                    setSrFieldValue('');
                    setUploadedDoc(null);
                  }}>
                  <Text style={styles.modalOptionText}>{type.label}</Text>
                </Pressable>
              ))}
            </View>
          </Pressable>
        </Modal>

        <Modal visible={showFieldMenu} transparent animationType="fade" onRequestClose={() => setShowFieldMenu(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowFieldMenu(false)}>
            <View style={styles.modalSheet}>
              <Text style={styles.modalTitle}>Choose {srFieldConfig.label}</Text>
              {srFieldConfig.options.map((opt) => (
                <Pressable
                  key={opt}
                  style={styles.modalOption}
                  onPress={() => {
                    setSrFieldValue(opt);
                    setShowFieldMenu(false);
                  }}>
                  <Text style={styles.modalOptionText}>{opt}</Text>
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
          contentContainerStyle={[styles.listContent, { paddingBottom: fabBottomSpacing + 72 }]}
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

        <Pressable style={[styles.fab, { bottom: fabBottomSpacing }]} onPress={handleCreatePress}>
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
  secondaryButton: {
    minHeight: 62,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D7DEEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryButtonText: {
    color: '#142A60',
    fontSize: 18,
    fontWeight: '800',
  },
  successIconWrap: {
    marginTop: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(15, 122, 58, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    marginTop: 22,
    fontSize: 30,
    fontWeight: '900',
    color: '#142A60',
    textAlign: 'center',
    paddingHorizontal: 22,
  },
  successSubtitle: {
    marginTop: 18,
    fontSize: 18,
    fontWeight: '700',
    color: '#61729A',
    textAlign: 'center',
  },
  successRef: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: '900',
    color: '#142A60',
    textAlign: 'center',
    letterSpacing: 0.4,
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
