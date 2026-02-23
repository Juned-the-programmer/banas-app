import { COLORS, RADIUS, SPACING } from '@/src/theme';
import { ThemedView } from '@/src/theme/themed-view';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SkeletonShimmer } from './SkeletonShimmer';

export function DashboardSkeleton() {
    return (
        <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.BACKGROUND }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
        >
            {/* Header */}
            <ThemedView style={styles.header}>
                <ThemedView style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.MD }}>
                    <SkeletonShimmer width={48} height={48} borderRadius={24} />
                    <ThemedView style={{ gap: SPACING.XS }}>
                        <SkeletonShimmer width={100} height={11} borderRadius={6} />
                        <SkeletonShimmer width={150} height={18} borderRadius={6} />
                    </ThemedView>
                </ThemedView>
                <SkeletonShimmer width={38} height={38} borderRadius={19} />
            </ThemedView>

            {/* Section Title */}
            <SkeletonShimmer width={140} height={16} borderRadius={8} style={{ marginTop: SPACING.MD }} />

            {/* Main Big Card */}
            <SkeletonShimmer height={130} borderRadius={RADIUS.XL} style={{ marginTop: SPACING.SM + 4 }} />

            {/* Twin Cards */}
            <ThemedView style={styles.twinRow}>
                <SkeletonShimmer height={110} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
                <SkeletonShimmer height={110} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
            </ThemedView>

            {/* Quick Actions Title */}
            <SkeletonShimmer width={130} height={16} borderRadius={8} style={{ marginTop: SPACING.LG }} />

            {/* Actions Grid */}
            <ThemedView style={styles.grid}>
                <SkeletonShimmer height={110} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
                <SkeletonShimmer height={110} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
            </ThemedView>
            <ThemedView style={styles.grid}>
                <SkeletonShimmer height={110} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
                <SkeletonShimmer height={110} borderRadius={RADIUS.LG} style={{ flex: 1 }} />
            </ThemedView>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: SPACING.MD, paddingBottom: SPACING.XXL },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: SPACING.SM,
    },
    twinRow: { flexDirection: 'row', gap: SPACING.MD, marginTop: SPACING.MD },
    grid: { flexDirection: 'row', gap: SPACING.MD, marginTop: SPACING.MD },
});
