import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  Alert,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import ToastManager from '../components/ToastManager';
import useToast from '../hooks/useToast';
import { 
  selectShortcutById,
  deleteShortcut,
  recordShortcutRun,
} from '../store/shortcutsSlice';
import ActionExecutor from '../utils/actionExecutor';
import { handleActionErrors } from '../utils/errorHandler';

export default function ShortcutDetailScreen({ route, navigation }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const { shortcutId, autoRun } = route.params || {};
  
  const { toast, showToast, hideToast } = useToast();
  const [executing, setExecuting] = useState(false);
  const shortcut = useSelector(state => selectShortcutById(state, shortcutId));

  // Set header with back button
  useEffect(() => {
    navigation.setOptions({
      title: shortcut?.name || 'Shortcut',
      headerLeft: () => (
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
      ),
    });
  }, [navigation, shortcut, theme]);

  // Auto-run shortcut on mount if needed
  useEffect(() => {
    if (autoRun && shortcut) handleRunShortcut();
  }, [autoRun, shortcut]);

  const handleRunShortcut = async () => {
    if (!shortcut || executing) return;

    setExecuting(true);
    Vibration.vibrate(50);

    try {
      const actionExecutor = new ActionExecutor(dispatch);
      const result = await actionExecutor.executeShortcut(shortcut);
      dispatch(recordShortcutRun(shortcutId));

      if (result.success) {
        showToast(`✓ ${shortcut.name} completed`, 'success');
      } else if (result.summary?.failed > 0 && result.summary?.successful > 0) {
        showToast(`⚠️ ${shortcut.name} partially completed`, 'warning');
        const errorInfo = handleActionErrors(result.results);
        if (errorInfo) {
          setTimeout(() => showToast(errorInfo.message, errorInfo.severity), 500);
        }
      } else {
        showToast(`✗ ${shortcut.name} failed`, 'error');
        const errorInfo = handleActionErrors(result.results);
        if (errorInfo) {
          setTimeout(() => showToast(errorInfo.message, errorInfo.severity), 500);
        }
      }
    } catch (error) {
      showToast(`Failed to execute ${shortcut.name}`, 'error');
    } finally {
      setTimeout(() => setExecuting(false), 300);
    }
  };

  const handleDelete = () => {
    if (!shortcut) return;

    Alert.alert(
      'Delete Shortcut',
      `Are you sure you want to delete "${shortcut.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteShortcut(shortcutId));
            navigation.goBack();
            showToast(`Deleted "${shortcut.name}"`, 'info');
          }
        }
      ]
    );
  };

  const getActionIcon = (actionId) => {
    const iconMap = {
      'call_make': 'call',
      'email_send': 'mail',
      'sms_send': 'chatbubble',
      'notification_show': 'notifications',
      'vibrate_device': 'phone-portrait',
      'wait_delay': 'time',
      'open_url': 'link',
      'toggle_wifi': 'wifi',
      'toggle_bluetooth': 'bluetooth',
      'toggle_flashlight': 'flashlight',
      'adjust_volume': 'volume-high',
      'take_screenshot': 'camera',
      'clipboard_copy': 'clipboard',
      'clipboard_paste': 'clipboard-outline',
    };
    return iconMap[actionId] || 'cube';
  };

  const getActionType = (actionId) => {
    const typeMap = {
      'call_make': 'Phone Call',
      'email_send': 'Email',
      'sms_send': 'SMS',
      'notification_show': 'Notification',
      'vibrate_device': 'Vibration',
      'wait_delay': 'Delay',
      'open_url': 'Open URL',
      'toggle_wifi': 'Wi-Fi',
      'toggle_bluetooth': 'Bluetooth',
      'toggle_flashlight': 'Flashlight',
      'adjust_volume': 'Volume',
      'take_screenshot': 'Screenshot',
      'clipboard_copy': 'Copy to Clipboard',
      'clipboard_paste': 'Paste from Clipboard',
    };
    return typeMap[actionId] || 'Action';
  };

  if (!shortcut) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
        <Text style={[styles.errorText, { color: theme.textMuted }]}>
          Shortcut not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={[styles.headerCard, { backgroundColor: theme.bgCard }]}>
          <View style={styles.headerTop}>
            <View style={[styles.iconContainer, { backgroundColor: theme.bgCard }]}>
              <Ionicons name={shortcut.icon} size={32} color={shortcut.color} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={[styles.title, { color: theme.textPrimary }]}>
                {shortcut.name}
              </Text>
              <Text style={[styles.subtitle, { color: theme.textMuted }]}>
                {shortcut.actions.length} action{shortcut.actions.length !== 1 ? 's' : ''}
                {shortcut.metadata.runCount > 0 && ` • ${shortcut.metadata.runCount} run${shortcut.metadata.runCount !== 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.runButton, { backgroundColor: shortcut.color }]}
            onPress={handleRunShortcut}
            disabled={executing || !shortcut.enabled}
          >
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.runButtonText}>
              {executing ? 'Running...' : 'Run Shortcut'}
            </Text>
          </TouchableOpacity>

          {!shortcut.enabled && (
            <View style={[styles.disabledBadge, { backgroundColor: theme.bgTertiary }]}>
              <Ionicons name="alert-circle" size={14} color={theme.textMuted} />
              <Text style={[styles.disabledText, { color: theme.textMuted }]}>
                Disabled
              </Text>
            </View>
          )}
        </View>

        {/* Actions List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Actions ({shortcut.actions.length})
          </Text>
          {shortcut.actions.map((action, index) => (
            <View key={action.id} style={[styles.actionItem, { backgroundColor: theme.bgCard }]}>
              <View style={styles.actionHeader}>
                <View style={[styles.actionIcon, { backgroundColor: shortcut.color + '22' }]}>
                  <Ionicons name={getActionIcon(action.actionId)} size={16} color={shortcut.color} />
                </View>
                <View style={styles.actionTextContainer}>
                  <Text style={[styles.actionName, { color: theme.textPrimary }]}>
                    {action.title || getActionType(action.actionId)}
                  </Text>
                  <Text style={[styles.actionDescription, { color: theme.textMuted }]}>
                    {getActionType(action.actionId)}
                    {action.delayBefore > 0 && ` • ${action.delayBefore}ms delay`}
                  </Text>
                </View>
                <View style={styles.sequenceIndicator}>
                  <Text style={[styles.sequenceText, { color: theme.textMuted }]}>
                    {index + 1}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Shortcut Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Information
          </Text>
          <View style={[styles.infoCard, { backgroundColor: theme.bgCard }]}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                Created
              </Text>
              <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                {new Date(shortcut.metadata.createdAt).toLocaleDateString()}
              </Text>
            </View>
            {shortcut.metadata.lastRun && (
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                  Last Run
                </Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
                  {new Date(shortcut.metadata.lastRun).toLocaleDateString()}
                </Text>
              </View>
            )}
            <View style={[styles.infoRow, styles.infoRowLast]}>
              <Text style={[styles.infoLabel, { color: theme.textMuted }]}>
                Status
              </Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: shortcut.enabled ? theme.green : theme.red }]} />
                <Text style={[styles.statusText, { color: shortcut.enabled ? theme.green : theme.red }]}>
                  {shortcut.enabled ? 'Active' : 'Disabled'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
            Actions
          </Text>
          <View style={[styles.settingsCard, { backgroundColor: theme.bgCard }]}>

            <TouchableOpacity style={[styles.settingItem, styles.deleteItem]} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color={theme.red} />
              <Text style={[styles.settingText, { color: theme.red }]}>
                Delete Shortcut
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <ToastManager toast={toast} onHide={hideToast} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  backButton: {
    marginLeft: 16,
    padding: 8,
  },
  headerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 4,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
  },
  runButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  runButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  disabledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  disabledText: {
    fontSize: 12,
    marginLeft: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  actionItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  actionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionName: {
    fontSize: 16,
    marginBottom: 2,
    fontWeight: '600',
  },
  actionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sequenceIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sequenceText: {
    fontSize: 12,
  },
  settingsCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  deleteItem: {
    borderBottomWidth: 0,
  },
  settingText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 40,
  },
});