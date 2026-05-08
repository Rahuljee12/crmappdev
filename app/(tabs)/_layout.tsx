import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { HapticTab } from '@/components/haptic-tab';
import { Fonts } from '@/theme/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneContainerStyle: {
          backgroundColor: '#F4F7FB',
        },
        tabBarActiveTintColor: '#1B348B',
        tabBarInactiveTintColor: '#667085',
        tabBarStyle: {
          position: 'absolute',
          left: 10,
          right: 10,
          bottom: 10,
          height: 88,
          paddingTop: 10,
          paddingBottom: 14,
          borderRadius: 26,
          borderTopWidth: 0,
          backgroundColor: '#FFFFFF',
          shadowColor: '#0F172A',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -6 },
          elevation: 14,
          overflow: 'hidden',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
          fontFamily: Fonts.sans,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: 'Customers',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Leads',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'radio-button-on' : 'ellipse-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="accounts"
        options={{
          title: 'Accounts',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="sr"
        options={{
          title: 'SR',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'headset' : 'headset-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ color }) => <Ionicons name="ellipsis-horizontal" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
