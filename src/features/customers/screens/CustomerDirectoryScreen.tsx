/**
 * Banas App - Customer Directory Screen
 * Ref: RULES.md - Feature-first architecture, ThemedView/ThemedText, Zustand store
 *
 * Data flow: useCustomersStore → customersService → API
 */
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useCustomersStore } from '@/src/stores';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { CustomerCard } from '../components/CustomerCard';
import { CustomerDirectorySkeleton } from '../components/CustomerDirectorySkeleton';

type FilterTab = 'all' | 'active' | 'inactive';

const FILTER_TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All Customers' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
];

export function CustomerDirectoryScreen() {
    const {
        loading,
        error,
        searchQuery,
        activeFilter,
        routes,
        selectedRouteId,
        filteredCustomers,
        loadCustomers,
        loadRoutes,
        setSearchQuery,
        setFilter,
        setSelectedRoute,
    } = useCustomersStore();

    const [isRouteMenuVisible, setRouteMenuVisible] = useState(false);

    useEffect(() => {
        loadCustomers();
        loadRoutes();
    }, [loadCustomers, loadRoutes]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <CustomerDirectorySkeleton />
            </SafeAreaView>
        );
    }

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
                    <TouchableOpacity style={styles.retryBtn} onPress={loadCustomers}>
                        <ThemedText variant="label" color={COLORS.TEXT_ON_PRIMARY}>Retry</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </SafeAreaView>
        );
    }

    const customers = filteredCustomers();
    const currentRouteName = selectedRouteId
        ? routes.find(r => r.id === selectedRouteId)?.route_name || 'All Routes'
        : 'All Routes';

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            <ThemedView style={styles.inner}>
                {/* ── Header ─────────────────────────────────────────────────── */}
                <ThemedView style={styles.header}>
                    <ThemedText variant="heading" style={styles.title}>Customer Directory</ThemedText>
                    <TouchableOpacity style={styles.routeHeaderBtn} onPress={() => setRouteMenuVisible(true)}>
                        <ThemedText variant="label" color={COLORS.PRIMARY}>
                            {currentRouteName}
                        </ThemedText>
                        <Ionicons name="chevron-down" size={16} color={COLORS.PRIMARY} style={{ marginLeft: 4 }} />
                    </TouchableOpacity>
                </ThemedView>

                {/* ── Search Bar ──────────────────────────────────────────────── */}
                <ThemedView style={styles.searchBar}>
                    <Ionicons name="search-outline" size={18} color={COLORS.TEXT_MUTED} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search by name or route..."
                        placeholderTextColor={COLORS.TEXT_MUTED}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.TEXT_MUTED} />
                        </TouchableOpacity>
                    )}
                </ThemedView>


                {/* ── Filter Tabs ─────────────────────────────────────────────── */}
                <ThemedView style={styles.filterTabsRow}>
                    {FILTER_TABS.map((tab) => {
                        const isActive = activeFilter === tab.key;
                        return (
                            <TouchableOpacity
                                key={tab.key}
                                onPress={() => setFilter(tab.key)}
                                style={[
                                    styles.filterTab,
                                    isActive ? styles.filterTabActive : styles.filterTabInactive,
                                ]}
                                activeOpacity={0.75}
                            >
                                <ThemedText
                                    style={[
                                        styles.filterTabText,
                                        { color: isActive ? COLORS.TEXT_ON_PRIMARY : COLORS.TEXT_SECONDARY },
                                    ]}
                                >
                                    {tab.label}
                                </ThemedText>
                            </TouchableOpacity>
                        );
                    })}
                </ThemedView>

                {/* ── Customer List ────────────────────────────────────────────── */}
                <ScrollView
                    style={styles.list}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {customers.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <Ionicons name="people-outline" size={52} color={COLORS.BORDER} />
                            <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ marginTop: SPACING.MD }}>
                                No customers found
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        customers.map((customer) => (
                            <CustomerCard
                                key={customer.id}
                                customer={customer}
                                onPress={() =>
                                    router.push(`/customers/${customer.id}` as any)
                                }
                                style={styles.card}
                            />
                        ))
                    )}
                    <ThemedView style={{ height: SPACING.XXL }} />
                </ScrollView>
            </ThemedView>

            {/* ── FAB: Add Customer ───────────────────────────────────────── */}
            <TouchableOpacity
                style={styles.fab}
                activeOpacity={0.85}
                onPress={() => router.push('/customers/add-customer' as any)}
            >
                <Ionicons name="add" size={30} color={COLORS.TEXT_ON_PRIMARY} />
            </TouchableOpacity>

            {/* ── Route Menu Modal ───────────────────────────────────────── */}
            <Modal
                visible={isRouteMenuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setRouteMenuVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setRouteMenuVisible(false)}
                >
                    <ThemedView style={styles.modalContent}>
                        <ThemedText variant="subheading" style={styles.modalTitle}>Select Route</ThemedText>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <TouchableOpacity
                                style={styles.modalItem}
                                onPress={() => { setSelectedRoute(null); setRouteMenuVisible(false); }}
                            >
                                <ThemedText
                                    style={{
                                        color: selectedRouteId === null ? COLORS.PRIMARY : COLORS.TEXT_PRIMARY,
                                        fontWeight: selectedRouteId === null ? FONT_WEIGHT.BOLD : FONT_WEIGHT.REGULAR
                                    }}
                                >
                                    All Routes
                                </ThemedText>
                                {selectedRouteId === null && <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />}
                            </TouchableOpacity>

                            {routes.map((route) => {
                                const isActive = selectedRouteId === route.id;
                                return (
                                    <TouchableOpacity
                                        key={route.id}
                                        style={styles.modalItem}
                                        onPress={() => { setSelectedRoute(route.id); setRouteMenuVisible(false); }}
                                    >
                                        <ThemedText
                                            style={{
                                                color: isActive ? COLORS.PRIMARY : COLORS.TEXT_PRIMARY,
                                                fontWeight: isActive ? FONT_WEIGHT.BOLD : FONT_WEIGHT.REGULAR
                                            }}
                                        >
                                            {route.route_name}
                                        </ThemedText>
                                        {isActive && <Ionicons name="checkmark" size={20} color={COLORS.PRIMARY} />}
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </ThemedView>
                </TouchableOpacity>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    inner: { flex: 1, paddingHorizontal: SPACING.MD },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.LG,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: SPACING.SM,
        marginBottom: SPACING.MD,
    },
    title: {
        fontSize: FONT_SIZE.XL + 2,
        fontWeight: FONT_WEIGHT.EXTRABOLD,
        color: COLORS.TEXT_PRIMARY,
    },
    routeHeaderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.PRIMARY_LIGHT,
        paddingHorizontal: SPACING.MD,
        paddingVertical: 6,
        borderRadius: RADIUS.FULL,
    },

    // Search
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.CARD,
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM + 2,
        gap: SPACING.SM,
        shadowColor: COLORS.SHADOW,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1,
        shadowRadius: 4,
        elevation: 2,
        marginBottom: SPACING.MD,
    },
    searchInput: {
        flex: 1,
        fontSize: FONT_SIZE.MD,
        color: COLORS.TEXT_PRIMARY,
        paddingVertical: 0,
    },

    // Filter tabs
    filterTabsRow: {
        flexDirection: 'row',
        gap: SPACING.SM,
        marginBottom: SPACING.MD,
    },
    filterTab: {
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM,
    },
    filterTabActive: {
        backgroundColor: COLORS.SUCCESS,
    },
    filterTabInactive: {
        backgroundColor: COLORS.CARD,
        borderWidth: 1,
        borderColor: COLORS.BORDER,
    },
    filterTabText: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
    },

    // List
    list: { flex: 1 },
    listContent: { gap: SPACING.SM + 2, paddingBottom: 80 },
    card: {},

    // Empty state
    emptyState: {
        alignItems: 'center',
        marginTop: SPACING.XXL,
    },

    // FAB
    fab: {
        position: 'absolute',
        bottom: SPACING.LG + 4,
        right: SPACING.LG,
        width: 58,
        height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.SUCCESS,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: COLORS.SUCCESS,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 10,
    },

    // Retry
    retryBtn: {
        marginTop: SPACING.LG,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.LG,
        paddingHorizontal: SPACING.LG,
        paddingVertical: SPACING.SM + 4,
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        paddingHorizontal: SPACING.XL,
    },
    modalContent: {
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: RADIUS.LG,
        padding: SPACING.LG,
        maxHeight: '80%',
    },
    modalTitle: {
        marginBottom: SPACING.MD,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
        paddingBottom: SPACING.SM,
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.BOLD,
    },
    modalItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: SPACING.MD,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
    },
});
