import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector } from 'react-redux';
import RecentlyRunItem from '../components/RecentItem';
import TipsCard from '../components/TipsCard';
import EmptyState from '../components/EmptyState';
import ToastManager from '../components/ToastManager';
import useToast from '../hooks/useToast';
import { 
  selectVisibleShortcuts, 
  selectRecentlyUsedShortcuts,
} from '../store/shortcutsSlice';
import { 
  selectUserQuickActions,
} from '../store/quickActionsSlice';
import ShortcutsSection from '../components/ShortcutsSection';
import QuickActionsSection from '../components/QuickActionsSection';
import { formatTimeAgo } from '../utils/errorHandler';

export default function HomeScreen({ navigation }) {
  const { theme } = useTheme();
  const { toast, showToast, hideToast } = useToast();
  const allShortcuts = useSelector(selectVisibleShortcuts);
  const recentlyUsedShortcuts = useSelector(selectRecentlyUsedShortcuts);
  const userQuickActions = useSelector(selectUserQuickActions);

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
          Tapstack
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate('History')}>
          <Ionicons name="time-outline" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ShortcutsSection navigation={navigation} />
        <QuickActionsSection navigation={navigation} />

        {recentlyUsedShortcuts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
                Recently Run
              </Text>
            </View>

            {recentlyUsedShortcuts.slice(0, 3).map(shortcut => (
              <RecentlyRunItem
                key={shortcut.id}
                title={shortcut.name}
                time={formatTimeAgo(shortcut.metadata.lastRun)}
                icon={shortcut.icon}
                color={shortcut.color}
                onPress={() => navigation.navigate('ShortcutDetail', { shortcutId: shortcut.id })}
                onRun={() => navigation.navigate('ShortcutDetail', { shortcutId: shortcut.id, autoRun: true })}
              />
            ))}
          </>
        )}
        
        {(allShortcuts.length > 0 || userQuickActions.length > 0) && (
          <TipsCard 
            tip={userQuickActions.length > 0 
              ? 'Tap quick actions for instant app access' 
              : 'Tap and hold any shortcut for more options'}
          />
        )}
        
        {allShortcuts.length === 0 && userQuickActions.length === 0 && (
          <EmptyState
            icon="grid-outline"
            title="Get Started"
            subtitle="Create shortcuts or add quick actions to get started"
            primaryAction={{
              text: 'Create Shortcut',
              icon: 'add',
              onPress: () => navigation.navigate('CreateShortcut')
            }}
            secondaryAction={{
              text: 'Add Quick Action',
              icon: 'flash',
              onPress: () => showToast('Tap "Add" in Quick Actions section', 'info')
            }}
          />
        )}
      </ScrollView>

      <ToastManager toast={toast} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    paddingTop: 50, 
    paddingHorizontal: 20, 
    paddingBottom: 12, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between' 
  },
  headerTitle: { fontSize: 18 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
});