import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DraggableFlatList from 'react-native-draggable-flatlist';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import ColorPicker from '../components/ColorPicker';
import ActionItem from '../components/ActionItem';
import { 
  createShortcut,
  addActionToShortcut,
  reorderActionsInShortcut 
} from '../store/shortcutsSlice';
import { generateId } from '../utils/idGen';
import { selectAllActions } from '../store/actionsSlice';

export default function NewShortcutScreen({ navigation }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  const availableActions = useSelector(selectAllActions);

  const [name, setName] = useState('');
  const [color, setColor] = useState(theme.blue);
  const [icon, setIcon] = useState('flash'); // Default icon
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('productivity');
  
  // Actions in this shortcut (these are action instances with parameters)
  const [actions, setActions] = useState([]);

  const handleSaveShortcut = () => {
    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter a name for your shortcut');
      return;
    }

    if (actions.length === 0) {
      Alert.alert('No Actions', 'Add at least one action to your shortcut');
      return;
    }

    const newShortcut = {
      name: name.trim(),
      description: description.trim(),
      icon: icon,
      color: color,
      category: category,
      tags: [],
      trigger: {
        type: 'manual',
        parameters: {}
      },
      actions: actions.map((action, index) => ({
        id: generateId('actinst'),
        actionId: action.actionId,
        title: action.title,
        parameters: action.parameters || {},
        delayBefore: index === 0 ? 0 : 500, // Default 500ms delay between actions
        conditions: []
      }))
    };

    dispatch(createShortcut(newShortcut));
    
    // Show success message
    Alert.alert(
      'Shortcut Created',
      `${name} has been created successfully!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  const handleAddAction = () => {
    // Navigate to AddActionScreen to select an action
    navigation.navigate('AddAction', {
      onSelectAction: (selectedAction) => {
        // When an action is selected from the picker, we get its configuration
        const newActionInstance = {
          id: generateId('tempact'),
          actionId: selectedAction.id,
          title: selectedAction.name,
          icon: selectedAction.icon,
          color: selectedAction.color,
          parameters: selectedAction.parameters || {},
          category: selectedAction.category
        };
        
        setActions(prev => [...prev, newActionInstance]);
      }
    });
  };

  const handleRemoveAction = (actionId) => {
    setActions(prev => prev.filter(action => action.id !== actionId));
  };

  const handleEditAction = (actionId) => {
    // Find the action
    const actionToEdit = actions.find(action => action.id === actionId);
    if (!actionToEdit) return;
    
    // Find the action definition from availableActions
    const actionDefinition = availableActions.find(
      action => action.id === actionToEdit.actionId
    );
    
    if (!actionDefinition) {
      Alert.alert('Action Not Found', 'The action definition could not be found');
      return;
    }
    
    // Navigate to action configuration screen
    navigation.navigate('ActionConfig', {
      actionId: actionToEdit.actionId,
      actionDefinition: actionDefinition,
      currentParameters: actionToEdit.parameters,
      onSave: (updatedParameters) => {
        setActions(prev => 
          prev.map(action => 
            action.id === actionId 
              ? { ...action, parameters: updatedParameters }
              : action
          )
        );
      }
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="close" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { 
          color: theme.textPrimary,
          fontFamily: theme.fontBold 
        }]}>
          New Shortcut
        </Text>

        <TouchableOpacity onPress={handleSaveShortcut}>
          <Text style={[styles.saveText, { 
            color: theme.primary,
            fontFamily: theme.fontMedium 
          }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Shortcut Name */}
        <Text style={[styles.label, { 
          color: theme.textMuted,
          fontFamily: theme.fontMedium 
        }]}>
          SHORTCUT NAME
        </Text>

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderPrimary,
            },
          ]}
        >
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, { 
              color: theme.textPrimary,
              fontFamily: theme.fontRegular 
            }]}
            placeholder="Enter shortcut name"
            placeholderTextColor={theme.textMuted}
            autoFocus={true}
          />
        </View>

        {/* Description */}
        <Text style={[styles.label, { 
          color: theme.textMuted,
          fontFamily: theme.fontMedium,
          marginTop: 16 
        }]}>
          DESCRIPTION (OPTIONAL)
        </Text>

        <View
          style={[
            styles.inputWrapper,
            {
              backgroundColor: theme.bgCard,
              borderColor: theme.borderPrimary,
              height: 80,
            },
          ]}
        >
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { 
              color: theme.textPrimary,
              fontFamily: theme.fontRegular,
              height: 60,
              textAlignVertical: 'top'
            }]}
            placeholder="What does this shortcut do?"
            placeholderTextColor={theme.textMuted}
            multiline={true}
          />
        </View>

        {/* Icon Color */}
        <Text style={[styles.sectionTitle, { 
          color: theme.textPrimary,
          fontFamily: theme.fontBold,
          marginTop: 8 
        }]}>
          Icon Color
        </Text>

        <ColorPicker value={color} onChange={setColor} />

        {/* Icon Selection (simplified) */}
        <Text style={[styles.label, { 
          color: theme.textMuted,
          fontFamily: theme.fontMedium,
          marginTop: 16 
        }]}>
          ICON
        </Text>
        <View style={styles.iconSelector}>
          {['flash', 'sunny', 'moon', 'home', 'briefcase', 'wifi'].map(iconName => (
            <TouchableOpacity
              key={iconName}
              onPress={() => setIcon(iconName)}
              style={[
                styles.iconOption,
                { 
                  backgroundColor: icon === iconName ? color + '30' : theme.bgCard,
                  borderColor: icon === iconName ? color : theme.borderPrimary
                }
              ]}
            >
              <Ionicons 
                name={iconName} 
                size={20} 
                color={icon === iconName ? color : theme.textSecondary} 
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Actions Stack */}
        <View style={styles.actionsHeader}>
          <Text style={[styles.sectionTitle, { 
            color: theme.textPrimary,
            fontFamily: theme.fontBold 
          }]}>
            Actions Stack
          </Text>
          <Text style={[styles.actionsCount, { 
            color: theme.textMuted,
            fontFamily: theme.fontMedium 
          }]}>
            {actions.length} ACTION{actions.length !== 1 ? 'S' : ''}
          </Text>
        </View>

        {actions.length === 0 ? (
          <View style={styles.emptyActions}>
            <Ionicons name="layers-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyActionsText, { 
              color: theme.textMuted,
              fontFamily: theme.fontRegular 
            }]}>
              No actions added yet
            </Text>
            <Text style={[styles.emptyActionsSubtext, { 
              color: theme.textMuted + 'CC',
              fontFamily: theme.fontRegular 
            }]}>
              Tap "Add Action" below to build your shortcut
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={actions}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            onDragEnd={({ data }) => setActions(data)}
            renderItem={({ item, drag, isActive }) => (
              <ActionItem
                title={item.title}
                subtitle={`Action type: ${item.category}`}
                icon={item.icon}
                color={item.color}
                onLongPress={drag}
                isActive={isActive}
                onEdit={() => handleEditAction(item.id)}
                onRemove={() => handleRemoveAction(item.id)}
              />
            )}
          />
        )}

        {/* Add Action */}
        <TouchableOpacity
          style={[
            styles.addAction,
            { borderColor: theme.borderPrimary },
          ]}
          onPress={handleAddAction}
        >
          <Ionicons name="add-circle" size={22} color={theme.primary} />
          <Text style={[styles.addActionText, { 
            color: theme.primary,
            fontFamily: theme.fontMedium 
          }]}>
            Add Action
          </Text>
        </TouchableOpacity>

        {/* Trigger Settings (basic) */}
        <Text style={[styles.sectionTitle, { 
          color: theme.textPrimary,
          fontFamily: theme.fontBold,
          marginTop: 32 
        }]}>
          Trigger Settings
        </Text>
        <View style={[styles.triggerCard, { backgroundColor: theme.bgCard }]}>
          <Ionicons name="play-circle" size={24} color={theme.primary} />
          <View style={styles.triggerContent}>
            <Text style={[styles.triggerTitle, { 
              color: theme.textPrimary,
              fontFamily: theme.fontMedium 
            }]}>
              Manual Trigger
            </Text>
            <Text style={[styles.triggerSubtitle, { 
              color: theme.textMuted,
              fontFamily: theme.fontRegular 
            }]}>
              Run this shortcut by tapping it
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
  },
  saveText: {
    fontSize: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 8,
  },
  inputWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 24,
  },
  iconSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionsCount: {
    fontSize: 12,
    letterSpacing: 1,
  },
  emptyActions: {
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  emptyActionsText: {
    fontSize: 16,
    marginTop: 12,
  },
  emptyActionsSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  addAction: {
    marginTop: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  addActionText: {
    fontSize: 16,
  },
  triggerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginTop: 12,
    gap: 12,
  },
  triggerContent: {
    flex: 1,
  },
  triggerTitle: {
    fontSize: 16,
  },
  triggerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});