// components/AddQuickActionModal.js
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectAvailableAppActions,
  selectAvailableActionsByCategory,
  addQuickAction
} from '../store/quickActionsSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AddQuickActionModal({ visible, onClose }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  
  const availableAppActions = useSelector(selectAvailableAppActions);
  const actionsByCategory = useSelector(selectAvailableActionsByCategory);
  
  const [selectedAction, setSelectedAction] = useState(null);
  const [parameters, setParameters] = useState({});
  const [customName, setCustomName] = useState('');
  const [step, setStep] = useState('browse'); // 'browse', 'configure', 'complete'
  
  const categories = Object.keys(actionsByCategory).sort();
  
  const handleSelectAction = (action) => {
    setSelectedAction(action);
    setCustomName(action.title);
    
    // Initialize parameters with empty values
    const initialParams = {};
    action.config.parameters.forEach(param => {
      initialParams[param.name] = '';
    });
    setParameters(initialParams);
    
    setStep('configure');
  };
  
  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  const handleSaveAction = () => {
    if (!selectedAction) return;
    
    // Validate required parameters
    const missingParams = selectedAction.config.parameters
      .filter(param => param.required && !parameters[param.name])
      .map(param => param.label);
    
    if (missingParams.length > 0) {
      Alert.alert(
        'Missing Information',
        `Please fill in: ${missingParams.join(', ')}`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Save the quick action
    dispatch(addQuickAction({
      actionId: selectedAction.id,
      name: customName || selectedAction.title,
      icon: selectedAction.icon,
      color: selectedAction.color,
      parameters: parameters
    }));
    
    setStep('complete');
  };
  
  const handleAddAnother = () => {
    setSelectedAction(null);
    setParameters({});
    setCustomName('');
    setStep('browse');
  };
  
  const handleClose = () => {
    setSelectedAction(null);
    setParameters({});
    setCustomName('');
    setStep('browse');
    onClose();
  };
  
  const renderBrowseStep = () => (
    <>
      <Text style={[styles.modalTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
        Add Quick Action
      </Text>
      
      <Text style={[styles.modalSubtitle, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
        Choose an app action to add to your home screen
      </Text>
      
      <ScrollView style={styles.categoriesScroll} showsVerticalScrollIndicator={false}>
        {categories.map(category => (
          <View key={category} style={styles.categorySection}>
            <Text style={[styles.categoryTitle, { 
              color: theme.textMuted, 
              fontFamily: theme.fontMedium,
              backgroundColor: theme.bgPrimary 
            }]}>
              {category.toUpperCase()}
            </Text>
            
            {/* Horizontal scrolling row for actions in this category */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryRow}
              contentContainerStyle={styles.categoryRowContent}
            >
              {actionsByCategory[category].map(action => (
                <TouchableOpacity
                  key={action.id}
                  style={[styles.actionOption, { 
                    backgroundColor: theme.bgCard,
                    borderColor: theme.borderPrimary 
                  }]}
                  onPress={() => handleSelectAction(action)}
                >
                  <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                    <Ionicons 
                      name={getIconName(action.icon)} 
                      size={20} 
                      color={action.color} 
                    />
                  </View>
                  
                  <Text style={[styles.actionName, { 
                    color: theme.textPrimary, 
                    fontFamily: theme.fontMedium 
                  }]}>
                    {action.title}
                  </Text>
                  
                  <Text style={[styles.actionApp, { 
                    color: theme.textMuted, 
                    fontFamily: theme.fontRegular 
                  }]}>
                    {action.appName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity
        style={[styles.cancelButton, { backgroundColor: theme.bgTertiary }]}
        onPress={handleClose}
      >
        <Text style={[styles.cancelButtonText, { 
          color: theme.textSecondary, 
          fontFamily: theme.fontMedium 
        }]}>
          Cancel
        </Text>
      </TouchableOpacity>
    </>
  );
  
  const renderConfigureStep = () => (
    <>
      <View style={styles.configureHeader}>
        <TouchableOpacity onPress={() => setStep('browse')}>
          <Ionicons name="arrow-back" size={24} color={theme.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.configureTitle, { 
          color: theme.textPrimary, 
          fontFamily: theme.fontBold 
        }]}>
          Configure Action
        </Text>
        
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView style={styles.configureScroll} showsVerticalScrollIndicator={false}>
        {/* Action Preview */}
        <View style={[styles.previewCard, { backgroundColor: selectedAction.color + '10' }]}>
          <View style={[styles.previewIcon, { backgroundColor: selectedAction.color }]}>
            <Ionicons 
              name={getIconName(selectedAction.icon)} 
              size={24} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.previewInfo}>
            <Text style={[styles.previewName, { 
              color: theme.textPrimary, 
              fontFamily: theme.fontBold 
            }]}>
              {selectedAction.title}
            </Text>
            <Text style={[styles.previewApp, { 
              color: theme.textMuted, 
              fontFamily: theme.fontRegular 
            }]}>
              {selectedAction.appName}
            </Text>
          </View>
        </View>
        
        {/* Custom Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: theme.textPrimary, 
            fontFamily: theme.fontMedium 
          }]}>
            Action Name
          </Text>
          <TextInput
            value={customName}
            onChangeText={setCustomName}
            style={[styles.nameInput, { 
              backgroundColor: theme.bgCard,
              borderColor: theme.borderPrimary,
              color: theme.textPrimary,
              fontFamily: theme.fontRegular
            }]}
            placeholder="Give your action a name"
            placeholderTextColor={theme.textMuted}
          />
          <Text style={[styles.helperText, { 
            color: theme.textMuted, 
            fontFamily: theme.fontRegular 
          }]}>
            This will appear on your home screen
          </Text>
        </View>
        
        {/* Parameters - Horizontal scroll for multiple parameters */}
        {selectedAction.config.parameters.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: theme.textPrimary, 
              fontFamily: theme.fontMedium 
            }]}>
              Configuration
            </Text>
            <Text style={[styles.sectionSubtitle, { 
              color: theme.textMuted, 
              fontFamily: theme.fontRegular 
            }]}>
              Fill in the details for this action
            </Text>
            
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.parametersContainer}
              contentContainerStyle={styles.parametersContent}
            >
              {selectedAction.config.parameters.map((param, index) => (
                <View key={param.name} style={[
                  styles.parameterCard,
                  { backgroundColor: theme.bgCard, width: SCREEN_WIDTH - 80 }
                ]}>
                  <Text style={[styles.parameterLabel, { 
                    color: theme.textPrimary, 
                    fontFamily: theme.fontMedium 
                  }]}>
                    {param.label}
                    {param.required && (
                      <Text style={{ color: theme.red }}> *</Text>
                    )}
                  </Text>
                  
                  <TextInput
                    value={parameters[param.name] || ''}
                    onChangeText={(text) => handleParameterChange(param.name, text)}
                    style={[styles.parameterInput, { 
                      backgroundColor: theme.bgPrimary,
                      borderColor: theme.borderPrimary,
                      color: theme.textPrimary,
                      fontFamily: theme.fontRegular
                    }]}
                    placeholder={param.placeholder}
                    placeholderTextColor={theme.textMuted}
                    multiline={param.type === 'textArea'}
                    numberOfLines={param.type === 'textArea' ? 4 : 2}
                  />
                  
                  {param.description && (
                    <Text style={[styles.parameterHelp, { 
                      color: theme.textMuted, 
                      fontFamily: theme.fontRegular 
                    }]}>
                      {param.description}
                    </Text>
                  )}
                </View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* Action Description */}
        <View style={[styles.infoCard, { backgroundColor: theme.primary + '10' }]}>
          <Ionicons name="information-circle" size={20} color={theme.primary} />
          <Text style={[styles.infoText, { 
            color: theme.textPrimary, 
            fontFamily: theme.fontRegular 
          }]}>
            {selectedAction.description}
          </Text>
        </View>
      </ScrollView>
      
      <View style={styles.configureButtons}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSaveAction}
        >
          <Text style={[styles.saveButtonText, { fontFamily: theme.fontMedium }]}>
            Add to Home Screen
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.bgTertiary }]}
          onPress={handleClose}
        >
          <Text style={[styles.cancelButtonText, { 
            color: theme.textSecondary, 
            fontFamily: theme.fontMedium 
          }]}>
            Cancel
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
  
  const renderCompleteStep = () => (
    <>
      <View style={styles.completeIconContainer}>
        <View style={[styles.completeIcon, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="checkmark" size={48} color={theme.primary} />
        </View>
      </View>
      
      <Text style={[styles.completeTitle, { 
        color: theme.textPrimary, 
        fontFamily: theme.fontBold 
      }]}>
        Quick Action Added!
      </Text>
      
      <Text style={[styles.completeMessage, { 
        color: theme.textMuted, 
        fontFamily: theme.fontRegular 
      }]}>
        "{customName || selectedAction?.title}" has been added to your home screen.
      </Text>
      
      <View style={styles.completeButtons}>
        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: theme.primary }]}
          onPress={handleAddAnother}
        >
          <Text style={[styles.primaryButtonText, { fontFamily: theme.fontMedium }]}>
            Add Another Action
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.secondaryButton, { backgroundColor: theme.bgTertiary }]}
          onPress={handleClose}
        >
          <Text style={[styles.secondaryButtonText, { 
            color: theme.textPrimary, 
            fontFamily: theme.fontMedium 
          }]}>
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
  
  const getIconName = (icon) => {
    const iconMap = {
      'navigate': 'navigate',
      'map': 'map',
      'chatbubble': 'chatbubble',
      'call': 'call',
      'camera': 'camera',
      'image': 'image',
      'mail': 'mail',
      'document-text': 'document-text',
      'calendar': 'calendar',
      'musical-notes': 'musical-notes',
      'chatbox': 'chatbox'
    };
    return iconMap[icon] || 'cube';
  };
  
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { backgroundColor: theme.bgPrimary }]}>
          {step === 'browse' && renderBrowseStep()}
          {step === 'configure' && renderConfigureStep()}
          {step === 'complete' && renderCompleteStep()}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    flex: 1,
    marginTop: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    marginBottom: 24,
    lineHeight: 20,
  },
  categoriesScroll: {
    flex: 1,
    marginBottom: 16,
  },
  categorySection: {
    marginBottom: 32,
  },
  categoryTitle: {
    fontSize: 12,
    letterSpacing: 1,
    paddingVertical: 8,
    marginBottom: 16,
    position: 'sticky',
    top: 0,
    zIndex: 1,
  },
  // Horizontal scrolling container for each category
  categoryRow: {
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  categoryRowContent: {
    paddingRight: 40,
    gap: 12,
  },
  actionOption: {
    width: 140,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionName: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  actionApp: {
    fontSize: 12,
    textAlign: 'center',
    opacity: 0.8,
  },
  configureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  configureTitle: {
    fontSize: 20,
  },
  configureScroll: {
    flex: 1,
    marginBottom: 16,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  previewIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  previewInfo: {
    flex: 1,
  },
  previewName: {
    fontSize: 18,
    marginBottom: 4,
  },
  previewApp: {
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    opacity: 0.8,
  },
  nameInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 8,
  },
  helperText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  // Horizontal scrolling for parameters in configure step
  parametersContainer: {
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  parametersContent: {
    paddingRight: 40,
    gap: 16,
  },
  parameterCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  parameterLabel: {
    fontSize: 14,
    marginBottom: 12,
  },
  parameterInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 48,
  },
  parameterHelp: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  configureButtons: {
    gap: 12,
  },
  saveButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  cancelButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
  },
  completeIconContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  completeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeTitle: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 12,
  },
  completeMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 40,
  },
  completeButtons: {
    gap: 12,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  secondaryButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
  },
});