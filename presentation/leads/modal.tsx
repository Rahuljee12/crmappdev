import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCreateLeadMutation } from '@/hooks/use-create-lead';
import { useSendLeadOtpMutation } from '@/hooks/use-send-lead-otp';
import { useVerifyLeadOtpMutation } from '@/hooks/use-verify-lead-otp';
import { useGenerateAadhaarOtpMutation } from '@/hooks/use-generate-aadhaar-otp';
import { useAuthenticateAadhaarOtpMutation } from '@/hooks/use-authenticate-aadhaar-otp';
import { useFetchAadhaarDetailsMutation } from '@/hooks/use-fetch-aadhaar-details';
import { useValidatePanMutation } from '@/hooks/use-validate-pan';
import { log } from '@/core/utils/logger';
import { encryptAadhaarUid } from '@/core/ekyc/aadhaar-crypto';
import { generateUidaiOtpAuthBlock } from '@/core/ekyc/uidai-pidblock';
import {
  extractLeadPrefillFromAadhaarAuthenticateResponse,
  type AadhaarLeadPrefill,
} from '@/core/ekyc/aadhaar-kyc';

type Step = 1 | 2 | 3;

const LEAD_SOURCES = ['Walk-in', 'Referral', 'Campaign', 'Branch Visit'];
const CUSTOMER_TYPES = ['Individual', 'Non-individual'];
const SUB_TYPES = ['Retail', 'Joint', 'NRI'];
const INCOME_BANDS = ['Below 2L', '2-5L', '5-10L', '10-25L', '25L+'];
const PRODUCT_TYPES = ['Savings', 'Current', 'Term Deposit', 'Recurring Deposit', 'Personal Loan', 'Mortgage Loan'];
const DOCUMENT_TYPES = ['Aadhaar', 'PAN'];
const OTP_DIGITS = Array.from({ length: 6 }, (_, index) => index);

const SCREEN_SCALE = Math.min(Math.max(Dimensions.get('window').width / 390, 0.9), 1.08);
const S = (value: number) => Math.round(value * SCREEN_SCALE);

type ProductCode = {
  label: string;
  code: string;
  name: string;
  subtitle: string;
  details: { label: string; value: string }[];
};

const PRODUCT_CODES: ProductCode[] = [
  {
    label: 'Select code',
    code: '',
    name: 'Select code',
    subtitle: 'Choose a product code',
    details: [],
  },
  {
    label: 'P101 · LALIT',
    code: 'P101',
    name: 'LALIT',
    subtitle: 'Basic Savings',
    details: [
      { label: 'INTEREST', value: '3.50% p.a.' },
      { label: 'MAB', value: '₹500' },
      { label: 'FREE CHEQUES', value: '20/yr' },
      { label: 'DEBIT CARD', value: 'Classic' },
    ],
  },
  {
    label: 'P103 · Mahila Sree',
    code: 'P103',
    name: 'Mahila Sree',
    subtitle: 'Women Savings',
    details: [
      { label: 'INTEREST', value: '3.75% p.a.' },
      { label: 'MAB', value: '₹1,000' },
      { label: 'FREE CHEQUES', value: '25/yr' },
      { label: 'DEBIT CARD', value: 'Platinum' },
    ],
  },
  {
    label: 'P106 · Pearl Savings',
    code: 'P106',
    name: 'Pearl Savings',
    subtitle: 'Preferred Savings',
    details: [
      { label: 'INTEREST', value: '4.00% p.a.' },
      { label: 'MAB', value: '₹2,000' },
      { label: 'FREE CHEQUES', value: '30/yr' },
      { label: 'DEBIT CARD', value: 'Gold' },
    ],
  },
  {
    label: 'P107 · Salary Account',
    code: 'P107',
    name: 'Salary Account',
    subtitle: 'Salary Savings',
    details: [
      { label: 'INTEREST', value: '3.25% p.a.' },
      { label: 'MAB', value: 'NIL' },
      { label: 'FREE CHEQUES', value: '15/yr' },
      { label: 'DEBIT CARD', value: 'Classic' },
    ],
  },
];

export function NewLeadModalScreen() {
  const params = useLocalSearchParams<{ mobile?: string | string[] }>();
  const { width: windowWidth } = useWindowDimensions();
  const initialMobile =
    typeof params.mobile === 'string'
      ? params.mobile
      : Array.isArray(params.mobile)
        ? params.mobile[0] ?? ''
        : '';

  const [step, setStep] = useState<Step>(1);
  const [mobile, setMobile] = useState(initialMobile);
  const [leadSource, setLeadSource] = useState('Select source');
  const [leadSourceOpen, setLeadSourceOpen] = useState(false);
  const [incomeBand, setIncomeBand] = useState('Select band');
  const [incomeBandOpen, setIncomeBandOpen] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpRequestId, setOtpRequestId] = useState<string | null>(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const [consents, setConsents] = useState([false, false, false]);
  const [customerType, setCustomerType] = useState('Select type');
  const [customerTypeOpen, setCustomerTypeOpen] = useState(false);
  const [subType, setSubType] = useState('Select sub-type');
  const [subTypeOpen, setSubTypeOpen] = useState(false);
  const [documentType, setDocumentType] = useState('Aadhaar');
  const [documentTypeOpen, setDocumentTypeOpen] = useState(false);
  const [documentNumber, setDocumentNumber] = useState('');
  const [identityOtpSent, setIdentityOtpSent] = useState(false);
  const [identityOtpDigits, setIdentityOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [aadhaarTxn, setAadhaarTxn] = useState<string | null>(null);
  const [aadhaarOtpVerified, setAadhaarOtpVerified] = useState(false);
  const [aadhaarAuth, setAadhaarAuth] = useState<{
    skey?: { ci?: string; value?: string };
    data?: { type?: string; value?: string };
    hmac?: string;
  } | null>(null);
  const [aadhaarLeadPrefill, setAadhaarLeadPrefill] = useState<AadhaarLeadPrefill | null>(null);
  const [aadhaarFlowLoading, setAadhaarFlowLoading] = useState(false);
  const [panNumber, setPanNumber] = useState('');
  const [panFullName, setPanFullName] = useState('');
  const [panFatherName, setPanFatherName] = useState('');
  const [panDob, setPanDob] = useState(''); // YYYY-MM-DD
  const [panValidated, setPanValidated] = useState(false);
  const [productType, setProductType] = useState('Savings');
  const [productTypeOpen, setProductTypeOpen] = useState(false);
  const [productCode, setProductCode] = useState('P101 · LALIT');
  const [productCodeOpen, setProductCodeOpen] = useState(false);

  const otpRefs = useRef<(TextInput | null)[]>([]);
  const identityOtpRefs = useRef<(TextInput | null)[]>([]);
  const scrollRef = useRef<ScrollView | null>(null);
  const otpCardY = useRef(0);
  const identityOtpCardY = useRef(0);
  const otpScrollHandled = useRef(false);
  const identityOtpScrollHandled = useRef(false);

  const canSendOtp = consents.every(Boolean) && mobile.trim().length === 10;
  const otpComplete = otpDigits.every((digit) => digit.length === 1);
  const otpValue = otpDigits.join('');
  const identityOtpComplete = identityOtpDigits.every((digit) => digit.length === 1);
  const identityOtpValue = identityOtpDigits.join('');
  const panFormComplete =
    panNumber.trim().length === 10 &&
    panFullName.trim().length > 0 &&
    panFatherName.trim().length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(panDob.trim());

  const otpSlotWidth = Math.max(34, Math.min(46, Math.floor((windowWidth - 100) / 6)));

  const selectedProductCode =
    PRODUCT_CODES.find((item) => item.label === productCode) ?? PRODUCT_CODES[1];
  const createLead = useCreateLeadMutation();
  const sendOtp = useSendLeadOtpMutation();
  const verifyOtp = useVerifyLeadOtpMutation();
  const generateAadhaarOtp = useGenerateAadhaarOtpMutation();
  const authenticateAadhaarOtp = useAuthenticateAadhaarOtpMutation();
  const fetchAadhaarDetails = useFetchAadhaarDetailsMutation();
  const validatePan = useValidatePanMutation();

  const isAnyApiPending =
    sendOtp.isPending ||
    verifyOtp.isPending ||
    createLead.isPending ||
    generateAadhaarOtp.isPending ||
    authenticateAadhaarOtp.isPending ||
    fetchAadhaarDetails.isPending ||
    aadhaarFlowLoading ||
    validatePan.isPending;

  const progressWidth = useMemo(() => {
    if (step === 1) return [1, 0, 0];
    if (step === 2) return [1, 1, 0];
    return [1, 1, 1];
  }, [step]);

  const goBack = () => {
    if (step === 1) {
      router.back();
      return;
    }
    setStep((current) => Math.max(1, current - 1) as Step);
  };

  const onNext = () => {
    setStep((current) => Math.min(3, current + 1) as Step);
  };

  const handleStep2PrimaryCta = async () => {
    if (step !== 2) return;

    if (documentType === 'PAN') {
      if (!panValidated) {
        if (!panFormComplete) {
          Alert.alert('PAN validation', 'Enter PAN, Name, Father name and DOB (YYYY-MM-DD).');
          return;
        }

        try {
          const response = await validatePan.mutateAsync({
            pan: panNumber.trim(),
            name: panFullName.trim(),
            fathername: panFatherName.trim(),
            dob: panDob.trim(),
          });

          const statusCode = (response as any)?.status?.[0]?.statusCode ?? '';
          const statusOk = !statusCode || statusCode === '000';
          // Best-effort interpretation; backend response shape may vary.
          const anyTrue =
            (response as any)?.response?.outputData?.[0]?.status === true ||
            (response as any)?.response?.outputData?.[0]?.isValid === true ||
            (response as any)?.response?.outputData?.[0]?.panStatus === true ||
            (response as any)?.response?.outputData?.[0]?.panStatus === 'true';

          if (statusOk && anyTrue) {
            setPanValidated(true);
            return;
          }

          Alert.alert('PAN validation failed', (response as any)?.status?.[0]?.statusMessage ?? 'Please try again.');
          setPanValidated(false);
          return;
        } catch (error) {
          log.error('pan validation failed', error);
          Alert.alert('PAN validation failed', 'Please try again.');
          setPanValidated(false);
          return;
        }
      }

      onNext();
      return;
    }

    onNext();
  };

  const closeMenus = () => {
    setLeadSourceOpen(false);
    setIncomeBandOpen(false);
    setCustomerTypeOpen(false);
    setSubTypeOpen(false);
    setDocumentTypeOpen(false);
    setProductTypeOpen(false);
    setProductCodeOpen(false);
  };

  const handleSubmitLead = () => {
    if (!otpVerified || !otpRequestId) {
      Alert.alert('OTP verification required', 'Verify the OTP before submitting.');
      return;
    }

    if (documentType === 'Aadhaar') {
      if (!aadhaarOtpVerified) {
        Alert.alert('Aadhaar verification required', 'Verify Aadhaar OTP before submitting.');
        return;
      }
      // if (!aadhaarLeadPrefill?.permanentAddressStreet || !aadhaarLeadPrefill?.permanentAddressPostalCode) {
      //   Alert.alert(
      //     'Aadhaar details missing',
      //     'Unable to read name/address from Aadhaar response. Please try verifying again.',
      //   );
      //   return;
      // }
    }
    if (documentType === 'PAN') {
      if (!panValidated) {
        Alert.alert('PAN validation required', 'Validate PAN before submitting.');
        return;
      }
    }

    if (createLead.isPending) return;



    const mobileNumber = mobile.trim();
    const interestedProduct =
      productType === 'Savings'
        ? 'SA'
        : productType === 'Current'
          ? 'CA'
          : productType === 'Term Deposit'
            ? 'FD'
            : productType === 'Recurring Deposit'
              ? 'RD'
              : productType === 'Personal Loan'
                ? 'PL'
                : productType === 'Mortgage Loan'
                  ? 'ML'
                  : 'SA';


    const extractedCode =
      selectedProductCode.code.replace(/\D/g, '') || '3008';

    createLead.mutate(
      {
        mobileNumber,
        leadSource: leadSource === 'Select source' ? 'Walk-in' : leadSource,
        interestedProduct,
        productCode: extractedCode,
        ...(documentType === 'Aadhaar'
          ? (aadhaarLeadPrefill ?? undefined)
          : documentType === 'PAN'
            ? {
                firstName: panFullName.trim(),
                panNumber: panNumber.trim(),
                fatherName: panFatherName.trim(),
                dob: panDob.trim(),
              }
            : undefined),
      },
      {
        onSuccess: () => {
          router.back();
        },
        onError: () => {
          Alert.alert('Lead creation failed', 'Please try again.');
        },
      },
    );
  };

  const profileName = useMemo(() => {
    if (documentType === 'PAN') {
      const v = panFullName.trim();
      return v || '—';
    }
    const first = aadhaarLeadPrefill?.firstName?.trim();
    const last = aadhaarLeadPrefill?.lastName?.trim();
    const full = [first, last].filter(Boolean).join(' ');
    return full || '—';
  }, [aadhaarLeadPrefill?.firstName, aadhaarLeadPrefill?.lastName, documentType, panFullName]);

  const profileGender = useMemo(() => {
    if (documentType === 'PAN') return '—';
    const gender = aadhaarLeadPrefill?.gender?.trim();
    if (!gender) return '—';
    const g = gender.toUpperCase();
    if (g === 'M') return 'Male';
    if (g === 'F') return 'Female';
    if (g === 'T') return 'Transgender';
    return gender;
  }, [aadhaarLeadPrefill?.gender, documentType]);

  const handleOtpChange = (value: string, index: number) => {
    const nextValue = value.replace(/\D/g, '').slice(0, 1);
    setOtpDigits((current) => {
      const updated = [...current];
      updated[index] = nextValue;
      return updated;
    });

    if (nextValue && index < otpRefs.current.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleIdentityOtpChange = (value: string, index: number) => {
    const nextValue = value.replace(/\D/g, '').slice(0, 1);
    setIdentityOtpDigits((current) => {
      const updated = [...current];
      updated[index] = nextValue;
      return updated;
    });

    if (nextValue && index < identityOtpRefs.current.length - 1) {
      identityOtpRefs.current[index + 1]?.focus();
    }
  };

  const handleIdentityOtpKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !identityOtpDigits[index] && index > 0) {
      identityOtpRefs.current[index - 1]?.focus();
    }
  };

  const scrollToSection = (y: number) => {
    scrollRef.current?.scrollTo({
      y: Math.max(0, y - 140),
      animated: true,
    });
  };

  const handleOtpFocus = () => {
    if (otpScrollHandled.current) return;
    otpScrollHandled.current = true;
    requestAnimationFrame(() => {
      scrollToSection(otpCardY.current);
    });
  };

  const handleIdentityOtpFocus = () => {
    if (identityOtpScrollHandled.current) return;
    identityOtpScrollHandled.current = true;
    requestAnimationFrame(() => {
      scrollToSection(identityOtpCardY.current);
    });
  };

  useEffect(() => {
    if (!otpSent) otpScrollHandled.current = false;
  }, [otpSent]);

  useEffect(() => {
    if (!identityOtpSent) identityOtpScrollHandled.current = false;
  }, [identityOtpSent]);

  useEffect(() => {
    setDocumentNumber('');
    setIdentityOtpSent(false);
    setIdentityOtpDigits(Array(6).fill(''));
    setAadhaarTxn(null);
    setAadhaarOtpVerified(false);
    setAadhaarAuth(null);
    setAadhaarLeadPrefill(null);
    setPanNumber('');
    setPanFullName('');
    setPanFatherName('');
    setPanDob('');
    setPanValidated(false);
  }, [documentType]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        {isAnyApiPending ? (
          <View style={styles.apiLoaderOverlay}>
            <ActivityIndicator size="large" color="#FFFFFF" />
            <Text style={styles.apiLoaderText}>Please wait…</Text>
          </View>
        ) : null}

        <View style={styles.topBar}>
          <TouchableOpacity activeOpacity={0.85} style={styles.backPill} onPress={goBack}>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.brandBlock}>
            <Text style={styles.brandTitle}>ESAF</Text>
            <Text style={styles.brandSubtitle}>Joy of Banking</Text>
          </View>

          <View style={styles.backSpacer} />
        </View>

        <KeyboardAvoidingView
          style={styles.contentShell}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={56}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <Text style={styles.title}>New lead</Text>
            <Text style={styles.stepLabel}>
              {step === 1
                ? 'Step 1 of 3 · Capture contact'
                : step === 2
                  ? 'Step 2 of 3 · Capture identity'
                  : 'Step 3 of 3 · Pick product'}
            </Text>

            <View style={styles.progressRow}>
              {progressWidth.map((width, index) => (
                <View key={String(index)} style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${width * 100}%`,
                        opacity: index <= step - 1 ? 1 : 0,
                      },
                    ]}
                  />
                </View>
              ))}
            </View>

            {step === 1 ? (
              <View style={styles.stack}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Customer mobile</Text>

                  <View style={styles.inlineRow}>
                    <Pressable style={[styles.selectField, styles.countryField]}>
                      <Text style={styles.fieldText}>+91</Text>
                      <Ionicons name="chevron-down" size={18} color="#334155" />
                    </Pressable>

                    <TextInput
                      value={mobile}
                      onChangeText={setMobile}
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="10-digit number"
                      placeholderTextColor="#7B869B"
                      style={[styles.textField, styles.mobileField]}
                    />
                  </View>

                  <Text style={styles.fieldLabel}>Lead source</Text>
                  <View style={[styles.dropdownWrap, styles.dropdownWrapFull]}>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => {
                        Keyboard.dismiss();
                        closeMenus();
                        setLeadSourceOpen((current) => !current);
                      }}>
                      <Text style={styles.fieldText}>{leadSource}</Text>
                      <Ionicons name="chevron-down" size={S(18)} color="#334155" />
                    </Pressable>
                    {leadSourceOpen ? (
                      <View style={styles.dropdownMenuFull}>
                        {LEAD_SOURCES.map((source) => (
                          <Pressable
                            key={source}
                            onPress={() => {
                              setLeadSource(source);
                              setLeadSourceOpen(false);
                            }}
                            style={[styles.dropdownItem, leadSource === source && styles.dropdownItemActive]}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                leadSource === source && styles.dropdownItemTextActive,
                              ]}>
                              {source}
                            </Text>
                            {leadSource === source ? (
                              <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.consentCard}>
                  <View style={styles.consentHeader}>
                    <Text style={styles.cardTitle}>Customer consent</Text>
                    <View style={styles.requiredBadge}>
                      <Text style={styles.requiredText}>Required</Text>
                    </View>
                  </View>
                  <Text style={styles.helperText}>
                    Read aloud to the customer before proceeding. Consents are time-stamped and stored
                    with the lead.
                  </Text>

                  {[
                    "I agree to ESAF Bank's Terms & Conditions and Privacy Policy.",
                    'I authorise ESAF Bank to fetch my KYC details from UIDAI / NSDL and verify with credit bureaus.',
                    'I consent to receive product updates and offers via SMS, email and WhatsApp.',
                  ].map((label, index) => (
                    <Pressable
                      key={label}
                      onPress={() =>
                        setConsents((current) =>
                          current.map((checked, checkedIndex) =>
                            checkedIndex === index ? !checked : checked,
                          ),
                        )
                      }
                      style={styles.checkboxRow}>
                      <View style={[styles.checkbox, consents[index] && styles.checkboxChecked]}>
                        {consents[index] ? <Ionicons name="checkmark" size={S(13)} color="#FFFFFF" /> : null}
                      </View>
                      <Text style={styles.checkboxText}>
                        {label} <Text style={styles.requiredAsterisk}>*</Text>
                      </Text>
                    </Pressable>
                  ))}

                  <Text style={styles.errorText}>Both required consents must be captured to send OTP.</Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={!canSendOtp || sendOtp.isPending}
                      onPress={() => {
                        if (!canSendOtp) return;

                        const phone = mobile.trim();
                        sendOtp.mutate(
                          { phone },
                          {
                            onSuccess: (data) => {
                              const requestId = data?.request_id ?? null;
                              setOtpRequestId(requestId);
                              setOtpSent(true);
                              setOtpDigits(Array(6).fill(''));
                              setOtpVerified(false);
                            },
                            onError: () => {
                              Alert.alert('OTP send failed', 'Please try again.');
                            },
                          },
                        );
                      }}
                      style={[
                        styles.otpButton,
                        canSendOtp ? styles.otpButtonEnabled : styles.otpButtonDisabled,
                      ]}>
                    <Ionicons name="paper-plane-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.otpButtonText}>Send OTP</Text>
                  </TouchableOpacity>
                </View>

                {otpSent ? (
                  <View
                    style={styles.otpCard}
                    onLayout={(event) => {
                      otpCardY.current = event.nativeEvent.layout.y;
                    }}>
                    <Text style={styles.otpTitle}>Enter OTP sent to +91 XXXXX {mobile.slice(-4)}</Text>
                    <View style={styles.otpRow}>
                      {OTP_DIGITS.map((index) => (
                        <TextInput
                          key={String(index)}
                          ref={(ref) => {
                            otpRefs.current[index] = ref;
                          }}
                          value={otpDigits[index]}
                          onChangeText={(value) => handleOtpChange(value, index)}
                          onKeyPress={({ nativeEvent }) => handleOtpKeyPress(nativeEvent.key, index)}
                          onFocus={handleOtpFocus}
                          keyboardType="number-pad"
                          maxLength={1}
                          style={[
                            styles.otpSlot,
                            { width: otpSlotWidth },
                            otpDigits[index] && styles.otpSlotFilled,
                            index === 0 && !otpDigits[index] && styles.otpSlotActive,
                          ]}
                          textAlign="center"
                        />
                      ))}
                    </View>
                    <Text style={styles.otpHelpText}>
                      Enter OTP to continue.
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      disabled={!otpComplete || !otpRequestId || verifyOtp.isPending || otpVerified}
                      onPress={() => {
                        if (!otpRequestId) return;

                        log.debug("verify otp key: ",otpRequestId)
                        verifyOtp.mutate(
                          {
                            phone: mobile.trim(),
                            otp: otpValue,
                            requestId: otpRequestId,
                          },
                          {
                            onSuccess: () => {
                              setOtpVerified(true);
                            },
                            onError: () => {
                              Alert.alert('OTP verification failed', 'Please enter the correct OTP.');
                              setOtpVerified(false);
                            },
                          },
                        );
                      }}
                      style={{
                        marginTop: 10,
                        paddingVertical: 12,
                        paddingHorizontal: 14,
                        backgroundColor: otpComplete && !otpVerified ? '#1D4ED8' : '#D8DDE8',
                        borderRadius: 12,
                        alignItems: 'center',
                      }}>
                      <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                        {otpVerified
                          ? 'OTP Verified'
                          : verifyOtp.isPending
                            ? 'Verifying…'
                            : 'Verify OTP'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity activeOpacity={0.8}>
                      <Text style={styles.resendLink}>Resend OTP</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                {/* Step 1 demo controls are left out intentionally */}
              </View>
            ) : null}

            {step === 2 ? (
              <View style={styles.stack}>
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Customer type</Text>

                  <View style={styles.inlineRow}>
                    <View style={styles.halfColumn}>
                      <Text style={styles.fieldLabel}>Type</Text>
                      <View style={styles.dropdownWrap}>
                        <Pressable
                          style={styles.selectField}
                          onPress={() => {
                            Keyboard.dismiss();
                            closeMenus();
                            setCustomerTypeOpen((current) => !current);
                          }}>
                          <Text style={styles.fieldText}>{customerType}</Text>
                          <Ionicons name="chevron-down" size={S(18)} color="#334155" />
                        </Pressable>
                        {customerTypeOpen ? (
                          <View style={[styles.dropdownMenuWide, styles.dropdownMenuLeft]}>
                            <Pressable
                              onPress={() => {
                                setCustomerType('Select type');
                                setCustomerTypeOpen(false);
                              }}
                              style={styles.dropdownItem}>
                              <Text style={styles.dropdownItemText}>Select type</Text>
                              {customerType === 'Select type' ? (
                                <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                              ) : null}
                            </Pressable>
                            {CUSTOMER_TYPES.map((type) => (
                              <Pressable
                                key={type}
                                onPress={() => {
                                  setCustomerType(type);
                                  setCustomerTypeOpen(false);
                                }}
                                style={[styles.dropdownItem, customerType === type && styles.dropdownItemActive]}>
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    customerType === type && styles.dropdownItemTextActive,
                                  ]}>
                                  {type}
                                </Text>
                                {customerType === type ? (
                                  <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                                ) : null}
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.halfColumn}>
                      <Text style={styles.fieldLabel}>Sub-type</Text>
                      <View style={styles.dropdownWrap}>
                        <Pressable
                          style={styles.selectField}
                          onPress={() => {
                            Keyboard.dismiss();
                            closeMenus();
                            setSubTypeOpen((current) => !current);
                          }}>
                          <Text style={styles.fieldText}>{subType}</Text>
                          <Ionicons name="chevron-down" size={S(18)} color="#334155" />
                        </Pressable>
                        {subTypeOpen ? (
                          <View style={[styles.dropdownMenuWide, styles.dropdownMenuRight]}>
                            <Pressable
                              onPress={() => {
                                setSubType('Select sub-type');
                                setSubTypeOpen(false);
                              }}
                              style={styles.dropdownItem}>
                              <Text style={styles.dropdownItemText}>Select sub-type</Text>
                              {subType === 'Select sub-type' ? (
                                <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                              ) : null}
                            </Pressable>
                            {SUB_TYPES.map((type) => (
                              <Pressable
                                key={type}
                                onPress={() => {
                                  setSubType(type);
                                  setSubTypeOpen(false);
                                }}
                                style={[styles.dropdownItem, subType === type && styles.dropdownItemActive]}>
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    subType === type && styles.dropdownItemTextActive,
                                  ]}>
                                  {type}
                                </Text>
                                {subType === type ? (
                                  <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                                ) : null}
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>Mobile</Text>
                    <View style={styles.successBadge}>
                      <Ionicons name="checkmark" size={14} color="#127A36" />
                      <Text style={styles.successText}>Verified</Text>
                    </View>
                  </View>
                  <View style={styles.readonlyField}>
                    <Text style={styles.fieldText}>+91 {mobile}</Text>
                  </View>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Identity proof</Text>

                  <Text style={styles.fieldLabel}>Document type</Text>
                  <View style={[styles.dropdownWrap, styles.dropdownWrapFull]}>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => {
                        Keyboard.dismiss();
                        closeMenus();
                        setDocumentTypeOpen((current) => !current);
                      }}>
                      <Text style={styles.fieldText}>{documentType}</Text>
                      <Ionicons name="chevron-down" size={S(18)} color="#334155" />
                    </Pressable>
                    {documentTypeOpen ? (
                      <View style={styles.dropdownMenuFull}>
                        {DOCUMENT_TYPES.map((type) => (
                          <Pressable
                            key={type}
                            onPress={() => {
                              setDocumentType(type);
                              setDocumentTypeOpen(false);
                            }}
                            style={[styles.dropdownItem, documentType === type && styles.dropdownItemActive]}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                documentType === type && styles.dropdownItemTextActive,
                              ]}>
                              {type}
                            </Text>
                            {documentType === type ? (
                              <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                  {documentType === 'Aadhaar' ? (
                    <View>
                    <Text style={[styles.fieldLabel, styles.sectionGap]}>Document number</Text>
                  <View style={styles.inlineRow}>
                    <TextInput
                      value={documentNumber}
                      onChangeText={(value) => {
                        setDocumentNumber(value);
                        setAadhaarTxn(null);
                        setAadhaarOtpVerified(false);
                      }}
                      placeholder="XXXX XXXX XXXX"
                      placeholderTextColor="#7B869B"
                      style={[styles.textField, styles.documentField]}
                    />
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={() => {
                        setIdentityOtpSent(true);
                        setIdentityOtpDigits(Array(6).fill(''));
                      }}>
                      <Ionicons name="camera-outline" size={S(22)} color="#182B78" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, styles.primaryIconButton]}
                      onPress={async () => {
                        const aadhaar = documentNumber.replace(/\D/g, '');
                        if (documentType !== 'Aadhaar') {
                          setIdentityOtpSent(true);
                          setIdentityOtpDigits(Array(6).fill(''));
                          return;
                        }

                        if (aadhaar.length !== 12) {
                          Alert.alert('Invalid Aadhaar', 'Enter a valid 12-digit Aadhaar number.');
                          return;
                        }

                        let encryptedUid = '';
                        try {
                          encryptedUid = await encryptAadhaarUid(aadhaar);
                        } catch (error) {
                          log.error('aadhaar uid encryption failed', error);
                          const message =
                            error instanceof Error
                              ? error.message
                              : 'Please check the encryption configuration.';
                          Alert.alert('Encryption failed', message);
                          return;
                        }

                        generateAadhaarOtp.mutate(
                          { encryptedUid },
                          {
                            onSuccess: (data) => {
                              const statusCode = data?.status?.[0]?.statusCode ?? '';
                              const txn = data?.response?.otpResponse?.txn ?? null;
                              const ret = data?.response?.otpResponse?.ret ?? '';
                              const authLike =
                                (data as any)?.response?.auth ??
                                (data as any)?.response?.authenticate ??
                                (data as any)?.response?.authRequest ??
                                (data as any)?.response?.authData ??
                                null;
                              const skey =
                                authLike?.skey ??
                                (data as any)?.response?.skey ??
                                null;
                              const authData =
                                authLike?.data ??
                                (data as any)?.response?.data ??
                                null;
                              const hmac =
                                authLike?.hmac ??
                                (data as any)?.response?.hmac ??
                                null;

                              if (statusCode && statusCode !== '000') {
                                Alert.alert(
                                  'OTP request failed',
                                  data?.status?.[0]?.statusMessage ?? 'Please try again.',
                                );
                                return;
                              }

                              if (ret && ret.toLowerCase() !== 'y') {
                                Alert.alert('OTP request failed', 'Please try again.');
                                return;
                              }

                              if (!txn) {
                                Alert.alert('OTP request failed', 'Missing transaction id.');
                                return;
                              }

                              setAadhaarTxn(txn);
                              setAadhaarAuth(
                                skey || authData || hmac
                                  ? {
                                      skey:
                                        skey && (skey.ci || skey.value)
                                          ? { ci: skey.ci, value: skey.value }
                                          : undefined,
                                      data:
                                        authData && (authData.type || authData.value)
                                          ? { type: authData.type, value: authData.value }
                                          : undefined,
                                      hmac: typeof hmac === 'string' ? hmac : undefined,
                                    }
                                  : null,
                              );
                              setIdentityOtpSent(true);
                              setIdentityOtpDigits(Array(6).fill(''));
                              setAadhaarOtpVerified(false);
                            },
                            onError: () => {
                              Alert.alert('OTP request failed', 'Please try again.');
                            },
                          },
                        );
                      }}>
                      <Ionicons name="search" size={S(22)} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.helperText}>
                    {documentType === 'Aadhaar'
                      ? '12 digits · OTP-based e-KYC via UIDAI'
                      : 'PAN validation requires PAN + Name + Father name + DOB'}
                  </Text>
                  </View>
                  ):null 
                  }

                  {documentType === 'PAN' ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.fieldLabel}>PAN number</Text>
                      <TextInput
                        value={panNumber}
                        onChangeText={(v) => {
                          setPanNumber(v.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10));
                          setPanValidated(false);
                        }}
                        placeholder="CTDPK4297F"
                        placeholderTextColor="#7B869B"
                        autoCapitalize="characters"
                        style={[styles.textField, { marginTop: 6 }]}
                      />

                      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Name</Text>
                      <TextInput
                        value={panFullName}
                        onChangeText={(v) => {
                          setPanFullName(v);
                          setPanValidated(false);
                        }}
                        placeholder="Rahul Kumar"
                        placeholderTextColor="#7B869B"
                        style={[styles.textField, { marginTop: 6 }]}
                      />

                      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Father name</Text>
                      <TextInput
                        value={panFatherName}
                        onChangeText={(v) => {
                          setPanFatherName(v);
                          setPanValidated(false);
                        }}
                        placeholder="Hari Kumar"
                        placeholderTextColor="#7B869B"
                        style={[styles.textField, { marginTop: 6 }]}
                      />

                      <Text style={[styles.fieldLabel, { marginTop: 12 }]}>DOB (YYYY-MM-DD)</Text>
                      <TextInput
                        value={panDob}
                        onChangeText={(v) => {
                          setPanDob(v.replace(/[^\d-]/g, '').slice(0, 10));
                          setPanValidated(false);
                        }}
                        placeholder="1987-01-31"
                        placeholderTextColor="#7B869B"
                        keyboardType="numbers-and-punctuation"
                        style={[styles.textField, { marginTop: 6 }]}
                      />

                      {panValidated ? (
                        <Text style={[styles.successLine, { marginTop: 10 }]}>✓ PAN validated</Text>
                      ) : null}
                    </View>
                  ) : null}

                  {documentType === 'Aadhaar' && identityOtpSent ? (
                    <View
                      style={styles.otpCardInner}
                      onLayout={(event) => {
                        identityOtpCardY.current = event.nativeEvent.layout.y;
                      }}>
                      <Text style={styles.otpTitle}>Enter OTP sent to verify identity</Text>
                      <View style={styles.otpRow}>
                        {OTP_DIGITS.map((index) => (
                          <TextInput
                            key={`identity-${String(index)}`}
                            ref={(ref) => {
                              identityOtpRefs.current[index] = ref;
                            }}
                            value={identityOtpDigits[index]}
                            onChangeText={(value) => handleIdentityOtpChange(value, index)}
                            onKeyPress={({ nativeEvent }) =>
                              handleIdentityOtpKeyPress(nativeEvent.key, index)
                            }
                            onFocus={handleIdentityOtpFocus}
                            keyboardType="number-pad"
                            maxLength={1}
                            style={[
                              styles.otpSlot,
                              { width: otpSlotWidth },
                              identityOtpDigits[index] && styles.otpSlotFilled,
                              index === 0 && !identityOtpDigits[index] && styles.otpSlotActive,
                            ]}
                            textAlign="center"
                          />
                        ))}
                      </View>
                      <Text style={styles.otpHelpText}>
                        Enter the 6-digit OTP. Current value: {identityOtpValue || '------'}
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        disabled={
                          documentType === 'Aadhaar'
                            ? !identityOtpComplete ||
                              !aadhaarTxn ||
                              authenticateAadhaarOtp.isPending ||
                              aadhaarOtpVerified
                            : !identityOtpComplete
                        }
                        onPress={async () => {
                          if (documentType !== 'Aadhaar') return;
                          const aadhaar = documentNumber.replace(/\D/g, '');
                          if (!aadhaarTxn) return;
                          if (aadhaar.length !== 12) {
                            Alert.alert('Invalid Aadhaar', 'Enter a valid 12-digit Aadhaar number.');
                            return;
                          }

                          let encryptedUid = '';
                          try {
                            encryptedUid = await encryptAadhaarUid(aadhaar);
                          } catch (error) {
                            log.error('aadhaar uid encryption failed', error);
                            const message =
                              error instanceof Error
                                ? error.message
                                : 'Please check the encryption configuration.';
                            Alert.alert('Encryption failed', message);
                            return;
                          }

                          let authBlock:
                            | {
                                skey: { ci: string; value: string };
                                data: { type: string; value: string };
                                hmac: string;
                              }
                            | null = null;
                          try {
                            authBlock = await generateUidaiOtpAuthBlock({
                              otp: identityOtpValue,
                            });
                          } catch (error) {
                            log.error('uidai pidblock generation failed', error);
                            const hasFallback =
                              !!aadhaarAuth?.skey?.ci &&
                              !!aadhaarAuth?.skey?.value &&
                              !!aadhaarAuth?.data?.type &&
                              !!aadhaarAuth?.data?.value &&
                              !!aadhaarAuth?.hmac;
                            if (hasFallback) {
                              authBlock = aadhaarAuth as unknown as {
                                skey: { ci: string; value: string };
                                data: { type: string; value: string };
                                hmac: string;
                              };
                            } else {
                              Alert.alert('Aadhaar verification failed', 'Unable to generate UIDAI auth parameters.');
                              return;
                            }
                          }

                          setAadhaarFlowLoading(true);
                          try {
                            const authResponse = await authenticateAadhaarOtp.mutateAsync({
                              encryptedUid,
                              txn: aadhaarTxn,
                              auth: authBlock ?? undefined,
                            });

                            const statusCode = authResponse?.status?.[0]?.statusCode ?? '';
                            if (statusCode !== '000') {
                              throw new Error(
                                authResponse?.status?.[0]?.statusMessage ?? 'Aadhaar verification failed',
                              );
                            }

                            const detailsResponse = await fetchAadhaarDetails.mutateAsync({
                              encryptedUid,
                              txn: aadhaarTxn,
                              auth: authBlock as {
                                skey: { ci: string; value: string };
                                data: { type: string; value: string };
                                hmac: string;
                              },
                            });

                            const prefill =
                              extractLeadPrefillFromAadhaarAuthenticateResponse(detailsResponse);
                            setAadhaarLeadPrefill(prefill);
                            setAadhaarOtpVerified(true);
                          } catch (error) {
                            log.error('[AADHAAR] full flow failed', error);
                            const message =
                              error instanceof Error ? error.message : 'Aadhaar verification failed';
                            Alert.alert('Aadhaar verification failed', message);
                            setAadhaarOtpVerified(false);
                          } finally {
                            setAadhaarFlowLoading(false);
                          }
                        }}
                        style={{
                          marginTop: 10,
                          paddingVertical: 12,
                          paddingHorizontal: 14,
                          backgroundColor:
                            identityOtpComplete &&
                            documentType === 'Aadhaar' &&
                            aadhaarTxn &&
                            !aadhaarOtpVerified
                              ? '#1D4ED8'
                              : '#D8DDE8',
                          borderRadius: 12,
                          alignItems: 'center',
                        }}>
                        <Text style={{ color: '#FFFFFF', fontWeight: '800' }}>
                          {aadhaarOtpVerified
                            ? 'Verified'
                            : authenticateAadhaarOtp.isPending
                              ? 'Verifying…'
                              : 'Verify OTP'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Annual income</Text>
                  <Text style={styles.fieldLabel}>Income band (₹)</Text>
                  <View style={styles.dropdownWrap}>
                    <Pressable
                      style={styles.selectField}
                      onPress={() => {
                        Keyboard.dismiss();
                        closeMenus();
                        setIncomeBandOpen((current) => !current);
                      }}>
                      <Text style={styles.fieldText}>{incomeBand}</Text>
                      <Ionicons name="chevron-down" size={S(18)} color="#334155" />
                    </Pressable>
                    {incomeBandOpen ? (
                      <View style={styles.dropdownMenu}>
                        <Pressable
                          onPress={() => {
                            setIncomeBand('Select band');
                            setIncomeBandOpen(false);
                          }}
                          style={styles.dropdownItem}>
                          <Text style={styles.dropdownItemText}>Select band</Text>
                          {incomeBand === 'Select band' ? (
                            <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                          ) : null}
                        </Pressable>
                        {INCOME_BANDS.map((band) => (
                          <Pressable
                            key={band}
                            onPress={() => {
                              setIncomeBand(band);
                              setIncomeBandOpen(false);
                            }}
                            style={[styles.dropdownItem, incomeBand === band && styles.dropdownItemActive]}>
                            <Text
                              style={[
                                styles.dropdownItemText,
                                incomeBand === band && styles.dropdownItemTextActive,
                              ]}>
                              {band}
                            </Text>
                            {incomeBand === band ? (
                              <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                            ) : null}
                          </Pressable>
                        ))}
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : null}

            {step === 3 ? (
              <View style={styles.stack}>
                <View style={styles.profilePillRow}>
                  <Text style={styles.profileLabel}>PROFILE</Text>
                  <Text style={styles.profilePillActive}>{profileName}</Text>
                  <Text style={styles.profilePill}>{profileGender}</Text>
                  <Text style={styles.profilePill}>
                    {incomeBand === 'Select band' ? '—' : `₹${incomeBand}`}
                  </Text>
                </View>

                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Product selection</Text>
                  <View style={styles.inlineRow}>
                    <View style={styles.halfColumn}>
                      <Text style={styles.fieldLabel}>Type</Text>
                      <View style={styles.dropdownWrap}>
                        <Pressable
                          style={styles.selectField}
                          onPress={() => {
                            Keyboard.dismiss();
                            closeMenus();
                            setProductTypeOpen((current) => !current);
                          }}>
                          <Text style={styles.fieldText}>{productType}</Text>
                          <Ionicons name="chevron-down" size={S(18)} color="#334155" />
                        </Pressable>
                        {productTypeOpen ? (
                          <View style={[styles.dropdownMenuWide, styles.dropdownMenuLeft]}>
                            {PRODUCT_TYPES.map((type) => (
                              <Pressable
                                key={type}
                                onPress={() => {
                                  setProductType(type);
                                  setProductTypeOpen(false);
                                }}
                                style={[styles.dropdownItem, productType === type && styles.dropdownItemActive]}>
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    productType === type && styles.dropdownItemTextActive,
                                  ]}>
                                  {type}
                                </Text>
                                {productType === type ? (
                                  <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                                ) : null}
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>

                    <View style={styles.halfColumn}>
                      <Text style={styles.fieldLabel}>Code</Text>
                      <View style={styles.dropdownWrap}>
                        <Pressable
                          style={styles.selectFieldError}
                          onPress={() => {
                            Keyboard.dismiss();
                            closeMenus();
                            setProductCodeOpen((current) => !current);
                          }}>
                          <Text style={styles.fieldText}>{productCode}</Text>
                          <Ionicons name="chevron-down" size={S(18)} color="#334155" />
                        </Pressable>
                        {productCodeOpen ? (
                          <View style={[styles.dropdownMenuWide, styles.dropdownMenuRight]}>
                            {PRODUCT_CODES.map((item) => (
                              <Pressable
                                key={item.label}
                                onPress={() => {
                                  setProductCode(item.label);
                                  setProductCodeOpen(false);
                                }}
                                style={[
                                  styles.dropdownItem,
                                  productCode === item.label && styles.dropdownItemActive,
                                ]}>
                                <Text
                                  style={[
                                    styles.dropdownItemText,
                                    productCode === item.label && styles.dropdownItemTextActive,
                                  ]}>
                                  {item.label}
                                </Text>
                                {productCode === item.label ? (
                                  <Ionicons name="checkmark" size={S(18)} color="#FFFFFF" />
                                ) : null}
                              </Pressable>
                            ))}
                          </View>
                        ) : null}
                      </View>
                    </View>
                  </View>

                  <Text style={styles.successLine}>✓ Showing 4 of 13 codes — filtered by profile</Text>
                </View>

                <View style={styles.card}>
                  <View style={styles.cardHeaderRow}>
                    <Text style={styles.cardTitle}>{selectedProductCode.name}</Text>
                    <Text style={styles.codeText}>{selectedProductCode.code}</Text>
                  </View>
                  <Text style={styles.helperText}>{selectedProductCode.subtitle}</Text>

                  <View style={styles.featureGrid}>
                    {selectedProductCode.details.map((item) => (
                      <View key={item.label} style={styles.featureBox}>
                        <Text style={styles.featureLabel}>{item.label}</Text>
                        <Text style={styles.featureValue}>{item.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        {step === 1 ? (
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.85} style={styles.footerButton} disabled={isAnyApiPending}>
              <Text style={styles.secondaryButtonText}>Save draft</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.footerButton} onPress={goBack}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              disabled={!otpComplete}
              style={[
                styles.footerButton,
                styles.primaryButton,
                !otpComplete && styles.primaryButtonDisabled,
              ]}
              onPress={onNext}>
              <Text style={styles.primaryButtonText}>Next</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {step >= 2 ? (
          <View style={styles.footer}>
            {step === 3 ? (
              <>
                <TouchableOpacity activeOpacity={0.85} style={styles.footerButton} disabled={isAnyApiPending}>
                  <Text style={styles.secondaryButtonText}>Save draft</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.footerButton}
                  onPress={() => setStep(2)}
                  disabled={isAnyApiPending}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={createLead.isPending}
                  style={[
                    styles.footerButton,
                    styles.primaryButton,
                    createLead.isPending && styles.primaryButtonDisabled,
                  ]}
                  onPress={handleSubmitLead}>
                  <Text style={styles.primaryButtonText}>Submit lead</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity activeOpacity={0.85} style={styles.footerButton}>
                  <Text style={styles.secondaryButtonText}>Save draft</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.85} style={styles.footerButton} onPress={goBack}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  disabled={
                    !otpVerified ||
                    verifyOtp.isPending ||
                    (documentType === 'Aadhaar'
                      ? !identityOtpComplete || !aadhaarOtpVerified
                      : documentType === 'PAN'
                        ? !panFormComplete
                        : false)
                  }
                  style={[
                    styles.footerButton,
                    styles.primaryButton,
                    (!otpVerified ||
                      verifyOtp.isPending ||
                      (documentType === 'Aadhaar'
                        ? !identityOtpComplete || !aadhaarOtpVerified
                        : documentType === 'PAN'
                          ? !panFormComplete
                          : false)) &&
                      styles.primaryButtonDisabled,
                  ]}
                  onPress={documentType === 'PAN' ? handleStep2PrimaryCta : onNext}>
                  <Text style={styles.primaryButtonText}>
                    {documentType === 'PAN'
                      ? panValidated
                        ? 'Next'
                        : validatePan.isPending
                          ? 'Validating…'
                          : 'Validate PAN'
                      : otpVerified
                        ? 'Next'
                        : 'Verify OTP'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    position: 'relative',
  },
  contentShell: {
    flex: 1,
  },
  topBar: {
    height: 56,
    backgroundColor: '#BD1F25',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  backPill: {
    height: 30,
    paddingHorizontal: 12,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  brandBlock: {
    alignItems: 'center',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 3,
  },
  brandSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: -2,
  },
  backSpacer: {
    width: 56,
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 14,
    paddingBottom: 132,
  },
  title: {
    color: '#142A60',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  stepLabel: {
    color: '#5D6C91',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 14,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: '#E0E3EB',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#E22C36',
  },
  stack: {
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E5F0',
    padding: 14,
  },
  consentCard: {
    backgroundColor: '#FBFBFE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5DBE8',
    padding: 14,
  },
  cardTitle: {
    color: '#142A60',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#142A60',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  halfColumn: {
    flex: 1,
    position: 'relative',
    overflow: 'visible',
  },
  countryField: {
    flex: 0.2,
  },
  textField: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DDEB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    color: '#142A60',
    fontSize: 15,
  },
  mobileField: {
    flex: 1,
  },
  documentField: {
    flex: 1,
  },
  fieldText: {
    color: '#142A60',
    fontSize: 15,
    fontWeight: '500',
  },
  selectField: {
    minHeight: 50,
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DDEB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectFieldError: {
    minHeight: 50,
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B63',
    backgroundColor: '#FFFDFD',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownWrap: {
    position: 'relative',
    overflow: 'visible',
    zIndex: 20,
  },
  dropdownWrapFull: {
    zIndex: 30,
  },
  dropdownMenuFull: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5E3',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownMenuWide: {
    position: 'absolute',
    top: 52,
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5E3',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1001,
  },
  dropdownMenuLeft: {
    left: 0,
  },
  dropdownMenuRight: {
    right: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 52,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5E3',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF1F7',
    backgroundColor: '#FFFFFF',
  },
  dropdownItemActive: {
    backgroundColor: '#5AA0FF',
  },
  dropdownItemText: {
    color: '#2D2D2D',
    fontSize: 13,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  requiredBadge: {
    backgroundColor: '#F8EAC3',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  requiredText: {
    color: '#A96A00',
    fontWeight: '700',
    fontSize: 12,
  },
  helperText: {
    color: '#5D6C91',
    fontSize: 13,
    lineHeight: 18,
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    marginTop: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#AAB4CB',
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: '#E22C36',
    backgroundColor: '#E22C36',
  },
  checkboxText: {
    flex: 1,
    color: '#142A60',
    fontSize: 13,
    lineHeight: 18,
  },
  requiredAsterisk: {
    color: '#E22C36',
    fontWeight: '800',
  },
  errorText: {
    color: '#F04438',
    fontSize: 12,
    marginTop: 10,
  },
  otpButton: {
    marginTop: 12,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  otpButtonEnabled: {
    backgroundColor: '#182B78',
  },
  otpButtonDisabled: {
    backgroundColor: '#D8DDE8',
    opacity: 0.7,
  },
  otpButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  otpCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E5F0',
    padding: 14,
  },
  otpTitle: {
    color: '#142A60',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  otpRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  otpSlot: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DDEB',
    backgroundColor: '#FFFFFF',
    color: '#142A60',
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  otpSlotActive: {
    borderColor: '#FF6A5E',
    shadowColor: '#FF6A5E',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  otpSlotFilled: {
    borderColor: '#182B78',
  },
  otpCardInner: {
    marginTop: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E0E5F0',
    backgroundColor: '#FFFFFF',
  },
  otpHelpText: {
    color: '#5D6C91',
    fontSize: 12,
    marginBottom: 10,
  },
  resendLink: {
    color: '#142A60',
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  sectionGap: {
    marginTop: 10,
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DDEB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  primaryIconButton: {
    backgroundColor: '#182B78',
    borderColor: '#182B78',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  successBadge: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#E4F7EB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
  },
  successText: {
    color: '#127A36',
    fontWeight: '700',
    fontSize: 12,
  },
  readonlyField: {
    minHeight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7DDEB',
    backgroundColor: '#F6F7FB',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  successLine: {
    marginTop: 8,
    color: '#198A3F',
    fontSize: 12,
    fontWeight: '600',
  },
  codeText: {
    color: '#667085',
    fontWeight: '700',
    fontSize: 14,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  featureBox: {
    width: '48%',
    borderRadius: 14,
    backgroundColor: '#F4F6FB',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  featureLabel: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  featureValue: {
    color: '#142A60',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  profilePillRow: {
    backgroundColor: '#ECEEF4',
    borderRadius: 999,
    padding: 8,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileLabel: {
    color: '#5D6C91',
    fontSize: 12,
    fontWeight: '700',
    marginHorizontal: 6,
  },
  profilePill: {
    backgroundColor: '#D7DDEB',
    color: '#142A60',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
  },
  profilePillActive: {
    backgroundColor: '#DCEBFB',
    color: '#1857A7',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E3E7F0',
    backgroundColor: '#F5F7FB',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  footerButton: {
    flex: 1,
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#142A60',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: '#E22C36',
  },
  primaryButtonDisabled: {
    backgroundColor: '#D8DDE8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },

  apiLoaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2000,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  apiLoaderText: {
    marginTop: 12,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
