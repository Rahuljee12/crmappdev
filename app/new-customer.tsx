import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { globalStyles } from '@/theme/globalStyles';
import { Fonts } from '@/theme/theme';

const products = ['Savings Account', 'Current Account', 'Fixed Deposit', 'Loan'] as const;

function asString(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export default function NewCustomerScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mobile?: string | string[] }>();
  const mobile = asString(params.mobile);
  const [selectedProduct, setSelectedProduct] = useState<typeof products[number] | ''>('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState<typeof products[number] | ''>('');
  const [selectHovered, setSelectHovered] = useState(false);

  const canCreateLead = useMemo(() => Boolean(selectedProduct), [selectedProduct]);

  return (
    <SafeAreaView style={globalStyles.safeArea} edges={['left', 'right']}>
      <StatusBar style="dark" />

      <AppHeader />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.content,
            { paddingBottom: insets.bottom + 280 },
          ]}>
          <Text style={styles.pageTitle}>New Customer</Text>

          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Ionicons name="person-add-outline" size={36} color="#1E3A8A" />
            </View>
            <Text style={styles.heroTitle}>No existing customer or lead found</Text>
            <Text style={styles.heroSubtitle}>{mobile}</Text>
          </View>

          <Text style={styles.sectionLabel}>SELECT PRODUCT OF INTEREST</Text>

          <View style={styles.selectorGroup}>
            <Pressable
              onHoverIn={() => setSelectHovered(true)}
              onHoverOut={() => setSelectHovered(false)}
              onPress={() => setPickerOpen((value) => !value)}
              style={({ pressed }) => [
                styles.selectField,
                selectHovered && styles.selectFieldHovered,
                pressed && styles.selectFieldPressed,
              ]}>
              <Text style={[styles.selectFieldText, !selectedProduct && styles.selectPlaceholder]}>
                {selectedProduct || 'Choose a product'}
              </Text>
              <Ionicons name={pickerOpen ? 'chevron-up' : 'chevron-down'} size={22} color="#9CA3AF" />
            </Pressable>

            {pickerOpen ? (
              <View style={styles.pickerCard}>
                {products.map((product, index) => {
                  const active = selectedProduct === product;
                  const highlighted =
                    active ||
                    hoveredProduct === product ||
                    (!selectedProduct && index === 0);

                  return (
                    <Pressable
                      key={product}
                      onHoverIn={() => setHoveredProduct(product)}
                      onHoverOut={() => setHoveredProduct((current) => (current === product ? '' : current))}
                      onPressIn={() => setHoveredProduct(product)}
                      onPress={() => {
                        setSelectedProduct(product);
                        setHoveredProduct('');
                        setPickerOpen(false);
                      }}
                      style={({ pressed }) => [
                        styles.pickerItem,
                        highlighted && styles.pickerItemHighlighted,
                        pressed && styles.pickerItemHighlighted,
                      ]}>
                      <Text
                        style={[
                          styles.pickerText,
                          highlighted && styles.pickerTextHighlighted,
                        ]}>
                        {product}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <Text style={styles.helperText}>
            Mobile number will be pre-filled in the lead form.
          </Text>
        </ScrollView>

        <View
          style={[
            styles.actionsShell,
            {
              bottom: insets.bottom + 102,
            },
          ]}>
          <TouchableOpacity
            style={[styles.primaryButton, !canCreateLead && styles.primaryButtonDisabled]}
            onPress={() => {
              router.push({
                pathname: '/modal',
                params: {
                  mobile,
                  product: selectedProduct,
                },
              });
            }}
            disabled={!canCreateLead}>
            <Text style={styles.primaryButtonText}>Create New Lead</Text>
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

  content: {
    padding: 12,
    gap: 16,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F4F7FB',
    opacity: 0.18,
    marginBottom: 4,
  },

  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#94A3B8',
    shadowOpacity: 0.14,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },

  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },

  heroSubtitle: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },

  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#64748B',
  },

  selectorGroup: {
    gap: 8,
  },

  selectField: {
    minHeight: 58,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D7DEE8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  selectFieldPressed: {
    backgroundColor: '#F8FAFC',
    borderColor: '#C7D2FE',
  },

  selectFieldHovered: {
    borderColor: '#F97316',
    backgroundColor: '#FFF7ED',
  },

  selectFieldText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },

  selectPlaceholder: {
    color: '#6B7280',
  },

  pickerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D7DEE8',
    overflow: 'hidden',
    shadowColor: '#94A3B8',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },

  pickerItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  pickerItemHighlighted: {
    backgroundColor: '#F97316',
  },

  pickerText: {
    fontSize: 16,
    color: '#111827',
  },

  pickerTextHighlighted: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  helperText: {
    marginTop: -4,
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },

  actionsShell: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 14,
    paddingHorizontal: 12,
  },

  primaryButton: {
    height: 54,
    borderRadius: 18,
    backgroundColor: '#17307F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  primaryButtonDisabled: {
    opacity: 0.45,
  },

  primaryButtonText: {
    color: '#FFFFFF',
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
