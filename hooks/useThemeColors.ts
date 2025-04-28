import { useThemeStore } from "@/store/theme-store";
import { colors } from "@/constants/colors";

export function useThemeColors() {
  const { isDarkMode } = useThemeStore();

  return {
    background: isDarkMode ? colors.darkBackground : colors.background,
    backgroundLight: isDarkMode ? colors.darkBackgroundLight : colors.backgroundLight,
    backgroundDark: isDarkMode ? colors.darkBackgroundDark : colors.backgroundDark,
    backgroundGradient: isDarkMode ? colors.darkBackgroundGradient : colors.backgroundGradient,
    
    card: isDarkMode ? colors.darkCard : colors.card,
    cardAlt: isDarkMode ? colors.darkCardAlt : colors.cardAlt,
    cardGradient: isDarkMode ? colors.darkCardGradient : colors.cardGradient,
    
    text: isDarkMode ? colors.darkText : colors.text,
    textLight: isDarkMode ? colors.darkTextLight : colors.textLight,
    textMuted: isDarkMode ? colors.darkTextMuted : colors.textMuted,
    
    border: isDarkMode ? colors.darkBorder : colors.border,
    borderLight: isDarkMode ? colors.darkBorderLight : colors.borderLight,
    
    overlay: isDarkMode ? colors.darkOverlay : colors.overlay,
    overlayLight: isDarkMode ? colors.darkOverlayLight : colors.overlayLight,
    
    shadow: isDarkMode ? colors.darkShadow : colors.shadow,
    shadowDark: isDarkMode ? colors.darkShadowDark : colors.shadowDark,
    
    // Keep primary, secondary, tertiary, and status colors the same in both modes
    primary: colors.primary,
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    primaryGradient: colors.primaryGradient,
    
    secondary: colors.secondary,
    secondaryLight: colors.secondaryLight,
    secondaryDark: colors.secondaryDark,
    secondaryGradient: colors.secondaryGradient,
    
    tertiary: colors.tertiary,
    tertiaryLight: colors.tertiaryLight,
    tertiaryDark: colors.tertiaryDark,
    tertiaryGradient: colors.tertiaryGradient,
    
    success: colors.success,
    successLight: colors.successLight,
    warning: colors.warning,
    warningLight: colors.warningLight,
    error: colors.error,
    errorLight: colors.errorLight,
    info: colors.info,
    infoLight: colors.infoLight,
    
    accent1: colors.accent1,
    accent2: colors.accent2,
    accent3: colors.accent3,
    accent4: colors.accent4,
    
    categories: colors.categories,
  };
}