import { StyleSheet } from 'react-native';

import { esafColors, esafFonts, esafRadius } from './esafTheme';

/**
 * App-wide shared styles.
 *
 * Keep this file focused on reusable primitives (layout containers, cards,
 * typography, etc.). Screen-specific styles should remain local.
 */
export const globalStyles = StyleSheet.create({
  // Common layout
  safeArea: {
    flex: 1,
    backgroundColor: esafColors.page.bg,
  },

  screenBase: {
    flex: 1,
    backgroundColor: esafColors.page.bg,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  col: {
    flexDirection: 'column',
  },

  // Inputs
  input: {
    flex: 1,
    fontSize: 16,
    color: esafColors.brand.navy,
    backgroundColor: esafColors.page.bg,
  },


  // Cards / surfaces
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: esafRadius.xl,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'hsla(222, 73%, 19%, 0.12)',
  },

  cardElevated: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },

  // Typography
  // Note: StyleSheet.create expects each top-level entry to be a style
  // object for a single RN style type (View/Text/Image). We keep typography
  // as separate top-level keys to satisfy TS.
  typographyTitle: {
    fontFamily: esafFonts.sans,
    fontSize: 24,
    fontWeight: '800',
    color: esafColors.brand.navy,
  },

  typographySubtitle: {
    fontFamily: esafFonts.sans,
    fontSize: 14,
    fontWeight: '600',
    color: esafColors.page.textMute,
  },

  typographyLabel: {
    fontFamily: esafFonts.sans,
    fontSize: 12,
    fontWeight: '700',
    color: esafColors.page.textMute,
  },

  // Navigation header (used in app/_layout.tsx)
  navHeader: {
    height: 120,
    paddingTop: 52,
    paddingHorizontal: 20,
    backgroundColor: '#F5F7FB',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  navHeaderLogo: {
    width: 90,
    height: 28,
  },

  navHeaderStatusDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: '#FF6B35',
  },

  // Shared button primitive (single source of truth)
  // Requested global button background
  btnPrimary: {
    backgroundColor: '#112A74',

    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnTextPrimary: {
    color: '#FFFFFF',
    fontFamily: esafFonts.sans,
    fontSize: 13,
    fontWeight: '500',
  },
});

