import { Customer } from '@/src/api/customersService';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface CustomerCardProps {
    customer: Customer;
    onPress?: () => void;
    style?: StyleProp<ViewStyle>;
}

// Background color palette for initials avatars
const AVATAR_COLORS = [
    { bg: '#DBEAFE', text: '#1D4ED8' }, // blue
    { bg: '#D1FAE5', text: '#065F46' }, // green
    { bg: '#EDE9FE', text: '#5B21B6' }, // purple
    { bg: '#FFEDD5', text: '#9A3412' }, // orange
    { bg: '#FCE7F3', text: '#9D174D' }, // pink
];

function getAvatarColor(id: string) {
    const index = id.charCodeAt(0) % AVATAR_COLORS.length;
    return AVATAR_COLORS[index];
}

export function CustomerCard({ customer, onPress, style }: CustomerCardProps) {
    const avatarColor = getAvatarColor(customer.id);

    return (
        <TouchableOpacity activeOpacity={0.75} onPress={onPress} style={[styles.card, style]}>
            {/* Avatar */}
            <ThemedView style={styles.avatarWrapper}>
                <ThemedView style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
                    <ThemedText style={[styles.initials, { color: avatarColor.text }]}>
                        {customer.initials}
                    </ThemedText>
                </ThemedView>
                <ThemedView
                    style={[
                        styles.statusDot,
                        { backgroundColor: customer.isActive ? COLORS.SUCCESS : COLORS.TEXT_MUTED },
                    ]}
                />
            </ThemedView>

            {/* Info */}
            <ThemedView style={styles.info}>
                {/* Name row */}
                <ThemedView style={styles.nameRow}>
                    <ThemedText style={styles.name}>{customer.name}</ThemedText>
                    <ThemedView
                        style={[
                            styles.badge,
                            { backgroundColor: customer.isActive ? '#DCFCE7' : COLORS.SKELETON },
                        ]}
                    >
                        <ThemedText
                            style={[
                                styles.badgeText,
                                { color: customer.isActive ? '#16A34A' : COLORS.TEXT_MUTED },
                            ]}
                        >
                            {customer.isActive ? 'Active' : 'Inactive'}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                {/* Route */}
                <ThemedView style={styles.metaRow}>
                    <Ionicons name="location-outline" size={13} color={COLORS.TEXT_SECONDARY} />
                    <ThemedText variant="caption" style={styles.metaText}>{customer.route}</ThemedText>
                </ThemedView>

                {/* Phone */}
                <ThemedView style={styles.metaRow}>
                    <Ionicons name="call-outline" size={13} color={COLORS.PRIMARY} />
                    <ThemedText variant="caption" style={styles.milkText}>{customer.phone_no}</ThemedText>
                </ThemedView>
            </ThemedView>

            {/* Chevron */}
            <Ionicons name="chevron-forward" size={18} color={COLORS.BORDER} style={styles.chevron} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.CARD,
        borderRadius: RADIUS.LG,
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.MD,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 2,
    },
    avatarWrapper: {
        position: 'relative',
        marginRight: SPACING.MD,
    },
    avatar: {
        width: 52,
        height: 52,
        borderRadius: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },
    initials: {
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.BOLD,
    },
    statusDot: {
        position: 'absolute',
        bottom: 1,
        right: 1,
        width: 12,
        height: 12,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: COLORS.CARD,
    },
    info: {
        flex: 1,
        gap: 3,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.SM,
        marginBottom: 2,
    },
    name: {
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY,
        flex: 1,
    },
    badge: {
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.SM,
        paddingVertical: 2,
    },
    badgeText: {
        fontSize: FONT_SIZE.XS,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: COLORS.TEXT_SECONDARY,
    },
    milkText: {
        color: COLORS.PRIMARY,
        fontWeight: FONT_WEIGHT.MEDIUM,
    },
    chevron: {
        marginLeft: SPACING.SM,
    },
});
