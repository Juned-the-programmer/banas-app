/**
 * Banas App - Add Payment Screen
 * Form: Route Picker → Customer Picker → Enter Payment Details → Submit
 */
import { Customer, fetchCustomerAccountDue, fetchCustomerDetails, fetchCustomersByRoute, fetchRoutes, Route } from '@/src/api/customersService';
import { createPayment } from '@/src/api/paymentsService';
import { usePaymentsStore } from '@/src/stores/paymentsStore';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AddPaymentScreen() {
    // ─── Query Params ────────────────────────────────────────────────────────
    const { customerId: paramCustomerId } = useLocalSearchParams<{ customerId?: string }>();

    // ─── State ───────────────────────────────────────────────────────────────
    const [routeId, setRouteId] = useState<string | null>(null);
    const [customerId, setCustomerId] = useState<string | null>(paramCustomerId || null);
    const [customerName, setCustomerName] = useState<string>('');
    const [dueAmount, setDueAmount] = useState<number | null>(null);

    const [paidAmount, setPaidAmount] = useState('');
    const [roundOffAmount, setRoundOffAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'UPI' | 'cheque'>('cash');
    const [notes, setNotes] = useState('');

    // Loaders
    const [loadingInit, setLoadingInit] = useState(false);
    const [loadingDue, setLoadingDue] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Pickers Data
    const [routes, setRoutes] = useState<Route[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Modals
    const [routeModalVisible, setRouteModalVisible] = useState(false);
    const [customerModalVisible, setCustomerModalVisible] = useState(false);

    const { loadPayments } = usePaymentsStore();

    // ─── Initialization ───────────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            setLoadingInit(true);
            try {
                // Fetch routes for picker
                const r = await fetchRoutes();
                setRoutes(r);

                // If opened with a specific customer, skip route picking and fetch their due
                if (paramCustomerId) {
                    const [details, account] = await Promise.all([
                        fetchCustomerDetails(paramCustomerId),
                        fetchCustomerAccountDue(paramCustomerId),
                    ]);
                    setCustomerName(`${details.first_name} ${details.last_name}`);
                    setDueAmount(account.due);
                }
            } catch (err: any) {
                Alert.alert('Initialization Error', err?.message ?? 'Failed to setup page.');
            } finally {
                setLoadingInit(false);
            }
        }
        init();
    }, [paramCustomerId]);

    // ─── Effects ──────────────────────────────────────────────────────────────
    // When route changes (and not from URL param auto-fill), fetch customers for that route
    useEffect(() => {
        if (!routeId) return;
        async function fetchCustomerList() {
            try {
                const c = await fetchCustomersByRoute(routeId!);
                setCustomers(c);
            } catch (err) {
                console.error('Failed to fetch customers for route', err);
            }
        }
        fetchCustomerList();
    }, [routeId]);

    // When a customer is picked manually, fetch their due amount
    useEffect(() => {
        if (!customerId || customerId === paramCustomerId) return; // Do not fetch again if initialized via URL

        async function fetchDue() {
            setLoadingDue(true);
            try {
                const account = await fetchCustomerAccountDue(customerId!);
                setDueAmount(account.due);
            } catch (err) {
                Alert.alert('Error', 'Failed to fetch current due amount.');
            } finally {
                setLoadingDue(false);
            }
        }
        fetchDue();
    }, [customerId, paramCustomerId]);

    // ─── Search Filter ────────────────────────────────────────────────────────
    const filteredCustomers = useMemo(() => {
        if (!searchQuery) return customers;
        return customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [customers, searchQuery]);

    // ─── Submit ───────────────────────────────────────────────────────────────
    async function handleSubmit() {
        if (!customerId) { Alert.alert('Required', 'Please select a customer.'); return; }
        const parsedAmount = parseInt(paidAmount, 10);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Invalid', 'Paid Amount must be greater than zero.');
            return;
        }

        const parsedRound = roundOffAmount ? parseInt(roundOffAmount, 10) : undefined;

        setSubmitting(true);
        try {
            await createPayment({
                customer_name: customerId,
                paid_amount: parsedAmount,
                rounf_off_amount: parsedRound,
                payment_method: paymentMethod,
                notes: notes || undefined,
            });
            await loadPayments(); // Refresh global list
            Alert.alert('Success', 'Payment recorded successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Failed to record payment.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingInit) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Record Payment</ThemedText>
                    <View style={{ width: 40 }} />
                </View>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Record Payment</ThemedText>
                <View style={{ width: 40 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

                    {/* ── Customer Selection (Bypassed if loaded from profile) ── */}
                    {paramCustomerId ? (
                        <ThemedView style={styles.readOnlyCard}>
                            <ThemedText style={styles.label}>Customer</ThemedText>
                            <ThemedText style={styles.readOnlyVal}>{customerName}</ThemedText>
                        </ThemedView>
                    ) : (
                        <>
                            {/* Route Picker */}
                            <ThemedView style={styles.fieldGroup}>
                                <View style={styles.labelRow}>
                                    <ThemedText style={styles.label}>Route</ThemedText>
                                    <ThemedText style={styles.required}> *</ThemedText>
                                </View>
                                <TouchableOpacity
                                    style={styles.picker}
                                    onPress={() => setRouteModalVisible(true)}
                                >
                                    <Ionicons name="map-outline" size={18} color={routeId ? COLORS.PRIMARY : COLORS.TEXT_MUTED} />
                                    <ThemedText style={StyleSheet.flatten([styles.pickerText, !routeId && { color: COLORS.TEXT_MUTED }])}>
                                        {routeId ? routes.find(r => r.id === routeId)?.route_name || 'Selected' : 'Select a route...'}
                                    </ThemedText>
                                    <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_MUTED} />
                                </TouchableOpacity>
                            </ThemedView>

                            {/* Customer Picker */}
                            <ThemedView style={styles.fieldGroup}>
                                <View style={styles.labelRow}>
                                    <ThemedText style={styles.label}>Customer</ThemedText>
                                    <ThemedText style={styles.required}> *</ThemedText>
                                </View>
                                <TouchableOpacity
                                    style={StyleSheet.flatten([styles.picker, !routeId && { opacity: 0.5 }])}
                                    onPress={() => {
                                        if (!routeId) {
                                            Alert.alert('Required', 'Please select a route first.');
                                            return;
                                        }
                                        setSearchQuery('');
                                        setCustomerModalVisible(true);
                                    }}
                                    activeOpacity={routeId ? 0.7 : 1}
                                >
                                    <Ionicons name="person-outline" size={18} color={customerId ? COLORS.TEXT_PRIMARY : COLORS.TEXT_MUTED} />
                                    <ThemedText style={StyleSheet.flatten([styles.pickerText, !customerId && { color: COLORS.TEXT_MUTED }])}>
                                        {customerId ? customerName : 'Select a customer...'}
                                    </ThemedText>
                                    <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_MUTED} />
                                </TouchableOpacity>
                            </ThemedView>
                        </>
                    )}

                    {/* ── Current Due (Read Only) ────────────────────────────── */}
                    {customerId && (
                        <ThemedView style={styles.dueCard}>
                            <ThemedText style={{ color: COLORS.TEXT_SECONDARY, fontWeight: FONT_WEIGHT.SEMIBOLD }}>Current Due</ThemedText>
                            {loadingDue ? (
                                <ActivityIndicator size="small" color={COLORS.PRIMARY} />
                            ) : (
                                <ThemedText style={{ fontSize: FONT_SIZE.XL, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.DANGER }}>
                                    ₹{dueAmount ?? 0}
                                </ThemedText>
                            )}
                        </ThemedView>
                    )}

                    {/* ── Amount fields ────────────────────────────────────────── */}
                    <View style={styles.amountRow}>
                        <ThemedView style={[styles.fieldGroup, { flex: 1 }]}>
                            <View style={styles.labelRow}>
                                <ThemedText style={styles.label}>Paid Amount</ThemedText>
                                <ThemedText style={styles.required}> *</ThemedText>
                            </View>
                            <View style={styles.picker}>
                                <ThemedText style={{ color: COLORS.TEXT_MUTED, fontSize: FONT_SIZE.MD }}>₹</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    value={paidAmount}
                                    onChangeText={(t) => setPaidAmount(t.replace(/[^0-9]/g, ''))}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={COLORS.TEXT_MUTED}
                                />
                            </View>
                        </ThemedView>

                        <ThemedView style={[styles.fieldGroup, { flex: 1 }]}>
                            <View style={styles.labelRow}>
                                <ThemedText style={styles.label}>Round Off</ThemedText>
                                <ThemedText style={{ fontSize: 12, color: COLORS.TEXT_MUTED, marginLeft: 4 }}>(Optional)</ThemedText>
                            </View>
                            <View style={styles.picker}>
                                <ThemedText style={{ color: COLORS.TEXT_MUTED, fontSize: FONT_SIZE.MD }}>₹</ThemedText>
                                <TextInput
                                    style={styles.input}
                                    value={roundOffAmount}
                                    onChangeText={(t) => setRoundOffAmount(t.replace(/[^0-9]/g, ''))}
                                    keyboardType="numeric"
                                    placeholder="0"
                                    placeholderTextColor={COLORS.TEXT_MUTED}
                                />
                            </View>
                        </ThemedView>
                    </View>

                    {/* ── Payment Method ───────────────────────────────────────── */}
                    <ThemedView style={styles.fieldGroup}>
                        <View style={styles.labelRow}>
                            <ThemedText style={styles.label}>Payment Method</ThemedText>
                            <ThemedText style={styles.required}> *</ThemedText>
                        </View>
                        <View style={styles.methodRow}>
                            {(['cash', 'UPI', 'cheque'] as const).map(method => {
                                const active = paymentMethod === method;
                                return (
                                    <TouchableOpacity
                                        key={method}
                                        style={StyleSheet.flatten([styles.methodPill, active && styles.methodPillActive])}
                                        onPress={() => setPaymentMethod(method)}
                                    >
                                        <Ionicons
                                            name={method === 'cash' ? 'cash-outline' : method === 'UPI' ? 'qr-code-outline' : 'document-text-outline'}
                                            size={16}
                                            color={active ? '#fff' : COLORS.TEXT_SECONDARY}
                                        />
                                        <ThemedText style={StyleSheet.flatten([styles.methodText, active && { color: '#fff', fontWeight: FONT_WEIGHT.BOLD }])}>
                                            {method.toUpperCase()}
                                        </ThemedText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </ThemedView>

                    {/* ── Notes ────────────────────────────────────────────────── */}
                    <ThemedView style={styles.fieldGroup}>
                        <View style={styles.labelRow}>
                            <ThemedText style={styles.label}>Notes</ThemedText>
                            <ThemedText style={{ fontSize: 12, color: COLORS.TEXT_MUTED, marginLeft: 4 }}>(Optional)</ThemedText>
                        </View>
                        <View style={StyleSheet.flatten([styles.picker, { alignItems: 'flex-start' }])}>
                            <TextInput
                                style={StyleSheet.flatten([styles.input, { minHeight: 60, textAlignVertical: 'top' }])}
                                value={notes}
                                onChangeText={setNotes}
                                placeholder="Any additional details..."
                                placeholderTextColor={COLORS.TEXT_MUTED}
                                multiline
                            />
                        </View>
                    </ThemedView>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit */}
            <ThemedView style={styles.footer}>
                <TouchableOpacity
                    style={StyleSheet.flatten([styles.submitBtn, submitting && { opacity: 0.6 }])}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
                    <ThemedText style={styles.submitBtnText}>
                        {submitting ? 'Recording...' : 'Record Payment'}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>

            {/* ── Route Modal ─────────────────────────────────────────────────── */}
            <Modal visible={routeModalVisible} transparent animationType="fade" onRequestClose={() => setRouteModalVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setRouteModalVisible(false)}>
                    <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                        <View style={styles.modalContent}>
                            <ThemedText style={styles.modalTitle}>Select Route</ThemedText>
                            <View style={styles.modalDivider} />
                            <ScrollView showsVerticalScrollIndicator={false}>
                                {routes.map(r => {
                                    const isActive = routeId === r.id;
                                    return (
                                        <TouchableOpacity
                                            key={r.id}
                                            style={styles.modalItem}
                                            onPress={() => {
                                                if (routeId !== r.id) {
                                                    setRouteId(r.id);
                                                    setCustomerId(null);
                                                    setCustomerName('');
                                                    setDueAmount(null);
                                                }
                                                setRouteModalVisible(false);
                                            }}
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

            {/* ── Searchable Customer Modal ─────────────────────────────────────── */}
            <Modal visible={customerModalVisible} transparent animationType="slide" onRequestClose={() => setCustomerModalVisible(false)}>
                <SafeAreaView style={styles.fullScreenModal} edges={['top']}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setCustomerModalVisible(false)} style={styles.backBtn}>
                            <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
                        </TouchableOpacity>
                        <View style={styles.searchContainer}>
                            <Ionicons name="search" size={18} color={COLORS.TEXT_MUTED} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search customers..."
                                placeholderTextColor={COLORS.TEXT_MUTED}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                autoFocus
                            />
                            {searchQuery.length > 0 && (
                                <TouchableOpacity onPress={() => setSearchQuery('')}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.TEXT_MUTED} />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                    <FlatList
                        data={filteredCustomers}
                        keyExtractor={c => c.id}
                        contentContainerStyle={{ paddingBottom: SPACING.XXL }}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.customerRow}
                                onPress={() => {
                                    setCustomerId(item.id);
                                    setCustomerName(item.name);
                                    setCustomerModalVisible(false);
                                }}
                            >
                                <View style={styles.customerAvatar}>
                                    <ThemedText style={{ color: COLORS.PRIMARY, fontWeight: FONT_WEIGHT.BOLD }}>{item.initials}</ThemedText>
                                </View>
                                <ThemedText style={{ fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.MEDIUM }}>{item.name}</ThemedText>
                            </TouchableOpacity>
                        )}
                        ListEmptyComponent={
                            <View style={{ padding: SPACING.XXL, alignItems: 'center' }}>
                                <Ionicons name="search-outline" size={48} color={COLORS.BORDER} />
                                <ThemedText style={{ marginTop: SPACING.MD, color: COLORS.TEXT_MUTED }}>No customers found.</ThemedText>
                            </View>
                        }
                    />
                </SafeAreaView>
            </Modal>
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    header: {
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM + 4,
        backgroundColor: COLORS.CARD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    title: { flex: 1, fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },

    body: { flex: 1, padding: SPACING.MD },

    readOnlyCard: {
        backgroundColor: COLORS.CARD, borderRadius: RADIUS.MD, padding: SPACING.MD,
        marginBottom: SPACING.LG, borderWidth: 1, borderColor: COLORS.BORDER,
    },
    readOnlyVal: { fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginTop: 4 },

    dueCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.DANGER_LIGHT, borderRadius: RADIUS.MD,
        padding: SPACING.MD, marginBottom: SPACING.LG,
    },

    fieldGroup: { marginBottom: SPACING.LG },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.XS },
    label: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
    required: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.DANGER },

    picker: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
        backgroundColor: COLORS.CARD, borderRadius: RADIUS.MD,
        borderWidth: 1.5, borderColor: COLORS.BORDER,
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM + 2,
        minHeight: 50,
    },
    pickerText: { flex: 1, fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },
    input: {
        flex: 1, fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY, paddingVertical: 0,
    },

    amountRow: { flexDirection: 'row', gap: SPACING.MD },

    methodRow: { flexDirection: 'row', gap: SPACING.SM },
    methodPill: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: SPACING.SM + 2, borderRadius: RADIUS.MD,
        backgroundColor: COLORS.CARD, borderWidth: 1, borderColor: COLORS.BORDER,
    },
    methodPillActive: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
    methodText: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.MEDIUM, color: COLORS.TEXT_SECONDARY },

    footer: {
        padding: SPACING.MD, backgroundColor: COLORS.CARD,
        borderTopWidth: 1, borderTopColor: COLORS.BORDER,
    },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM,
        backgroundColor: COLORS.SUCCESS, borderRadius: RADIUS.LG, paddingVertical: SPACING.MD,
        shadowColor: COLORS.SUCCESS, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    submitBtnText: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: '#fff' },

    // Modals
    modalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', paddingHorizontal: SPACING.MD,
    },
    modalContent: {
        backgroundColor: '#FFFFFF', borderRadius: RADIUS.LG, padding: SPACING.LG,
        maxHeight: '90%', shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18, shadowRadius: 12, elevation: 10,
    },
    modalDivider: { height: 1, backgroundColor: COLORS.BORDER, marginBottom: SPACING.XS },
    modalTitle: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, paddingBottom: SPACING.SM },
    modalItem: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingVertical: SPACING.MD, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: COLORS.BORDER,
    },
    modalItemText: { fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },
    modalItemTextActive: { color: COLORS.PRIMARY, fontWeight: FONT_WEIGHT.BOLD },

    // Full Screen Search Modal
    fullScreenModal: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    searchContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'center', gap: SPACING.XS,
        backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.MD,
        paddingHorizontal: SPACING.SM, paddingVertical: 6, marginLeft: SPACING.SM,
    },
    searchInput: { flex: 1, fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY, paddingVertical: 0 },
    customerRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.MD,
        padding: SPACING.MD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, backgroundColor: COLORS.CARD,
    },
    customerAvatar: {
        width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.PRIMARY_LIGHT,
        alignItems: 'center', justifyContent: 'center',
    },
});
