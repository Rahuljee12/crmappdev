import { esafColors } from '@/theme/esafTheme';
import { StyleSheet } from 'react-native';

// Shared React Native styles ported from the provided CSS design system.
// This does not attempt to replicate Tailwind’s utility layer; it exposes
// “component classes” as RN StyleSheet objects.

export const esafStyles = StyleSheet.create({
  esafCard: {
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsla(222, 73%, 19%, 0.08)',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },

  esafPill: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    fontSize: 10,
    fontWeight: '500',
    lineHeight: 14,
  },

  pillNeutral: {
    backgroundColor: 'hsla(222, 73%, 19%, 0.06)',
    color: esafColors.brand.navy,
  },

  pillGreen: {
    backgroundColor: esafColors.status.successBg,
    color: esafColors.brand.green,
  },

  pillAmber: {
    backgroundColor: esafColors.status.warnBg,
    color: esafColors.brand.amber,
  },

  pillRed: {
    backgroundColor: esafColors.status.dangerBg,
    color: esafColors.brand.redDark,
  },

  pillInfo: {
    backgroundColor: esafColors.status.infoBg,
    color: 'hsl(213 75% 38%)',
  },

  esafInput: {
    width: '100%',
    backgroundColor: '#fff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsla(222, 73%, 19%, 0.16)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 9,
    fontSize: 12,
    color: esafColors.brand.navy,
  },

  esafBtnPrimary: {
    backgroundColor: esafColors.brand.red,
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  esafBtnSecondary: {
    backgroundColor: esafColors.brand.navy,
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

