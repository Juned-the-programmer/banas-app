/**
 * PendingEntryCard — pending daily entry row with checkbox for bulk select + verify button.
 */
import { DailyEntry } from '@/src/api/dailyEntryService';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

interface PendingEntryCardProps {
    entry: DailyEntry;
    isSelected: boolean;
    onToggleSelect: () => void;
    onVerify: () => void;
    verifying: boolean;
    style?: StyleProp<ViewStyle>;
}

export function PendingEntryCard({
    entry,
    isSelected,
    onToggleSelect,
    onVerify,
    verifying,
    style,
}: PendingEntryCardProps) {
    return (
        <ThemedView
            surface="card"
            style={[styles.card, isSelected && styles.cardSelected, style]}
        >
            {/* Left accent */}
            <ThemedView style={styles.accent} />

            {/* Checkbox */}
            <TouchableOpacity onPress={onToggleSelect} style={styles.checkbox}>
                <Ionicons
                    name={isSelected ? 'checkbox' : 'square-outline'}
                    size={22}
                    color={isSelected ? COLORS.PRIMARY : COLORS.BORDER}
                />
            </TouchableOpacity>

            {/* Info */}
            <ThemedView style={styles.body}>
                <ThemedView style={styles.topRow}>
                    <ThemedText style={styles.name}>{entry.customerName}</ThemedText>
                    <TouchableOpacity
                        onPress={onVerify}
                        disabled={verifying}
                        style={[styles.verifyBtn, verifying && { opacity: 0.5 }]}
                    >
                        <Ionicons name="checkmark-done" size={14} color={COLORS.TEXT_ON_PRIMARY} />
                        <ThemedText style={styles.verifyBtnText}>Verify</ThemedText>
                    </TouchableOpacity>
                </ThemedView>

                <ThemedView style={styles.metaRow}>
                    <ThemedView style={styles.metaItem}>
                        <Ionicons name="water-outline" size={13} color={COLORS.PRIMARY} />
                        <ThemedText variant="caption" style={styles.metaText}>{entry.cooler}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.metaItem}>
                        <Ionicons name="person-outline" size={13} color={COLORS.TEXT_MUTED} />
                        <ThemedText variant="caption" style={styles.metaText}>{entry.addedBy}</ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: RADIUS.LG,
        overflow: 'hidden',
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardSelected: {
        borderWidth: 1.5,
        borderColor: COLORS.PRIMARY,
        shadowColor: COLORS.PRIMARY,
        shadowOpacity: 0.15,
    },
    accent: {
        width: 4,
        alignSelf: 'stretch',
        backgroundColor: COLORS.WARNING,
    },
    checkbox: {
        padding: SPACING.SM + 2,
    },
    body: {
        flex: 1,
        paddingVertical: SPACING.SM + 2,
        paddingRight: SPACING.MD,
        gap: SPACING.XS,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY,
        flex: 1,
    },
    verifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.SM + 2,
        paddingVertical: 4,
    },
    verifyBtnText: {
        fontSize: FONT_SIZE.XS,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_ON_PRIMARY,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.MD,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: COLORS.TEXT_SECONDARY,
    },
});
