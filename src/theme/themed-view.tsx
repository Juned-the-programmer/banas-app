/**
 * Banas App - Themed View Component
 * Wraps React Native View with optional design-system-backed background and padding.
 * Ref: RULES.md §2 — "Always use ThemedView for layout"
 */
import { COLORS } from '@/src/theme';
import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

interface ThemedViewProps extends ViewProps {
    /** 'screen' uses BACKGROUND color, 'card' uses CARD (white) color, 'transparent' for no background */
    surface?: 'screen' | 'card' | 'transparent';
    style?: StyleProp<ViewStyle>;
    children?: React.ReactNode;
}

export function ThemedView({
    surface = 'transparent',
    style,
    children,
    ...rest
}: ThemedViewProps) {
    const surfaceStyle: ViewStyle =
        surface === 'screen'
            ? { backgroundColor: COLORS.BACKGROUND }
            : surface === 'card'
                ? { backgroundColor: COLORS.CARD }
                : {};

    return (
        <View style={[surfaceStyle, style]} {...rest}>
            {children}
        </View>
    );
}
