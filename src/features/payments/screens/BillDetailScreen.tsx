import { BillDetailResponse, fetchBillDetails } from '@/src/api/billsService';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function BillDetailScreen() {
    const { billId: id } = useLocalSearchParams<{ billId: string }>();

    const [data, setData] = useState<BillDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadBill() {
            if (!id) return;
            try {
                setLoading(true);
                const response = await fetchBillDetails(id);
                setData(response);
            } catch (err: any) {
                Alert.alert('Error', err?.message || 'Failed to load bill details.');
                router.back();
            } finally {
                setLoading(false);
            }
        }
        loadBill();
    }, [id]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Bill Details</ThemedText>
                    <View style={{ width: 40 }} />
                </View>
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                </View>
            </SafeAreaView>
        );
    }

    if (!data) return null;

    const { bill, daily_entry } = data;
    const isPaid = bill.paid;

    // Parse Dates safely
    const fromStr = (() => { try { return format(parseISO(bill.from_date), 'dd MMM yyyy'); } catch { return bill.from_date; } })();
    const toStr = (() => { try { return format(parseISO(bill.to_date), 'dd MMM yyyy'); } catch { return bill.to_date; } })();
    const createdAtStr = (() => { try { return format(parseISO(bill.date), 'dd MMM yyyy, hh:mm a'); } catch { return bill.date; } })();

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Bill Details</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* ── Header Card ────────────────────────────────────────── */}
                <ThemedView style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <View>
                            <ThemedText variant="subheading" color={COLORS.TEXT_PRIMARY}>
                                Bill #{bill.bill_number}
                            </ThemedText>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginTop: 2 }}>
                                Generated on {createdAtStr}
                            </ThemedText>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: isPaid ? COLORS.SUCCESS_LIGHT : COLORS.WARNING_LIGHT }]}>
                            <ThemedText style={[styles.statusText, { color: isPaid ? COLORS.SUCCESS : COLORS.WARNING }]}>
                                {isPaid ? 'PAID' : 'DUE'}
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.infoRow}>
                        <View style={styles.infoCol}>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Customer</ThemedText>
                            <ThemedText style={styles.infoVal}>{bill.customer_name}</ThemedText>
                        </View>
                        <View style={styles.infoColRight}>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Billing Period</ThemedText>
                            <ThemedText style={styles.infoVal}>{fromStr} - {toStr}</ThemedText>
                        </View>
                    </View>

                    <View style={styles.divider} />

                    {/* ── Amounts Grid ────────────────────────────────────────── */}
                    <View style={styles.amountGrid}>
                        <View style={styles.amountBox}>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Coolers</ThemedText>
                            <ThemedText style={styles.amountVal}>{bill.coolers}</ThemedText>
                        </View>
                        <View style={styles.amountBox}>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Rate</ThemedText>
                            <ThemedText style={styles.amountVal}>₹{bill.Rate}</ThemedText>
                        </View>
                        <View style={styles.amountBox}>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Amount</ThemedText>
                            <ThemedText style={styles.amountVal}>₹{bill.Amount}</ThemedText>
                        </View>
                    </View>

                    <View style={[styles.amountGrid, { marginTop: SPACING.SM }]}>
                        {bill.Pending_amount > 0 && (
                            <View style={styles.amountBox}>
                                <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Previous Pending</ThemedText>
                                <ThemedText style={[styles.amountVal, { color: COLORS.WARNING }]}>₹{bill.Pending_amount}</ThemedText>
                            </View>
                        )}
                        {bill.Advanced_amount > 0 && (
                            <View style={styles.amountBox}>
                                <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Advance Paid</ThemedText>
                                <ThemedText style={[styles.amountVal, { color: COLORS.SUCCESS }]}>-₹{bill.Advanced_amount}</ThemedText>
                            </View>
                        )}
                    </View>

                    <View style={styles.totalRow}>
                        <ThemedText style={styles.totalLabel}>Total Payable</ThemedText>
                        <ThemedText style={styles.totalVal}>₹{bill.Total}</ThemedText>
                    </View>
                </ThemedView>

                {/* ── Daily Entries List ────────────────────────────────────────── */}
                <View style={styles.sectionTitleContainer}>
                    <ThemedText variant="subheading">Daily Entries ({daily_entry.length})</ThemedText>
                </View>

                {daily_entry.length === 0 ? (
                    <ThemedView style={styles.emptyState}>
                        <Ionicons name="list-outline" size={32} color={COLORS.BORDER} />
                        <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ marginTop: SPACING.SM }}>
                            No entries found for this bill.
                        </ThemedText>
                    </ThemedView>
                ) : (
                    <ThemedView style={styles.entriesCard}>
                        {daily_entry.map((entry, idx) => {
                            const dateObj = new Date(entry.date_added);
                            const formattedDate = (() => { try { return format(dateObj, "dd MMM, hh:mm a"); } catch { return entry.date_added; } })();
                            const isLast = idx === daily_entry.length - 1;

                            return (
                                <View key={idx} style={[styles.entryRow, !isLast && styles.entryRowBorder]}>
                                    <View style={styles.entryIconCircle}>
                                        <Ionicons name="water" size={16} color={COLORS.PRIMARY} />
                                    </View>
                                    <View style={styles.entryDetails}>
                                        <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.SEMIBOLD }}>
                                            {formattedDate}
                                        </ThemedText>
                                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>
                                            By {entry.addedby}
                                        </ThemedText>
                                    </View>
                                    <View style={styles.entryCoolersBadge}>
                                        <ThemedText style={styles.entryCoolersText}>
                                            {entry.cooler} Coolers
                                        </ThemedText>
                                    </View>
                                </View>
                            );
                        })}
                    </ThemedView>
                )}

                <View style={{ height: SPACING.XXL }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM + 4,
        backgroundColor: COLORS.CARD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    title: { flex: 1, fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, textAlign: 'center' },

    scrollContent: { padding: SPACING.MD },

    card: {
        backgroundColor: COLORS.CARD,
        borderRadius: RADIUS.LG,
        padding: SPACING.LG,
        marginBottom: SPACING.LG,
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1, shadowRadius: 6, elevation: 3,
    },
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.SM },
    statusText: { fontSize: 10, fontWeight: FONT_WEIGHT.EXTRABOLD, letterSpacing: 0.5 },

    divider: { height: 1, backgroundColor: COLORS.BORDER, marginVertical: SPACING.MD },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between' },
    infoCol: { flex: 1 },
    infoColRight: { flex: 1, alignItems: 'flex-end' },
    infoVal: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY, marginTop: 2 },

    amountGrid: { flexDirection: 'row', justifyContent: 'space-between' },
    amountBox: { flex: 1, backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD, padding: SPACING.SM, marginHorizontal: 4, alignItems: 'center' },
    amountVal: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginTop: 4 },

    totalRow: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: SPACING.LG, paddingTop: SPACING.MD,
        borderTopWidth: 2, borderTopColor: COLORS.BACKGROUND, borderStyle: 'dashed'
    },
    totalLabel: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_SECONDARY },
    totalVal: { fontSize: 22, fontWeight: FONT_WEIGHT.EXTRABOLD, color: COLORS.PRIMARY },

    sectionTitleContainer: { marginBottom: SPACING.SM, paddingHorizontal: 4 },

    emptyState: { alignItems: 'center', padding: SPACING.XL, backgroundColor: COLORS.CARD, borderRadius: RADIUS.LG },

    entriesCard: {
        backgroundColor: COLORS.CARD,
        borderRadius: RADIUS.LG,
        overflow: 'hidden',
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },
    entryRow: {
        flexDirection: 'row', alignItems: 'center',
        padding: SPACING.MD,
    },
    entryRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.BORDER },
    entryIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.PRIMARY_LIGHT, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.MD },
    entryDetails: { flex: 1 },
    entryCoolersBadge: { backgroundColor: COLORS.BACKGROUND, paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.MD, borderWidth: 1, borderColor: COLORS.BORDER },
    entryCoolersText: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
});
