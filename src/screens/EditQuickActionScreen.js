// screens/EditQuickActionScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectQuickActionById,
  updateQuickAction,
  deleteQuickAction
} from '../store/slices/quickActionsSlice';

export default function EditQuickActionScreen({ navigation, route }) {
  const { theme } = useTheme();
  const dispatch = useDispatch();
  
  const { actionId } = route.params;
  const quickAction = useSelector(state => selectQuickActionById(state, actionId));
  
  const [name, setName] = useState('');
  const [parameters, setParameters] = useState({});
  
  useEffect(() => {
    if (quickAction) {
      setName(quickAction.name);
      setParameters({ ...quickAction.parameters });
    }
  }, [quickAction]);
  
  if (!quickAction) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-back" size={24} color={theme.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
            Edit Action
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.errorState}>
          <MaterialCommunityIcons name="alert-circle" size={64} color={theme.red} />
          <Text style={[styles.errorText, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
            Action not found
          </Text>
        </View>
      </View>
    );
  }
  
  const handleParameterChange = (paramName, value) => {
    setParameters(prev => ({
      ...prev,
      [paramName]: value
    }));
  };
  
  const handleSave = () => {
    // Validate required parameters
    const missingParams = quickAction.config.parameters
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
    
    dispatch(updateQuickAction({
      id: actionId,
      updates: {
        name,
        parameters
      }
    }));
    
    Alert.alert(
      'Saved',
      'Quick action updated successfully',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Delete Action',
      `Delete "${name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteQuickAction(actionId));
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
          Edit Action
        </Text>
        
        <TouchableOpacity onPress={handleSave}>
          <Text style={[styles.saveText, { color: theme.primary, fontFamily: theme.fontMedium }]}>
            Save
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Action Preview */}
        <View style={[styles.previewCard, { backgroundColor: quickAction.color + '10' }]}>
          <View style={[styles.previewIcon, { backgroundColor: quickAction.color }]}>
            <MaterialCommunityIcons 
              name={getIconName(quickAction.icon)} 
              size={24} 
              color="#fff" 
            />
          </View>
          
          <View style={styles.previewInfo}>
            <Text style={[styles.previewName, { 
              color: theme.textPrimary, 
              fontFamily: theme.fontBold 
            }]}>
              {quickAction.appName}
            </Text>
            <Text style={[styles.previewType, { 
              color: theme.textMuted, 
              fontFamily: theme.fontRegular 
            }]}>
              Quick Action
            </Text>
          </View>
        </View>
        
        {/* Name */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { 
            color: theme.textPrimary, 
            fontFamily: theme.fontMedium 
          }]}>
            Action Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.nameInput, { 
              backgroundColor: theme.bgCard,
              borderColor: theme.borderPrimary,
              color: theme.textPrimary,
              fontFamily: theme.fontRegular
            }]}
            placeholder="Give your action a name"
            placeholderTextColor={theme.textMuted}
          />
        </View>
        
        {/* Parameters */}
        {quickAction.config.parameters.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { 
              color: theme.textPrimary, 
              fontFamily: theme.fontMedium 
            }]}>
              Configuration
            </Text>
            
            {quickAction.config.parameters.map((param, index) => (
              <View key={param.name} style={styles.parameterRow}>
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
                    backgroundColor: theme.bgCard,
                    borderColor: theme.borderPrimary,
                    color: theme.textPrimary,
                    fontFamily: theme.fontRegular
                  }]}
                  placeholder={param.placeholder}
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            ))}
          </View>
        )}
        
        {/* Delete Button */}
        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: theme.red + '20' }]}
          onPress={handleDelete}
        >
          <MaterialCommunityIcons name="trash" size={20} color={theme.red} />
          <Text style={[styles.deleteButtonText, { 
            color: theme.red, 
            fontFamily: theme.fontMedium 
          }]}>
            Delete Action
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const getIconName = (icon) => {
  const iconMap = {
    'navigate': 'navigate',
    'map': 'map',
    'chatbubble': 'chatbubble',
    'call': 'phone-dial',
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 18,
    marginTop: 16,
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
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
  previewType: {
    fontSize: 14,
    opacity: 0.8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  nameInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  parameterRow: {
    marginBottom: 16,
  },
  parameterLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  parameterInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  deleteButtonText: {
    fontSize: 16,
  },
});