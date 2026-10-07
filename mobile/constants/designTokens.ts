import { StyleSheet, Easing, Platform, Animated } from 'react-native';

/**
 * Mento Design System Tokens — "Warm Reassurance" 🚪🌿
 * Exact palette and Manrope typography matching design specs.
 */

export const Palette = {
  // Primary Dark Charcoal
  primary: '#2C2D30',
  primaryLight: '#43454A',
  primaryDark: '#1A1B1D',

  // Secondary Forest Sage Green (Verified essentials & safe home status)
  secondary: '#2E7D5B',
  secondaryLight: '#419972',
  secondaryDark: '#1E583F',
  secondaryTrack: '#176B4B',
  secondaryMint: '#BEFFDB',
  secondarySoft: 'rgba(46, 125, 91, 0.12)',
  secondaryGlow: 'rgba(46, 125, 91, 0.25)',

  // Tertiary Warm Amber (Safety checks & hold-to-confirm)
  tertiary: '#D97706',
  tertiaryLight: '#F59E0B',
  tertiaryDark: '#92400E',
  tertiarySoft: 'rgba(217, 119, 6, 0.12)',
  tertiaryGlow: 'rgba(217, 119, 6, 0.25)',

  // Neutral Stone Slate
  neutral: '#6B6D72',
  neutralLight: '#9CA3AF',
  neutralDark: '#4A4946',

  // Light Theme Surfaces & Canvas (Subtle border opacities)
  light: {
    background: '#F4F5F7',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceSubtle: '#F0F1F3',
    surfaceHighlight: '#E8E9EC',
    card: '#FFFFFF',
    cardSecondary: '#F0F1F3',
    cardBorder: 'rgba(44, 45, 48, 0.06)',
    pillBackground: 'rgba(44, 45, 48, 0.025)',
    pillBackgroundHover: 'rgba(44, 45, 48, 0.04)',
    border: 'rgba(44, 45, 48, 0.08)',
    borderSubtle: 'rgba(44, 45, 48, 0.04)',
    borderHairline: 'rgba(44, 45, 48, 0.03)',
    
    text: '#2C2D30',
    textPrimary: '#2C2D30',
    textSecondary: '#6B6D72',
    textMuted: '#9CA3AF',
  },

  // Dark Theme Surfaces & Canvas (Warm Obsidian)
  dark: {
    background: '#18191B',
    surface: '#222327',
    surfaceElevated: '#2A2C31',
    surfaceSubtle: '#1D1E21',
    surfaceHighlight: '#34363C',
    card: '#222327',
    cardSecondary: '#1D1E21',
    cardBorder: 'rgba(255, 255, 255, 0.07)',
    pillBackground: 'rgba(255, 255, 255, 0.035)',
    pillBackgroundHover: 'rgba(255, 255, 255, 0.06)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderSubtle: 'rgba(255, 255, 255, 0.04)',
    borderHairline: 'rgba(255, 255, 255, 0.03)',
    
    text: '#F6F5F2',
    textPrimary: '#F6F5F2',
    textSecondary: '#A8A7A2',
    textMuted: '#767571',
  },

  // Semantic Alert Red (Distance alerts & urgent actions)
  rose: '#C53030',
  roseLight: '#E53E3E',
  roseDark: '#82181A',
  roseSoft: 'rgba(197, 48, 48, 0.12)',
  roseGlow: 'rgba(197, 48, 48, 0.25)',

  // Validation Error Red & Surface Tokens
  error: '#DC2626',
  errorLight: '#EF4444',
  errorDark: '#B91C1C',
  errorSurface: '#FEF2F2',
  errorBorder: '#FECACA',
  errorBorderStrong: '#DC2626',
};

// Default active theme (Light default, with dark support)
export const Colors = {
  // Primary Brand & Surfaces (Light default)
  background: Palette.light.background,
  card: Palette.light.card,
  cardSecondary: Palette.light.cardSecondary,
  cardBorder: Palette.light.cardBorder,
  surface: Palette.light.surface,
  surfaceElevated: Palette.light.surfaceElevated,
  surfaceSubtle: Palette.light.surfaceSubtle,
  surfaceHighlight: Palette.light.surfaceHighlight,
  pillBackground: Palette.light.pillBackground,
  pillBackgroundHover: Palette.light.pillBackgroundHover,

  border: Palette.light.border,
  borderSubtle: Palette.light.borderSubtle,
  borderHairline: Palette.light.borderHairline,

  text: Palette.light.text,
  textPrimary: Palette.light.textPrimary,
  textSecondary: Palette.light.textSecondary,
  textMuted: Palette.light.textMuted,

  // Semantic & Brand Tokens
  primary: Palette.primary,
  primaryLight: Palette.primaryLight,
  primaryDark: Palette.primaryDark,

  secondary: Palette.secondary,
  secondaryLight: Palette.secondaryLight,
  secondaryDark: Palette.secondaryDark,
  secondarySoft: Palette.secondarySoft,
  secondaryGlow: Palette.secondaryGlow,

  emerald: Palette.secondary, // Alias for verified items
  emeraldLight: Palette.secondaryLight,
  emeraldDark: Palette.secondaryDark,
  emeraldSoft: Palette.secondarySoft,

  tertiary: Palette.tertiary,
  tertiaryLight: Palette.tertiaryLight,
  tertiaryDark: Palette.tertiaryDark,
  tertiarySoft: Palette.tertiarySoft,

  amber: Palette.tertiary, // Alias for safety checks
  amberLight: Palette.tertiaryLight,
  amberDark: Palette.tertiaryDark,
  amberSoft: Palette.tertiarySoft,

  neutral: Palette.neutral,
  neutralLight: Palette.neutralLight,
  neutralDark: Palette.neutralDark,

  coral: Palette.rose,
  coralLight: Palette.roseLight,
  coralDark: Palette.roseDark,
  coralSoft: Palette.roseSoft,

  rose: Palette.rose,
  roseLight: Palette.roseLight,
  roseDark: Palette.roseDark,
  roseSoft: Palette.roseSoft,

  // Validation Error Aliases
  error: Palette.error,
  errorLight: Palette.errorLight,
  errorDark: Palette.errorDark,
  errorSurface: Palette.errorSurface,
  errorBorder: Palette.errorBorder,
  errorBorderStrong: Palette.errorBorderStrong,

  // Simulator & Utility aliases
  blue: '#3B82F6',
  blueLight: '#60A5FA',
  blueDark: '#1D4ED8',
  purple: '#8B5CF6',
};

export const FontFamily = {
  regular: 'Manrope_400Regular',
  medium: 'Manrope_500Medium',
  semiBold: 'Manrope_600SemiBold',
  bold: 'Manrope_700Bold',
  extraBold: 'Manrope_800ExtraBold',
};

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  hero: 32,
};

export const BorderRadius = {
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 9999,
  full: 9999,
};

export const BorderWidth = {
  hairline: StyleSheet.hairlineWidth, // ~0.5px on Retina/High-DPI
  subtle: 0.75,
  regular: 1,
  bold: 2,
};

export const Typography = {
  h1: {
    fontFamily: FontFamily.extraBold,
    fontSize: 28,
    letterSpacing: -0.6,
    lineHeight: 34,
  },
  h2: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  h3: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    letterSpacing: -0.2,
    lineHeight: 24,
  },
  body: {
    fontFamily: FontFamily.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  bodyMedium: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  bodySmall: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    lineHeight: 18,
  },
  label: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    letterSpacing: -0.1,
  },
  caption: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    lineHeight: 16,
  },
  badge: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    letterSpacing: 0.5,
  },
};

export const Shadows = {
  subtle: {
    shadowColor: '#2C2D30',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  soft: {
    shadowColor: '#2C2D30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#2C2D30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
  },
  glowSecondary: {
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
};

/**
 * Standard Bottom Sheet & Modal Motion Behavior Tokens
 * Engineered for zero-delay tap responsiveness and fluid gesture dismissal.
 */
export const ModalMotion = {
  duration: {
    enterSlide: 180,
    enterFade: 150,
    exitSlide: 180,
    exitFade: 150,
    snapBack: 140,
  },
  easing: {
    // Snappy ease-out curve that settles immediately at rest (zero oscillation, avoids touch hit-test locks)
    enter: Easing.bezier(0.16, 1, 0.3, 1),
    // Fluid iOS-style deceleration curve for dismissal
    exit: Easing.bezier(0.32, 0.72, 0, 1),
    // Smooth backdrop fade curve
    fade: Easing.out(Easing.quad),
    // Rubber-band snap back curve
    snap: Easing.out(Easing.quad),
  },
  distance: {
    slideHiddenOffset: 850,
    dismissOffset: 900,
  },
  gesture: {
    startThreshold: 4, // Movement px before active tracking on empty background
    dragThreshold: 8, // Minimum px drag before responder claims gesture over buttons
    directionalRatio: 1.5, // Vertical movement must exceed horizontal by this multiplier
    dismissDistance: 60, // Minimum downward drag distance in px to trigger close
    dismissVelocity: 0.45, // Downward flick velocity threshold to trigger close
    upwardResistance: 0.12, // Damping resistance multiplier on upward pull
  },
  touch: {
    delayPressIn: 0, // Zero-delay touch registration for instantaneous button reaction
    activeOpacity: 0.6, // Tactile feedback opacity for touchable items
  },
  backdropMaxOpacity: 0.5, // Standard dimmed backdrop opacity
};

/**
 * iOS-Style Screen Slide Transition Tokens & Spring Physics
 * Used for full-screen slide sheets (Edit Routine, Add Location, etc.)
 * Provides ultra-smooth 60/120fps hardware-accelerated slide up and down animations
 * synchronized with background scale recession and dock dismissal.
 */
export const ScreenSlideMotion = {
  spring: {
    // Upward slide-in spring physics (natural deceleration with zero overshoot)
    slideEnter: {
      toValue: 1,
      damping: 24,
      mass: 0.8,
      stiffness: 190,
      useNativeDriver: true,
    },
    // Background content subtle recession spring on enter
    backgroundEnter: {
      toValue: 1,
      damping: 20,
      mass: 0.65,
      stiffness: 220,
      useNativeDriver: true,
    },
    // Background content restoration spring on exit
    backgroundExit: {
      toValue: 0,
      damping: 22,
      mass: 0.65,
      stiffness: 240,
      useNativeDriver: true,
    },
  },
  timing: {
    // Downward slide-out transition
    slideExit: {
      toValue: 0,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    },
  },
  interpolation: {
    // Background scale recession range
    backgroundScale: {
      inputRange: [0, 1],
      outputRange: [1, 0.97],
    },
    // Background opacity dimming range
    backgroundOpacity: {
      inputRange: [0, 1],
      outputRange: [1, 0.96],
    },
    // Floating dock slide-down range
    dockTranslateY: {
      inputRange: [0, 1],
      outputRange: [0, 130],
    },
    // Helper to generate dynamic translateY interpolation from offscreen to resting position
    sheetTranslateY: (screenHeight: number) => ({
      inputRange: [0, 1],
      outputRange: [screenHeight, 0],
    }),
  },
};

/**
 * Pre-configured composite animations for ScreenSlideMotion
 * Ready-to-use helpers for opening and closing sliding screens.
 */
export const createScreenSlideAnimation = {
  open: (
    slideAnim: Animated.Value,
    zoomAnim?: Animated.Value,
    onComplete?: () => void
  ) => {
    slideAnim.setValue(0);
    const animations: Animated.CompositeAnimation[] = [
      Animated.spring(slideAnim, ScreenSlideMotion.spring.slideEnter),
    ];
    if (zoomAnim) {
      animations.push(Animated.spring(zoomAnim, ScreenSlideMotion.spring.backgroundEnter));
    }
    const composite = Animated.parallel(animations);
    composite.start(onComplete);
    return composite;
  },
  close: (
    slideAnim: Animated.Value,
    zoomAnim?: Animated.Value,
    onComplete?: () => void
  ) => {
    const animations: Animated.CompositeAnimation[] = [
      Animated.timing(slideAnim, ScreenSlideMotion.timing.slideExit),
    ];
    if (zoomAnim) {
      animations.push(Animated.spring(zoomAnim, ScreenSlideMotion.spring.backgroundExit));
    }
    const composite = Animated.parallel(animations);
    composite.start(onComplete);
    return composite;
  },
};

/**
 * Standard Full Screen Slide Overlay Styling
 */
export const ScreenSlideStyles = {
  overlay: {
    backgroundColor: '#FFFFFF',
    zIndex: 100,
    elevation: 25,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
};

/**
 * Standard Modal & Bottom Sheet Visual Styling Tokens
 * Pre-configured styles for Sheet Container, Grabber, Left-Aligned Header, Border Close Button, and Cards.
 */
export const ModalStyles = {
  overlay: {
    flex: 1,
    justifyContent: 'flex-end' as const,
  },
  backdrop: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  sheetContainer: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm + 4,
    paddingBottom: Platform.OS === 'ios' ? 42 : Spacing.xl,
    ...Shadows.elevated,
  },
  grabber: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center' as const,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    color: Colors.textPrimary,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  actionsList: {
    gap: Spacing.sm + 2,
  },
  actionCard: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.borderHairline,
  },
  actionIconBox: {
    width: 42,
    height: 42,
    borderRadius: BorderRadius.md,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginRight: Spacing.md,
  },
};

/**
 * Standard Form Field & Error UI Tokens
 * Pre-configured styling tokens for Required Field Labels, Error Input States, Inline Validation Badges, and Error Banners.
 */
export const FormFieldStyles = {
  // Label Row with optional required asterisk
  labelRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    marginBottom: 6,
  },
  label: {
    ...Typography.label,
    color: Colors.textSecondary,
  },
  requiredAsterisk: {
    color: Palette.error,
    fontFamily: FontFamily.bold,
    fontSize: 13,
  },

  // Base and Error Input States
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 14,
    paddingVertical: 11,
    ...Typography.body,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: Colors.borderHairline,
  },
  inputError: {
    borderColor: Palette.error,
    borderWidth: 1.5,
    backgroundColor: Palette.errorSurface,
  },

  // Inline Error Badge (AlertCircle icon + text)
  inlineErrorRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 5,
    marginTop: 6,
    paddingHorizontal: 2,
  },
  inlineErrorIconColor: Palette.error,
  inlineErrorText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Palette.error,
  },

  // Full-width General Error Banner
  errorBanner: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 8,
    backgroundColor: Palette.errorSurface,
    borderWidth: 1,
    borderColor: Palette.errorBorder,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontFamily: FontFamily.medium,
    fontSize: 13,
    color: Palette.error,
    flex: 1,
  },
};

/**
 * Standard Routine Card Styling Tokens
 * Flat, zero-shadow cards with hairline border and unified primary color semantics.
 */
export const RoutineCardStyles = {
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.borderHairline,
    // Explicitly NO shadows - flat, clean design
    shadowOpacity: 0,
    elevation: 0,
  },
  cardInactive: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
    marginBottom: Spacing.xs + 2,
  },
  titleContainer: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 15.5,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  locationRow: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
  },
  locationText: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.textSecondary,
  },
  metaBar: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    flexWrap: 'wrap' as const,
    gap: Spacing.xs,
    paddingTop: Spacing.xs,
  },
  metaBarBorder: {
    paddingBottom: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderHairline,
  },
  metaChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.pill,
    backgroundColor: Colors.pillBackground,
    borderWidth: 1,
    borderColor: Colors.borderHairline,
  },
  metaChipText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  metaChipTextBold: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  itemTag: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3.5,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.pillBackground,
    borderWidth: 1,
    borderColor: Colors.borderHairline,
    maxWidth: 135,
  },
  itemTagText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Colors.textSecondary,
  },
  itemTagMore: {
    backgroundColor: Colors.pillBackgroundHover,
    borderWidth: 1,
    borderColor: Colors.borderHairline,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3.5,
  },
  itemTagMoreText: {
    fontFamily: FontFamily.medium,
    fontSize: 11.5,
    color: Colors.textMuted,
  },
};




