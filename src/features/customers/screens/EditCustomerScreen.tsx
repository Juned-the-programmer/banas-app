/**
 * Banas App - Edit Customer Screen
 * Ref: RULES.md - Feature-first, ThemedView/ThemedText, Zustand store consumption
 *
 * Data flow: useCustomerProfileStore (init) -> useEditCustomerStore -> updateCustomer -> API
 */
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCustomerProfileStore, useCustomersStore } from '@/src/stores';
import { useEditCustomerStore } from '@/src/stores/customers/editCustomerStore';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { FormField } from '../components/FormField';

export function EditCustomerScreen() {
    const { customerId } = useLocalSearchParams<{ customerId: string }>();

    const { data: profile } = useCustomerProfileStore();
    const { loadCustomers, routes } = useCustomersStore();

    const {
        firstName, lastName, routeId, rate, phone, email, sequenceNo, isActive,
        errors, loading, submitError,
        setField, submit, reset, initForm
    } = useEditCustomerStore();

    const [routePickerVisible, setRoutePickerVisible] = React.useState(false);

    const lastNameRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const rateRef = useRef<TextInput>(null);
    const emailRef = useRef<TextInput>(null);
    const seqRef = useRef<TextInput>(null);

    // Initialize the form with existing data when mounted
    useEffect(() => {
        if (profile && routes.length > 0) {
            const matchedRouteId = routes.find(r => r.route_name === profile.route)?.id;
            initForm(profile, matchedRouteId);
        }
        return () => reset(); // Cleanup on unmount
    }, [profile, routes, initForm, reset]);

    const selectedRouteName =
        routes.find((r) => r.id === routeId)?.route_name ?? '';

    async function handleSubmit() {
        const success = await submit();
        if (success) {
            reset();
            await loadCustomers(); // refresh the customer directory globally
            if (customerId) {
                await useCustomerProfileStore.getState().loadProfile(customerId); // refresh active details
            }
            router.back();
        }
    }

    if (!profile) {
        return (
            <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
                <ThemedView style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                    </TouchableOpacity>
                    <ThemedText style={styles.title}>Edit Customer</ThemedText>
                    <ThemedView style={{ width: 40 }} />
                </ThemedView>
                <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={COLORS.PRIMARY} />
                </ThemedView>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            {/* ── Header ─────────────────────────────────────────────────── */}
            <ThemedView style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
                <ThemedText style={styles.title}>Edit Customer</ThemedText>
                <ThemedView style={{ width: 40 }} />
            </ThemedView>

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.container}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                {/* ── Submit Error Banner ──────────────────────────────────── */}
                {submitError && (
                    <ThemedView style={styles.errorBanner}>
                        <Ionicons name="alert-circle" size={18} color={COLORS.DANGER} />
                        <ThemedText style={styles.errorBannerText}>{submitError}</ThemedText>
                    </ThemedView>
                )}

                {/* ── Section: Personal Info ───────────────────────────────── */}
                <ThemedView style={styles.section}>
                    <ThemedView style={styles.sectionHeader}>
                        <Ionicons name="person-outline" size={16} color={COLORS.PRIMARY} />
                        <ThemedText style={styles.sectionTitle}>Personal Info</ThemedText>
                    </ThemedView>

                    <FormField
                        label="First Name"
                        required
                        placeholder="e.g. Juned"
                        value={firstName}
                        onChangeText={(v) => setField('firstName', v)}
                        error={errors.firstName}
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => lastNameRef.current?.focus()}
                    />
                    <FormField
                        ref={lastNameRef}
                        label="Last Name"
                        required
                        placeholder="e.g. Davada"
                        value={lastName}
                        onChangeText={(v) => setField('lastName', v)}
                        error={errors.lastName}
                        autoCapitalize="words"
                        returnKeyType="next"
                        onSubmitEditing={() => phoneRef.current?.focus()}
                    />
                </ThemedView>

                {/* ── Section: Contact ─────────────────────────────────────── */}
                <ThemedView style={styles.section}>
                    <ThemedView style={styles.sectionHeader}>
                        <Ionicons name="call-outline" size={16} color={COLORS.PRIMARY} />
                        <ThemedText style={styles.sectionTitle}>Contact</ThemedText>
                    </ThemedView>

                    <FormField
                        ref={phoneRef}
                        label="Phone Number"
                        required
                        placeholder="e.g. 7698530801"
                        value={phone}
                        onChangeText={(v) => setField('phone', v)}
                        error={errors.phone}
                        keyboardType="phone-pad"
                        maxLength={10}
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        hint="10-digit mobile number"
                    />
                    <FormField
                        ref={emailRef}
                        label="Email"
                        placeholder="e.g. juned@example.com"
                        value={email}
                        onChangeText={(v) => setField('email', v)}
                        error={errors.email}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        returnKeyType="next"
                        onSubmitEditing={() => rateRef.current?.focus()}
                    />
                </ThemedView>

                {/* ── Section: Delivery Info ───────────────────────────────── */}
                <ThemedView style={styles.section}>
                    <ThemedView style={styles.sectionHeader}>
                        <Ionicons name="bicycle-outline" size={16} color={COLORS.PRIMARY} />
                        <ThemedText style={styles.sectionTitle}>Delivery Info</ThemedText>
                    </ThemedView>

                    {/* Route Picker */}
                    <ThemedView style={styles.fieldContainer}>
                        <ThemedView style={styles.labelRow}>
                            <ThemedText style={styles.fieldLabel}>Route</ThemedText>
                            <ThemedText style={styles.requiredStar}> *</ThemedText>
                        </ThemedView>
                        <TouchableOpacity
                            style={[styles.picker, errors.routeId ? styles.pickerError : null]}
                            onPress={() => setRoutePickerVisible(true)}
                            activeOpacity={0.75}
                        >
                            <Ionicons name="map-outline" size={18} color={selectedRouteName ? COLORS.TEXT_PRIMARY : COLORS.TEXT_MUTED} />
                            <ThemedText
                                style={[
                                    styles.pickerText,
                                    !selectedRouteName ? { color: COLORS.TEXT_MUTED } : {},
                                ]}
                            >
                                {selectedRouteName || 'Select a route...'}
                            </ThemedText>
                            <Ionicons name="chevron-down" size={18} color={COLORS.TEXT_MUTED} />
                        </TouchableOpacity>
                        {errors.routeId && (
                            <ThemedText style={styles.fieldError}>{errors.routeId}</ThemedText>
                        )}
                    </ThemedView>

                    <FormField
                        ref={rateRef}
                        label="Rate (₹ per cooler)"
                        required
                        placeholder="e.g. 25"
                        value={rate}
                        onChangeText={(v) => setField('rate', v)}
                        error={errors.rate}
                        keyboardType="numeric"
                        returnKeyType="next"
                        onSubmitEditing={() => seqRef.current?.focus()}
                        hint="Price per cooler/bottle delivered"
                    />
                    <FormField
                        ref={seqRef}
                        label="Sequence No"
                        placeholder="e.g. 1"
                        value={sequenceNo}
                        onChangeText={(v) => setField('sequenceNo', v)}
                        keyboardType="numeric"
                        returnKeyType="done"
                        onSubmitEditing={handleSubmit}
                        hint="Delivery order position on this route"
                    />
                </ThemedView>

                {/* ── Section: Account Status ──────────────────────────────── */}
                <ThemedView style={styles.section}>
                    <ThemedView style={styles.sectionHeader}>
                        <Ionicons name="settings-outline" size={16} color={COLORS.PRIMARY} />
                        <ThemedText style={styles.sectionTitle}>Account Status</ThemedText>
                    </ThemedView>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: SPACING.SM }}>
                        <View>
                            <ThemedText style={styles.fieldLabel}>Active Customer</ThemedText>
                            <ThemedText variant="caption" color={COLORS.TEXT_MUTED} style={{ marginTop: 2 }}>
                                {isActive ? 'Customer will appear in daily operations.' : 'Customer is hidden from daily operations.'}
                            </ThemedText>
                        </View>
                        <Switch
                            value={isActive}
                            onValueChange={(val: boolean) => setField('isActive', val)}
                            trackColor={{ false: COLORS.BORDER, true: COLORS.SUCCESS }}
                            thumbColor="#fff"
                        />
                    </View>
                </ThemedView>

                <ThemedView style={{ height: SPACING.XL }} />
            </ScrollView>

            {/* ── Submit Button ────────────────────────────────────────── */}
            <ThemedView style={styles.footer}>
                <TouchableOpacity
                    style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                    onPress={handleSubmit}
                    disabled={loading}
                    activeOpacity={0.85}
                >
                    {loading ? (
                        <ActivityIndicator color={COLORS.TEXT_ON_PRIMARY} />
                    ) : (
                        <>
                            <Ionicons name="save-outline" size={20} color={COLORS.TEXT_ON_PRIMARY} />
                            <ThemedText style={styles.submitBtnText}>Save Changes</ThemedText>
                        </>
                    )}
                </TouchableOpacity>
            </ThemedView>

            {/* ── Route Picker Modal ────────────────────────────────────── */}
            <Modal
                visible={routePickerVisible}
                animationType="slide"
                transparent
                onRequestClose={() => setRoutePickerVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setRoutePickerVisible(false)}
                />
                <ThemedView style={styles.modalSheet}>
                    <ThemedView style={styles.modalHandle} />
                    <ThemedText style={styles.modalTitle}>Select Route</ThemedText>
                    <FlatList
                        data={routes}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => {
                            const isSelected = item.id === routeId;
                            return (
                                <TouchableOpacity
                                    style={[styles.routeOption, isSelected && styles.routeOptionSelected]}
                                    onPress={() => {
                                        setField('routeId', item.id);
                                        setRoutePickerVisible(false);
                                    }}
                                >
                                    <Ionicons
                                        name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                                        size={20}
                                        color={isSelected ? COLORS.PRIMARY : COLORS.BORDER}
                                    />
                                    <ThemedText
                                        style={[
                                            styles.routeOptionText,
                                            isSelected ? { color: COLORS.PRIMARY, fontWeight: FONT_WEIGHT.SEMIBOLD } : {},
                                        ]}
                                    >
                                        {item.route_name}
                                    </ThemedText>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </ThemedView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM + 4,
        backgroundColor: COLORS.CARD,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
    },
    backBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 20,
    },
    title: {
        fontSize: FONT_SIZE.LG,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY,
    },

    // Scroll / Sections
    scroll: { flex: 1 },
    container: { padding: SPACING.MD, paddingBottom: SPACING.XXL },
    section: {
        backgroundColor: COLORS.CARD,
        borderRadius: RADIUS.LG,
        padding: SPACING.MD,
        marginBottom: SPACING.MD,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.XS,
        marginBottom: SPACING.MD,
        paddingBottom: SPACING.SM,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
    },
    sectionTitle: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.PRIMARY,
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },

    // Error banner
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.SM,
        backgroundColor: '#FFF5F5',
        borderRadius: RADIUS.MD,
        borderWidth: 1,
        borderColor: '#FCA5A5',
        padding: SPACING.MD,
        marginBottom: SPACING.MD,
    },
    errorBannerText: {
        flex: 1,
        fontSize: FONT_SIZE.SM,
        color: COLORS.DANGER,
    },

    // Route picker field
    fieldContainer: { marginBottom: SPACING.MD },
    labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.XS },
    fieldLabel: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.SEMIBOLD, color: COLORS.TEXT_PRIMARY },
    requiredStar: { fontSize: FONT_SIZE.SM, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.DANGER },
    picker: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.SM,
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: RADIUS.MD,
        borderWidth: 1.5,
        borderColor: COLORS.BORDER,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM + 4,
    },
    pickerError: { borderColor: COLORS.DANGER, backgroundColor: '#FFF5F5' },
    pickerText: { flex: 1, fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },
    fieldError: { marginTop: SPACING.XS, fontSize: FONT_SIZE.XS, color: COLORS.DANGER, fontWeight: FONT_WEIGHT.MEDIUM },

    // Footer / Submit
    footer: {
        padding: SPACING.MD,
        backgroundColor: COLORS.CARD,
        borderTopWidth: 1,
        borderTopColor: COLORS.BORDER,
    },
    submitBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.SM,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.LG,
        paddingVertical: SPACING.MD,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    submitBtnDisabled: { opacity: 0.65 },
    submitBtnText: {
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_ON_PRIMARY,
    },

    // Route picker modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
    modalSheet: {
        backgroundColor: COLORS.CARD,
        borderTopLeftRadius: RADIUS.XL,
        borderTopRightRadius: RADIUS.XL,
        paddingHorizontal: SPACING.MD,
        paddingBottom: SPACING.XXL,
        maxHeight: '60%',
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: COLORS.BORDER,
        alignSelf: 'center',
        marginVertical: SPACING.MD,
    },
    modalTitle: {
        fontSize: FONT_SIZE.LG,
        fontWeight: FONT_WEIGHT.BOLD,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: SPACING.MD,
    },
    routeOption: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.MD,
        paddingVertical: SPACING.MD,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
    },
    routeOptionSelected: { backgroundColor: COLORS.PRIMARY_LIGHT, borderRadius: RADIUS.MD, paddingHorizontal: SPACING.SM },
    routeOptionText: { fontSize: FONT_SIZE.MD, color: COLORS.TEXT_PRIMARY },
});
