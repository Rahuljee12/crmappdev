import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { CasaAccountType, CasaOpenStep } from '@/core/navigation/casa.routes';
import type { ReactNode } from 'react';

const FLOW_STEPS: CasaOpenStep[] = [
  'identify',
  'customer',
  'demographic',
  'address',
  'product',
  'nominee',
  'review',
  'submit',
];

const DEMO_NUMBERS = {
  etb: '9847012345',
  ntbLead: '9988776655',
  ntbFresh: '9123456789',
};

const CUSTOMER_TYPES = ['Individual', 'Non-individual'];
const SUB_TYPES = ['Retail', 'Joint', 'NRI'];
const DOCUMENT_TYPES = ['Aadhaar', 'PAN', 'Voter ID', 'Driving Licence', 'Passport'];
const TITLE_OPTIONS = ['Mr', 'Ms', 'Mrs', 'Dr', 'M/s'];
const MARITAL_STATUS_OPTIONS = ['Single', 'Married', 'Divorced', 'Widowed'];
const GENDER_OPTIONS = ['Male', 'Female', 'Third gender', 'Prefer not to say'];
const RELATION_OPTIONS = ['Father', 'Mother', 'Spouse'];
const NATIONALITY_OPTIONS = ['Indian', 'NRI', 'Foreign'];
const RELIGION_OPTIONS = ['Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other', 'Prefer not to say'];
const CASTE_OPTIONS = ['General', 'OBC', 'SC', 'ST', 'Other'];
const MOTHER_TONGUE_OPTIONS = ['Malayalam', 'Tamil', 'Hindi', 'English', 'Telugu', 'Kannada', 'Other'];
const OCCUPATION_OPTIONS = ['Salaried', 'Self-employed', 'Professional', 'Homemaker', 'Student', 'Retired', 'Agricultural', 'Unemployed'];
const INCOME_OPTIONS = ['Below 2L', '2-5L', '5-10L', '10-25L', '25-50L', '50L+'];
const SOURCE_FUNDS_OPTIONS = ['Salary', 'Business income', 'Agriculture', 'Pension', 'Investment', 'Inheritance', 'Other'];
const EDUCATION_OPTIONS = ['Below SSLC', 'SSLC', '+2', 'Graduate', 'Post-graduate', 'Doctorate', 'Professional'];
const PRODUCT_TYPES = ['Savings', 'Current', 'Term Deposit', 'Recurring Deposit', 'Term Loan', 'Demand Loan', 'Personal Loan', 'Mortgage Loan'];
const PRODUCT_CODE_OPTIONS = [
  'P101 · LALIT Basic Savings',
  'P104 · Eleganza',
  'P106 · Pearl Savings',
  'P107 · Salary Account',
  'P109 · Balajyothi',
  'P110 · NRI Savings',
  'P111 · Hriday Corporate',
  'P112 · Corporate Salary',
  'P113 · Trust / Society',
];
const MODE_OF_OPERATION_OPTIONS = [
  'Self / Singly',
  'Either or Survivor',
  'Anyone or Survivor',
  'Joint',
  'Former or Survivor',
  'Latter or Survivor',
  'Mandate holder',
];
const FUNDING_TYPE_OPTIONS = ['Cash', 'GL Transfer', 'Own SB/CA account'];
const CARD_TYPE_OPTIONS = ['India Card', 'Personalized card'];
const STATEMENT_DELIVERY_OPTIONS = ['e-statement only', 'Email', 'Post', 'None'];
const STATEMENT_FREQUENCY_OPTIONS = ['Monthly', 'Quarterly', 'Annual'];
const NOMINATION_OPTIONS = ['Yes, nominate now', 'I do not want to nominate anyone', 'I will nominate later'];
const DOCUMENT_NUMBER_FORMATS: Record<
  string,
  { placeholder: string; maxLength: number; keyboardType: 'default' | 'number-pad'; format: (value: string) => string }
> = {
  Aadhaar: {
    placeholder: 'XXXX XXXX XXXX',
    maxLength: 12,
    keyboardType: 'number-pad',
    format: (value) => value.replace(/\D/g, '').slice(0, 12).replace(/(.{4})/g, '$1 ').trim(),
  },
  PAN: {
    placeholder: 'AAAAA9999A',
    maxLength: 10,
    keyboardType: 'default',
    format: (value) => {
      const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10).split('');
      const result: string[] = [];
      let index = 0;

      for (const char of chars) {
        if (index < 5) {
          if (/^[A-Z]$/.test(char)) {
            result.push(char);
            index += 1;
          }
          continue;
        }

        if (index < 9) {
          if (/^\d$/.test(char)) {
            result.push(char);
            index += 1;
          }
          continue;
        }

        if (/^[A-Z]$/.test(char)) {
          result.push(char);
          index += 1;
        }
      }

      return result.join('');
    },
  },
  'Voter ID': {
    placeholder: 'AAA9999999',
    maxLength: 10,
    keyboardType: 'default',
    format: (value) => {
      const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10).split('');
      const result: string[] = [];
      let index = 0;

      for (const char of chars) {
        if (index < 3) {
          if (/^[A-Z]$/.test(char)) {
            result.push(char);
            index += 1;
          }
          continue;
        }

        if (/^\d$/.test(char)) {
          result.push(char);
          index += 1;
        }
      }

      return result.join('');
    },
  },
  'Driving Licence': {
    placeholder: 'AA99 99999999999',
    maxLength: 15,
    keyboardType: 'default',
    format: (value) => value.replace(/[^A-Za-z0-9]/g, '').toUpperCase().slice(0, 15).replace(/(.{4})/g, '$1 ').trim(),
  },
  Passport: {
    placeholder: 'A9999999',
    maxLength: 8,
    keyboardType: 'default',
    format: (value) => {
      const chars = value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8).split('');
      const result: string[] = [];
      let index = 0;

      for (const char of chars) {
        if (index === 0) {
          if (/^[A-Z]$/.test(char)) {
            result.push(char);
            index += 1;
          }
          continue;
        }

        if (/^\d$/.test(char)) {
          result.push(char);
          index += 1;
        }
      }

      return result.join('');
    },
  },
};

const LEAD_PRODUCTS: Record<string, string[]> = {
  [DEMO_NUMBERS.ntbLead]: ['Home Loan', 'CASA Premium', 'Business Loan'],
};

const PRODUCT_CODES: Record<string, { code: string; name: string; subtitle: string }> = {
  Savings: {
    code: 'SA101',
    name: 'Savings Account',
    subtitle: 'Everyday banking for new customers',
  },
  Current: {
    code: 'CA101',
    name: 'Standard Current',
    subtitle: 'Daily business current account',
  },
  'Term Deposit': {
    code: 'TD101',
    name: 'Fixed Deposit',
    subtitle: 'High-yield deposit for secure savings',
  },
  'Recurring Deposit': {
    code: 'RD101',
    name: 'Recurring Deposit',
    subtitle: 'Systematic monthly savings plan',
  },
  'Term Loan': {
    code: 'TL101',
    name: 'Term Loan',
    subtitle: 'Structured lending for longer tenures',
  },
  'Demand Loan': {
    code: 'DL101',
    name: 'Demand Loan',
    subtitle: 'Flexible overdraft-style borrowing',
  },
};

type StepParam = CasaOpenStep | string | string[] | undefined;
type DropdownKey =
  | 'customerType'
  | 'subType'
  | 'documentType'
  | 'title'
  | 'maritalStatus'
  | 'gender'
  | 'relation'
  | 'nationality'
  | 'religion'
  | 'caste'
  | 'motherTongue'
  | 'occupation'
  | 'incomeBand'
  | 'sourceOfFunds'
  | 'education'
  | 'productType'
  | 'productCode'
  | 'modeOfOperation'
  | 'fundingType'
  | 'cardType'
  | 'statementDelivery'
  | 'statementFrequency'
  | 'nominationChoice';

function asString(value: StepParam) {
  if (Array.isArray(value)) return value[0] ?? '';
  return value ?? '';
}

function clampStep(step: string): CasaOpenStep {
  return FLOW_STEPS.includes(step as CasaOpenStep) ? (step as CasaOpenStep) : 'identify';
}

function formatMobile(value: string) {
  if (value.length !== 10) return value;
  return `${value.slice(0, 5)} ${value.slice(5)}`;
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 8));
  return parts.join('/');
}

function getDocumentFormat(documentType: string) {
  return DOCUMENT_NUMBER_FORMATS[documentType] ?? DOCUMENT_NUMBER_FORMATS.Aadhaar;
}

function stepTitle(step: CasaOpenStep) {
  switch (step) {
    case 'identify':
      return 'Identify customer';
    case 'customer':
      return 'Customer identification';
    case 'demographic':
      return 'Demographic details';
    case 'address':
      return 'Address details';
    case 'product':
      return 'Product details';
    case 'nominee':
      return 'Nominee details';
    case 'review':
      return 'Review & submit';
    case 'submit':
      return 'Application submitted';
  }
}

function stepSubtitle(step: CasaOpenStep) {
  switch (step) {
    case 'identify':
      return 'Step 1 of 7';
    case 'customer':
      return 'Step 2 of 7';
    case 'demographic':
      return 'Step 3 of 7';
    case 'address':
      return 'Step 4 of 7';
    case 'product':
      return 'Step 5 of 7';
    case 'nominee':
      return 'Step 6 of 7';
    case 'review':
      return 'Step 7 of 7';
    case 'submit':
      return 'Complete';
  }
}

function stepIndex(step: CasaOpenStep) {
  return Math.max(0, FLOW_STEPS.indexOf(step));
}

function stepPath(step: CasaOpenStep, type: CasaAccountType, mobile?: string) {
  return { pathname: '/(casa)/open/[step]' as const, params: { step, type, mobile } };
}

export default function AccountCreationFlowScreen() {
  const params = useLocalSearchParams<{
    step?: StepParam;
    type?: StepParam;
    mobile?: StepParam;
    returnToReview?: StepParam;
  }>();
  const { width } = useWindowDimensions();

  const currentStep = clampStep(asString(params.step));
  const returnToReview = asString(params.returnToReview) === 'review';
  const rawType = asString(params.type);
  const accountType = (rawType in PRODUCT_CODES ? rawType : 'Savings') as CasaAccountType;

  const [mobile, setMobile] = useState(asString(params.mobile));
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [customerType, setCustomerType] = useState('Select type');
  const [subType, setSubType] = useState('Select sub-type');
  const [documentType, setDocumentType] = useState('Aadhaar');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentOtpSent, setDocumentOtpSent] = useState(false);
  const [documentOtpDigits, setDocumentOtpDigits] = useState<string[]>(Array(6).fill(''));
  const [documentOtpVerifying, setDocumentOtpVerifying] = useState(false);
  const [documentOtpVerified, setDocumentOtpVerified] = useState(false);
  const [proofVerified, setProofVerified] = useState(false);
  const [amlPassed, setAmlPassed] = useState(false);
  const [sanctionPassed, setSanctionPassed] = useState(false);
  const [pepDeclared, setPepDeclared] = useState(false);
  const [title, setTitle] = useState('Select...');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Select...');
  const [maritalStatus, setMaritalStatus] = useState('Select...');
  const [nationality, setNationality] = useState('Indian');
  const [religion, setReligion] = useState('Select...');
  const [casteCategory, setCasteCategory] = useState('Select...');
  const [motherTongue, setMotherTongue] = useState('Select...');
  const [differentlyAbled, setDifferentlyAbled] = useState(false);
  const [occupation, setOccupation] = useState('Select...');
  const [incomeBand, setIncomeBand] = useState('Select...');
  const [sourceOfFunds, setSourceOfFunds] = useState('Select...');
  const [education, setEducation] = useState('Select...');
  const [pan, setPan] = useState('');
  const [hasPan, setHasPan] = useState(true);
  const [fatcaResident, setFatcaResident] = useState<'YES' | 'NO'>('NO');
  const [fatcaDeclared, setFatcaDeclared] = useState(false);
  const [taxAddressPurpose, setTaxAddressPurpose] = useState<'Permanent' | 'Communication'>('Permanent');
  const [isPensioner, setIsPensioner] = useState(false);
  const [permanentLine1, setPermanentLine1] = useState('');
  const [permanentLine2, setPermanentLine2] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [stateName, setStateName] = useState('');
  const [sameAsPermanent, setSameAsPermanent] = useState(false);
  const [altPhone, setAltPhone] = useState('');
  const [altEmail, setAltEmail] = useState('');
  const [debitCard, setDebitCard] = useState(false);
  const [chequeBook, setChequeBook] = useState(false);
  const [cardType, setCardType] = useState('India Card');
  const [statementDelivery, setStatementDelivery] = useState('e-statement only');
  const [statementFrequency, setStatementFrequency] = useState('Monthly');
  const [fundingAmount, setFundingAmount] = useState('');
  const [fundingType, setFundingType] = useState('Select type');
  const [fundingAccount, setFundingAccount] = useState('');
  const [productType, setProductType] = useState(accountType);
  const [productCode, setProductCode] = useState('Select...');
  const [modeOfOperation, setModeOfOperation] = useState('Select...');
  const [nominationChoice, setNominationChoice] = useState('Select option');
  const [nominees, setNominees] = useState<
    {
      id: string;
      open: boolean;
      title: string;
      firstName: string;
      lastName: string;
      relation: string;
      dob: string;
      share: string;
    }[]
  >([]);
  const [customerAttestations, setCustomerAttestations] = useState([false, false, false, false, false, false]);
  const [rmAttestations, setRmAttestations] = useState([false, false]);
  const [communicationPrefs, setCommunicationPrefs] = useState({
    sms: true,
    email: true,
    whatsapp: true,
    voice: true,
    marketingOptOut: true,
    transactional: true,
  });
  const otpRefs = useRef<(TextInput | null)[]>([]);
  const documentOtpRefs = useRef<(TextInput | null)[]>([]);
  const otpVerifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const documentOtpVerifyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const otpVerificationStartedRef = useRef(false);
  const documentOtpVerificationStartedRef = useRef(false);
  const [openDropdown, setOpenDropdown] = useState<DropdownKey | null>(null);

  const effectiveProductType = productType in PRODUCT_CODES ? productType : accountType;
  const product = PRODUCT_CODES[effectiveProductType] ?? PRODUCT_CODES.Savings;

  const otpComplete = otpDigits.every((digit) => digit.length === 1);
  const documentOtpComplete = documentOtpDigits.every((digit) => digit.length === 1);
  const currentStepIndex = stepIndex(currentStep);
  const progressWidth = ((currentStepIndex + 1) / FLOW_STEPS.length) * 100;
  const mobileDigits = mobile.replace(/\D/g, '').slice(0, 10);
  const leadProducts = LEAD_PRODUCTS[mobileDigits] ?? [];
  const isNtBLead = mobileDigits === DEMO_NUMBERS.ntbLead;
  const isNtBFresh = mobileDigits === DEMO_NUMBERS.ntbFresh;
  const isEtb = mobileDigits === DEMO_NUMBERS.etb;
  const canContinueIdentify = otpSent && (otpComplete || isNtBLead || isNtBFresh || isEtb);
  const canContinueCustomer =
    isEtb || isNtBLead || isNtBFresh || (proofVerified && amlPassed && sanctionPassed && pepDeclared);
  const canContinueDemographic =
    isEtb || isNtBLead || isNtBFresh || (firstName.trim().length > 0 && lastName.trim().length > 0 && dob.trim().length > 0);
  const canContinueAddress =
    isEtb || isNtBLead || isNtBFresh || (permanentLine1.trim().length > 0 && pincode.trim().length === 6);
  const canContinueProduct = isEtb || isNtBLead || isNtBFresh || fundingType !== 'Select type';
  const nomineeCaptured =
    isEtb ||
    isNtBLead ||
    isNtBFresh ||
    nominationChoice === 'I do not want to nominate anyone' ||
    nominationChoice === 'I will nominate later' ||
    nominees.length > 0;
  const canContinueNominee = nomineeCaptured;
  const canSubmit =
    isEtb || isNtBLead || isNtBFresh || (customerAttestations.every(Boolean) && rmAttestations.every(Boolean));

  const otpSlotWidth = Math.max(36, Math.min(48, Math.floor((width - 100) / 6)));
  const fundingAccountVisible = fundingType === 'GL Transfer' || fundingType === 'Own SB/CA account';
  const nomineeAllocation = nominees.reduce((sum, nominee) => sum + (Number(nominee.share) || 0), 0);

  const addNominee = () => {
    setNominationChoice('Yes, nominate now');
    setNominees((current) => {
      if (current.length >= 3) return current;
      return [
        ...current.map((nominee) => ({ ...nominee, open: false })),
        {
          id: `${Date.now()}-${current.length + 1}`,
          open: true,
          title: 'Select...',
          firstName: '',
          lastName: '',
          relation: 'Select relation',
          dob: '',
          share: '',
        },
      ];
    });
  };

  const removeNominee = (id: string) => {
    setNominees((current) => current.filter((nominee) => nominee.id !== id));
  };

  const toggleNomineeOpen = (id: string) => {
    setNominees((current) =>
      current.map((nominee) =>
        nominee.id === id ? { ...nominee, open: !nominee.open } : nominee,
      ),
    );
  };

  const updateNominee = (id: string, patch: Partial<(typeof nominees)[number]>) => {
    setNominees((current) => current.map((nominee) => (nominee.id === id ? { ...nominee, ...patch } : nominee)));
  };

  const goToReviewEditStep = (step: CasaOpenStep) => {
    router.push({
      pathname: '/(casa)/open/[step]',
      params: {
        step,
        type: accountType,
        mobile: mobileDigits || undefined,
        returnToReview: 'review',
      },
    });
  };

  const goNext = () => {
    const nextStep = FLOW_STEPS[Math.min(currentStepIndex + 1, FLOW_STEPS.length - 1)];
    router.push(stepPath(nextStep, accountType, mobileDigits || undefined));
  };

  const goBack = () => {
    if (returnToReview && currentStep !== 'review') {
      router.push(stepPath('review', accountType, mobileDigits || undefined));
      return;
    }
    if (currentStepIndex === 0) {
      router.push('/(tabs)/accounts');
      return;
    }
    const previousStep = FLOW_STEPS[Math.max(currentStepIndex - 1, 0)];
    router.push(stepPath(previousStep, accountType, mobileDigits || undefined));
  };

  const handleStepNavigation = (step: CasaOpenStep) => {
    router.push({
      pathname: '/(casa)/open/[step]',
      params: { step, type: accountType, mobile: mobileDigits || undefined },
    });
  };

  useEffect(() => {
    if (currentStep !== 'submit') return;

    const timer = setTimeout(() => {
      router.replace('/(tabs)/accounts');
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentStep]);

  useEffect(() => {
    if (!otpSent || !otpComplete || otpVerified || otpVerificationStartedRef.current) return;

    otpVerificationStartedRef.current = true;
    setOtpVerifying(true);

    otpVerifyTimerRef.current = setTimeout(() => {
      setOtpVerifying(false);
      setOtpVerified(true);
      otpVerifyTimerRef.current = null;
    }, 2500);
  }, [otpSent, otpComplete, otpVerified]);

  useEffect(() => {
    if (
      !documentOtpSent ||
      !documentOtpComplete ||
      documentOtpVerified ||
      documentOtpVerifying ||
      documentOtpVerificationStartedRef.current
    ) {
      return;
    }

    documentOtpVerificationStartedRef.current = true;
    setDocumentOtpVerifying(true);

    documentOtpVerifyTimerRef.current = setTimeout(() => {
      setDocumentOtpVerifying(false);
      setDocumentOtpVerified(true);
      setProofVerified(true);
      documentOtpVerifyTimerRef.current = null;
    }, 2200);
  }, [documentOtpSent, documentOtpComplete, documentOtpVerified, documentOtpVerifying]);

  useEffect(() => {
    return () => {
      if (otpVerifyTimerRef.current) {
        clearTimeout(otpVerifyTimerRef.current);
      }
      if (documentOtpVerifyTimerRef.current) {
        clearTimeout(documentOtpVerifyTimerRef.current);
      }
    };
  }, []);

  const footerCopy =
    currentStep === 'identify'
      ? 'Capture mobile and OTP to continue.'
      : currentStep === 'customer'
        ? 'Complete KYC screening to proceed.'
        : currentStep === 'demographic'
          ? 'Complete name, DOB and gender.'
          : currentStep === 'address'
            ? 'Address details captured.'
            : currentStep === 'product'
              ? 'Capture initial funding amount and source.'
              : currentStep === 'nominee'
                ? 'Add at least one nominee.'
                : currentStep === 'review'
                  ? 'Tick all customer attestations including pricing acknowledgement.'
                  : 'Application successfully submitted.';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <TouchableOpacity activeOpacity={0.85} style={styles.backPill} onPress={goBack}>
            <Ionicons name="chevron-back" size={18} color="#FFFFFF" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>ESAF</Text>
            <View style={styles.brandDivider} />
            <Text style={styles.brandSubtitle}>Joy of Banking</Text>
          </View>

          <View style={styles.avatarDot} />
        </View>

        <KeyboardAvoidingView
          style={styles.contentShell}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={60}>
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag">
            <View style={styles.progressRow}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progressWidth}%` }]} />
              </View>
              <Text style={styles.progressText}>{currentStepIndex + 1} of 7</Text>
            </View>

            <Text style={styles.pageTitle}>{stepTitle(currentStep)}</Text>
            <Text style={styles.pageSubtitle}>{stepSubtitle(currentStep)}</Text>

            {currentStep === 'identify' ? (
              <>
                <SectionCard
                  title="Mobile capture"
                  badge="Required"
                  action={
                    <View style={styles.inlineBadge}>
                      <Text style={styles.inlineBadgeText}>Required</Text>
                    </View>
                  }>
                  <View style={styles.inlineRow}>
                    <Pressable style={styles.countryField}>
                      <Text style={styles.fieldValue}>+91</Text>
                      <Ionicons name="chevron-down" size={16} color="#1E2F5B" />
                    </Pressable>
                    <TextInput
                      value={mobile}
                      onChangeText={(value) => setMobile(value.replace(/\D/g, '').slice(0, 10))}
                      keyboardType="number-pad"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#98A2B3"
                      style={styles.mobileInput}
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.88}
                    disabled={!mobileDigits || mobileDigits.length !== 10}
                    onPress={() => {
                      setOtpSent(true);
                      setOtpVerified(false);
                      setOtpVerifying(false);
                      setOtpDigits(Array(6).fill(''));
                      otpVerificationStartedRef.current = false;
                      if (otpVerifyTimerRef.current) {
                        clearTimeout(otpVerifyTimerRef.current);
                        otpVerifyTimerRef.current = null;
                      }
                      requestAnimationFrame(() => {
                        otpRefs.current[0]?.focus();
                      });
                    }}
                    style={[
                      styles.primaryButton,
                      (!mobileDigits || mobileDigits.length !== 10) && styles.primaryButtonDisabled,
                    ]}>
                    <Text style={styles.primaryButtonText}>Send OTP</Text>
                  </TouchableOpacity>

                  {otpSent ? (
                    <View style={styles.otpBlock}>
                      <Text style={styles.otpHint}>OTP sent to +91 {formatMobile(mobileDigits)}</Text>
                      <View style={styles.otpRow}>
                        {Array.from({ length: 6 }, (_, index) => (
                          <TextInput
                            key={`otp-${String(index)}`}
                            ref={(ref) => {
                              otpRefs.current[index] = ref;
                            }}
                            value={otpDigits[index]}
                            onChangeText={(value) => {
                              const next = value.replace(/\D/g, '').slice(0, 1);
                              setOtpDigits((current) => {
                                const updated = [...current];
                                updated[index] = next;
                                return updated;
                              });
                              if (next && index < otpRefs.current.length - 1) {
                                requestAnimationFrame(() => {
                                  otpRefs.current[index + 1]?.focus();
                                });
                              }
                            }}
                            onKeyPress={({ nativeEvent }) => {
                              if (nativeEvent.key === 'Backspace' && !otpDigits[index] && index > 0) {
                                otpRefs.current[index - 1]?.focus();
                              }
                            }}
                            keyboardType="number-pad"
                            maxLength={1}
                            style={[styles.otpInput, { width: otpSlotWidth }]}
                            textAlign="center"
                            editable={!otpVerifying && !otpVerified}
                          />
                        ))}
                      </View>
                      {otpVerifying ? (
                        <View style={styles.verifyRow}>
                          <ActivityIndicator size="small" color="#1D4ED8" />
                          <Text style={styles.verifyText}>Verifying OTP...</Text>
                        </View>
                      ) : otpVerified ? (
                        <View style={styles.verifyRow}>
                          <Ionicons name="checkmark-circle" size={16} color="#127A36" />
                          <Text style={styles.verifyTextSuccess}>OTP verified</Text>
                        </View>
                      ) : (
                        <Text style={styles.otpTip}>Tip: enter 000000 for the error path.</Text>
                      )}
                    </View>
                  ) : null}
                </SectionCard>

                {otpVerified && leadProducts.length > 0 ? (
                  <View style={styles.greenBanner}>
                    <View style={styles.bannerTopRow}>
                      <Text style={styles.bannerTitle}>Leads already exist</Text>
                      <Ionicons name="checkmark-circle" size={18} color="#127A36" />
                    </View>
                    <Text style={styles.bannerLabel}>Associated products</Text>
                    <View style={styles.pillList}>
                      {leadProducts.map((item) => (
                        <View key={item} style={styles.productPill}>
                          <Text style={styles.productPillText}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}

                {otpVerified && (isNtBFresh || isEtb) ? (
                  <View style={styles.infoBanner}>
                    <View style={styles.bannerTopRow}>
                      <Text style={styles.infoTitle}>
                        {isEtb ? 'Existing customer' : 'New to ESAF'}
                      </Text>
                      <Ionicons name="information-circle-outline" size={18} color="#1D4ED8" />
                    </View>
                    <Text style={styles.infoBody}>
                      {isEtb
                        ? 'Proceeding with an existing customer profile.'
                        : 'Proceeding with fresh account origination.'}
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() => handleStepNavigation('customer')}
                      style={styles.redCta}>
                      <Text style={styles.redCtaText}>Start KYC & continue</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}

                <SectionCard
                  title="Demo triggers"
                  badge="Pre-fill phone"
                  action={<View style={styles.inlineBadge}><Text style={styles.inlineBadgeText}>Pre-fill phone</Text></View>}>
                  <View style={styles.demoGrid}>
                    {[
                      { label: 'ETB', number: DEMO_NUMBERS.etb },
                      { label: 'NTB+lead', number: DEMO_NUMBERS.ntbLead },
                      { label: 'NTB fresh', number: DEMO_NUMBERS.ntbFresh },
                    ].map((item) => (
                      <Pressable
                        key={item.label}
                        onPress={() => {
                          Keyboard.dismiss();
                          setMobile(item.number);
                          setOtpSent(item.label !== 'ETB');
                        }}
                        style={styles.demoChip}>
                        <Text style={styles.demoLabel}>{item.label}</Text>
                        <Text style={styles.demoNumber}>{item.number}</Text>
                      </Pressable>
                    ))}
                  </View>
                </SectionCard>
              </>
            ) : null}

            {currentStep === 'customer' ? (
              <>
                <SectionCard title="Customer type" badge="">
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>Type</FieldLabel>
                      <DropdownSelect
                        id="customerType"
                        value={customerType}
                        options={CUSTOMER_TYPES}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setCustomerType}
                        placeholderLabel="Select type"
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>Sub-type</FieldLabel>
                      <DropdownSelect
                        id="subType"
                        value={subType}
                        options={SUB_TYPES}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setSubType}
                        placeholderLabel="Select sub-type"
                      />
                    </View>
                  </View>
                </SectionCard>

                <SectionCard
                  title="Identity proofs"
                  badge={proofVerified ? 'Verified' : 'Draft'}
                  action={
                    <Pressable
                      onPress={() => setProofVerified((current) => !current)}
                      style={styles.circleButton}>
                      <Ionicons name="add" size={28} color="#1D4ED8" />
                    </Pressable>
                  }>
                  <View style={styles.proofCard}>
                    <View style={styles.proofTopRow}>
                      <Text style={styles.proofTitle}>Aadhaar · XXXX XXXX ...</Text>
                      <View style={[styles.smallBadge, proofVerified && styles.smallBadgeSuccess]}>
                        <Text style={[styles.smallBadgeText, proofVerified && styles.smallBadgeTextSuccess]}>
                          {proofVerified ? 'Verified' : 'Draft'}
                        </Text>
                      </View>
                    </View>
                    <FieldLabel>Document type</FieldLabel>
                    <DropdownSelect
                      id="documentType"
                      value={documentType}
                      options={DOCUMENT_TYPES}
                      openKey={openDropdown}
                      setOpenKey={setOpenDropdown}
                      onSelect={(nextType) => {
                        setDocumentType(nextType);
                        setDocumentNumber('');
                        setDocumentOtpSent(false);
                        setDocumentOtpDigits(Array(6).fill(''));
                        setDocumentOtpVerifying(false);
                        setDocumentOtpVerified(false);
                        setProofVerified(false);
                        documentOtpVerificationStartedRef.current = false;
                        if (documentOtpVerifyTimerRef.current) {
                          clearTimeout(documentOtpVerifyTimerRef.current);
                          documentOtpVerifyTimerRef.current = null;
                        }
                      }}
                    />
                    <FieldLabel>Document number</FieldLabel>
                    <View style={styles.inlineRow}>
                      <TextInput
                        value={documentNumber}
                        onChangeText={(value) => {
                          const { format } = getDocumentFormat(documentType);
                          setDocumentNumber(format(value));
                          setDocumentOtpSent(false);
                          setDocumentOtpVerifying(false);
                          setDocumentOtpVerified(false);
                          setProofVerified(false);
                        }}
                        placeholder={getDocumentFormat(documentType).placeholder}
                        placeholderTextColor="#98A2B3"
                        keyboardType={getDocumentFormat(documentType).keyboardType}
                        maxLength={getDocumentFormat(documentType).maxLength + 4}
                        editable={hasPan || documentType !== 'PAN'}
                        style={[styles.mobileInput, styles.flexOne]}
                      />
                      <Pressable style={styles.iconSquare}>
                        <Ionicons name="camera-outline" size={20} color="#1E2F5B" />
                      </Pressable>
                      <Pressable
                        style={styles.iconSquare}
                        onPress={() => {
                          Keyboard.dismiss();
                          documentOtpVerificationStartedRef.current = false;
                          if (documentOtpVerifyTimerRef.current) {
                            clearTimeout(documentOtpVerifyTimerRef.current);
                            documentOtpVerifyTimerRef.current = null;
                          }
                          setDocumentOtpSent(true);
                          setDocumentOtpDigits(Array(6).fill(''));
                          setDocumentOtpVerifying(false);
                          setDocumentOtpVerified(false);
                          requestAnimationFrame(() => {
                            documentOtpRefs.current[0]?.focus();
                          });
                        }}>
                        <Ionicons name="search" size={20} color="#1E2F5B" />
                      </Pressable>
                    </View>
                    {documentOtpSent ? (
                      <View style={styles.documentOtpCard}>
                        {documentOtpVerifying ? (
                          <View style={styles.documentOtpStatusRow}>
                            <ActivityIndicator size="small" color="#127A36" />
                            <Text style={styles.documentOtpStatusText}>Verifying OTP...</Text>
                          </View>
                        ) : documentOtpVerified ? (
                          <View style={styles.documentVerifiedCard}>
                            <View style={styles.documentVerifiedHeader}>
                              <View style={styles.documentVerifiedTitleRow}>
                                <Ionicons name="checkmark-circle" size={20} color="#127A36" />
                                <Text style={styles.documentVerifiedName}>Anjali Krishnan</Text>
                              </View>
                              <Text style={styles.documentVerifiedDob}>DOB 14/06/1995</Text>
                            </View>
                            <Text style={styles.documentVerifiedBody}>XXXX XXXX 1111  ·  UIDAI  e-KYC</Text>
                            <TouchableOpacity activeOpacity={0.8}>
                              <Text style={styles.documentVerifiedLink}>Show all details</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <>
                            <Text style={styles.otpHint}>Enter OTP sent for {documentType} verification.</Text>
                            <View style={styles.otpRow}>
                              {Array.from({ length: 6 }, (_, index) => (
                                <TextInput
                                  key={`document-otp-${String(index)}`}
                                  ref={(ref) => {
                                    documentOtpRefs.current[index] = ref;
                                  }}
                                  value={documentOtpDigits[index]}
                                  onChangeText={(value) => {
                                    const next = value.replace(/\D/g, '').slice(0, 1);
                                    setDocumentOtpDigits((current) => {
                                      const updated = [...current];
                                      updated[index] = next;
                                      return updated;
                                    });
                                    if (next && index < documentOtpRefs.current.length - 1) {
                                      requestAnimationFrame(() => {
                                        documentOtpRefs.current[index + 1]?.focus();
                                      });
                                    }
                                  }}
                                  onKeyPress={({ nativeEvent }) => {
                                    if (nativeEvent.key === 'Backspace' && !documentOtpDigits[index] && index > 0) {
                                      documentOtpRefs.current[index - 1]?.focus();
                                    }
                                  }}
                                  keyboardType="number-pad"
                                  maxLength={1}
                                  style={[styles.otpInput, { width: otpSlotWidth }]}
                                  textAlign="center"
                                  editable={!documentOtpVerifying && !documentOtpVerified}
                                />
                              ))}
                            </View>
                          </>
                        )}
                    </View>
                    ) : null}
                    <Text style={styles.helperText}>Up to 5 proofs · Aadhaar required.</Text>
                  </View>
                </SectionCard>

                <SectionCard title="AML screening" badge={amlPassed ? 'PASS' : 'Not run'}>
                  <Text style={styles.helperText}>Automated anti-money-laundering risk check.</Text>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => setAmlPassed(true)}
                    style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      {amlPassed ? 'Re-run AML check' : 'Run AML check'}
                    </Text>
                  </TouchableOpacity>
                  {amlPassed ? (
                    <View style={styles.greenBanner}>
                      <Text style={styles.greenBannerText}>Risk band 412 / 500 — Pass.</Text>
                    </View>
                  ) : null}
                </SectionCard>

                <SectionCard title="Sanction screening" badge={sanctionPassed ? 'PASS' : 'Not run'}>
                  <Text style={styles.helperText}>Checks UN, OFAC, RBI Caution List.</Text>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => setSanctionPassed(true)}
                    style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      {sanctionPassed ? 'Re-run sanction check' : 'Run sanction check'}
                    </Text>
                  </TouchableOpacity>
                  {sanctionPassed ? (
                    <View style={styles.greenBanner}>
                      <Text style={styles.greenBannerText}>No matches found — Pass.</Text>
                    </View>
                  ) : null}
                </SectionCard>

                <SectionCard title="PEP declaration" badge={pepDeclared ? 'Captured' : 'Not declared'}>
                  <Text style={styles.helperText}>
                    Confirm whether customer is a Politically Exposed Person.
                  </Text>
                  <Pressable onPress={() => setPepDeclared((current) => !current)} style={styles.checkboxRow}>
                    <View style={[styles.checkbox, pepDeclared && styles.checkboxChecked]}>
                      {pepDeclared ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>Customer declares PEP status.</Text>
                  </Pressable>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => setPepDeclared(true)}
                    style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      {pepDeclared ? 'Declaration captured ✓' : 'Capture declaration'}
                    </Text>
                  </TouchableOpacity>
                </SectionCard>
              </>
            ) : null}

            {currentStep === 'demographic' ? (
              <>
                <SectionCard title="Personal information" badge="">
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>Title</FieldLabel>
                      <DropdownSelect
                        id="title"
                        value={title}
                        options={TITLE_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setTitle}
                        placeholderLabel="Select..."
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>First name</FieldLabel>
                      <FieldInput value={firstName} onChangeText={setFirstName} />
                    </View>
                  </View>
                  <FieldLabel>Last name</FieldLabel>
                  <FieldInput value={lastName} onChangeText={setLastName} />
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>DOB</FieldLabel>
                      <FieldInput
                        value={dob}
                        onChangeText={(value) => setDob(formatDateInput(value))}
                        placeholder="DD/MM/YYYY"
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>Gender</FieldLabel>
                      <DropdownSelect
                        id="gender"
                        value={gender}
                        options={GENDER_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setGender}
                      />
                    </View>
                  </View>
                  <FieldLabel>Marital status</FieldLabel>
                  <DropdownSelect
                    id="maritalStatus"
                    value={maritalStatus}
                    options={MARITAL_STATUS_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setMaritalStatus}
                    placeholderLabel="Select..."
                  />
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>Nationality</FieldLabel>
                      <DropdownSelect
                        id="nationality"
                        value={nationality}
                        options={NATIONALITY_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setNationality}
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>Mother tongue</FieldLabel>
                      <DropdownSelect
                        id="motherTongue"
                        value={motherTongue}
                        options={MOTHER_TONGUE_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setMotherTongue}
                      />
                    </View>
                  </View>
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>Religion</FieldLabel>
                      <DropdownSelect
                        id="religion"
                        value={religion}
                        options={RELIGION_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setReligion}
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>Caste category</FieldLabel>
                      <DropdownSelect
                        id="caste"
                        value={casteCategory}
                        options={CASTE_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setCasteCategory}
                      />
                    </View>
                  </View>
                  <FieldLabel>Differently abled person</FieldLabel>
                  <View style={styles.pillToggleRow}>
                    <TogglePill label="No" active={!differentlyAbled} onPress={() => setDifferentlyAbled(false)} />
                    <TogglePill label="Yes" active={differentlyAbled} onPress={() => setDifferentlyAbled(true)} />
                  </View>
                  <Pressable onPress={() => setDifferentlyAbled((current) => !current)} style={styles.checkboxRow}>
                    <View style={[styles.checkbox, differentlyAbled && styles.checkboxChecked]}>
                      {differentlyAbled ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>Capture differently abled details separately.</Text>
                  </Pressable>
                </SectionCard>

                <SectionCard title="Occupation & income" badge="">
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>Occupation</FieldLabel>
                      <DropdownSelect
                        id="occupation"
                        value={occupation}
                        options={OCCUPATION_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setOccupation}
                      />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>Income band</FieldLabel>
                      <DropdownSelect
                        id="incomeBand"
                        value={incomeBand}
                        options={INCOME_OPTIONS}
                        openKey={openDropdown}
                        setOpenKey={setOpenDropdown}
                        onSelect={setIncomeBand}
                      />
                    </View>
                  </View>
                  <FieldLabel>Source of funds</FieldLabel>
                  <DropdownSelect
                    id="sourceOfFunds"
                    value={sourceOfFunds}
                    options={SOURCE_FUNDS_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setSourceOfFunds}
                  />
                  <FieldLabel>Education</FieldLabel>
                  <DropdownSelect
                    id="education"
                    value={education}
                    options={EDUCATION_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setEducation}
                  />
                </SectionCard>

                <SectionCard title="Address for taxation purpose" badge="">
                  <View style={styles.pillToggleRow}>
                    <Pressable
                      onPress={() => setTaxAddressPurpose('Permanent')}
                      style={[styles.taxPill, taxAddressPurpose === 'Permanent' && styles.taxPillActive]}>
                      <View style={[styles.taxRadio, taxAddressPurpose === 'Permanent' && styles.taxRadioActive]}>
                        {taxAddressPurpose === 'Permanent' ? <View style={styles.taxRadioDot} /> : null}
                      </View>
                      <Text style={[styles.taxPillText, taxAddressPurpose === 'Permanent' && styles.taxPillTextActive]}>
                        Permanent
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setTaxAddressPurpose('Communication')}
                      style={[styles.taxPill, taxAddressPurpose === 'Communication' && styles.taxPillActive]}>
                      <View style={[styles.taxRadio, taxAddressPurpose === 'Communication' && styles.taxRadioActive]}>
                        {taxAddressPurpose === 'Communication' ? <View style={styles.taxRadioDot} /> : null}
                      </View>
                      <Text
                        style={[
                          styles.taxPillText,
                          taxAddressPurpose === 'Communication' && styles.taxPillTextActive,
                        ]}>
                        Communication
                      </Text>
                    </Pressable>
                  </View>
                  <Pressable onPress={() => setIsPensioner((current) => !current)} style={styles.checkboxRow}>
                    <View style={[styles.checkbox, isPensioner && styles.checkboxChecked]}>
                      {isPensioner ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>Is the person a pensioner</Text>
                  </Pressable>
                </SectionCard>

                <SectionCard title="PAN / Form 60" badge="Required">
                  <FieldLabel>PAN</FieldLabel>
                  <TextInput
                    value={pan}
                    onChangeText={(value) => setPan(value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))}
                    placeholder="ABCDE1234F"
                    placeholderTextColor="#98A2B3"
                    editable={hasPan}
                    style={[styles.input, !hasPan && styles.inputDisabled]}
                  />
                  <Pressable
                    onPress={() => {
                      setHasPan((current) => {
                        const next = !current;
                        if (!next) {
                          setPan('');
                        }
                        return next;
                      });
                    }}
                    style={styles.checkboxRow}>
                    <View style={[styles.checkbox, !hasPan && styles.checkboxChecked]}>
                      {!hasPan ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>I do not have a PAN - capture Form 60</Text>
                  </Pressable>
                </SectionCard>

                <SectionCard title="FATCA / CRS declaration" badge="Required">
                  <Text style={styles.helperText}>
                    Are you a tax resident of any country other than India?
                  </Text>
                  <View style={styles.pillToggleRow}>
                    <TogglePill label="YES" active={fatcaResident === 'YES'} onPress={() => setFatcaResident('YES')} />
                    <TogglePill label="NO" active={fatcaResident === 'NO'} onPress={() => setFatcaResident('NO')} />
                  </View>
                  <Pressable onPress={() => setFatcaDeclared((current) => !current)} style={styles.checkboxRow}>
                    <View style={[styles.checkbox, fatcaDeclared && styles.checkboxChecked]}>
                      {fatcaDeclared ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>I declare the above to be true and correct.</Text>
                  </Pressable>
                  <TouchableOpacity
                    activeOpacity={0.86}
                    onPress={() => setFatcaDeclared(true)}
                    style={styles.secondaryButton}>
                    <Text style={styles.secondaryButtonText}>
                      {fatcaDeclared ? 'Declaration captured ✓' : 'Capture declaration'}
                    </Text>
                  </TouchableOpacity>
                </SectionCard>
              </>
            ) : null}

            {currentStep === 'address' ? (
              <>
                <SectionCard title="Permanent address" badge="">
                  <FieldLabel>Address line 1</FieldLabel>
                  <FieldInput value={permanentLine1} onChangeText={setPermanentLine1} />
                  <FieldLabel>Address line 2</FieldLabel>
                  <FieldInput value={permanentLine2} onChangeText={setPermanentLine2} />
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>Pincode</FieldLabel>
                      <FieldInput value={pincode} onChangeText={setPincode} />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>City</FieldLabel>
                      <FieldInput value={city} onChangeText={setCity} />
                    </View>
                  </View>
                  <FieldLabel>District</FieldLabel>
                  <FieldInput value={district} onChangeText={setDistrict} />
                  <View style={styles.twoColRow}>
                    <View style={styles.flexOne}>
                      <FieldLabel>State</FieldLabel>
                      <FieldInput value={stateName} onChangeText={setStateName} placeholder="State" />
                    </View>
                    <View style={styles.flexOne}>
                      <FieldLabel>Country</FieldLabel>
                      <TextInput
                        value="India"
                        editable={false}
                        placeholder="Country"
                        placeholderTextColor="#98A2B3"
                        style={[styles.input, styles.inputDisabled]}
                      />
                    </View>
                  </View>
                </SectionCard>

                <SectionCard title="Communication address" badge="">
                  <Pressable onPress={() => setSameAsPermanent((current) => !current)} style={styles.checkboxRow}>
                    <View style={[styles.checkbox, sameAsPermanent && styles.checkboxChecked]}>
                      {sameAsPermanent ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>Same as permanent</Text>
                  </Pressable>
                  <Text style={styles.helperText}>
                    Same as permanent: {permanentLine1}, {city} {pincode}
                  </Text>
                </SectionCard>

                <SectionCard title="Alternate contact" badge="">
                  <FieldLabel>Alternate phone</FieldLabel>
                  <FieldInput value={altPhone} onChangeText={setAltPhone} />
                  <FieldLabel>Email</FieldLabel>
                  <FieldInput value={altEmail} onChangeText={setAltEmail} />
                </SectionCard>

                <SectionCard title="Communication preferences" badge="">
                  <View style={styles.preferenceGrid}>
                    <View style={styles.preferenceGridRow}>
                      <Pressable
                        onPress={() =>
                          setCommunicationPrefs((current) => ({ ...current, sms: !current.sms }))
                        }
                        style={styles.preferenceItem}>
                        <View style={[styles.checkbox, communicationPrefs.sms && styles.checkboxChecked]}>
                          {communicationPrefs.sms ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                        </View>
                        <Text style={styles.checkboxText}>Sms</Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          setCommunicationPrefs((current) => ({ ...current, email: !current.email }))
                        }
                        style={styles.preferenceItem}>
                        <View style={[styles.checkbox, communicationPrefs.email && styles.checkboxChecked]}>
                          {communicationPrefs.email ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                        </View>
                        <Text style={styles.checkboxText}>Email</Text>
                      </Pressable>
                    </View>
                    <View style={styles.preferenceGridRow}>
                      <Pressable
                        onPress={() =>
                          setCommunicationPrefs((current) => ({ ...current, whatsapp: !current.whatsapp }))
                        }
                        style={styles.preferenceItem}>
                        <View style={[styles.checkbox, communicationPrefs.whatsapp && styles.checkboxChecked]}>
                          {communicationPrefs.whatsapp ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                        </View>
                        <Text style={styles.checkboxText}>Whatsapp</Text>
                      </Pressable>
                      <Pressable
                        onPress={() =>
                          setCommunicationPrefs((current) => ({ ...current, voice: !current.voice }))
                        }
                        style={styles.preferenceItem}>
                        <View style={[styles.checkbox, communicationPrefs.voice && styles.checkboxChecked]}>
                          {communicationPrefs.voice ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                        </View>
                        <Text style={styles.checkboxText}>Voice</Text>
                      </Pressable>
                    </View>
                    <Pressable
                      onPress={() =>
                        setCommunicationPrefs((current) => ({
                          ...current,
                          marketingOptOut: !current.marketingOptOut,
                        }))
                      }
                      style={styles.preferenceItemFull}>
                      <View style={[styles.checkbox, communicationPrefs.marketingOptOut && styles.checkboxChecked]}>
                        {communicationPrefs.marketingOptOut ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                      </View>
                      <Text style={styles.checkboxText}>Customer opts out of marketing communications</Text>
                    </Pressable>
                    <Pressable
                      onPress={() =>
                        setCommunicationPrefs((current) => ({
                          ...current,
                          transactional: !current.transactional,
                        }))
                      }
                      style={styles.preferenceItemFull}>
                      <View style={[styles.checkbox, communicationPrefs.transactional && styles.checkboxChecked]}>
                        {communicationPrefs.transactional ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                      </View>
                      <Text style={styles.checkboxText}>
                        I consent to receive transactional communication on registered contact details.
                      </Text>
                    </Pressable>
                  </View>
                </SectionCard>
              </>
            ) : null}

            {currentStep === 'product' ? (
              <>
                <SectionCard title="Selected product" badge="Filtered to profile">
                  <FieldLabel>Type</FieldLabel>
                  <DropdownSelect
                    id="productType"
                    value={productType}
                    options={PRODUCT_TYPES}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setProductType}
                  />
                  <FieldLabel>Code</FieldLabel>
                  <DropdownSelect
                    id="productCode"
                    value={productCode}
                    options={PRODUCT_CODE_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setProductCode}
                    error
                  />
                  <Text style={styles.helperText}>Showing 2 of 2 codes - filtered by profile.</Text>
                  <View style={styles.productCard}>
                    <View style={styles.productRow}>
                      <View style={styles.codeChip}>
                        <Text style={styles.codeChipText}>{product.code}</Text>
                      </View>
                      <Text style={styles.productName}>{product.name}</Text>
                    </View>
                    <Text style={styles.helperText}>{product.subtitle}</Text>
                  </View>
                </SectionCard>

                <SectionCard title="Mode of operation" badge="">
                  <DropdownSelect
                    id="modeOfOperation"
                    value={modeOfOperation}
                    options={MODE_OF_OPERATION_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setModeOfOperation}
                  />
                </SectionCard>

                <SectionCard title="Initial funding" badge="">
                  <FieldLabel>Funding amount (₹)</FieldLabel>
                  <FieldInput value={fundingAmount} onChangeText={setFundingAmount} />
                  <FieldLabel>Funding type</FieldLabel>
                  <DropdownSelect
                    id="fundingType"
                    value={fundingType}
                    options={FUNDING_TYPE_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={(value) => {
                      setFundingType(value);
                      if (value === 'Cash') {
                        setFundingAccount('');
                      }
                    }}
                  />
                  {fundingAccountVisible ? (
                    <>
                      <FieldLabel>Funding account</FieldLabel>
                      <FieldInput value={fundingAccount} onChangeText={setFundingAccount} />
                    </>
                  ) : null}
                </SectionCard>

                <SectionCard title="Account preferences" badge="">
                  <Pressable onPress={() => setDebitCard((current) => !current)} style={styles.checkboxRow}>
                    <View style={[styles.checkbox, debitCard && styles.checkboxChecked]}>
                      {debitCard ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>Issue debit card</Text>
                  </Pressable>
                  <FieldLabel>Card type</FieldLabel>
                  <DropdownSelect
                    id="cardType"
                    value={cardType}
                    options={CARD_TYPE_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setCardType}
                  />
                  <Pressable onPress={() => setChequeBook((current) => !current)} style={styles.checkboxRow}>
                    <View style={[styles.checkbox, chequeBook && styles.checkboxChecked]}>
                      {chequeBook ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                    </View>
                    <Text style={styles.checkboxText}>Issue cheque book</Text>
                  </Pressable>
                  <FieldLabel>Statements delivery</FieldLabel>
                  <DropdownSelect
                    id="statementDelivery"
                    value={statementDelivery}
                    options={STATEMENT_DELIVERY_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setStatementDelivery}
                  />
                  <FieldLabel>Frequency</FieldLabel>
                  <DropdownSelect
                    id="statementFrequency"
                    value={statementFrequency}
                    options={STATEMENT_FREQUENCY_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={setStatementFrequency}
                  />
                </SectionCard>
              </>
            ) : null}

            {currentStep === 'nominee' ? (
              <>
                <SectionCard title="Nominate someone for this account?" badge="?" >
                  <Text style={styles.helperText}>
                    A nominee receives the account proceeds in case of the customer&apos;s demise.
                  </Text>
                  <FieldLabel>Nomination choice</FieldLabel>
                  <DropdownSelect
                    id="nominationChoice"
                    value={nominationChoice}
                    options={NOMINATION_OPTIONS}
                    openKey={openDropdown}
                    setOpenKey={setOpenDropdown}
                    onSelect={(value) => {
                      setNominationChoice(value);
                      if (value !== 'Yes, nominate now') {
                        setNominees([]);
                      }
                    }}
                  />
                </SectionCard>

                {nominationChoice === 'Yes, nominate now' ? (
                  <SectionCard
                    title="Nominees"
                    badge={nominees.length ? `${nomineeAllocation}% allocated` : '0% allocated'}
                    action={
                      <Pressable
                        style={styles.circleButton}
                        onPress={() => {
                          if (nominees.length < 3) addNominee();
                        }}>
                        <Ionicons name="add" size={28} color="#1D4ED8" />
                      </Pressable>
                    }>
                    <Text style={styles.helperText}>Up to 3 nominees · total share % must equal 100%.</Text>
                    {nominees.length === 0 ? (
                      <View style={styles.nomineeEmptyState}>
                        <Text style={styles.nomineeEmptyText}>No nominees yet — tap + to add one.</Text>
                      </View>
                    ) : (
                      nominees.map((nominee, index) => (
                        <View key={nominee.id} style={styles.nomineeCard}>
                          <View style={styles.proofTopRow}>
                            <Text style={styles.proofTitle}>
                              {nominee.title === 'Select...' ? 'Nominee' : nominee.title} ·{' '}
                              {nominee.firstName || 'First name'} {nominee.lastName || 'Last name'} ·{' '}
                              {nominee.share || '0'}%
                            </Text>
                            <View style={styles.iconRow}>
                              <Pressable onPress={() => removeNominee(nominee.id)}>
                                <Ionicons name="close" size={20} color="#64748B" />
                              </Pressable>
                              <Pressable onPress={() => toggleNomineeOpen(nominee.id)}>
                                <Ionicons
                                  name={nominee.open ? 'chevron-up' : 'chevron-down'}
                                  size={20}
                                  color="#64748B"
                                />
                              </Pressable>
                            </View>
                          </View>
                          {nominee.open ? (
                            <>
                              <FieldLabel>Relationship</FieldLabel>
                              <DropdownSelect
                                id={`relation-${nominee.id}` as DropdownKey}
                                value={nominee.relation}
                                options={RELATION_OPTIONS}
                                openKey={openDropdown}
                                setOpenKey={setOpenDropdown}
                                onSelect={(value) => updateNominee(nominee.id, { relation: value })}
                              />
                              <FieldLabel>Search existing customer (optional)</FieldLabel>
                              <FieldInput placeholder="Name, Cust ID or Aadhaar/PAN..." />
                              <View style={styles.twoColRow}>
                                <View style={styles.flexOne}>
                                  <FieldLabel>Title</FieldLabel>
                                  <DropdownSelect
                                    id={`nominee-title-${nominee.id}` as DropdownKey}
                                    value={nominee.title}
                                    options={TITLE_OPTIONS}
                                    openKey={openDropdown}
                                    setOpenKey={setOpenDropdown}
                                    onSelect={(value) => updateNominee(nominee.id, { title: value })}
                                    placeholderLabel="Select..."
                                  />
                                </View>
                                <View style={styles.flexOne}>
                                  <FieldLabel>First name</FieldLabel>
                                  <FieldInput
                                    value={nominee.firstName}
                                    onChangeText={(value) => updateNominee(nominee.id, { firstName: value })}
                                  />
                                </View>
                              </View>
                              <FieldLabel>Last name</FieldLabel>
                              <FieldInput
                                value={nominee.lastName}
                                onChangeText={(value) => updateNominee(nominee.id, { lastName: value })}
                              />
                              <View style={styles.twoColRow}>
                                <View style={styles.flexOne}>
                                  <FieldLabel>DOB</FieldLabel>
                                  <FieldInput
                                    value={nominee.dob}
                                    onChangeText={(value) =>
                                      updateNominee(nominee.id, { dob: formatDateInput(value) })
                                    }
                                    placeholder="DD/MM/YYYY"
                                  />
                                </View>
                                <View style={styles.flexOne}>
                                  <FieldLabel>Share %</FieldLabel>
                                  <FieldInput
                                    value={nominee.share}
                                    onChangeText={(value) =>
                                      updateNominee(nominee.id, {
                                        share: value.replace(/\D/g, '').slice(0, 3),
                                      })
                                    }
                                  />
                                </View>
                              </View>
                              <Pressable style={styles.checkboxRow}>
                                <View style={styles.checkbox} />
                                <Text style={styles.checkboxText}>Capture identity proof for this nominee</Text>
                              </Pressable>
                              <TouchableOpacity activeOpacity={0.85} style={styles.secondaryButton}>
                                <Text style={styles.secondaryButtonText}>Upload POI</Text>
                              </TouchableOpacity>
                            </>
                          ) : (
                            <Text style={styles.nomineeCollapsedText}>Tap the chevron to expand or edit.</Text>
                          )}
                        </View>
                      ))
                    )}
                  </SectionCard>
                ) : null}
              </>
            ) : null}

            {currentStep === 'review' ? (
              <>
                <SummaryCard
                  title="Customer"
                  value="Mr Rahul bhandari"
                  subtitle="New customer"
                  onEdit={() => goToReviewEditStep('identify')}
                />
                <SummaryCard
                  title="Identity proofs"
                  value="1 proof · 1 verified"
                  onEdit={() => goToReviewEditStep('customer')}
                />
                <SummaryCard
                  title="Compliance"
                  value="AML pass   Sanction pass   PEP captured"
                  chips
                  onEdit={() => goToReviewEditStep('customer')}
                />
                <SummaryCard
                  title="Address"
                  value={permanentLine1 || 'Madhubani, Madhubani 847225'}
                  subtitle={sameAsPermanent ? 'Same as permanent' : `${city || 'City'}, ${stateName || 'State'} ${pincode || 'Pincode'}`}
                  onEdit={() => goToReviewEditStep('address')}
                />
                <SummaryCard
                  title="Product"
                  value={`${product.code} · ${product.name} · ${accountType}`}
                  subtitle={`Mode: Self / Singly · Funding ₹${fundingAmount || '0'}`}
                  onEdit={() => goToReviewEditStep('product')}
                />
                <SummaryCard
                  title="Nominee"
                  value={nominees.length ? `${nominees.length} nominee${nominees.length > 1 ? 's' : ''}` : 'No nominee'}
                  onEdit={() => goToReviewEditStep('nominee')}
                />

                <SectionCard title="Customer attestation" badge="Required">
                  {[
                    'I have read and agreed to the Terms & Conditions.',
                    'I have read and understood the MITC.',
                    'All information provided is true and correct.',
                    'I authorize the bank to use the information for KYC and account servicing.',
                    'I acknowledge the deposit insurance cover under DICGC up to ₹5 lakh.',
                    'I acknowledge the pricing schedule.',
                  ].map((label, index) => (
                    <Pressable
                      key={label}
                      onPress={() =>
                        setCustomerAttestations((current) =>
                          current.map((value, valueIndex) => (valueIndex === index ? !value : value)),
                        )
                      }
                      style={styles.checkboxRow}>
                      <View style={[styles.checkbox, customerAttestations[index] && styles.checkboxChecked]}>
                        {customerAttestations[index] ? (
                          <Ionicons name="checkbox" size={18} color="#FFFFFF" />
                        ) : null}
                      </View>
                      <Text style={styles.checkboxText}>{label}</Text>
                    </Pressable>
                  ))}
                </SectionCard>

                <SectionCard title="RM attestation" badge="RM-12 · Anuja S">
                  {[
                    'I have personally met the customer and verified identity in original.',
                    'I have explained the product features and pricing.',
                  ].map((label, index) => (
                    <Pressable
                      key={label}
                      onPress={() =>
                        setRmAttestations((current) =>
                          current.map((value, valueIndex) => (valueIndex === index ? !value : value)),
                        )
                      }
                      style={styles.checkboxRow}>
                      <View style={[styles.checkbox, rmAttestations[index] && styles.checkboxChecked]}>
                        {rmAttestations[index] ? <Ionicons name="checkbox" size={18} color="#FFFFFF" /> : null}
                      </View>
                      <Text style={styles.checkboxText}>{label}</Text>
                    </Pressable>
                  ))}
                </SectionCard>
              </>
            ) : null}

            {currentStep === 'submit' ? (
              <View style={styles.successPanel}>
                <Ionicons name="checkmark-circle" size={56} color="#127A36" />
                <Text style={styles.successTitle}>Application submitted</Text>
                <Text style={styles.successBody}>The account creation request is now ready for ops review.</Text>
              </View>
            ) : null}
          </ScrollView>
        </KeyboardAvoidingView>

        {currentStep !== 'submit' && currentStep !== 'identify' ? (
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.85} style={styles.footerButton}>
              <Text style={styles.footerSecondaryText}>Save draft</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              disabled={
                (currentStep === 'identify' && !canContinueIdentify) ||
                (currentStep === 'customer' && !canContinueCustomer) ||
                (currentStep === 'demographic' && !canContinueDemographic) ||
                (currentStep === 'address' && !canContinueAddress) ||
                (currentStep === 'product' && !canContinueProduct) ||
                (currentStep === 'nominee' && !canContinueNominee) ||
                (currentStep === 'review' && !canSubmit)
              }
              onPress={() => {
                if (currentStep === 'review') {
                  handleStepNavigation('submit');
                  return;
                }
                if (currentStep === 'identify' && isNtBFresh) {
                  handleStepNavigation('customer');
                  return;
                }
                goNext();
              }}
              style={[
                styles.footerButton,
                styles.primaryFooterButton,
                ((currentStep === 'identify' && !canContinueIdentify) ||
                  (currentStep === 'customer' && !canContinueCustomer) ||
                  (currentStep === 'demographic' && !canContinueDemographic) ||
                  (currentStep === 'address' && !canContinueAddress) ||
                  (currentStep === 'product' && !canContinueProduct) ||
                  (currentStep === 'nominee' && !canContinueNominee) ||
                  (currentStep === 'review' && !canSubmit)) &&
                  styles.primaryFooterButtonDisabled,
              ]}>
              <Text style={styles.footerPrimaryText}>
                {currentStep === 'review'
                  ? 'Submit application'
                  : currentStep === 'identify' && isNtBFresh
                    ? 'Start KYC'
                    : currentStep === 'nominee'
                      ? 'Next · Submit'
                      : currentStep === 'product'
                        ? 'Next · Nominee'
                        : currentStep === 'address'
                          ? 'Next · Product details'
                          : currentStep === 'demographic'
                            ? 'Next · Address'
                            : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {currentStep === 'submit' ? (
          <View style={styles.footer}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.footerButton}
              onPress={() => router.replace('/(tabs)/accounts')}>
              <Text style={styles.footerSecondaryText}>Back to accounts</Text>
            </TouchableOpacity>
            <TouchableOpacity activeOpacity={0.85} style={styles.footerButton} onPress={() => router.back()}>
              <Text style={styles.footerSecondaryText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.footerButton, styles.primaryFooterButton]}
              onPress={() => router.replace('/(tabs)/accounts')}>
              <Text style={styles.footerPrimaryText}>Done</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {currentStep !== 'identify' ? (
          <View style={styles.footerNoteWrap}>
            <Text style={styles.footerNote}>{footerCopy}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function SectionCard({
  title,
  badge,
  action,
  children,
}: {
  title: string;
  badge?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.cardActions}>
          {badge ? (
            <View style={styles.cardBadge}>
              <Text style={styles.cardBadgeText}>{badge}</Text>
            </View>
          ) : null}
          {action}
        </View>
      </View>
      {children}
    </View>
  );
}

function SummaryCard({
  title,
  value,
  subtitle,
  chips,
  onEdit,
}: {
  title: string;
  value: string;
  subtitle?: string;
  chips?: boolean;
  onEdit?: () => void;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Pressable onPress={onEdit} style={styles.editPill}>
          <Ionicons name="pencil-outline" size={18} color="#64748B" />
        </Pressable>
      </View>
      {chips ? (
        <View style={styles.chipRow}>
          {value.split('   ').map((item) => (
            <View key={item} style={styles.greenChip}>
              <Text style={styles.greenChipText}>{item}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.summaryValue}>{value}</Text>
      )}
      {subtitle ? <Text style={styles.summarySub}>{subtitle}</Text> : null}
    </View>
  );
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

function FieldInput({
  value,
  onChangeText,
  placeholder,
}: {
  value?: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor="#98A2B3"
      style={styles.input}
    />
  );
}

function DropdownSelect({
  id,
  value,
  options,
  openKey,
  setOpenKey,
  error,
  onSelect,
  placeholderLabel = 'Select...',
}: {
  id: DropdownKey;
  value: string;
  options: string[];
  openKey: DropdownKey | null;
  setOpenKey: (value: DropdownKey | null) => void;
  error?: boolean;
  onSelect: (value: string) => void;
  placeholderLabel?: string;
}) {
  const open = openKey === id;
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const anchorRef = useRef<View>(null);
  const [anchorRect, setAnchorRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const estimatedMenuHeight = Math.min((options.length + 1) * 44, 360);
  const availableBelow = anchorRect ? windowHeight - anchorRect.y - anchorRect.height - 16 : 0;
  const availableAbove = anchorRect ? anchorRect.y - 16 : 0;
  const openUp = open && anchorRect ? availableBelow < estimatedMenuHeight && availableAbove > availableBelow : false;
  const menuMaxHeight = anchorRect
    ? Math.max(120, Math.min(estimatedMenuHeight, openUp ? availableAbove : availableBelow))
    : estimatedMenuHeight;
  const menuWidth = anchorRect ? Math.min(Math.max(anchorRect.width, 220), windowWidth - 24) : 220;
  const menuLeft = anchorRect
    ? Math.min(Math.max(anchorRect.x, 12), windowWidth - menuWidth - 12)
    : 12;
  const menuTop = anchorRect
    ? openUp
      ? Math.max(12, anchorRect.y - menuMaxHeight - 8)
      : Math.min(windowHeight - menuMaxHeight - 12, anchorRect.y + anchorRect.height + 8)
    : 0;

  const openMenu = () => {
    anchorRef.current?.measureInWindow((x, y, width, height) => {
      setAnchorRect({ x, y, width, height });
      setOpenKey(open ? null : id);
    });
  };

  return (
    <View style={styles.dropdownWrap}>
      <Pressable
        ref={anchorRef}
        style={[styles.selectBox, error && styles.selectBoxError]}
        onPress={open ? () => setOpenKey(null) : openMenu}>
        <Text style={styles.selectText}>{value}</Text>
        <Ionicons name="chevron-down" size={20} color="#5F6B8D" />
      </Pressable>
      {open ? (
        <Modal
          transparent
          animationType="fade"
          statusBarTranslucent
          visible={open}
          onRequestClose={() => setOpenKey(null)}>
          <View style={styles.dropdownOverlay}>
            <Pressable style={styles.dropdownBackdrop} onPress={() => setOpenKey(null)} />
            <View
              style={[
                styles.dropdownMenu,
                {
                  left: menuLeft,
                  top: menuTop,
                  width: menuWidth,
                  maxHeight: menuMaxHeight,
                },
              ]}>
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                <Pressable
                  onPress={() => {
                    onSelect(placeholderLabel);
                    setOpenKey(null);
                  }}
                  style={[styles.dropdownItem, value === placeholderLabel && styles.dropdownItemActive]}>
                  <Text style={[styles.dropdownItemText, value === placeholderLabel && styles.dropdownItemTextActive]}>
                    {placeholderLabel}
                  </Text>
                  {value === placeholderLabel ? <Ionicons name="checkmark" size={18} color="#FFFFFF" /> : null}
                </Pressable>
                {options.map((item) => (
                  <Pressable
                    key={item}
                    onPress={() => {
                      onSelect(item);
                      setOpenKey(null);
                    }}
                    style={[styles.dropdownItem, value === item && styles.dropdownItemActive]}>
                    <Text style={[styles.dropdownItemText, value === item && styles.dropdownItemTextActive]}>
                      {item}
                    </Text>
                    {value === item ? <Ionicons name="checkmark" size={18} color="#FFFFFF" /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

function TogglePill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.togglePill, active && styles.togglePillActive]}>
      <Text style={[styles.toggleText, active && styles.toggleTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  screen: {
    flex: 1,
    backgroundColor: '#F4F6FB',
  },
  statusStrip: {
    height: 48,
    backgroundColor: '#B9171E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  statusTime: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  statusPill: {
    position: 'absolute',
    left: '33%',
    right: '33%',
    top: 10,
    bottom: 8,
    borderRadius: 22,
    backgroundColor: '#050505',
  },
  statusNetwork: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  header: {
    height: 56,
    backgroundColor: '#DC262E',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
  },
  backPill: {
    height: 34,
    paddingHorizontal: 14,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
  brandDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  brandSubtitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  avatarDot: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  contentShell: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 126,
    gap: 12,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: '#E1E6F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1B2F72',
  },
  progressText: {
    color: '#5F6B8D',
    fontSize: 12,
    fontWeight: '700',
  },
  pageTitle: {
    color: '#162A63',
    fontSize: 22,
    fontWeight: '900',
  },
  pageSubtitle: {
    marginTop: -4,
    color: '#5F6B8D',
    fontSize: 14,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E3E8F3',
    padding: 12,
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardTitle: {
    color: '#162A63',
    fontSize: 16,
    fontWeight: '800',
    flex: 1,
  },
  cardBadge: {
    backgroundColor: '#F3F4F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cardBadgeText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '700',
  },
  inlineBadge: {
    backgroundColor: '#F3F4F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  inlineBadgeText: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
  },
  inlineRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  countryField: {
    width: 106,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED7E9',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
  },
  fieldValue: {
    color: '#162A63',
    fontSize: 15,
    fontWeight: '700',
  },
  mobileInput: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED7E9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: '#162A63',
    fontSize: 15,
    fontWeight: '600',
  },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED7E9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    color: '#162A63',
    fontSize: 15,
    fontWeight: '600',
  },
  inputDisabled: {
    backgroundColor: '#F3F5FA',
    color: '#94A3B8',
  },
  primaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#E02631',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    backgroundColor: '#E5E7EC',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  otpBlock: {
    gap: 10,
  },
  otpHint: {
    color: '#5F6B8D',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpInput: {
    height: 52,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD3E4',
    backgroundColor: '#FFFFFF',
    color: '#162A63',
    fontSize: 16,
    fontWeight: '700',
  },
  otpTip: {
    color: '#5F6B8D',
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  verifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  verifyText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  verifyTextSuccess: {
    color: '#127A36',
    fontSize: 12,
    fontWeight: '700',
  },
  documentOtpCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D5E2FF',
    backgroundColor: '#F8FBFF',
    padding: 12,
    gap: 10,
  },
  documentOtpStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 52,
  },
  documentOtpStatusText: {
    color: '#127A36',
    fontSize: 13,
    fontWeight: '700',
  },
  documentVerifiedCard: {
    borderRadius: 18,
    backgroundColor: '#DFF4E6',
    borderWidth: 1,
    borderColor: '#B7E4C7',
    padding: 14,
    gap: 8,
  },
  documentVerifiedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  documentVerifiedTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  documentVerifiedName: {
    color: '#127A36',
    fontSize: 16,
    fontWeight: '900',
    flex: 1,
  },
  documentVerifiedDob: {
    color: '#127A36',
    fontSize: 12,
    fontWeight: '800',
  },
  documentVerifiedBody: {
    color: '#127A36',
    fontSize: 13,
    fontWeight: '700',
  },
  documentVerifiedLink: {
    color: '#127A36',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  demoGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  demoChip: {
    flex: 1,
    minWidth: 92,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7DEEA',
    backgroundColor: '#FFFFFF',
    padding: 10,
    gap: 4,
  },
  demoLabel: {
    color: '#162A63',
    fontSize: 14,
    fontWeight: '800',
  },
  demoNumber: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '600',
  },
  greenBanner: {
    backgroundColor: '#E8F7EE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#B8E2C6',
    padding: 12,
    gap: 8,
  },
  greenBannerText: {
    color: '#127A36',
    fontSize: 13,
    fontWeight: '700',
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bannerTitle: {
    color: '#127A36',
    fontSize: 14,
    fontWeight: '900',
  },
  bannerLabel: {
    color: '#14532D',
    fontSize: 12,
    fontWeight: '700',
  },
  pillList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  productPill: {
    backgroundColor: '#DDF3E4',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  productPillText: {
    color: '#14532D',
    fontSize: 11,
    fontWeight: '700',
  },
  infoBanner: {
    backgroundColor: '#EAF1FF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BDD2FF',
    padding: 12,
    gap: 10,
  },
  infoTitle: {
    color: '#1D4ED8',
    fontSize: 14,
    fontWeight: '900',
  },
  infoBody: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  redCta: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#DC262E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  redCtaText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  twoColRow: {
    flexDirection: 'row',
    gap: 8,
  },
  flexOne: {
    flex: 1,
  },
  fieldLabel: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  selectBox: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED7E9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dropdownWrap: {
    position: 'relative',
    overflow: 'visible',
  },
  dropdownOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  dropdownMenu: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D1D5E3',
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 18,
    overflow: 'hidden',
    zIndex: 1000,
  },
  dropdownItem: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownItemActive: {
    backgroundColor: '#5E9CF6',
  },
  dropdownItemText: {
    color: '#293241',
    fontSize: 14,
    fontWeight: '500',
  },
  dropdownItemTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  selectBoxError: {
    borderColor: '#FF8A84',
    backgroundColor: '#FFFDFD',
  },
  selectText: {
    color: '#162A63',
    fontSize: 15,
    fontWeight: '600',
  },
  proofCard: {
    backgroundColor: '#FBFCFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    padding: 12,
    gap: 10,
  },
  proofTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  proofTitle: {
    flex: 1,
    color: '#162A63',
    fontSize: 14,
    fontWeight: '900',
  },
  smallBadge: {
    backgroundColor: '#F3F4F8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  smallBadgeSuccess: {
    backgroundColor: '#DFF4E6',
  },
  smallBadgeText: {
    color: '#667085',
    fontSize: 11,
    fontWeight: '700',
  },
  smallBadgeTextSuccess: {
    color: '#127A36',
  },
  iconSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED7E9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  helperText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  secondaryButton: {
    minHeight: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED7E9',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#162A63',
    fontSize: 14,
    fontWeight: '800',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#7C879D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0B78F0',
    borderColor: '#0B78F0',
  },
  checkboxText: {
    flex: 1,
    color: '#162A63',
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  pillToggleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  togglePill: {
    flex: 1,
    minHeight: 40,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#CED7E9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  togglePillActive: {
    backgroundColor: '#162A63',
  },
  toggleText: {
    color: '#162A63',
    fontSize: 13,
    fontWeight: '700',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  taxPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CED7E9',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  taxPillActive: {
    borderColor: '#0B78F0',
    backgroundColor: '#EEF5FF',
  },
  taxRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  taxRadioActive: {
    borderColor: '#0B78F0',
  },
  taxRadioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0B78F0',
  },
  taxPillText: {
    color: '#162A63',
    fontSize: 13,
    fontWeight: '700',
  },
  taxPillTextActive: {
    color: '#0B78F0',
  },
  productCard: {
    backgroundColor: '#F7F8FC',
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  codeChip: {
    backgroundColor: '#E1EBFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  codeChipText: {
    color: '#1D4ED8',
    fontSize: 11,
    fontWeight: '800',
  },
  productName: {
    color: '#162A63',
    fontSize: 14,
    fontWeight: '800',
  },
  nomineeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5EAF3',
    padding: 12,
    gap: 10,
  },
  nomineeEmptyState: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  nomineeEmptyText: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '600',
  },
  nomineeCollapsedText: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  preferenceGrid: {
    gap: 12,
  },
  preferenceGridRow: {
    flexDirection: 'row',
    gap: 12,
  },
  preferenceItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  preferenceItemFull: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  greenChip: {
    backgroundColor: '#DFF4E6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  greenChipText: {
    color: '#127A36',
    fontSize: 11,
    fontWeight: '700',
  },
  summaryValue: {
    color: '#162A63',
    fontSize: 14,
    fontWeight: '700',
  },
  summarySub: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  editPill: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  circleButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#D7DEEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successPanel: {
    marginTop: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DFF4E6',
    padding: 18,
    alignItems: 'center',
    gap: 10,
  },
  successTitle: {
    color: '#127A36',
    fontSize: 18,
    fontWeight: '900',
  },
  successBody: {
    color: '#334155',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#F4F6FB',
    flexDirection: 'row',
    gap: 8,
  },
  footerButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED7E9',
  },
  footerSecondaryText: {
    color: '#162A63',
    fontSize: 13,
    fontWeight: '800',
  },
  primaryFooterButton: {
    backgroundColor: '#E02631',
    borderColor: '#E02631',
  },
  primaryFooterButtonDisabled: {
    backgroundColor: '#E5E7EC',
    borderColor: '#E5E7EC',
  },
  footerPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },
  footerNoteWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 62,
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  footerNote: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 17,
  },
});
