import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  Vibration,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../context/ThemeContext';
import useToast from '../hooks/useToast';
import ShortcutCard from './ShortcutCard';
import SectionHeader from './SectionHeader';
import EmptyState from './EmptyState';
import ToastManager from './ToastManager';
import { 
  selectVisibleShortcuts,
  deleteShortcut, 
  toggleShortcutVisibility,
  recordShortcutRun
} from '../store/shortcutsSlice';
import ActionExecutor from '../utils/actionExecutor';
import { handleActionErrors } from '../utils/errorHandler';

export default function ShortcutsSection({ navigation }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const [actionExecutor] = useState(() => new ActionExecutor(dispatch));

  const [showAllShortcuts, setShowAllShortcuts] = useState(false);
  const [selectedShortcut, setSelectedShortcut] = useState(null);
  const [executingShortcut, setExecutingShortcut] = useState(null);
  
  const { toast, showToast, hideToast } = useToast();
  const allShortcuts = useSelector(selectVisibleShortcuts);
  
  // console.log("all shortcuts", allShortcuts)
  const sortedShortcuts = [...allShortcuts].sort((a, b) => {
    if (a.metadata.favorite && !b.metadata.favorite) return -1;
    if (!a.metadata.favorite && b.metadata.favorite) return 1;
    return b.metadata.createdAt - a.metadata.createdAt;
  });
  
  const maxInitialShortcuts = 3;
  const shortcutsToShow = showAllShortcuts 
    ? sortedShortcuts 
    : sortedShortcuts.slice(0, maxInitialShortcuts);
  const hasMoreShortcuts = sortedShortcuts.length > maxInitialShortcuts;

  const handleCreateNewShortcut = () => {
    navigation.navigate('CreateShortcut');
  };

  const handleRunShortcut = async (shortcutId) => {
    const shortcut = allShortcuts.find(s => s.id === shortcutId);
    if (!shortcut) {
      showToast('Shortcut not found', 'error');
      return;
    }

    if (selectedShortcut?.id === shortcut.id) return;

    setExecutingShortcut(shortcutId);
    Vibration.vibrate(50);
    
    try {
      const result = await actionExecutor.executeShortcut(shortcut);
      dispatch(recordShortcutRun(shortcutId));
      
      if (result.success) {
        showToast(`✓ ${shortcut.name} completed`, 'success');
      } else if (result.summary.failed > 0 && result.summary.successful > 0) {
        showToast(`⚠️ ${shortcut.name} partially completed`, 'warning');
        const errorInfo = handleActionErrors(result.results);
        if (errorInfo) {
          setTimeout(() => {
            showToast(errorInfo.message, errorInfo.severity);
          }, 500);
        }
      } else {
        showToast(`✗ ${shortcut.name} failed`, 'error');
        const errorInfo = handleActionErrors(result.results);
        if (errorInfo) {
          setTimeout(() => {
            showToast(errorInfo.message, errorInfo.severity);
          }, 500);
        }
      }
    } catch (error) {
      console.error('Shortcut execution error:', error);
      showToast(`Failed to execute shortcut`, 'error');
    } finally {
      setTimeout(() => setExecutingShortcut(null), 300);
    }
  };

  const handleShortcutLongPress = (shortcut) => {
    setSelectedShortcut(shortcut);
    Vibration.vibrate(50);
  };

  const handleDeleteButtonPress = (shortcut) => {
    if (shortcut.isDefault) {
      dispatch(toggleShortcutVisibility(shortcut.id));
      showToast(`Hidden "${shortcut.name}"`, 'info');
      setSelectedShortcut(null);
    } else {
      dispatch(deleteShortcut(shortcut.id));
      showToast(`Deleted "${shortcut.name}"`, 'info');
      setSelectedShortcut(null);
    }
  };

  const handlePressOutside = () => {
    setSelectedShortcut(null);
  };

  const getShortcutStatus = (shortcut) => {
    if (executingShortcut === shortcut.id) return 'executing';
    if (!shortcut.enabled) return 'disabled';
    return 'ready';
  };

  if (sortedShortcuts.length === 0) {
    return (
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <View style={styles.container}>
          <SectionHeader
            title="Your Shortcuts"
            subtitle="Create your first shortcut to get started"
          />

          <EmptyState
            icon="grid-outline"
            title="No Shortcuts Yet"
            subtitle="Create shortcuts to automate your tasks"
            primaryAction={{
              text: 'Create Shortcut',
              icon: 'add',
              onPress: handleCreateNewShortcut
            }}
            style={{ marginTop: 16 }}
          />

          <ToastManager toast={toast} onHide={hideToast} />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={styles.container}>
        <SectionHeader
          title="Your Shortcuts"
          subtitle={`${sortedShortcuts.length} shortcut${sortedShortcuts.length !== 1 ? 's' : ''}${sortedShortcuts.length > 0 ? ` • ${sortedShortcuts.filter(s => s.enabled).length} active` : ''}`}
          actionText={hasMoreShortcuts ? (showAllShortcuts ? 'Show Less' : 'Show All') : null}
          onActionPress={() => setShowAllShortcuts(!showAllShortcuts)}
          disabled={executingShortcut !== null}
        />

        <View style={styles.grid}>
          {shortcutsToShow.map(shortcut => {
            const status = getShortcutStatus(shortcut);
            return (
              <ShortcutCard
                key={shortcut.id}
                shortcut={shortcut}
                title={shortcut.name}
                subtitle={`${shortcut.actions.length} action${shortcut.actions.length !== 1 ? 's' : ''}`} 
                icon={shortcut.icon}
                color={shortcut.color}
                isFavorite={shortcut.metadata.favorite}
                isDefault={shortcut.isDefault}
                onRun={() => handleRunShortcut(shortcut.id)}
                onPress={() => navigation.navigate('ShortcutDetail', { shortcutId: shortcut.id })}
                onLongPress={() => handleShortcutLongPress(shortcut)}
                onDeletePress={() => handleDeleteButtonPress(shortcut)}
                isSelected={selectedShortcut?.id === shortcut.id}
                isExecuting={status === 'executing'}
                isDisabled={!shortcut.enabled}
                showRunButton={status === 'ready'}
                closeDelete={handlePressOutside}
              />
            );
          })}
          
          <ShortcutCard
            title="Create New"
            subtitle="Add a new shortcut"
            icon="add-circle-outline"
            color={theme.textMuted}
            isCreateCard={true}
            onPress={handleCreateNewShortcut}
          />
        </View>

        <ToastManager toast={toast} onHide={hideToast} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 32,
  },
  grid: { 
    marginTop: 16, 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
});