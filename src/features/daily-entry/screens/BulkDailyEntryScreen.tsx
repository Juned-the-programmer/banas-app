import { Route, fetchRoutes } from '@/src/api/customersService';
import { MissingEntryCustomer } from '@/src/api/dailyEntryService';
import { useDailyEntryStore } from '@/src/stores';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function BulkDailyEntryScreen() {
    // ─── Global State ────────────────────────────────────────────────────────
    const {
        missingCustomers,
        loadingMissing,
        loading, // Reused for submission loader
        error,
        loadMissingEntries,
        submitBulkEntries,
    } = useDailyEntryStore();

    // ─── Local State ─────────────────────────────────────────────────────────
    const [routeId, setRouteId] = useState<string | null>(null);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [routePickerVisible, setRoutePickerVisible] = useState(false);

    // Tracks cooler count per customerId (defaults handle as 0 when undefined)
    const [coolerCounts, setCoolerCounts] = useState<Record<string, number>>({});

    // ─── Initialization ──────────────────────────────────────────────────────
    useEffect(() => {
        // Load initial missing entries for "All Routes"
        loadMissingEntries();

        // Fetch available routes for the filter
        fetchRoutes().then(setRoutes).catch(err => {
            Alert.alert('Error', 'Failed to load routes filter.');
        });
    }, [loadMissingEntries]);

    // Re-fetch missing entries whenever the route filter changes
    useEffect(() => {
        loadMissingEntries(routeId || undefined);
    }, [routeId, loadMissingEntries]);

    // ─── Computed Values ─────────────────────────────────────────────────────
    const selectedRoute = useMemo(() => routes.find(r => r.id === routeId), [routes, routeId]);

    // Derived payload considering only customers with > 0 coolers
    const pendingPayload = useMemo(() => {
        return Object.entries(coolerCounts)
            .filter(([_, count]) => count > 0)
            .map(([customerId, count]) => ({ customer: customerId, cooler: count }));
    }, [coolerCounts]);

    // ─── Handlers ────────────────────────────────────────────────────────────
    const handleIncrement = (customerId: string) => {
        setCoolerCounts(prev => ({
            ...prev,
            [customerId]: (prev[customerId] || 0) + 1
        }));
    };

    const handleDecrement = (customerId: string) => {
        setCoolerCounts(prev => {
            const current = prev[customerId] || 0;
            if (current <= 0) return prev; // Cannot go below 0
            return {
                ...prev,
                [customerId]: current - 1
            };
        });
    };

    const handleSubmit = async () => {
        if (pendingPayload.length === 0) {
            Alert.alert('No Entries', 'Please increase the cooler count for at least one customer before submitting.');
            return;
        }

        try {
            await submitBulkEntries(pendingPayload);
            Alert.alert('Success', 'Bulk daily entries submitted successfully.', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        } catch (err: any) {
            Alert.alert('Error', err?.message || 'Failed to submit bulk entries.');
        }
    };

    // ─── Renderers ───────────────────────────────────────────────────────────
    const renderCustomerRow = ({ item }: { item: MissingEntryCustomer }) => {
        const count = coolerCounts[item.id] || 0;
        const isActive = count > 0;

        return (
            <ThemedView style={[styles.customerCard, isActive && styles.customerCardActive]}>
                <View style={styles.customerInfo}>
                    <ThemedText style={styles.customerName}>
                        {item.first_name} {item.last_name}
                    </ThemedText>
                </View>

                <View style={styles.stepperContainer}>
                    <TouchableOpacity
                        style={[styles.stepperBtn, count <= 0 && styles.stepperBtnDisabled]}
                        onPress={() => handleDecrement(item.id)}
                        disabled={count <= 0}
                    >
                        <Ionicons name="remove" size={20} color={count <= 0 ? COLORS.TEXT_MUTED : COLORS.TEXT_PRIMARY} />
                    </TouchableOpacity>

                    <ThemedText style={styles.stepperValue}>
                        {count}
                    </ThemedText>

                    <TouchableOpacity
                        style={[styles.stepperBtn, styles.stepperBtnAdd]}
                        onPress={() => handleIncrement(item.id)}
                    >
                        <Ionicons name="add" size={20} color={COLORS.TEXT_ON_PRIMARY} />
                    </TouchableOpacity>
                </View>
            </ThemedView>
        );
    };

    return (
        <SafeAreaView style={styles.safe}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                    <Ionicons name="close" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Bulk Daily Entry</ThemedText>
                <View style={{ width: 40 }} />
            </ThemedView>

            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <View style={styles.content}>

                    {/* ── Route Filter ────────────────────────────────────────── */}
                    <View style={styles.filterSection}>
                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginBottom: 4 }}>
                            Filter by Route
                        </ThemedText>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setRoutePickerVisible(true)}
                        >
                            <Ionicons name="map-outline" size={18} color={routeId ? COLORS.PRIMARY : COLORS.TEXT_MUTED} />
                            <ThemedText style={[styles.pickerText, !routeId ? { color: COLORS.TEXT_MUTED } : {}]}>
                                {routeId && selectedRoute ? selectedRoute.route_name : 'All Routes'}
                            </ThemedText>
                            {routeId ? (
                                <TouchableOpacity onPress={(e) => { e.stopPropagation(); setRouteId(null); }}>
                                    <Ionicons name="close-circle" size={18} color={COLORS.TEXT_MUTED} />
                                </TouchableOpacity>
                            ) : (
                                <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_MUTED} />
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* ── Error State ─────────────────────────────────────────── */}
                    {error && !loadingMissing && (
                        <View style={styles.errorContainer}>
                            <Ionicons name="alert-circle" size={20} color={COLORS.DANGER} />
                            <ThemedText style={styles.errorText}>{error}</ThemedText>
                            <TouchableOpacity onPress={() => loadMissingEntries(routeId || undefined)}>
                                <ThemedText style={{ color: COLORS.PRIMARY, fontWeight: FONT_WEIGHT.BOLD, marginTop: 4 }}>Retry</ThemedText>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* ── List Area ───────────────────────────────────────────── */}
                    <View style={styles.listContainer}>
                        {loadingMissing ? (
                            <View style={styles.centerContainer}>
                                <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                                <ThemedText variant="caption" style={{ marginTop: SPACING.MD }}>
                                    Loading missing entries...
                                </ThemedText>
                            </View>
                        ) : (
                            <FlatList
                                data={missingCustomers}
                                keyExtractor={(item) => item.id}
                                renderItem={renderCustomerRow}
                                contentContainerStyle={{ paddingBottom: SPACING.XXL * 2 }}
                                showsVerticalScrollIndicator={false}
                                ListEmptyComponent={
                                    <View style={styles.centerContainer}>
                                        <Ionicons name="checkmark-circle-outline" size={48} color={COLORS.SUCCESS} />
                                        <ThemedText variant="subheading" style={{ marginTop: SPACING.MD }}>
                                            All Caught Up!
                                        </ThemedText>
                                        <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ textAlign: 'center', marginTop: 4 }}>
                                            There are no missing daily entries for {routeId ? 'this route' : 'today'}.
                                        </ThemedText>
                                    </View>
                                }
                            />
                        )}
                    </View>
                </View>

                {/* ── Sticky Footer ─────────────────────────────────────────── */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.submitBtn, (pendingPayload.length === 0 || loading) && styles.submitBtnDisabled]}
                        onPress={handleSubmit}
                        disabled={pendingPayload.length === 0 || loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <ThemedText style={styles.submitBtnText}>
                                    Submit Entries ({pendingPayload.length})
                                </ThemedText>
                                <Ionicons name="arrow-forward" size={20} color="#fff" />
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>

            {/* ── Route Picker Modal ──────────────────────────────────────── */}
            <Modal visible={routePickerVisible} animationType="slide">
                <SafeAreaView style={styles.safe}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => setRoutePickerVisible(false)} style={styles.headerBtn}>
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
                                    style={[styles.routeOption, isSelected && styles.routeOptionSelected]}
                                    onPress={() => {
                                        setRouteId(item.id);
                                        setRoutePickerVisible(false);
                                    }}
                                >
                                    <View>
                                        <ThemedText style={[styles.routeOptionText, isSelected ? styles.routeOptionTextSelected : {}]}>
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
        </SafeAreaView>
    );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.MD, paddingVertical: SPACING.SM,
        borderBottomWidth: 1, borderBottomColor: COLORS.BORDER, backgroundColor: COLORS.CARD
    },
    headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    title: { fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },

    content: { flex: 1, padding: SPACING.MD },

    filterSection: { marginBottom: SPACING.MD },
    picker: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: COLORS.CARD, borderWidth: 1, borderColor: COLORS.BORDER,
        borderRadius: RADIUS.MD, paddingHorizontal: SPACING.SM, paddingVertical: 12,
    },
    pickerText: { flex: 1, marginLeft: 8, fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },

    errorContainer: {
        flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.DANGER_LIGHT,
        padding: SPACING.MD, borderRadius: RADIUS.MD, marginBottom: SPACING.MD,
    },
    errorText: { flex: 1, color: COLORS.DANGER, marginLeft: 8, fontSize: FONT_SIZE.SM },

    listContainer: { flex: 1 },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },

    customerCard: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: COLORS.CARD, borderRadius: RADIUS.MD,
        padding: SPACING.MD, marginBottom: SPACING.SM,
        borderWidth: 1, borderColor: COLORS.BORDER,
    },
    customerCardActive: {
        backgroundColor: COLORS.PRIMARY_LIGHT, borderColor: COLORS.PRIMARY,
    },
    customerInfo: { flex: 1, marginRight: SPACING.MD },
    customerName: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },

    stepperContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.BACKGROUND, borderRadius: RADIUS.SM, padding: 2 },
    stepperBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center', borderRadius: RADIUS.SM, backgroundColor: COLORS.CARD, borderWidth: 1, borderColor: COLORS.BORDER },
    stepperBtnDisabled: { backgroundColor: COLORS.SKELETON },
    stepperBtnAdd: { backgroundColor: COLORS.PRIMARY, borderColor: COLORS.PRIMARY },
    stepperValue: { width: 32, textAlign: 'center', fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },

    footer: {
        padding: SPACING.MD, paddingBottom: Platform.OS === 'ios' ? 0 : SPACING.MD,
        backgroundColor: COLORS.CARD, borderTopWidth: 1, borderTopColor: COLORS.BORDER,
    },
    submitBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        backgroundColor: COLORS.PRIMARY, borderRadius: RADIUS.LG,
        paddingVertical: 16, gap: SPACING.SM,
    },
    submitBtnDisabled: { backgroundColor: COLORS.SKELETON },
    submitBtnText: { color: COLORS.TEXT_ON_PRIMARY, fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD },

    routeOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        padding: SPACING.MD, borderBottomWidth: 1, borderBottomColor: COLORS.BORDER,
    },
    routeOptionSelected: { backgroundColor: COLORS.PRIMARY_LIGHT },
    routeOptionText: { fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },
    routeOptionTextSelected: { fontWeight: FONT_WEIGHT.BOLD, color: COLORS.PRIMARY },
});
