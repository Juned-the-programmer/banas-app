/**
 * Banas App - Due List Screen
 * Shows all customers with their due amounts.
 * Has a route filter (same as CustomerDirectory) to see per-route dues.
 */
import { CustomerDue } from '@/src/api/dueListService';
import { useDueListStore } from '@/src/stores/dueListStore';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Due Row Card ─────────────────────────────────────────────────────────────
function DueRow({ item }: { item: CustomerDue }) {
    const hasNoDue = item.due === 0;
    return (
        <ThemedView surface="card" style={styles.card}>
            {/* Left accent – green if cleared, red if outstanding */}
            <ThemedView style={[styles.cardAccent, { backgroundColor: hasNoDue ? COLORS.SUCCESS : COLORS.DANGER }]} />
            <ThemedView style={styles.cardBody}>
                <ThemedView style={styles.cardRow}>
                    <ThemedView style={styles.nameBlock}>
                        <ThemedView style={[styles.avatarCircle, { backgroundColor: hasNoDue ? '#DCFCE7' : '#FEE2E2' }]}>
                            <Ionicons
                                name="person"
                                size={16}
                                color={hasNoDue ? '#16A34A' : COLORS.DANGER}
                            />
                        </ThemedView>
                        <ThemedText style={styles.customerName}>{item.customer_name}</ThemedText>
                    </ThemedView>
                    <ThemedView style={[styles.dueBadge, { backgroundColor: hasNoDue ? '#DCFCE7' : '#FEE2E2' }]}>
                        <ThemedText style={[styles.dueAmount, { color: hasNoDue ? '#16A34A' : COLORS.DANGER }]}>
                            {hasNoDue ? '✓ Cleared' : `₹${item.due}`}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function DueListScreen() {
    const {
        items: rawItems, dueTotal, loading, error,
        routes, selectedRouteId,
        loadDues, loadRoutes, setSelectedRoute,
    } = useDueListStore();

    const items = rawItems ?? [];

    const [routeModalVisible, setRouteModalVisible] = useState(false);

    useEffect(() => {
        loadDues();
        loadRoutes();
    }, [loadDues, loadRoutes]);

    const currentRouteName = selectedRouteId
        ? routes.find(r => r.id === selectedRouteId)?.route_name ?? 'Route'
        : 'All Routes';

    const pendingItems = items.filter(i => i.due > 0);
    const clearedItems = items.filter(i => i.due === 0);

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ─────────────────────────────────────────────── */}
            <ThemedView style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={22} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <ThemedView style={{ flex: 1 }}>
                    <ThemedText style={styles.title}>Due List</ThemedText>
                    <ThemedText variant="caption">{items.length} customers</ThemedText>
                </ThemedView>
                <TouchableOpacity style={styles.routeBtn} onPress={() => setRouteModalVisible(true)}>
                    <ThemedText variant="label" color={COLORS.PRIMARY}>{currentRouteName}</ThemedText>
                    <Ionicons name="chevron-down" size={15} color={COLORS.PRIMARY} style={{ marginLeft: 3 }} />
                </TouchableOpacity>
            </ThemedView>

            {/* ── Total Due Banner ──────────────────────────────────────── */}
            {!loading && (
                <ThemedView style={styles.totalBanner}>
                    <Ionicons name="wallet-outline" size={18} color={COLORS.DANGER} />
                    <ThemedText style={styles.totalLabel}>Total Outstanding:</ThemedText>
                    <ThemedText style={styles.totalAmount}>₹{dueTotal.toLocaleString()}</ThemedText>
                </ThemedView>
            )}

            {/* ── Content ───────────────────────────────────────────────── */}
            {loading ? (
                <ThemedView style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                    <ThemedText variant="caption" style={{ marginTop: SPACING.SM }}>Loading…</ThemedText>
                </ThemedView>
            ) : error ? (
                <ThemedView style={styles.center}>
                    <Ionicons name="cloud-offline-outline" size={56} color={COLORS.TEXT_MUTED} />
                    <ThemedText variant="subheading" style={{ marginTop: SPACING.MD }}>Something went wrong</ThemedText>
                    <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginTop: 4, textAlign: 'center' }}>
                        {error}
                    </ThemedText>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadDues}>
                        <ThemedText variant="label" color={COLORS.TEXT_ON_PRIMARY}>Retry</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            ) : (
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Pending dues first */}
                    {pendingItems.length > 0 && (
                        <>
                            <ThemedView style={styles.sectionHeader}>
                                <Ionicons name="alert-circle" size={14} color={COLORS.DANGER} />
                                <ThemedText style={[styles.sectionLabel, { color: COLORS.DANGER }]}>
                                    Outstanding ({pendingItems.length})
                                </ThemedText>
                            </ThemedView>
                            {pendingItems.map(item => <DueRow key={item.customer_id} item={item} />)}
                        </>
                    )}

                    {/* Cleared */}
                    {clearedItems.length > 0 && (
                        <>
                            <ThemedView style={[styles.sectionHeader, { marginTop: SPACING.MD }]}>
                                <Ionicons name="checkmark-circle" size={14} color={COLORS.SUCCESS} />
                                <ThemedText style={[styles.sectionLabel, { color: COLORS.SUCCESS }]}>
                                    Cleared ({clearedItems.length})
                                </ThemedText>
                            </ThemedView>
                            {clearedItems.map(item => <DueRow key={item.customer_id} item={item} />)}
                        </>
                    )}

                    {items.length === 0 && (
                        <ThemedView style={styles.emptyState}>
                            <Ionicons name="checkmark-done-circle-outline" size={52} color={COLORS.BORDER} />
                            <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ marginTop: SPACING.MD }}>
                                No due records found
                            </ThemedText>
                        </ThemedView>
                    )}

                    <ThemedView style={{ height: 80 }} />
                </ScrollView>
            )}

            {/* ── Route Filter Modal ─────────────────────────────────────── */}
            <Modal
                visible={routeModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRouteModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalWrapper}
                    activeOpacity={1}
                    onPress={() => setRouteModalVisible(false)}
                >
                    {/* White card panel — plain View so it's always white, not theme-dependent */}
                    <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                        <View style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Select Route</ThemedText>
                            <View style={styles.modalDivider} />
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {/* All Routes */}
                                <TouchableOpacity
                                    style={styles.modalItem}
                                    onPress={() => { setSelectedRoute(null); setRouteModalVisible(false); }}
                                >
                                    <ThemedText style={StyleSheet.flatten([
                                        styles.modalItemText,
                                        !selectedRouteId && styles.modalItemTextActive,
                                    ])}>
                                        All Routes
                                    </ThemedText>
                                    {!selectedRouteId && <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />}
                                </TouchableOpacity>

                                {routes.map(r => {
                                    const isActive = selectedRouteId === r.id;
                                    return (
                                        <TouchableOpacity
                                            key={r.id}
                                            style={styles.modalItem}
                                            onPress={() => { setSelectedRoute(r.id); setRouteModalVisible(false); }}
                                        >
                                            <ThemedText style={StyleSheet.flatten([
                                                styles.modalItemText,
                                                isActive && styles.modalItemTextActive,
                                            ])}>
                                                {r.route_name}
                                            </ThemedText>
                                            {isActive && <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />}
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.LG },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM,
        gap: SPACING.SM,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: COLORS.CARD, alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1, shadowRadius: 3, elevation: 2,
    },
    title: { fontSize: FONT_SIZE.XL, fontWeight: FONT_WEIGHT.EXTRABOLD, color: COLORS.TEXT_PRIMARY },
    routeBtn: { flexDirection: 'row', alignItems: 'center' },

    totalBanner: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.XS,
        marginHorizontal: SPACING.MD, marginBottom: SPACING.SM,
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM,
        backgroundColor: '#FEE2E2', borderRadius: RADIUS.LG,
    },
    totalLabel: { flex: 1, fontSize: FONT_SIZE.SM, color: COLORS.TEXT_PRIMARY },
    totalAmount: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.DANGER },

    list: { flex: 1 },
    listContent: { paddingHorizontal: SPACING.MD },
    sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: SPACING.XS },
    sectionLabel: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.BOLD },
    emptyState: { alignItems: 'center', marginTop: SPACING.XXL },

    card: {
        flexDirection: 'row', borderRadius: RADIUS.LG, overflow: 'hidden',
        marginBottom: SPACING.SM,
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    cardAccent: { width: 4 },
    cardBody: { flex: 1, paddingVertical: SPACING.SM + 2, paddingHorizontal: SPACING.MD },
    cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    nameBlock: { flexDirection: 'row', alignItems: 'center', gap: SPACING.SM, flex: 1 },
    avatarCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    customerName: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY, flex: 1 },
    dueBadge: { borderRadius: RADIUS.FULL, paddingHorizontal: SPACING.SM, paddingVertical: 4 },
    dueAmount: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.BOLD },

    retryBtn: {
        marginTop: SPACING.LG, backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.LG, paddingHorizontal: SPACING.LG, paddingVertical: SPACING.SM + 4,
    },

    // Modal
    modalWrapper: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: SPACING.XL,
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: RADIUS.LG,
        padding: SPACING.LG,
        maxHeight: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 12,
        elevation: 10,
    },
    modalDivider: {
        height: 1,
        backgroundColor: COLORS.BORDER,
        marginBottom: SPACING.XS,
    },
    modalTitle: {
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY,
        paddingBottom: SPACING.SM,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.MD,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: COLORS.BORDER,
    },
    modalItemText: {
        fontSize: FONT_SIZE.MD,
        color: COLORS.TEXT_PRIMARY,
    },
    modalItemTextActive: {
        color: COLORS.PRIMARY,
        fontWeight: FONT_WEIGHT.BOLD,
    },
});
