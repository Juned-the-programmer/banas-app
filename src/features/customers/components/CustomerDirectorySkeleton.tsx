import { SkeletonShimmer } from '@/src/features/home/components/SkeletonShimmer';
import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { ThemedView } from '@/src/theme/themed-view';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export function CustomerDirectorySkeleton() {
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Header */}
            <ThemedView style={styles.header}>
                <SkeletonShimmer width={200} height={28} borderRadius={8} />
                <SkeletonShimmer width={36} height={36} borderRadius={18} />
            </ThemedView>

            {/* Search bar */}
            <SkeletonShimmer height={46} borderRadius={RADIUS.FULL} style={{ marginTop: SPACING.MD }} />

            {/* Filter tabs */}
            <ThemedView style={styles.filterRow}>
                <SkeletonShimmer width={110} height={36} borderRadius={RADIUS.FULL} />
                <SkeletonShimmer width={72} height={36} borderRadius={RADIUS.FULL} />
                <SkeletonShimmer width={80} height={36} borderRadius={RADIUS.FULL} />
            </ThemedView>

            {/* Customer cards */}
            {[0, 1, 2, 3, 4].map((i) => (
                <ThemedView key={i} surface="card" style={styles.cardSkeleton}>
                    <SkeletonShimmer width={52} height={52} borderRadius={26} />
                    <ThemedView style={{ flex: 1, gap: SPACING.XS }}>
                        <SkeletonShimmer width="70%" height={15} borderRadius={7} />
                        <SkeletonShimmer width="55%" height={12} borderRadius={6} />
                        <SkeletonShimmer width="45%" height={12} borderRadius={6} />
                    </ThemedView>
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
    },
    filterRow: {
        flexDirection: 'row',
        gap: SPACING.SM,
        marginTop: SPACING.MD,
    },
    cardSkeleton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.MD,
        borderRadius: RADIUS.LG,
        padding: SPACING.MD,
        marginTop: SPACING.MD,
    },
});
