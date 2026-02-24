import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Switch,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCustomerProfileStore } from '@/src/stores';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';


export function CustomerDetailScreen() {
    const { customerId: id } = useLocalSearchParams<{ customerId: string }>();
    const { data, loading, error, loadProfile, clearProfile } = useCustomerProfileStore();

    // State for viewing all records
    const [showAllDeliveries, setShowAllDeliveries] = useState(false);
    const [showAllBills, setShowAllBills] = useState(false);
    const [showAllPayments, setShowAllPayments] = useState(false);

    useEffect(() => {
        if (id) {
            loadProfile(id);
        }
        return () => {
            clearProfile();
        };
    }, [id, loadProfile, clearProfile]);

    if (loading || !data) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <ThemedView style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                </ThemedView>
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <ThemedView style={styles.centerContainer}>
                    <Ionicons name="cloud-offline-outline" size={56} color={COLORS.TEXT_MUTED} />
                    <ThemedText variant="subheading" style={{ marginTop: SPACING.MD }}>
                        Failed to Load Profile
                    </ThemedText>
                    <ThemedText variant="caption" style={{ marginTop: SPACING.XS, textAlign: 'center' }}>
                        {error}
                    </ThemedText>
                    <TouchableOpacity style={styles.retryBtn} onPress={() => id && loadProfile(id)}>
                        <ThemedText variant="label" color={COLORS.TEXT_ON_PRIMARY}>Retry</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="arrow-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <ThemedText variant="heading" style={{ fontSize: FONT_SIZE.LG }}>
                    Customer Profile
                </ThemedText>
                <TouchableOpacity style={styles.headerBtn} onPress={() => router.push(`/customers/edit/${id}`)}>
                    <Ionicons name="pencil" size={20} color={COLORS.PRIMARY} />
                </TouchableOpacity>
            </ThemedView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* ── Profile Info ────────────────────────────────────────────── */}
                <ThemedView style={styles.profileSection}>
                    <ThemedText variant="heading" style={styles.nameText}>
                        {data.first_name} {data.last_name}
                    </ThemedText>

                    <View style={styles.routeContainer}>
                        <Ionicons name="location" size={14} color={COLORS.TEXT_MUTED} />
                        <ThemedText variant="caption" style={{ marginLeft: 4 }}>
                            {data.route}
                        </ThemedText>
                    </View>

                    <View style={styles.routeContainer}>
                        <Ionicons name="call" size={14} color={COLORS.TEXT_MUTED} />
                        <ThemedText variant="caption" style={{ marginLeft: 4 }}>
                            +91 {data.phone_no}
                        </ThemedText>
                    </View>

                    <View style={[styles.rateBadge, { marginTop: SPACING.XS }]}>
                        <ThemedText variant="caption" color={COLORS.PRIMARY} style={{ fontWeight: FONT_WEIGHT.BOLD }}>
                            Rate: ₹{data.rate}/Bottle
                        </ThemedText>
                    </View>
                </ThemedView>

                {/* ── Quick Stats Grid ────────────────────────────────────────── */}
                <View style={{ flexDirection: 'row', gap: SPACING.MD, marginBottom: SPACING.LG }}>
                    <ThemedView style={[styles.statusCard, { flex: 1, marginBottom: 0 }]}>
                        <View style={styles.statusTextContainer}>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Coolers This Month</ThemedText>
                            <ThemedText variant="heading" style={{ color: COLORS.PRIMARY, fontSize: 24, marginTop: 4 }}>
                                {data.daily_entry_monthly}
                            </ThemedText>
                        </View>
                        <Ionicons name="water" size={32} color={COLORS.PRIMARY_LIGHT} style={{ opacity: 0.8 }} />
                    </ThemedView>

                    <ThemedView style={[styles.statusCard, { flex: 1, marginBottom: 0 }]}>
                        <View style={styles.statusTextContainer}>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>Active Status</ThemedText>
                            <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.BOLD, marginTop: 4, color: data.active ? COLORS.SUCCESS : COLORS.TEXT_MUTED }}>
                                {data.active ? 'Active' : 'Inactive'}
                            </ThemedText>
                        </View>
                        <Switch
                            value={data.active}
                            onValueChange={() => { }} // Disabled for now
                            trackColor={{ false: COLORS.BORDER, true: COLORS.SUCCESS }}
                            thumbColor="#fff"
                            style={{ transform: [{ scale: 0.8 }] }}
                        />
                    </ThemedView>
                </View>

                {/* ── Mini Ledger ────────────────────────────────────────────── */}
                <LinearGradient
                    colors={[COLORS.PRIMARY_LIGHT, '#f0f4ff']} // Using a light blue gradient
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={styles.ledgerCard}
                >
                    <View style={styles.ledgerCardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Ionicons name="wallet" size={20} color={COLORS.TEXT_PRIMARY} />
                            <ThemedText variant="subheading" style={{ marginLeft: 8 }}>
                                Mini Ledger
                            </ThemedText>
                        </View>
                    </View>

                    <View style={styles.ledgerBalancesRow}>
                        <View style={styles.balanceBox}>
                            <ThemedText variant="overline" color={COLORS.TEXT_MUTED}>
                                DUE AMOUNT
                            </ThemedText>
                            <ThemedText variant="number" color={COLORS.DANGER}>
                                ₹ {data.customer_account.due.toLocaleString()}
                            </ThemedText>
                            <View style={styles.trendContainer}>
                                <Ionicons name="caret-up" size={12} color={COLORS.DANGER} />
                                <ThemedText variant="caption" color={COLORS.DANGER} style={{ marginLeft: 4 }}>
                                    Overdue
                                </ThemedText>
                            </View>
                        </View>

                        <View style={styles.balanceBox}>
                            <ThemedText variant="overline" color={COLORS.TEXT_MUTED}>
                                TOTAL PAID
                            </ThemedText>
                            <ThemedText variant="number" color={COLORS.SUCCESS}>
                                ₹ {data.customer_account.total_paid.toLocaleString()}
                            </ThemedText>
                            <View style={styles.trendContainer}>
                                <Ionicons name="trending-up" size={12} color={COLORS.SUCCESS} />
                                <ThemedText variant="caption" color={COLORS.SUCCESS} style={{ marginLeft: 4 }}>
                                    This Month
                                </ThemedText>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        style={styles.recordPaymentBtn}
                        onPress={() => router.push({ pathname: '/finance/add-payment', params: { customerId: data.id } } as any)}
                    >
                        <Ionicons name="card" size={20} color={COLORS.TEXT_ON_PRIMARY} />
                        <ThemedText variant="label" color={COLORS.TEXT_ON_PRIMARY} style={{ marginLeft: 8 }}>
                            Record New Payment
                        </ThemedText>
                    </TouchableOpacity>
                </LinearGradient>

                {/* ── Recent Activity (Entries) ─────────────────────────────────────────── */}
                <View style={[styles.sectionTitleContainer, { marginTop: SPACING.MD }]}>
                    <ThemedText variant="subheading">Recent Deliveries</ThemedText>
                </View>

                {data.daily_entries.length === 0 ? (
                    <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ textAlign: 'center', marginVertical: SPACING.MD }}>No recent deliveries</ThemedText>
                ) : (
                    <>
                        {data.daily_entries.slice(0, showAllDeliveries ? undefined : 5).map((entry, index) => {
                            const dateObj = new Date(entry.date_added);
                            const formattedDate = format(dateObj, "dd MMM, hh:mm a");
                            const isToday = format(dateObj, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
                            const dateStr = isToday ? `Today, ${format(dateObj, "hh:mm a")}` : formattedDate;

                            return (
                                <View key={index} style={styles.activityRow}>
                                    <View style={[styles.activityIconCircle, { backgroundColor: COLORS.BACKGROUND }]}>
                                        <Ionicons name="water" size={20} color={COLORS.TEXT_SECONDARY} />
                                    </View>
                                    <View style={styles.activityDetails}>
                                        <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.SEMIBOLD }}>
                                            Coolers ({entry.cooler})
                                        </ThemedText>
                                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>
                                            {dateStr} • By {entry.addedby}
                                        </ThemedText>
                                    </View>
                                    <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.BOLD }}>
                                        ₹{entry.cooler * data.rate}
                                    </ThemedText>
                                </View>
                            );
                        })}
                        {data.daily_entries.length > 5 && (
                            <TouchableOpacity style={styles.viewMoreBtn} onPress={() => setShowAllDeliveries(!showAllDeliveries)}>
                                <ThemedText style={styles.viewMoreText}>{showAllDeliveries ? 'View Less Deliveries' : "View All " + data.daily_entries.length + " Deliveries"}</ThemedText>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* ── Recent Bills ─────────────────────────────────────────── */}
                <View style={[styles.sectionTitleContainer, { marginTop: SPACING.MD }]}>
                    <ThemedText variant="subheading">Recent Bills</ThemedText>
                </View>

                {data.bills.length === 0 ? (
                    <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ textAlign: 'center', marginVertical: SPACING.MD }}>No bills generated yet</ThemedText>
                ) : (
                    <>
                        {data.bills.slice(0, showAllBills ? undefined : 5).map((bill, index) => {
                            const fromStr = format(new Date(bill.from_date), "dd MMM");
                            const toStr = format(new Date(bill.to_date), "dd MMM yyyy");
                            const isPaid = bill.paid;

                            return (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.activityRow}
                                    onPress={() => router.push(`/finance/bill/${bill.id}`)}
                                >
                                    <View style={[styles.activityIconCircle, { backgroundColor: isPaid ? COLORS.SUCCESS_LIGHT : COLORS.WARNING_LIGHT }]}>
                                        <Ionicons name="document-text" size={20} color={isPaid ? COLORS.SUCCESS : COLORS.WARNING} />
                                    </View>
                                    <View style={styles.activityDetails}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.XS }}>
                                            <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.SEMIBOLD }}>
                                                Bill #{bill.bill_number}
                                            </ThemedText>
                                            <View style={{
                                                backgroundColor: isPaid ? COLORS.SUCCESS_LIGHT : COLORS.WARNING_LIGHT,
                                                paddingHorizontal: 6, paddingVertical: 2, borderRadius: RADIUS.SM
                                            }}>
                                                <ThemedText variant="caption" style={{ color: isPaid ? COLORS.SUCCESS : COLORS.WARNING, fontWeight: FONT_WEIGHT.BOLD, fontSize: 10 }}>
                                                    {isPaid ? 'PAID' : 'DUE'}
                                                </ThemedText>
                                            </View>
                                        </View>
                                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginTop: 2 }}>
                                            {fromStr} - {toStr} • {bill.coolers} Coolers
                                        </ThemedText>
                                    </View>
                                    <View style={{ alignItems: 'flex-end', flexDirection: 'row', gap: SPACING.SM }}>
                                        <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY }}>
                                            ₹{bill.Total}
                                        </ThemedText>
                                        <Ionicons name="chevron-forward" size={16} color={COLORS.TEXT_MUTED} />
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                        {data.bills.length > 5 && (
                            <TouchableOpacity style={styles.viewMoreBtn} onPress={() => setShowAllBills(!showAllBills)}>
                                <ThemedText style={styles.viewMoreText}>{showAllBills ? 'View Less Bills' : "View All " + data.bills.length + " Bills"}</ThemedText>
                            </TouchableOpacity>
                        )}
                    </>
                )}

                {/* ── Recent Payments ─────────────────────────────────────────── */}
                <View style={[styles.sectionTitleContainer, { marginTop: SPACING.MD }]}>
                    <ThemedText variant="subheading">Recent Payments</ThemedText>
                </View>

                {data.payments.length === 0 ? (
                    <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ textAlign: 'center', marginVertical: SPACING.MD }}>No recent payments</ThemedText>
                ) : (
                    <>
                        {data.payments.slice(0, showAllPayments ? undefined : 5).map((payment, index) => {
                            const dateStr = format(new Date(payment.date), "dd MMM, hh:mm a");
                            return (
                                <View key={index} style={styles.activityRow}>
                                    <View style={[styles.activityIconCircle, { backgroundColor: COLORS.SUCCESS_LIGHT }]}>
                                        <Ionicons name="cash" size={20} color={COLORS.SUCCESS} />
                                    </View>
                                    <View style={styles.activityDetails}>
                                        <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.SEMIBOLD }}>
                                            Payment Received
                                        </ThemedText>
                                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED}>
                                            {dateStr} • {payment.method}
                                        </ThemedText>
                                    </View>
                                    <View style={{ alignItems: 'flex-end' }}>
                                        <ThemedText variant="body" style={{ fontWeight: FONT_WEIGHT.BOLD, color: COLORS.SUCCESS }}>
                                            + ₹{payment.paid_amount || payment.amount || 0}
                                        </ThemedText>
                                        {(payment.rounf_off_amount ? payment.rounf_off_amount > 0 : false) && (
                                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginTop: 2 }}>
                                                Round Off: ₹{payment.rounf_off_amount}
                                            </ThemedText>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                        {data.payments.length > 5 && (
                            <TouchableOpacity style={styles.viewMoreBtn} onPress={() => setShowAllPayments(!showAllPayments)}>
                                <ThemedText style={styles.viewMoreText}>{showAllPayments ? 'View Less Payments' : "View All " + data.payments.length + " Payments"}</ThemedText>
                            </TouchableOpacity>
                        )}
                    </>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: {
        flex: 1,
        backgroundColor: COLORS.BACKGROUND,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: SPACING.LG,
    },
    retryBtn: {
        marginTop: SPACING.LG,
        backgroundColor: COLORS.PRIMARY,
        paddingHorizontal: SPACING.XL,
        paddingVertical: SPACING.SM,
        borderRadius: RADIUS.LG,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
        backgroundColor: COLORS.BACKGROUND,
    },
    headerBtn: {
        padding: SPACING.XS,
    },

    scrollContent: {
        padding: SPACING.MD,
        paddingBottom: SPACING.XXL,
    },

    // Profile Section
    profileSection: {
        alignItems: 'center',
        marginBottom: SPACING.LG,
    },

    nameText: {
        fontSize: FONT_SIZE.XL,
        fontWeight: FONT_WEIGHT.EXTRABOLD,
        marginBottom: 4,
    },
    routeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SPACING.SM,
    },
    rateBadge: {
        backgroundColor: COLORS.PRIMARY_LIGHT,
        paddingHorizontal: SPACING.MD,
        paddingVertical: 4,
        borderRadius: RADIUS.FULL,
    },

    // Status Card
    statusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD,
        padding: SPACING.MD,
        borderRadius: RADIUS.LG,
        marginBottom: SPACING.LG,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 1,
    },
    statusIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: COLORS.PRIMARY_LIGHT,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.MD,
    },
    statusTextContainer: {
        flex: 1,
    },

    // Mini Ledger
    ledgerCard: {
        padding: SPACING.MD,
        borderRadius: RADIUS.XL,
        marginBottom: SPACING.LG,
    },
    ledgerCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.MD,
    },
    ledgerBalancesRow: {
        flexDirection: 'row',
        gap: SPACING.MD,
        marginBottom: SPACING.LG,
    },
    balanceBox: {
        flex: 1,
        backgroundColor: '#fff',
        padding: SPACING.MD,
        borderRadius: RADIUS.LG,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
    },
    trendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    recordPaymentBtn: {
        flexDirection: 'row',
        backgroundColor: COLORS.PRIMARY,
        padding: SPACING.MD,
        borderRadius: RADIUS.LG,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Recent Activity
    sectionTitleContainer: {
        marginBottom: SPACING.SM,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD,
        padding: SPACING.MD,
        borderRadius: RADIUS.LG,
        marginBottom: SPACING.SM,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },
    activityIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.MD,
    },
    activityDetails: {
        flex: 1,
        gap: 2,
    },
    viewAllActivityBtn: {
        alignItems: 'center',
        paddingVertical: SPACING.MD,
    },
    viewMoreBtn: {
        marginTop: SPACING.SM,
        paddingVertical: SPACING.SM,
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: RADIUS.MD,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },
    viewMoreText: {
        color: COLORS.PRIMARY,
        fontWeight: FONT_WEIGHT.BOLD,
        fontSize: FONT_SIZE.SM,
    },
});
