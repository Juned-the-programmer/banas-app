import { COLORS, FONT_SIZE, FONT_WEIGHT } from '@/src/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabIconProps = { name: keyof typeof Ionicons.glyphMap; color: string };

function TabIcon({ name, color }: TabIconProps) {
    return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
    const insets = useSafeAreaInsets();

    // Calculate dynamic bottom padding. Fallback to 8 if no inset is present on Android.
    const bottomPadding = Platform.OS === 'ios' ? 24 : Math.max(8, insets.bottom + 4);
    const tabHeight = Platform.OS === 'ios' ? 84 : 60 + bottomPadding;

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: COLORS.PRIMARY,
                tabBarInactiveTintColor: '#9CA3AF',
                tabBarStyle: {
                    backgroundColor: COLORS.CARD,
                    borderTopColor: COLORS.BORDER,
                    borderTopWidth: 1,
                    height: tabHeight,
                    paddingBottom: bottomPadding,
                    paddingTop: 8,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 8,
                },
                tabBarLabelStyle: {
                    fontSize: FONT_SIZE.XS,
                    fontWeight: FONT_WEIGHT.SEMIBOLD,
                    marginTop: 2,
                },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'home' : 'home-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="customers"
                options={{
                    title: 'Customers',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'people' : 'people-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="daily-entry"
                options={{
                    title: 'Daily Entry',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} />
                    ),
                }}
            />
            <Tabs.Screen
                name="payments"
                options={{
                    title: 'Payments',
                    tabBarIcon: ({ color, focused }) => (
                        <TabIcon name={focused ? 'cash' : 'cash-outline'} color={color} />
                    ),
                }}
            />
        </Tabs>
    );
}
