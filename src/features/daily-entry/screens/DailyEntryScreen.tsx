/**
 * Banas App - Daily Entry Screen
 * Two internal tabs: "Daily Entry" (verified) | "Pending Daily Entry"
 *
 * Pending tab: checkboxes for bulk verify + individual verify buttons.
 * Ref: RULES.md - Feature-first, ThemedView/ThemedText, Zustand store
 */
import { useDailyEntryStore } from '@/src/stores';
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
import { DailyEntrySkeleton } from '../components/DailyEntrySkeleton';
import { EntryCard } from '../components/EntryCard';
import { PendingEntryCard } from '../components/PendingEntryCard';

type Tab = 'entries' | 'pending';

export function DailyEntryScreen() {
    const [activeTab, setActiveTab] = useState<Tab>('entries');
    const [entryTypeModalVisible, setEntryTypeModalVisible] = useState(false);

    const {
        loading, verifying, error,
        selectedIds,
        verified, pending,
        loadEntries,
        toggleSelect, selectAll, clearSelection,
        verifySelected, verifySingle,
    } = useDailyEntryStore();

    useEffect(() => {
        loadEntries();
    }, [loadEntries]);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <DailyEntrySkeleton />
            </SafeAreaView>
        );
    }

    if (error) {
        return (
            <SafeAreaView style={styles.safe} edges={['top']}>
                <ThemedView style={styles.centerContainer}>
                    <Ionicons name="cloud-offline-outline" size={56} color={COLORS.TEXT_MUTED} />
                    <ThemedText variant="subheading" style={{ marginTop: SPACING.MD }}>Something went wrong</ThemedText>
                    <TouchableOpacity style={styles.retryBtn} onPress={loadEntries}>
                        <ThemedText variant="label" color={COLORS.TEXT_ON_PRIMARY}>Retry</ThemedText>
                    </TouchableOpacity>
                </ThemedView>
            </SafeAreaView>
        );
    }

    const verifiedList = verified();
    const pendingList = pending();
    const allSelected = pendingList.length > 0 && selectedIds.size === pendingList.length;

    return (
        <SafeAreaView style={styles.safe} edges={['top']}>
            {/* ── Header ──────────────────────────────────────────────── */}
            <ThemedView style={styles.header}>
                <ThemedView>
                    <ThemedText style={styles.title}>Daily Entry</ThemedText>
                    <ThemedText variant="caption">
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </ThemedText>
                </ThemedView>
                {/* Refresh button */}
                <TouchableOpacity style={styles.iconBtn} onPress={loadEntries}>
                    <Ionicons name="refresh-outline" size={20} color={COLORS.TEXT_PRIMARY} />
                </TouchableOpacity>
            </ThemedView>

            {/* ── Tab Switcher ─────────────────────────────────────────── */}
            <ThemedView style={styles.tabRow}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'entries' && styles.tabActive]}
                    onPress={() => { setActiveTab('entries'); clearSelection(); }}
                    activeOpacity={0.75}
                >
                    <ThemedText style={[
                        styles.tabText,
                        activeTab === 'entries' ? styles.tabTextActive : {},
                    ]}>
                        Daily Entry
                    </ThemedText>
                    <ThemedView style={[styles.tabBadge, { backgroundColor: activeTab === 'entries' ? COLORS.SUCCESS : COLORS.SKELETON }]}>
                        <ThemedText style={[styles.tabBadgeText, { color: activeTab === 'entries' ? '#fff' : COLORS.TEXT_MUTED }]}>
                            {verifiedList.length}
                        </ThemedText>
                    </ThemedView>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'pending' && styles.tabActivePending]}
                    onPress={() => { setActiveTab('pending'); clearSelection(); }}
                    activeOpacity={0.75}
                >
                    <ThemedText style={[
                        styles.tabText,
                        activeTab === 'pending' ? styles.tabTextActive : {},
                    ]}>
                        Pending
                    </ThemedText>
                    {pendingList.length > 0 && (
                        <ThemedView style={[styles.tabBadge, { backgroundColor: activeTab === 'pending' ? COLORS.WARNING : COLORS.SKELETON }]}>
                            <ThemedText style={[styles.tabBadgeText, { color: activeTab === 'pending' ? '#fff' : COLORS.TEXT_MUTED }]}>
                                {pendingList.length}
                            </ThemedText>
                        </ThemedView>
                    )}
                </TouchableOpacity>
            </ThemedView>

            {/* ── Bulk Action Bar (visible only on Pending tab with selections) ── */}
            {activeTab === 'pending' && pendingList.length > 0 && (
                <ThemedView style={styles.bulkBar}>
                    {/* Select All toggle */}
                    <TouchableOpacity onPress={allSelected ? clearSelection : selectAll} style={styles.selectAllBtn}>
                        <Ionicons
                            name={allSelected ? 'checkbox' : 'square-outline'}
                            size={20}
                            color={allSelected ? COLORS.PRIMARY : COLORS.TEXT_MUTED}
                        />
                        <ThemedText style={styles.selectAllText}>
                            {allSelected ? 'Deselect All' : 'Select All'}
                        </ThemedText>
                    </TouchableOpacity>

                    {/* Bulk verify */}
                    {selectedIds.size > 0 && (
                        <TouchableOpacity
                            style={[styles.bulkVerifyBtn, verifying && { opacity: 0.6 }]}
                            onPress={verifySelected}
                            disabled={verifying}
                        >
                            {verifying ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <Ionicons name="checkmark-done" size={16} color="#fff" />
                                    <ThemedText style={styles.bulkVerifyText}>
                                        Verify {selectedIds.size}
                                    </ThemedText>
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </ThemedView>
            )}

            {/* ── List ──────────────────────────────────────────────────── */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {activeTab === 'entries' ? (
                    verifiedList.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <Ionicons name="calendar-outline" size={52} color={COLORS.BORDER} />
                            <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ marginTop: SPACING.MD }}>
                                No entries for today
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        verifiedList.map((entry) => (
                            <EntryCard key={entry.id} entry={entry} style={styles.card} />
                        ))
                    )
                ) : (
                    pendingList.length === 0 ? (
                        <ThemedView style={styles.emptyState}>
                            <Ionicons name="checkmark-circle-outline" size={52} color={COLORS.SUCCESS} />
                            <ThemedText variant="body" color={COLORS.TEXT_MUTED} style={{ marginTop: SPACING.MD }}>
                                All entries verified! 🎉
                            </ThemedText>
                        </ThemedView>
                    ) : (
                        pendingList.map((entry) => (
                            <PendingEntryCard
                                key={entry.id}
                                entry={entry}
                                isSelected={selectedIds.has(entry.id)}
                                onToggleSelect={() => toggleSelect(entry.id)}
                                onVerify={() => verifySingle(entry.id)}
                                verifying={verifying}
                                style={styles.card}
                            />
                        ))
                    )
                )}
                <ThemedView style={{ height: 80 }} />
            </ScrollView>

            {/* ── FAB: Add Entry (only on Daily Entry tab) ──────────────── */}
            {activeTab === 'entries' && (
                <TouchableOpacity
                    style={styles.fab}
                    activeOpacity={0.85}
                    onPress={() => setEntryTypeModalVisible(true)}
                >
                    <Ionicons name="add" size={30} color="#fff" />
                </TouchableOpacity>
            )}

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
                                router.push('/operations/add-daily-entry');
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
                                router.push('/operations/bulk-daily-entry');
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

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.BACKGROUND },
    centerContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.LG },

    // Header
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
        backgroundColor: COLORS.CARD, alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.SHADOW, shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 1, shadowRadius: 4, elevation: 2,
    },

    // Tab switcher
    tabRow: {
        flexDirection: 'row',
        gap: SPACING.SM,
        paddingHorizontal: SPACING.MD,
        marginBottom: SPACING.SM,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.XS,
        paddingVertical: SPACING.SM + 2,
        borderRadius: RADIUS.LG,
        backgroundColor: COLORS.CARD,
        borderWidth: 1.5,
        borderColor: COLORS.BORDER,
    },
    tabActive: {
        backgroundColor: COLORS.SUCCESS,
        borderColor: COLORS.SUCCESS,
    },
    tabActivePending: {
        backgroundColor: COLORS.WARNING,
        borderColor: COLORS.WARNING,
    },
    tabText: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: COLORS.TEXT_SECONDARY,
    },
    tabTextActive: { color: '#fff' },
    tabBadge: {
        borderRadius: RADIUS.FULL,
        minWidth: 20, height: 20,
        alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 5,
    },
    tabBadgeText: {
        fontSize: FONT_SIZE.XS,
        fontWeight: FONT_WEIGHT.BOLD,
    },

    // Bulk action bar
    bulkBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM,
        backgroundColor: COLORS.CARD,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.BORDER,
        marginBottom: SPACING.SM,
    },
    selectAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.XS,
    },
    selectAllText: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.MEDIUM,
        color: COLORS.TEXT_SECONDARY,
    },
    bulkVerifyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.XS,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.FULL,
        paddingHorizontal: SPACING.MD,
        paddingVertical: SPACING.SM,
    },
    bulkVerifyText: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.BOLD,
        color: '#fff',
    },

    // List
    list: { flex: 1 },
    listContent: { paddingHorizontal: SPACING.MD, paddingTop: SPACING.XS },
    card: { marginBottom: SPACING.SM },
    emptyState: { alignItems: 'center', marginTop: SPACING.XXL },

    // FAB
    fab: {
        position: 'absolute',
        bottom: SPACING.LG + 4,
        right: SPACING.LG,
        width: 58, height: 58,
        borderRadius: 29,
        backgroundColor: COLORS.PRIMARY,
        alignItems: 'center', justifyContent: 'center',
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 10,
    },

    // Retry
    retryBtn: {
        marginTop: SPACING.LG,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.LG,
        paddingHorizontal: SPACING.LG,
        paddingVertical: SPACING.SM + 4,
    },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: SPACING.LG },
    modalContent: { width: '100%', backgroundColor: COLORS.CARD, borderRadius: RADIUS.LG, padding: SPACING.LG, alignItems: 'center' },
    modalTitle: { fontSize: FONT_SIZE.LG, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY, marginBottom: 4 },
    modalOption: { width: '100%', flexDirection: 'row', alignItems: 'center', padding: SPACING.MD, borderWidth: 1, borderColor: COLORS.BORDER, borderRadius: RADIUS.MD, marginBottom: SPACING.SM },
    modalOptionIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
    modalOptionTitle: { fontSize: FONT_SIZE.MD, fontWeight: FONT_WEIGHT.BOLD, color: COLORS.TEXT_PRIMARY },
    modalCancelBtn: { marginTop: SPACING.SM, padding: SPACING.MD },
});
