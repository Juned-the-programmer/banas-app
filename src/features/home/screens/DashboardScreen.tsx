/**
 * Banas App - Dashboard Screen (Home Feature)
 * Ref: RULES.md - Feature-first architecture, ThemedView/ThemedText, Zustand store consumption
 *
 * Data flow: useHomeStore (Zustand) ← homeService ← API
 * UI flow:   loading → DashboardSkeleton | data → full UI
 */
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuthStore, useHomeStore } from '@/src/stores';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { ActionTile } from '../components/ActionTile';
import { DashboardSkeleton } from '../components/DashboardSkeleton';


// ─── Main Screen ──────────────────────────────────────────────────────────────
export function DashboardScreen() {
    // Layer 3: Pull state and actions from the Zustand store
    const { data, loading, error, loadDashboard } = useHomeStore();
    const { user } = useAuthStore();
    const [entryTypeModalVisible, setEntryTypeModalVisible] = useState(false);

    // Trigger data fetch on mount
    useEffect(() => {
        loadDashboard();
    }, [loadDashboard]);

    // Loading state → show premium skeleton
    if (loading || !data) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <DashboardSkeleton />
            </SafeAreaView>
        );
    }

    // Error state
    if (error) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <ThemedView style={styles.centerContainer}>
                    <Ionicons name="cloud-offline-outline" size={56} color={COLORS.TEXT_MUTED} />
                    <ThemedText variant="subheading" style={{ marginTop: SPACING.MD }}>
                        Something went wrong
                    </ThemedText>
                    <ThemedText variant="caption" style={{ marginTop: SPACING.XS, textAlign: 'center' }}>
                        {error}
                    </ThemedText>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadDashboard}>
                        <ThemedText variant="label" color={COLORS.TEXT_ON_PRIMARY}>Retry</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </SafeAreaView>
        );
    }

    const { metrics } = data;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
            >
                {/* ── Header ─────────────────────────────────────────────────── */}
                <ThemedView style={styles.header}>
                    <ThemedView style={styles.headerLeft}>
                        <ThemedView style={styles.avatarWrapper}>
                            <ThemedView style={styles.avatarCircle}>
                                <Ionicons name="person" size={22} color={COLORS.PRIMARY} />
                            </ThemedView>
                            <ThemedView style={styles.statusDot} />
                        </ThemedView>
                        <ThemedView>
                            <ThemedText variant="overline">Welcome Back</ThemedText>
                            <ThemedText variant="subheading">{user?.fullName || user?.firstName || 'Banas Admin'}</ThemedText>
                        </ThemedView>
                    </ThemedView>

                    <ThemedView style={styles.headerRight}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() =>
                                Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                                    { text: 'Cancel', style: 'cancel' },
                                    { text: 'Sign Out', style: 'destructive', onPress: () => useAuthStore.getState().logout() },
                                ])
                            }
                            activeOpacity={0.7}
                        >
                            <Ionicons name="log-out-outline" size={22} color={COLORS.DANGER} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.bellButton}
                            onPress={loadDashboard}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="notifications" size={22} color={COLORS.TEXT_PRIMARY} />
                            <ThemedView style={styles.bellDot} />
                        </TouchableOpacity>
                    </ThemedView>
                </ThemedView>

                {/* ── Daily Overview Title ─────────────────────────────────────── */}
                <ThemedView style={styles.sectionTitle}>
                    <Ionicons name="bar-chart" size={18} color={COLORS.PRIMARY} />
                    <ThemedText variant="subheading">Daily Overview</ThemedText>
                </ThemedView>

                {/* ── Main Metric Card with LinearGradient ─────────────────────── */}
                <LinearGradient
                    colors={[COLORS.PRIMARY, COLORS.PRIMARY_DARK]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mainCard}
                >
                    {/* Faded background icon */}
                    <ThemedView style={styles.mainCardBgIcon}>
                        <Ionicons name="people" size={72} color="rgba(255,255,255,0.12)" />
                    </ThemedView>

                    <ThemedView style={{ flex: 1, backgroundColor: 'transparent' }}>
                        <ThemedText variant="caption" color="rgba(255,255,255,0.75)">
                            Total Active Customers
                        </ThemedText>
                        <ThemedText variant="number" color={COLORS.TEXT_ON_PRIMARY}>
                            {metrics.totalActiveCustomers}
                        </ThemedText>
                    </ThemedView>
                </LinearGradient>

                {/* ── Secondary Metric Cards ───────────────────────────────────── */}
                <ThemedView style={styles.twinRow}>
                    {/* Today Coolers */}
                    <ThemedView surface="card" style={styles.secondaryCard}>
                        <ThemedView style={styles.secondaryCardHeader}>
                            <ThemedView style={[styles.smallIconCircle, { backgroundColor: COLORS.WARNING_LIGHT }]}>
                                <Ionicons name="water" size={16} color={COLORS.WARNING} />
                            </ThemedView>
                            <ThemedText variant="caption">Today</ThemedText>
                        </ThemedView>
                        <ThemedView style={{ marginTop: SPACING.SM }}>
                            <ThemedText>
                                <ThemedText variant="number" style={{ fontSize: FONT_SIZE.XXL }}>
                                    {metrics.todayCoolersCount}
                                </ThemedText>
                            </ThemedText>
                            <ThemedText variant="caption">{'Today\nCoolers'}</ThemedText>
                        </ThemedView>
                    </ThemedView>

                    {/* Pending Payments */}
                    <ThemedView surface="card" style={styles.secondaryCard}>
                        <ThemedView style={styles.secondaryCardHeader}>
                            <ThemedView style={[styles.smallIconCircle, { backgroundColor: COLORS.DANGER_LIGHT }]}>
                                <Ionicons name="wallet" size={16} color={COLORS.DANGER} />
                            </ThemedView>
                            <ThemedView style={styles.actionTag}>
                                <ThemedText variant="caption" color={COLORS.DANGER} style={{ fontWeight: FONT_WEIGHT.BOLD }}>
                                    Action
                                </ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView style={{ marginTop: SPACING.SM }}>
                            <ThemedText variant="number" style={{ fontSize: FONT_SIZE.XL }}>
                                ₹{metrics.totalPendingDue.toLocaleString()}
                            </ThemedText>
                            <ThemedText variant="caption">{'Pending\nPayments'}</ThemedText>
                        </ThemedView>
                    </ThemedView>
                </ThemedView>

                {/* ── Quick Actions ────────────────────────────────────────────── */}
                <ThemedView style={styles.sectionTitle}>
                    <Ionicons name="flash" size={18} color={COLORS.PRIMARY} />
                    <ThemedText variant="subheading">Quick Actions</ThemedText>
                </ThemedView>

                <ThemedView style={styles.actionsGrid}>
                    <ActionTile
                        icon="person-add"
                        iconColor={COLORS.PRIMARY}
                        iconBgColor={COLORS.PRIMARY_LIGHT}
                        label="Add Customer"
                        onPress={() => router.push('/customers/add-customer' as any)}
                    />
                    <ActionTile
                        icon="bicycle"
                        iconColor={COLORS.SUCCESS}
                        iconBgColor={COLORS.SUCCESS_LIGHT}
                        label="Log Delivery"
                        onPress={() => setEntryTypeModalVisible(true)}
                    />
                </ThemedView>
                <ThemedView style={[styles.actionsGrid, { marginTop: SPACING.MD }]}>
                    <ActionTile
                        icon="cash"
                        iconColor={COLORS.PURPLE}
                        iconBgColor={COLORS.PURPLE_LIGHT}
                        label="Record Payment"
                        onPress={() => router.push('/finance/add-payment' as any)}
                    />
                    <ActionTile
                        icon="alert-circle"
                        iconColor={COLORS.DANGER}
                        iconBgColor={COLORS.DANGER_LIGHT}
                        label="Due List"
                        onPress={() => router.push('/finance/due-list' as any)}
                    />
                </ThemedView>

                <ThemedView style={{ height: SPACING.XL }} />
            </ScrollView>

            {/* ── Entry Type Selection Modal ────────────────────────────── */}
            <Modal visible={entryTypeModalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <ThemedView style={styles.modalContent}>
                        <ThemedText style={styles.modalTitle}>Add Daily Entry</ThemedText>
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginBottom: SPACING.LG, textAlign: 'center' }}>
                            How would you like to log deliveries?
                        </ThemedText>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setEntryTypeModalVisible(false);
                                router.push('/operations/add-daily-entry' as any);
                            }}
                        >
                            <View style={[styles.modalOptionIcon, { backgroundColor: COLORS.PRIMARY_LIGHT }]}>
                                <Ionicons name="person" size={24} color={COLORS.PRIMARY} />
                            </View>
                            <View style={{ flex: 1, marginLeft: SPACING.MD }}>
                                <ThemedText style={styles.modalOptionTitle}>Single Entry</ThemedText>
                                <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Log a delivery for one specific customer.</ThemedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={() => {
                                setEntryTypeModalVisible(false);
                                router.push('/operations/bulk-daily-entry' as any);
                            }}
                        >
                            <View style={[styles.modalOptionIcon, { backgroundColor: COLORS.SUCCESS_LIGHT }]}>
                                <Ionicons name="people" size={24} color={COLORS.SUCCESS} />
                            </View>
                            <View style={{ flex: 1, marginLeft: SPACING.MD }}>
                                <ThemedText style={styles.modalOptionTitle}>Bulk Entry</ThemedText>
                                <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Quickly log deliveries for all missing customers today.</ThemedText>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalCancelBtn}
                            onPress={() => setEntryTypeModalVisible(false)}
                        >
                            <ThemedText style={{ color: COLORS.DANGER, fontWeight: FONT_WEIGHT.BOLD }}>Cancel</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    scroll: { flex: 1 },
    container: { paddingHorizontal: SPACING.MD, paddingTop: SPACING.SM, paddingBottom: SPACING.XXL },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.LG },

    // Header
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: SPACING.MD },
    headerLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD },
    avatarWrapper: { position: 'relative' },
    avatarCircle: {
        width: 48, height: 48, borderRadius: 24,
        backgroundColor: COLORS.PRIMARY_LIGHT,
        alignItems: 'center', justifyContent: 'center',
    },
    statusDot: {
        position: 'absolute', bottom: 1, right: 1,
        width: 12, height: 12, borderRadius: 6,
        backgroundColor: COLORS.SUCCESS,
        borderWidth: 2, borderColor: COLORS.BACKGROUND,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.SM,
    },
    iconButton: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: '#FFF5F5',
        alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 6, elevation: 3,
    },
    bellButton: {
        width: 42, height: 42, borderRadius: 21,
        backgroundColor: COLORS.CARD,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 6, elevation: 3,
    },
    bellDot: {
        position: 'absolute', top: 8, right: 8,
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: COLORS.DANGER,
        borderWidth: 1.5, borderColor: COLORS.CARD,
    },

    // Section Title
    sectionTitle: {
        flexDirection: 'row', alignItems: 'center',
        gap: SPACING.XS, marginTop: SPACING.MD, marginBottom: SPACING.SM + 2,
    },

    // Main Card
    mainCard: {
        borderRadius: RADIUS.XL,
        padding: SPACING.LG,
        overflow: 'hidden',
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
    },
    mainCardBgIcon: { position: 'absolute', right: -8, top: '50%', marginTop: -36 },
    trendPill: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.SM + 2, paddingVertical: 3,
        alignSelf: 'flex-start', marginTop: SPACING.SM,
    },

    // Twin Cards
    twinRow: { flexDirection: 'row', gap: SPACING.MD, marginTop: SPACING.SM },
    transactionsCard: {
        padding: SPACING.MD, borderRadius: RADIUS.LG, borderTopWidth: 4, borderTopColor: COLORS.SUCCESS, ...Platform.select({ ios: { shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 }, android: { elevation: 3 } }),
    },
    transactionIconCircle: {
        width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    },
    secondaryCard: {
        flex: 1, borderRadius: RADIUS.LG, padding: SPACING.MD,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 8, elevation: 3,
    },
    secondaryCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    smallIconCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
    actionTag: {
        backgroundColor: COLORS.DANGER_LIGHT,
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.SM, paddingVertical: 2,
    },

    // Actions
    actionsGrid: { flexDirection: 'row', gap: SPACING.MD },

    // Retry
    retryBtn: {
        marginTop: SPACING.LG,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.LG,
        paddingHorizontal: SPACING.LG, paddingVertical: SPACING.SM + 4,
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.LG },
    modalContent: { width: '100%', backgroundColor: COLORS.CARD, borderRadius: RADIUS.LG, padding: SPACING.LG, alignItems: 'center' },
    modalTitle: { fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
    modalOption: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, marginBottom: SPACING.SM },
    modalOptionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    modalOptionTitle: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
    modalCancelBtn: { marginTop: SPACING.SM, padding: SPACING.MD },
});
