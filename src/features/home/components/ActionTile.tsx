import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    GestureResponderEvent,
    StyleSheet,
    TouchableOpacity,
    ViewStyle,
} from 'react-native';

interface ActionTileProps {
    icon: keyof typeof Ionicons.glyphMap;
    iconColor: string;
    iconBgColor: string;
    label: string;
    onPress?: (event: GestureResponderEvent) => void;
    style?: ViewStyle;
}

export function ActionTile({
    icon,
    iconColor,
    iconBgColor,
    label,
    onPress,
    style,
}: ActionTileProps) {
    return (
        <TouchableOpacity style={[styles.tile, style]} onPress={onPress} activeOpacity={0.75}>
            <ThemedView style={[styles.iconCircle, { backgroundColor: iconBgColor }]}>
                <Ionicons name={icon} size={26} color={iconColor} />
            </ThemedView>
            <ThemedText variant="label" style={styles.label}>{label}</ThemedText>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    tile: {
        backgroundColor: COLORS.CARD,
        borderRadius: RADIUS.LG,
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.SM,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 8,
        elevation: 3,
    },
    iconCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        textAlign: 'center',
    },
});
