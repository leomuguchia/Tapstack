import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Vibration,
  TouchableWithoutFeedback
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectUserQuickActions, 
  selectAvailableAppActions,
  deleteQuickAction,
  recordQuickActionRun
} from '../store/quickActionsSlice';
import QuickActionItem from './QuickActionItem';
import AddQuickActionModal from './AddQuickActionModal';
import QuickActionExecutor from '../utils/quickActionExecutor';
import ToastManager from './ToastManager';
import useToast from '../hooks/useToast';
import SectionHeader from './SectionHeader';

export default function QuickActionsSection({ navigation }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  
  const userQuickActions = useSelector(selectUserQuickActions);
  const availableAppActions = useSelector(selectAvailableAppActions);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [executingAction, setExecutingAction] = useState(null);
  const [showAllActions, setShowAllActions] = useState(false);
  
  const { toast, showToast, hideToast } = useToast();
  
  const sortedActions = [...userQuickActions].sort((a, b) => {
    if (a.metadata.favorite && !b.metadata.favorite) return -1;
    if (!a.metadata.favorite && b.metadata.favorite) return 1;
    return b.metadata.createdAt - a.metadata.createdAt;
  });
  
  const maxInitialActions = 4;
  const actionsToShow = showAllActions 
    ? sortedActions 
    : sortedActions.slice(0, maxInitialActions);
  const hasMoreActions = sortedActions.length > maxInitialActions;
  
  const handleAddQuickAction = () => {
    if (availableAppActions.length === 0) {
      showToast('No actions available', 'error');
      return;
    }
    setShowAddModal(true);
  };
  
  const handleRunQuickAction = async (quickAction) => {
    if (selectedAction?.id === quickAction.id) return;
    
    setExecutingAction(quickAction.id);
    Vibration.vibrate(50);
    
    try {
      const result = await QuickActionExecutor.execute(quickAction);
      dispatch(recordQuickActionRun(quickAction.id));
      
      if (result.fallback) {
        showToast(`${quickAction.name} opened in browser`, 'info');
      } else {
        showToast(`✓ ${quickAction.name} executed`, 'success');
      }
      
    } catch (error) {
      if (error.message.includes('Missing required parameters')) {
        showToast(`Configure "${quickAction.name}" first`, 'warning');
        navigation.navigate('EditQuickAction', { actionId: quickAction.id });
      } else {
        showToast(error.message || `Failed to run "${quickAction.name}"`, 'error');
      }
    } finally {
      setTimeout(() => setExecutingAction(null), 300);
    }
  };
  
  const handleLongPress = (action) => {
    setSelectedAction(action);
    Vibration.vibrate(50);
  };
  
  const handleDeleteButtonPress = (action) => {
    dispatch(deleteQuickAction(action.id));
    showToast(`Deleted "${action.name}"`, 'info');
    setSelectedAction(null);
  };
  
  const handlePressOutside = () => {
    setSelectedAction(null);
  };
  
  if (sortedActions.length === 0) {
    return (
      <TouchableWithoutFeedback onPress={handlePressOutside}>
        <View style={styles.container}>
          <SectionHeader
            title="Quick Actions"
            subtitle="Add quick actions for your favorite apps"
          />
          
          <TouchableOpacity
            style={[styles.emptyState, { backgroundColor: theme.bgCard, borderColor: theme.borderPrimary }]}
            onPress={handleAddQuickAction}
          >
            <View style={[styles.emptyIcon, { backgroundColor: theme.primary + '20' }]}>
              <Ionicons name="add" size={24} color={theme.primary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
              Add Your First Quick Action
            </Text>
            <Text style={[styles.emptyDescription, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
              Tap to add quick actions for apps like Maps, WhatsApp, Instagram, etc.
            </Text>
          </TouchableOpacity>
          
          <AddQuickActionModal
            visible={showAddModal}
            onClose={() => setShowAddModal(false)}
          />
          
          <ToastManager toast={toast} onHide={hideToast} />
        </View>
      </TouchableWithoutFeedback>
    );
  }
  
  const rows = Math.ceil((actionsToShow.length + 1) / 2);
  
  return (
    <TouchableWithoutFeedback onPress={handlePressOutside}>
      <View style={styles.container}>
        <SectionHeader
          title="Quick Actions"
          subtitle={`${sortedActions.length} action${sortedActions.length !== 1 ? 's' : ''}`}
          actionText={hasMoreActions ? (showAllActions ? 'Show Less' : 'Show All') : null}
          onActionPress={() => setShowAllActions(!showAllActions)}
          disabled={executingAction !== null}
        />
        
        <View style={styles.gridContainer}>
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {actionsToShow[rowIndex * 2] && (
                <QuickActionItem
                  action={actionsToShow[rowIndex * 2]}
                  onPress={() => handleRunQuickAction(actionsToShow[rowIndex * 2])}
                  onLongPress={() => handleLongPress(actionsToShow[rowIndex * 2])}
                  onDeletePress={() => handleDeleteButtonPress(actionsToShow[rowIndex * 2])}
                  isSelected={selectedAction?.id === actionsToShow[rowIndex * 2].id}
                  closeDelete={handlePressOutside}
                />
              )}
              
              {actionsToShow[rowIndex * 2 + 1] ? (
                <QuickActionItem
                  action={actionsToShow[rowIndex * 2 + 1]}
                  onPress={() => handleRunQuickAction(actionsToShow[rowIndex * 2 + 1])}
                  onLongPress={() => handleLongPress(actionsToShow[rowIndex * 2 + 1])}
                  onDeletePress={() => handleDeleteButtonPress(actionsToShow[rowIndex * 2 + 1])}
                  isSelected={selectedAction?.id === actionsToShow[rowIndex * 2 + 1].id}
                  closeDelete={handlePressOutside}
                />
              ) : (
                <TouchableOpacity
                  style={[styles.addItem, { backgroundColor: theme.bgCard, borderColor: theme.borderPrimary }]}
                  onPress={handleAddQuickAction}
                >
                  <Ionicons name="add-circle" size={28} color={theme.primary} />
                  <Text style={[styles.addItemText, { color: theme.primary, fontFamily: theme.fontMedium }]}>
                    Add Action
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
          
          {actionsToShow.length % 2 === 0 && showAllActions && (
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.addItem, { backgroundColor: theme.bgCard, borderColor: theme.borderPrimary }]}
                onPress={handleAddQuickAction}
              >
                <Ionicons name="add-circle" size={28} color={theme.primary} />
                <Text style={[styles.addItemText, { color: theme.primary, fontFamily: theme.fontMedium }]}>
                  Add Action
                </Text>
              </TouchableOpacity>
            </View>
          )}
          
          {!showAllActions && actionsToShow.length === maxInitialActions && (
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.addItem, { backgroundColor: theme.bgCard, borderColor: theme.borderPrimary }]}
                onPress={handleAddQuickAction}
              >
                <Ionicons name="add-circle" size={28} color={theme.primary} />
                <Text style={[styles.addItemText, { color: theme.primary, fontFamily: theme.fontMedium }]}>
                  Add Action
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        <AddQuickActionModal
          visible={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
        
        <ToastManager toast={toast} onHide={hideToast} />
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    marginBottom: 32,
  },
  emptyState: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 16,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  gridContainer: {
    marginHorizontal: -4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  addItem: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addItemText: {
    fontSize: 13,
    marginTop: 8,
  },
});