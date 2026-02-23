/**
 * Banas App - Payments Screen
 * Two tabs: "Payments" (current month) | "Bills" (previous month)
 * Ref: RULES.md - Feature-first, ThemedView/ThemedText, Zustand store
 */
import { Bill } from '@/src/api/billsService';
import { Payment } from '@/src/api/paymentsService';
import { usePaymentsStore } from '@/src/stores';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Tab = 'payments' | 'bills';

// ─── Payment Card ─────────────────────────────────────────────────────────────
function PaymentCard({ item }: { item: Payment }) {
    const dateStr = (() => {
        try { return format(parseISO(item.date), 'dd MMM yyyy'); } catch { return item.date; }
    })();

    return (
        <ThemedView surface="card" style={styles.card}>
            <ThemedView style={styles.cardAccent} />
            <ThemedView style={styles.cardBody}>
                <ThemedView style={styles.cardTopRow}>
                    <ThemedText style={styles.cardName}>{item.customer_name}</ThemedText>
                    <ThemedView style={[styles.methodBadge, { backgroundColor: COLORS.PRIMARY + '18' }]}>
                        <ThemedText style={[styles.methodText, { color: COLORS.PRIMARY }]}>
                            {item.payment_method || 'Cash'}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>
                <ThemedView style={styles.cardMetaRow}>
                    <ThemedView style={styles.metaItem}>
                        <Ionicons name="checkmark-circle" size={13} color={COLORS.SUCCESS} />
                        <ThemedText variant="caption" style={{ color: COLORS.SUCCESS, fontWeight: FONT_WEIGHT.SEMIBOLD }}>
                            Paid ₹{item.paid_amount}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.TEXT_MUTED} />
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>{dateStr}</ThemedText>
                    </ThemedView>
                </ThemedView>
                <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginTop: 2 }}>
                    By {item.addedby}
                </ThemedText>
            </ThemedView>
        </ThemedView>
    );
}

// ─── Bill Card ────────────────────────────────────────────────────────────────
function BillCard({ item }: { item: Bill }) {
    const fromStr = (() => { try { return format(parseISO(item.from_date), 'dd MMM'); } catch { return item.from_date; } })();
    const toStr = (() => { try { return format(parseISO(item.to_date), 'dd MMM yyyy'); } catch { return item.to_date; } })();

    return (
        <ThemedView surface="card" style={styles.card}>
            <ThemedView style={[styles.cardAccent, { backgroundColor: item.paid ? COLORS.SUCCESS : COLORS.WARNING }]} />
            <ThemedView style={styles.cardBody}>
                <ThemedView style={styles.cardTopRow}>
                    <ThemedText style={styles.cardName}>{item.customer_name}</ThemedText>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.XS }}>
                        <TouchableOpacity onPress={() => router.push(`/finance/bill/${item.id}`)}>
                            <ThemedText style={{ fontSize: 12, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.PRIMARY, textDecorationLine: 'underline' }}>
                                View Details
                            </ThemedText>
                        </TouchableOpacity>
                        <ThemedView style={[styles.methodBadge, {
                            backgroundColor: item.paid ? '#DCFCE7' : '#FEF3C7'
                        }]}>
                            <ThemedText style={[styles.methodText, { color: item.paid ? '#16A34A' : '#92400E' }]}>
                                {item.paid ? 'Paid' : 'Pending'}
                            </ThemedText>
                        </ThemedView>
                    </View>
                </ThemedView>

                <ThemedView style={styles.billAmountsRow}>
                    <ThemedView style={styles.billAmountBlock}>
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Coolers</ThemedText>
                        <ThemedText style={styles.billAmountValue}>{item.coolers}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.billAmountBlock}>
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Amount</ThemedText>
                        <ThemedText style={styles.billAmountValue}>₹{item.Amount}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.billAmountBlock}>
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Pending</ThemedText>
                        <ThemedText style={[styles.billAmountValue, { color: item.Pending_amount > 0 ? COLORS.WARNING : COLORS.TEXT_PRIMARY }]}>
                            ₹{item.Pending_amount}
                        </ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.billAmountBlock}>
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Total</ThemedText>
                        <ThemedText style={[styles.billAmountValue, { color: COLORS.PRIMARY, fontWeight: FONT_WEIGHT.BOLD }]}>
                            ₹{item.Total}
                        </ThemedText>
                    </ThemedView>
                </ThemedView>

                <ThemedView style={styles.cardMetaRow}>
                    <ThemedView style={styles.metaItem}>
                        <Ionicons name="calendar-outline" size={12} color={COLORS.TEXT_MUTED} />
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>{fromStr} – {toStr}</ThemedText>
                    </ThemedView>
                    {item.bill_number && (
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>
                            #{item.bill_number}
                        </ThemedText>
                    )}
                </ThemedView>
            </ThemedView>
        </ThemedView>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function PaymentsScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('payments');

    const {
        payments, totalPaidAmount, paymentsLoading, paymentsError,
        bills, billsLoading, billsError,
        loadPayments, loadBills, refreshAll,
    } = usePaymentsStore();

    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    const onRefresh = () => {
        if (activeTab === 'payments') loadPayments();
        else loadBills();
    };

    const isLoading = activeTab === 'payments' ? paymentsLoading : billsLoading;
    const error = activeTab === 'payments' ? paymentsError : billsError;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ─────────────────────────────────────────────── */}
            <ThemedView style={styles.header}>
                <ThemedView>
                    <ThemedText style={styles.title}>Finance</ThemedText>
                    <ThemedText variant="caption">
                        {activeTab === 'payments' ? 'Current Month Payments' : 'Previous Month Bills'}
                    </ThemedText>
                </ThemedView>
                <TouchableOpacity style={styles.iconBtn} onPress={onRefresh} disabled={isLoading}>
                    {isLoading
                        ? <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                        : <Ionicons name="refresh-outline" size={20} color={COLORS.TEXT_PRIMARY} />
                    }
                </TouchableOpacity>
            </ThemedView>

            {/* ── Tab Switcher ──────────────────────────────────────────── */}
            <ThemedView style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'payments' && styles.tabActivePayments]}
                    onPress={() => setActiveTab('payments')}
                    activeOpacity={0.75}
                >
                    <Ionicons
                        name={activeTab === 'payments' ? 'cash' : 'cash-outline'}
                        size={15}
                        color={activeTab === 'payments' ? '#fff' : COLORS.TEXT_SECONDARY}
                    />
                    <ThemedText style={StyleSheet.flatten([styles.tabText, activeTab === 'payments' && styles.tabTextActive])}>
                        Payments
                    </ThemedText>
                    {payments.length > 0 && (
                        <ThemedView style={[styles.tabBadge, { backgroundColor: activeTab === 'payments' ? 'rgba(255,255,255,0.3)' : COLORS.SKELETON }]}>
                            <ThemedText style={[styles.tabBadgeText, { color: activeTab === 'payments' ? '#fff' : COLORS.TEXT_MUTED }]}>
                                {payments.length}
                            </ThemedText>
                        </ThemedView>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'bills' && styles.tabActiveBills]}
                    onPress={() => setActiveTab('bills')}
                    activeOpacity={0.75}
                >
                    <Ionicons
                        name={activeTab === 'bills' ? 'document-text' : 'document-text-outline'}
                        size={15}
                        color={activeTab === 'bills' ? '#fff' : COLORS.TEXT_SECONDARY}
                    />
                    <ThemedText style={StyleSheet.flatten([styles.tabText, activeTab === 'bills' && styles.tabTextActive])}>
                        Bills
                    </ThemedText>
                    {bills.length > 0 && (
                        <ThemedView style={[styles.tabBadge, { backgroundColor: activeTab === 'bills' ? 'rgba(255,255,255,0.3)' : COLORS.SKELETON }]}>
                            <ThemedText style={[styles.tabBadgeText, { color: activeTab === 'bills' ? '#fff' : COLORS.TEXT_MUTED }]}>
                                {bills.length}
                            </ThemedText>
                        </ThemedView>
                    )}
                </TouchableOpacity>
            </ThemedView>

            {/* ── Summary Bar (Payments tab only) ───────────────────────── */}
            {activeTab === 'payments' && !paymentsLoading && (
                <ThemedView style={styles.summaryBar}>
                    <Ionicons name="wallet-outline" size={16} color={COLORS.SUCCESS} />
                    <ThemedText style={styles.summaryText}>
                        Total Collected This Month:
                    </ThemedText>
                    <ThemedText style={styles.summaryAmount}>₹{totalPaidAmount}</ThemedText>
                </ThemedView>
            )}

            {/* ── Content ───────────────────────────────────────────────── */}
            {isLoading ? (
                <ThemedView style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                    <ThemedText variant="caption" style={{ marginTop: SPACING.SM }}>Loading…</ThemedText>
                </ThemedView>
            ) : error ? (
                <ThemedView style={styles.centerContainer}>
                    <Ionicons name="cloud-offline-outline" size={56} color={COLORS.TEXT_MUTED} />
                    <ThemedText variant="subheading" style={{ marginTop: SPACING.MD }}>Something went wrong</ThemedText>
                    <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginTop: 4, textAlign: 'center' }}>
                        {error}
                    </ThemedText>
                    <TouchableOpacity style={styles.retryBtn} onPress={onRefresh}>
                        <ThemedText variant="label" color={COLORS.TEXT_ON_PRIMARY}>Retry</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            ) : (
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'payments' ? (
                        payments.length === 0 ? (
                            <ThemedView style={styles.emptyState}>
                                <Ionicons name="cash-outline" size={52} color={COLORS.BORDER} />
                                <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ marginTop: SPACING.MD }}>
                                    No payments recorded this month
                                </ThemedText>
                            </ThemedView>
                        ) : (
                            payments.map((p, index) => <PaymentCard key={p.id || `payment-${index}`} item={p} />)
                        )
                    ) : (
                        bills.length === 0 ? (
                            <ThemedView style={styles.emptyState}>
                                <Ionicons name="document-text-outline" size={52} color={COLORS.BORDER} />
                                <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ marginTop: SPACING.MD }}>
                                    No bills found for last month
                                </ThemedText>
                            </ThemedView>
                        ) : (
                            bills.map((b, index) => <BillCard key={b.id || `bill-${index}`} item={b} />)
                        )
                    )}
                    <View style={{ height: 80 }} />
                </ScrollView>
            )}

            {/* ── FAB: Add Payment ────────────────────────────────────────── */}
            {activeTab === 'payments' && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.85}
                    onPress={() => router.push('/finance/add-payment')}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.LG },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.MD,
        paddingTop: SPACING.SM,
        paddingBottom: SPACING.SM,
    },
    title: {
        fontSize: FONT_SIZE.XL,
        fontWeight: FONT_WEIGHT.EXTRABOLD,
        color: COLORS.TEXT_PRIMARY,
    },
    iconBtn: {
        width: 38, height: 38, borderRadius: 19,
        backgroundColor: COLORS.CARD,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },

    tabRow: {
        flexDirection: 'row',
        gap: SPACING.SM,
        paddingHorizontal: SPACING.MD,
        marginBottom: SPACING.SM,
    },
    tab: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        gap: SPACING.XS, paddingVertical: SPACING.SM + 2,
        borderRadius: RADIUS.LG, backgroundColor: COLORS.CARD,
        borderWidth: 1.5, borderColor: COLORS.BORDER,
    },
    tabActivePayments: { backgroundColor: COLORS.SUCCESS, borderColor: COLORS.SUCCESS },
    tabActiveBills: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
    tabText: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_SECONDARY },
    tabTextActive: { color: '#fff' },
    tabBadge: {
        borderRadius: RADIUS.FULL, minWidth: 20, height: 20,
        alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5,
    },
    tabBadgeText: { fontSize: FONT_SIZE.XS, fontWeight: FONT_WEIGHT.BOLD },

    summaryBar: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.XS,
        marginHorizontal: SPACING.MD,
        marginBottom: SPACING.SM,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM,
        backgroundColor: '#DCFCE7',
        borderRadius: RADIUS.LG,
    },
    summaryText: { fontSize: FONT_SIZE.SM, color: COLORS.TEXT_PRIMARY, flex: 1 },
    summaryAmount: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: '#16A34A' },

    list: { flex: 1 },
    listContent: { paddingHorizontal: SPACING.MD, paddingTop: SPACING.XS },
    emptyState: { alignItems: 'center', marginTop: SPACING.XXL },

    fab: {
        position: 'absolute',
        right: SPACING.LG,
        bottom: SPACING.LG,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.PRIMARY,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    card: {
        flexDirection: 'row',
        borderRadius: RADIUS.LG,
        overflow: 'hidden',
        marginBottom: SPACING.SM,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    cardAccent: { width: 4, backgroundColor: COLORS.SUCCESS },
    cardBody: { flex: 1, paddingVertical: SPACING.SM + 2, paddingHorizontal: SPACING.MD, gap: SPACING.XS },
    cardTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    cardName: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, flex: 1, marginRight: SPACING.SM },
    cardMetaRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.MD, flexWrap: 'wrap' },
    metaItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
    methodBadge: { borderRadius: RADIUS.FULL, paddingHorizontal: SPACING.SM, paddingVertical: 2 },
    methodText: { fontSize: FONT_SIZE.XS, fontWeight: FONT_WEIGHT.SEMIBOLD },

    billAmountsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: RADIUS.MD,
        paddingVertical: SPACING.SM,
        paddingHorizontal: SPACING.SM,
        marginVertical: SPACING.XS,
    },
    billAmountBlock: { alignItems: 'center', gap: 2 },
    billAmountValue: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },

    retryBtn: {
        marginTop: SPACING.LG,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.LG,
        paddingHorizontal: SPACING.LG,
        paddingVertical: SPACING.SM + 4,
    },
});
