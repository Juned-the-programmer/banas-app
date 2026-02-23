/**
 * Banas App - Themed Text Component
 * Wraps React Native Text with consistent typography from the design system.
 * Ref: RULES.md §2 — "Always use ThemedText for text"
 */
import { COLORS, FONT_SIZE, FONT_WEIGHT } from '@/src/theme';
import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';

type Variant =
    | 'heading'
    | 'subheading'
    | 'body'
    | 'caption'
    | 'label'
    | 'overline'
    | 'number';

interface ThemedTextProps extends TextProps {
    variant?: Variant;
    color?: string;
    style?: TextStyle | TextStyle[];
    children: React.ReactNode;
}

const variantStyles: Record<Variant, TextStyle> = {
    heading: {
        fontSize: FONT_SIZE.XL,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY,
    },
    subheading: {
        fontSize: FONT_SIZE.LG,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: COLORS.TEXT_PRIMARY,
    },
    body: {
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.REGULAR,
        color: COLORS.TEXT_PRIMARY,
    },
    caption: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.REGULAR,
        color: COLORS.TEXT_SECONDARY,
    },
    label: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: COLORS.TEXT_PRIMARY,
    },
    overline: {
        fontSize: FONT_SIZE.XS,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: COLORS.TEXT_SECONDARY,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    number: {
        fontSize: FONT_SIZE.HUGE,
        fontWeight: FONT_WEIGHT.EXTRABOLD,
        color: COLORS.TEXT_PRIMARY,
    },
};

export function ThemedText({
    variant = 'body',
    color,
    style,
    children,
    ...rest
}: ThemedTextProps) {
    return (
        <Text
            style={[variantStyles[variant], color ? { color } : null, style]}
            {...rest}
        >
            {children}
        </Text>
    );
}
