/**
 * Banas App - Add Daily Entry Screen
 * Form: pick customer (real API) → enter integer cooler count → pick date (default today) → submit
 * POST /dailyentry/  { customer, cooler, date_added }
 */
import { Customer, fetchCustomersByRoute, fetchRoutes, Route } from '@/src/api/customersService';
import { createEntry } from '@/src/api/dailyEntryService';
import { useDailyEntryStore } from '@/src/stores';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toLocalISODate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function formatDisplayDate(iso: string): string {
    const [y, m, d] = iso.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
    });
}

// ─── Simple Date Picker Modal ─────────────────────────────────────────────────
function DatePickerModal({
    visible,
    value,
    onConfirm,
    onCancel,
}: {
    visible: boolean;
    value: string;
    onConfirm: (date: string) => void;
    onCancel: () => void;
}) {
    const [draft, setDraft] = useState(value);

    useEffect(() => { if (visible) setDraft(value); }, [visible, value]);

    const parsed = (() => {
        const [y, m, d] = draft.split('-').map(Number);
        return { year: y || new Date().getFullYear(), month: m || new Date().getMonth() + 1, day: d || new Date().getDate() };
    })();

    function adjust(field: 'year' | 'month' | 'day', delta: number) {
        let { year, month, day } = parsed;
        if (field === 'month') {
            month += delta;
            if (month < 1) { month = 12; year--; }
            if (month > 12) { month = 1; year++; }
        } else if (field === 'day') {
            const daysInMonth = new Date(year, month, 0).getDate();
            day = ((day - 1 + delta + daysInMonth) % daysInMonth) + 1;
        } else {
            year += delta;
        }
        // Clamp day to valid range for new month
        const maxDay = new Date(year, month, 0).getDate();
        day = Math.min(day, maxDay);
        setDraft(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
            <TouchableOpacity style={dpStyles.overlay} activeOpacity={1} onPress={onCancel}>
                <TouchableOpacity activeOpacity={1} onPress={() => { }}>
                    <View style={dpStyles.card}>
                        <ThemedText style={dpStyles.title}>Select Date</ThemedText>

                        <View style={dpStyles.row}>
                            {/* Day */}
                            <View style={dpStyles.spinnerCol}>
                                <TouchableOpacity onPress={() => adjust('day', 1)} style={dpStyles.arrow}>
                                    <Ionicons name="chevron-up" size={22} color={COLORS.PRIMARY} />
                                </TouchableOpacity>
                                <ThemedText style={dpStyles.spinnerVal}>{String(parsed.day).padStart(2, '0')}</ThemedText>
                                <TouchableOpacity onPress={() => adjust('day', -1)} style={dpStyles.arrow}>
                                    <Ionicons name="chevron-down" size={22} color={COLORS.PRIMARY} />
                                </TouchableOpacity>
                                <ThemedText style={dpStyles.spinnerLabel}>Day</ThemedText>
                            </View>

                            <ThemedText style={dpStyles.sep}>/</ThemedText>

                            {/* Month */}
                            <View style={dpStyles.spinnerCol}>
                                <TouchableOpacity onPress={() => adjust('month', 1)} style={dpStyles.arrow}>
                                    <Ionicons name="chevron-up" size={22} color={COLORS.PRIMARY} />
                                </TouchableOpacity>
                                <ThemedText style={dpStyles.spinnerVal}>{monthNames[parsed.month - 1]}</ThemedText>
                                <TouchableOpacity onPress={() => adjust('month', -1)} style={dpStyles.arrow}>
                                    <Ionicons name="chevron-down" size={22} color={COLORS.PRIMARY} />
                                </TouchableOpacity>
                                <ThemedText style={dpStyles.spinnerLabel}>Month</ThemedText>
                            </View>

                            <ThemedText style={dpStyles.sep}>/</ThemedText>

                            {/* Year */}
                            <View style={dpStyles.spinnerCol}>
                                <TouchableOpacity onPress={() => adjust('year', 1)} style={dpStyles.arrow}>
                                    <Ionicons name="chevron-up" size={22} color={COLORS.PRIMARY} />
                                </TouchableOpacity>
                                <ThemedText style={dpStyles.spinnerVal}>{parsed.year}</ThemedText>
                                <TouchableOpacity onPress={() => adjust('year', -1)} style={dpStyles.arrow}>
                                    <Ionicons name="chevron-down" size={22} color={COLORS.PRIMARY} />
                                </TouchableOpacity>
                                <ThemedText style={dpStyles.spinnerLabel}>Year</ThemedText>
                            </View>
                        </View>

                        <View style={dpStyles.actions}>
                            <TouchableOpacity style={dpStyles.cancelBtn} onPress={onCancel}>
                                <ThemedText style={{ color: COLORS.TEXT_SECONDARY, fontWeight: FONT_WEIGHT.MEDIUM }}>Cancel</ThemedText>
                            </TouchableOpacity>
                            <TouchableOpacity style={dpStyles.confirmBtn} onPress={() => onConfirm(draft)}>
                                <ThemedText style={{ color: '#fff', fontWeight: FONT_WEIGHT.BOLD }}>Confirm</ThemedText>
                            </TouchableOpacity>
                        </View>
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export function AddDailyEntryScreen() {
    const { loadEntries } = useDailyEntryStore();

    const [routeId, setRouteId] = useState<string | null>(null);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);

    const [customerId, setCustomerId] = useState('');
    const [customerName, setCustomerName] = useState('');

    const [cooler, setCooler] = useState('1');
    const [date, setDate] = useState(toLocalISODate(new Date()));

    const [loadingInit, setLoadingInit] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [routePickerVisible, setRoutePickerVisible] = useState(false);
    const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
    const [datePickerVisible, setDatePickerVisible] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    // ─── Initialization ───────────────────────────────────────────────────────
    useEffect(() => {
        async function init() {
            setLoadingInit(true);
            try {
                const r = await fetchRoutes();
                setRoutes(r);
            } catch (err: any) {
                Alert.alert('Initialization Error', err?.message ?? 'Failed to setup page.');
            } finally {
                setLoadingInit(false);
            }
        }
        init();
    }, []);

    // ─── Effects ──────────────────────────────────────────────────────────────
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

    // ─── Search Filter ────────────────────────────────────────────────────────
    const filteredCustomers = React.useMemo(() => {
        if (!searchQuery) return customers;
        return customers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [customers, searchQuery]);

    const selectedRoute = routes.find(r => r.id === routeId);

    async function handleSubmit() {
        if (!customerId) { Alert.alert('Required', 'Please select a customer.'); return; }
        const coolerNum = parseInt(cooler, 10);
        if (isNaN(coolerNum) || coolerNum < 1) {
            Alert.alert('Invalid', 'Cooler count must be a positive number.');
            return;
        }

        setSubmitting(true);
        try {
            await createEntry({ customerId, cooler: coolerNum, date });
            await loadEntries();
            Alert.alert('Success', 'Daily entry added successfully!', [
                { text: 'OK', onPress: () => router.back() },
            ]);
        } catch (e: any) {
            Alert.alert('Error', e?.message ?? 'Failed to add entry. Please try again.');
        } finally {
            setSubmitting(false);
        }
    }

    if (loadingInit) {
        return (
            <SafeAreaView style={styles.safe}>
                <ThemedView style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Add Daily Entry</ThemedText>
                    <ThemedView style={{ width: 40 }} />
                </ThemedView>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* Header */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Add Daily Entry</ThemedText>
                <ThemedView style={{ width: 40 }} />
            </ThemedView>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <ScrollView style={styles.body} keyboardShouldPersistTaps="handled">

                    {/* ── Date Row ─────────────────────────────────────────── */}
                    <TouchableOpacity style={styles.dateRow} onPress={() => setDatePickerVisible(true)}>
                        <Ionicons name="calendar-outline" size={16} color={COLORS.PRIMARY} />
                        <ThemedText style={styles.dateText}>{formatDisplayDate(date)}</ThemedText>
                        <Ionicons name="pencil-outline" size={14} color={COLORS.PRIMARY} />
                    </TouchableOpacity>

                    {/* ── Route Picker ────────────────────────────────────────── */}
                    <ThemedView style={styles.fieldGroup}>
                        <ThemedView style={styles.labelRow}>
                            <ThemedText style={styles.label}>Route</ThemedText>
                            <ThemedText style={styles.required}> *</ThemedText>
                        </ThemedView>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setRoutePickerVisible(true)}
                        >
                            <Ionicons
                                name="map-outline"
                                size={18}
                                color={routeId ? COLORS.TEXT_PRIMARY : COLORS.TEXT_MUTED}
                            />
                            <ThemedText style={StyleSheet.flatten([
                                styles.pickerText,
                                !routeId && { color: COLORS.TEXT_MUTED },
                            ])}>
                                {selectedRoute?.route_name ?? 'Select a route...'}
                            </ThemedText>
                            <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_MUTED} />
                        </TouchableOpacity>
                    </ThemedView>

                    {/* ── Customer Picker ───────────────────────────────────── */}
                    <ThemedView style={styles.fieldGroup}>
                        <ThemedView style={styles.labelRow}>
                            <ThemedText style={styles.label}>Customer</ThemedText>
                            <ThemedText style={styles.required}> *</ThemedText>
                        </ThemedView>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => {
                                if (!routeId) {
                                    Alert.alert('Select Route', 'Please select a route first.');
                                    return;
                                }
                                setCustomerPickerVisible(true);
                            }}
                        >
                            <Ionicons
                                name="person-outline"
                                size={18}
                                color={customerId ? COLORS.TEXT_PRIMARY : COLORS.TEXT_MUTED}
                            />
                            <ThemedText style={StyleSheet.flatten([
                                styles.pickerText,
                                !customerId && { color: COLORS.TEXT_MUTED },
                            ])}>
                                {customerName || 'Select a customer...'}
                            </ThemedText>
                            <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_MUTED} />
                        </TouchableOpacity>
                    </ThemedView>

                    {/* ── Cooler Count ──────────────────────────────────────── */}
                    <ThemedView style={styles.fieldGroup}>
                        <ThemedView style={styles.labelRow}>
                            <ThemedText style={styles.label}>Cooler Count</ThemedText>
                            <ThemedText style={styles.required}> *</ThemedText>
                        </ThemedView>
                        <ThemedView style={styles.picker}>
                            <Ionicons name="water-outline" size={18} color={cooler ? COLORS.PRIMARY : COLORS.TEXT_MUTED} />
                            <TextInput
                                style={styles.coolerInput}
                                value={cooler}
                                onChangeText={(t) => {
                                    // allow only digits
                                    const digits = t.replace(/[^0-9]/g, '');
                                    setCooler(digits);
                                }}
                                keyboardType="number-pad"
                                placeholder="e.g. 2"
                                placeholderTextColor={COLORS.TEXT_MUTED}
                                maxLength={3}
                            />
                            <ThemedText style={{ color: COLORS.TEXT_MUTED, fontSize: FONT_SIZE.SM }}>units</ThemedText>
                        </ThemedView>
                    </ThemedView>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* Submit */}
            <ThemedView style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    <Ionicons name="add-circle-outline" size={20} color="#fff" />
                    <ThemedText style={styles.submitBtnText}>
                        {submitting ? 'Saving...' : 'Add Entry'}
                    </ThemedText>
                </TouchableOpacity>
            </ThemedView>

            {/* ── Route Picker Modal ────────────────────────────────────────── */}
            <Modal
                visible={routePickerVisible}
                animationType="slide"
            >
                <SafeAreaView style={styles.safe}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setRoutePickerVisible(false)} style={styles.backBtn}>
                            <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Select Route</ThemedText>
                        <View style={{ width: 40 }} />
                    </View>
                    <FlatList
                        data={routes}
                        keyExtractor={r => r.id}
                        contentContainerStyle={{ padding: SPACING.MD }}
                        renderItem={({ item }) => {
                            const isSelected = item.id === routeId;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.pickerOption,
                                        isSelected && styles.pickerOptionSelected
                                    ]}
                                    onPress={() => {
                                        setRouteId(item.id);
                                        setCustomerId('');
                                        setCustomerName('');
                                        setRoutePickerVisible(false);
                                    }}
                                >
                                    <View style={styles.pickerOptionContent}>
                                        <ThemedText style={StyleSheet.flatten([
                                            styles.pickerOptionText,
                                            isSelected && styles.pickerOptionTextSelected
                                        ])}>
                                            {item.route_name}
                                        </ThemedText>
                                    </View>
                                    {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.PRIMARY} />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </SafeAreaView>
            </Modal>

            {/* ── Customer Picker (Searchable) Modal ────────────────────────── */}
            <Modal
                visible={customerPickerVisible}
                animationType="slide"
            >
                <SafeAreaView style={styles.safe}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setCustomerPickerVisible(false)} style={styles.backBtn}>
                            <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
                        </TouchableOpacity>
                        <ThemedText style={styles.title}>Select Customer</ThemedText>
                        <View style={{ width: 40 }} />
                    </View>

                    <View style={styles.searchContainer}>
                        <Ionicons name="search" size={20} color={COLORS.TEXT_MUTED} style={styles.searchIcon} />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name..."
                            placeholderTextColor={COLORS.TEXT_MUTED}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                            autoCapitalize="words"
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Ionicons name="close-circle" size={20} color={COLORS.TEXT_MUTED} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <FlatList
                        data={filteredCustomers}
                        keyExtractor={c => c.id}
                        contentContainerStyle={{ padding: SPACING.MD }}
                        ListEmptyComponent={
                            <View style={{ padding: SPACING.XL, alignItems: 'center' }}>
                                <Ionicons name="search-outline" size={48} color={COLORS.BORDER} />
                                <ThemedText style={{ marginTop: SPACING.MD, color: COLORS.TEXT_MUTED }}>
                                    No customers found.
                                </ThemedText>
                            </View>
                        }
                        renderItem={({ item }) => {
                            const isSelected = item.id === customerId;
                            return (
                                <TouchableOpacity
                                    style={[
                                        styles.pickerOption,
                                        isSelected && styles.pickerOptionSelected
                                    ]}
                                    onPress={() => {
                                        setCustomerId(item.id);
                                        setCustomerName(item.name);
                                        setCustomerPickerVisible(false);
                                    }}
                                >
                                    <View style={styles.pickerOptionContent}>
                                        <ThemedText style={StyleSheet.flatten([
                                            styles.pickerOptionText,
                                            isSelected && styles.pickerOptionTextSelected
                                        ])}>
                                            {item.name}
                                        </ThemedText>
                                    </View>
                                    {isSelected && <Ionicons name="checkmark-circle" size={24} color={COLORS.PRIMARY} />}
                                </TouchableOpacity>
                            );
                        }}
                    />
                </SafeAreaView>
            </Modal>

            {/* ── Date Picker Modal ─────────────────────────────────────── */}
            <DatePickerModal
                visible={datePickerVisible}
                value={date}
                onConfirm={(d) => { setDate(d); setDatePickerVisible(false); }}
                onCancel={() => setDatePickerVisible(false)}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM + 4,
        backgroundColor: COLORS.CARD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
    },
    backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 20 },
    title: { fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },

    body: { flex: 1, padding: SPACING.MD },

    dateRow: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.XS,
        backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: RADIUS.MD,
        padding: SPACING.SM + 4, marginBottom: SPACING.LG,
    },
    dateText: { flex: 1, color: COLORS.PRIMARY, fontWeight: FONT_WEIGHT.SEMIBOLD, fontSize: FONT_SIZE.SM },

    fieldGroup: { marginBottom: SPACING.MD },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.XS },
    label: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
    required: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.DANGER },

    picker: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.SM,
        backgroundColor: COLORS.CARD, borderRadius: RADIUS.MD,
        borderWidth: 1.5, borderColor: COLORS.BORDER,
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM + 4,
    },
    pickerText: { flex: 1, fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },

    coolerInput: {
        flex: 1,
        fontSize: FONT_SIZE.MD,
        color: COLORS.TEXT_PRIMARY,
        paddingVertical: 0,
    },

    footer: {
        padding: SPACING.MD, backgroundColor: COLORS.CARD,
        borderTopWidth: 1, borderTopColor: COLORS.BORDER,
    },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM,
        backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.LG, paddingVertical: SPACING.MD,
        shadowColor: COLORS.PRIMARY, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 6,
    },
    submitBtnText: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: '#fff' },

    searchContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.CARD,
        margin: SPACING.MD, paddingHorizontal: SPACING.MD, borderRadius: RADIUS.MD,
        borderWidth: 1, borderColor: COLORS.BORDER,
    },
    searchIcon: { marginRight: SPACING.SM },
    searchInput: { flex: 1, paddingVertical: SPACING.MD, fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },

    pickerOption: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.CARD,
        padding: SPACING.MD, borderRadius: RADIUS.LG, marginBottom: SPACING.SM,
        borderWidth: 1.5, borderColor: COLORS.BORDER,
    },
    pickerOptionSelected: { borderColor: COLORS.PRIMARY, backgroundColor: COLORS.PRIMARY_LIGHT },
    pickerOptionContent: { flex: 1 },
    pickerOptionText: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.MEDIUM, color: COLORS.TEXT_PRIMARY },
    pickerOptionTextSelected: { fontWeight: FONT_WEIGHT.BOLD, color: COLORS.PRIMARY },
});

const dpStyles = StyleSheet.create({
    overlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center', alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff', borderRadius: RADIUS.XL,
        padding: SPACING.LG, width: 300,
        shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2, shadowRadius: 16, elevation: 12,
    },
    title: {
        fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY, textAlign: 'center', marginBottom: SPACING.LG,
    },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.SM },
    spinnerCol: { alignItems: 'center', minWidth: 70 },
    arrow: { padding: SPACING.XS },
    spinnerVal: {
        fontSize: FONT_SIZE.XL, fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY, minWidth: 60, textAlign: 'center',
        marginVertical: SPACING.XS,
    },
    spinnerLabel: { fontSize: FONT_SIZE.XS, color: COLORS.TEXT_MUTED, marginTop: 2 },
    sep: { fontSize: FONT_SIZE.XL, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_MUTED, marginBottom: SPACING.LG },
    actions: {
        flexDirection: 'row', gap: SPACING.SM,
        marginTop: SPACING.LG, justifyContent: 'flex-end',
    },
    cancelBtn: {
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM,
        borderRadius: RADIUS.MD, borderWidth: 1, borderColor: COLORS.BORDER,
    },
    confirmBtn: {
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM,
        borderRadius: RADIUS.MD, backgroundColor: COLORS.PRIMARY,
    },
});
