/**
 * Banas App - Login Screen
 * Ref: RULES.md §1 (feature-first), §2 (LinearGradient, ThemedView), §3 (Zustand)
 */
import { useAuthStore } from '@/src/stores';
import { COLORS, FONT_SIZE, FONT_WEIGHT, RADIUS, SPACING } from '@/src/theme';
import { ThemedText } from '@/src/theme/themed-text';
import { ThemedView } from '@/src/theme/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function LoginScreen() {
    const { login, loading, error, clearError, isAuthenticated } = useAuthStore();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const passwordRef = useRef<TextInput>(null);

    // Redirect once authenticated (handles back-nav guard too)
    useEffect(() => {
        if (isAuthenticated) router.replace('/(tabs)');
    }, [isAuthenticated]);

    async function handleLogin() {
        if (!username.trim() || !password.trim()) return;
        Keyboard.dismiss();
        await login({ username: username.trim(), password: password.trim() });
    }

    return (
        <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <KeyboardAvoidingView
                    style={styles.flex}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    {/* ── Background gradient ── */}
                    <LinearGradient
                        colors={[COLORS.PRIMARY, '#1A3CCC', '#0D1F7A']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradient}
                    />

                    {/* ── Top hero ── */}
                    <ThemedView style={styles.hero}>
                        <ThemedView style={styles.logoRing}>
                            <Ionicons name="water" size={36} color={COLORS.PRIMARY} />
                        </ThemedView>
                        <ThemedText style={styles.appName}>Banas</ThemedText>
                        <ThemedText style={styles.tagline}>Water Delivery Management</ThemedText>
                    </ThemedView>

                    {/* ── Card ── */}
                    <ThemedView surface="card" style={styles.card}>
                        <ThemedText style={styles.cardTitle}>Welcome back 👋</ThemedText>
                        <ThemedText variant="caption" style={styles.cardSubtitle}>
                            Sign in to continue managing your routes
                        </ThemedText>

                        {/* Error banner */}
                        {error && (
                            <TouchableOpacity style={styles.errorBanner} onPress={clearError}>
                                <Ionicons name="alert-circle" size={16} color={COLORS.DANGER} />
                                <ThemedText style={styles.errorText}>{error}</ThemedText>
                                <Ionicons name="close" size={14} color={COLORS.DANGER} />
                            </TouchableOpacity>
                        )}

                        {/* Username */}
                        <ThemedView style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Username</ThemedText>
                            <ThemedView style={styles.inputRow}>
                                <Ionicons name="person-outline" size={18} color={COLORS.TEXT_MUTED} style={styles.inputIcon} />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    placeholderTextColor={COLORS.TEXT_MUTED}
                                    value={username}
                                    onChangeText={(v) => { setUsername(v); clearError(); }}
                                    autoCapitalize="none"
                                    autoCorrect={false}
                                    returnKeyType="next"
                                    onSubmitEditing={() => passwordRef.current?.focus()}
                                />
                            </ThemedView>
                        </ThemedView>

                        {/* Password */}
                        <ThemedView style={styles.fieldGroup}>
                            <ThemedText style={styles.label}>Password</ThemedText>
                            <ThemedView style={styles.inputRow}>
                                <Ionicons name="lock-closed-outline" size={18} color={COLORS.TEXT_MUTED} style={styles.inputIcon} />
                                <TextInput
                                    ref={passwordRef}
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    placeholderTextColor={COLORS.TEXT_MUTED}
                                    value={password}
                                    onChangeText={(v) => { setPassword(v); clearError(); }}
                                    secureTextEntry={!showPassword}
                                    returnKeyType="done"
                                    onSubmitEditing={handleLogin}
                                />
                                <TouchableOpacity onPress={() => setShowPassword((s) => !s)} style={styles.eyeBtn}>
                                    <Ionicons
                                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                                        size={18}
                                        color={COLORS.TEXT_MUTED}
                                    />
                                </TouchableOpacity>
                            </ThemedView>
                        </ThemedView>

                        {/* Login button */}
                        <TouchableOpacity
                            style={[styles.loginBtn, (!username.trim() || !password.trim() || loading) && styles.loginBtnDisabled]}
                            onPress={handleLogin}
                            disabled={!username.trim() || !password.trim() || loading}
                            activeOpacity={0.85}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <ThemedText style={styles.loginBtnText}>Sign In</ThemedText>
                                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                                </>
                            )}
                        </TouchableOpacity>
                    </ThemedView>

                    <ThemedText style={styles.footer}>
                        Banas Water Supply © {new Date().getFullYear()}
                    </ThemedText>
                </KeyboardAvoidingView>
            </TouchableWithoutFeedback>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: COLORS.PRIMARY },
    flex: { flex: 1 },

    // Gradient background
    gradient: {
        ...StyleSheet.absoluteFillObject,
    },

    // Hero
    hero: {
        alignItems: 'center',
        paddingTop: SPACING.XXL + 8,
        paddingBottom: SPACING.LG,
        backgroundColor: 'transparent',
    },
    logoRing: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: SPACING.MD,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
    appName: {
        fontSize: 32,
        fontWeight: FONT_WEIGHT.EXTRABOLD,
        color: '#fff',
        letterSpacing: 1.5,
    },
    tagline: {
        fontSize: FONT_SIZE.SM,
        color: 'rgba(255,255,255,0.75)',
        marginTop: 4,
        fontWeight: FONT_WEIGHT.MEDIUM,
    },

    // Card
    card: {
        marginHorizontal: SPACING.MD,
        borderRadius: RADIUS.XL,
        padding: SPACING.LG,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 16,
    },
    cardTitle: {
        fontSize: FONT_SIZE.XL,
        fontWeight: FONT_WEIGHT.EXTRABOLD,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: 4,
    },
    cardSubtitle: {
        color: COLORS.TEXT_MUTED,
        marginBottom: SPACING.LG,
    },

    // Error
    errorBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.XS,
        backgroundColor: '#FFF5F5',
        borderRadius: RADIUS.MD,
        borderWidth: 1,
        borderColor: '#FCA5A5',
        padding: SPACING.SM + 2,
        marginBottom: SPACING.MD,
    },
    errorText: {
        flex: 1,
        fontSize: FONT_SIZE.SM,
        color: COLORS.DANGER,
    },

    // Fields
    fieldGroup: { marginBottom: SPACING.MD },
    label: {
        fontSize: FONT_SIZE.SM,
        fontWeight: FONT_WEIGHT.SEMIBOLD,
        color: COLORS.TEXT_PRIMARY,
        marginBottom: SPACING.XS,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.BACKGROUND,
        borderRadius: RADIUS.MD,
        borderWidth: 1.5,
        borderColor: COLORS.BORDER,
        paddingHorizontal: SPACING.MD,
    },
    inputIcon: { marginRight: SPACING.SM },
    input: {
        flex: 1,
        fontSize: FONT_SIZE.MD,
        color: COLORS.TEXT_PRIMARY,
        paddingVertical: SPACING.SM + 6,
    },
    eyeBtn: { padding: SPACING.XS },

    // Button
    loginBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.SM,
        marginTop: SPACING.SM,
        backgroundColor: COLORS.PRIMARY,
        borderRadius: RADIUS.LG,
        paddingVertical: SPACING.MD + 2,
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 8,
    },
    loginBtnDisabled: { opacity: 0.55 },
    loginBtnText: {
        fontSize: FONT_SIZE.MD,
        fontWeight: FONT_WEIGHT.BOLD,
        color: '#fff',
    },

    // Footer
    footer: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.5)',
        fontSize: FONT_SIZE.XS,
        marginTop: SPACING.LG,
        marginBottom: SPACING.MD,
    },
});
