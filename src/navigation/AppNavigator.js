// src/navigation/AppNavigator.js
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, View, TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { selectDiscoveryStatus } from '../store/actionsSlice'; 

// Screens
import HomeScreen from '../screens/home';
import SettingsScreen from '../screens/settings';
import NewShortcutScreen from '../screens/newShortcut';
import AddActionScreen from '../screens/addAction';
import LoadingCapabilitiesScreen from '../screens/loadingCapabilities'; 
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import HistoryScreen from '../screens/historyScreen';
import ShortcutDetailScreen from '../screens/shortcutDetail';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.bgPrimary,
          borderTopColor: theme.borderSubtle,
          borderTopWidth: 1,
          height: 70 + insets.bottom,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: theme.fontMedium,
          marginBottom: insets.bottom > 0 ? 0 : 5,
        },
        tabBarIconStyle: {
          marginTop: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons 
              name={focused ? "home" : "home-outline"} 
              size={25} 
              color={focused ? theme.primary : theme.textMuted} 
            />
          ),
        }}
      />

      <Tab.Screen
        name="NewShortcutScreen"
        component={NewShortcutScreen}
        options={{
          tabBarLabel: 'Add',
          tabBarIcon: ({ focused, color, size }) => (
            <View style={{
              width: 58,
              height: 58,
              borderRadius: 29,
              backgroundColor: theme.primary,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 40,
              shadowColor: theme.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}>
              <Ionicons 
                name="add" 
                size={28} 
                color="#fff" 
              />
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons 
              name={focused ? "cog" : "cog-outline"} 
              size={25} 
              color={focused ? theme.primary : theme.textMuted} 
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useTheme();
  const discoveryStatus = useSelector(selectDiscoveryStatus);
  const isLoading = !discoveryStatus || !discoveryStatus.lastScan;

  if (isLoading) {
    return <LoadingCapabilitiesScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bgPrimary } }}
    >
      <Stack.Screen name="Main" component={BottomTabs} />
      <Stack.Screen name="CreateShortcut" component={NewShortcutScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="AddAction" component={AddActionScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="History" component={HistoryScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="ShortcutDetail" component={ShortcutDetailScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
