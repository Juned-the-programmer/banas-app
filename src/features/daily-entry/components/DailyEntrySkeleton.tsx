import { SkeletonShimmer } from '@/src/features/home/components/SkeletonShimmer';
import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { ThemedView } from '@/src/theme/themed-view';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export function DailyEntrySkeleton() {
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Header */}
            <ThemedView style={styles.header}>
                <SkeletonShimmer width={160} height={26} borderRadius={8} />
                <SkeletonShimmer width={36} height={36} borderRadius={18} />
            </ThemedView>

            {/* Tab switcher */}
            <ThemedView style={styles.tabRow}>
                <SkeletonShimmer height={38} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
                <SkeletonShimmer height={38} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
            </ThemedView>

            {/* Cards */}
            {[0, 1, 2, 3, 4].map((i) => (
                <ThemedView key={i} surface="card" style={styles.cardSkeleton}>
                    <ThemedView style={{ flex: 1, gap: SPACING.XS }}>
                        <SkeletonShimmer width="65%" height={15} borderRadius={7} />
                        <ThemedView style={{ flexDirection: 'row', gap: SPACING.MD }}>
                            <SkeletonShimmer width="40%" height={11} borderRadius={6} />
                            <SkeletonShimmer width="35%" height={11} borderRadius={6} />
                        </ThemedView>
                    </ThemedView>
                    <SkeletonShimmer width={60} height={26} borderRadius={RADIUS.FULL} />
                </ThemedView>
            ))}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: SPACING.MD, paddingBottom: SPACING.XXL },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.SM,
        marginBottom: SPACING.MD,
    },
    tabRow: {
        flexDirection: 'row',
        gap: SPACING.SM,
        marginBottom: SPACING.MD,
    },
    cardSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.MD,
        borderRadius: RADIUS.LG,
        padding: SPACING.MD,
        marginBottom: SPACING.SM,
    },
});
