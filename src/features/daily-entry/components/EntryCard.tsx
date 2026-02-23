/**
 * Entry Card — verified daily entry row.
 * Shows: customerName, cooler quantity, addedBy, date.
 */
import { DailyEntry } from '@/src/api/dailyEntryService';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

interface EntryCardProps {
    entry: DailyEntry;
    style?: StyleProp<ViewStyle>;
}

export function EntryCard({ entry, style }: EntryCardProps) {
    return (
        <ThemedView surface="card" style={[styles.card, style]}>
            {/* Left accent */}
            <ThemedView style={styles.accent} />

            <ThemedView style={styles.body}>
                {/* Top row: customer name + verified badge */}
                <ThemedView style={styles.topRow}>
                    <ThemedText style={styles.name}>{entry.customerName}</ThemedText>
                    <ThemedView style={styles.verifiedBadge}>
                        <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                        <ThemedText style={styles.verifiedText}>Verified</ThemedText>
                    </ThemedView>
                </ThemedView>

                {/* Meta row */}
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
        borderRadius: RADIUS.LG,
        overflow: 'hidden',
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    accent: {
        width: 4,
        backgroundColor: COLORS.SUCCESS,
    },
    body: {
        flex: 1,
        paddingVertical: SPACING.SM + 2,
        paddingHorizontal: SPACING.MD,
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
    verifiedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#DCFCE7',
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.SM,
        paddingVertical: 2,
    },
    verifiedText: {
        fontSize: FONT_SIZE.XS,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: '#16A34A',
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
