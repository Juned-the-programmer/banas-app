import { useAuthStore } from '@/src/stores';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import 'react-native-reanimated';

export default function RootLayout() {
    const colorScheme = useColorScheme();
    const { isAuthenticated, isInitialising, initialise } = useAuthStore();

    // Check SecureStore on first mount — restores session
    useEffect(() => {
        initialise();
    }, [initialise]);

    // Once initialised, redirect to login or tabs
    useEffect(() => {
        if (isInitialising) return;
        if (!isAuthenticated) {
            router.replace('/auth/login' as any);
        } else {
            router.replace('/(tabs)' as any);
        }
    }, [isAuthenticated, isInitialising]);

    return (
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="auth/login" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen
                    name="customers/add-customer"
                    options={{ presentation: 'modal', headerShown: false }}
                />
                <Stack.Screen
                    name="operations/add-daily-entry"
                    options={{ presentation: 'modal', headerShown: false }}
                />
            </Stack>
            <StatusBar style="dark" backgroundColor="#F0F4FF" />
        </ThemeProvider>
    );
}
