/**
 * Banas App - Global Color Palette & Design Tokens
 * Source of truth for all visual styles. Ref: RULES.md §2
 */

export const COLORS = {
    // Brand
    PRIMARY: '#2563EB',
    PRIMARY_DARK: '#1D4ED8',
    PRIMARY_LIGHT: '#DBEAFE',
    ACCENT: '#00E5FF',

    // Backgrounds & Surfaces
    BACKGROUND: '#F0F4FF',
    CARD: '#FFFFFF',

    // Text
    TEXT_PRIMARY: '#111827',
    TEXT_SECONDARY: '#6B7280',
    TEXT_ON_PRIMARY: '#FFFFFF',
    TEXT_MUTED: '#9CA3AF',

    // Semantic
    SUCCESS: '#10B981',
    SUCCESS_LIGHT: '#D1FAE5',
    WARNING: '#F97316',
    WARNING_LIGHT: '#FFEDD5',
    DANGER: '#EF4444',
    DANGER_LIGHT: '#FEE2E2',
    PURPLE: '#8B5CF6',
    PURPLE_LIGHT: '#EDE9FE',

    // Utility
    BORDER: '#E5E7EB',
    SHADOW: 'rgba(0,0,0,0.08)',
    SKELETON: '#E2E8F0',
    SKELETON_SHIMMER: '#F1F5F9',
};

export const SPACING = {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
};

export const RADIUS = {
    SM: 8,
    MD: 12,
    LG: 16,
    XL: 20,
    FULL: 9999,
};

export const FONT_SIZE = {
    XS: 11,
    SM: 13,
    MD: 15,
    LG: 17,
    XL: 22,
    XXL: 32,
    HUGE: 40,
};

export const FONT_WEIGHT = {
    REGULAR: '400' as const,
    MEDIUM: '500' as const,
    SEMIBOLD: '600' as const,
    BOLD: '700' as const,
    EXTRABOLD: '800' as const,
};
