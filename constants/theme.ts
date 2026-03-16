export const Colors = {
  // Backgrounds
  background: '#0A0A0A',
  backgroundCard: '#111111',
  backgroundElevated: '#161616',
  backgroundOverlay: 'rgba(0, 0, 0, 0.85)',
  backgroundSubtle: 'rgba(255, 255, 255, 0.05)',

  // Gold Palette
  gold: '#C9A84C',
  goldLight: '#E8C87A',
  goldDark: '#9A7A35',
  goldMuted: 'rgba(201, 168, 76, 0.12)',
  goldMutedLight: 'rgba(201, 168, 76, 0.2)',
  goldBorder: 'rgba(201, 168, 76, 0.3)',

  // Text
  textPrimary: '#FFFFFF',
  textSecondary: '#CCCCCC',
  textMuted: '#888888',
  textDisabled: '#555555',

  // Borders
  border: '#222222',
  borderLight: '#2A2A2A',

  // Status
  success: '#2ECC71',
  successMuted: 'rgba(46, 204, 113, 0.15)',
  successBorder: 'rgba(46, 204, 113, 0.3)',
  warning: '#F39C12',
  warningMuted: 'rgba(243, 156, 18, 0.15)',
  warningBorder: 'rgba(243, 156, 18, 0.3)',
  error: '#E74C3C',
  errorMuted: 'rgba(231, 76, 60, 0.15)',
  errorBorder: 'rgba(231, 76, 60, 0.3)',
  info: '#3498DB',
  infoMuted: 'rgba(52, 152, 219, 0.15)',
  infoBorder: 'rgba(52, 152, 219, 0.3)',

  // Accent (quick-action icons)
  accentPurple: '#9B59B6',
  accentTeal: '#1ABC9C',

  // Tab bar
  tabActive: '#C9A84C',
  tabInactive: '#555555',
  tabBackground: '#0D0D0D',
};

export const Typography = {
  // Font sizes
  xs: 12,
  sm: 13,
  base: 15,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  display: 38,

  // Font weights (as string for StyleSheet)
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  heavy: '800' as const,

  // Letter spacing
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
  widest: 2,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
  section: 56,
};

export const Radius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 9999,
};

export const Shadow = {
  gold: {
    shadowColor: '#C9A84C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
};

export const GradientColors = {
  gold: ['#E8C87A', '#C9A84C', '#9A7A35'] as const,
  goldDisabled: ['#4A3A1A', '#2A2010'] as const,
  goldSubtle: ['rgba(201,168,76,0.18)', 'rgba(201,168,76,0.04)'] as const,
  dark: ['#1A1A1A', '#0A0A0A'] as const,
  card: ['#1C1C1C', '#111111'] as const,
  cardGold: ['#1C1800', '#111111'] as const,
  hero: ['#1C1400', '#0A0A0A'] as const,
  heroOverlay: ['transparent', 'rgba(10,10,10,0.95)'] as const,
};
