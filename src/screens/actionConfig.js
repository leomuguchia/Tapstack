import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const Input = ({ 
  label, 
  placeholder, 
  value, 
  onChange, 
  theme, 
  keyboard = 'default',
  multiline = false,
  autoCapitalize = 'sentences',
  required = false,
  error = false
}) => (
  <View style={inputStyles.container}>
    <View style={inputStyles.labelRow}>
      {label && (
        <Text style={[inputStyles.label, { color: theme.textPrimary }]}>
          {label}
        </Text>
      )}
      {required && (
        <Text style={[inputStyles.required, { color: theme.red }]}>
          *
        </Text>
      )}
    </View>
    <TextInput
      style={[
        inputStyles.input,
        { 
          backgroundColor: theme.bgCard, 
          color: theme.textPrimary,
          borderColor: error ? theme.red : theme.border,
          minHeight: multiline ? 80 : undefined,
          textAlignVertical: multiline ? 'top' : 'center'
        }
      ]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={theme.textMuted}
      keyboardType={keyboard}
      multiline={multiline}
      autoCapitalize={autoCapitalize}
    />
    {error && (
      <Text style={[inputStyles.error, { color: theme.red }]}>
        This field is required
      </Text>
    )}
  </View>
);

const inputStyles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontFamily: 'jakarta-medium',
  },
  required: {
    fontSize: 14,
    fontFamily: 'jakarta-bold',
    marginLeft: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'jakarta-regular',
  },
  error: {
    fontSize: 12,
    fontFamily: 'jakarta-regular',
    marginTop: 4,
  },
});

export default function ConfigureActionScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { action, onConfigured } = route.params;
  console.log("actions here", action)

  const [parameters, setParameters] = useState({});
  const [delayBefore, setDelayBefore] = useState(0);
  const [isEnabled, setIsEnabled] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Initialize parameters based on action type
    const initParams = {};
    
    // Check if this is a quick action with config.parameters (new system)
    if (action.config?.parameters && Array.isArray(action.config.parameters)) {
      // New quick action system
      action.config.parameters.forEach(param => {
        // Check if we have existing parameter value from the action
        const existingValue = action.parameters?.[param.name];
        
        if (param.type === 'number' && param.default !== undefined) {
          initParams[param.name] = param.default;
        } else if (existingValue !== undefined && existingValue !== null) {
          // Use existing parameter value
          initParams[param.name] = existingValue;
        } else {
          // Initialize empty
          initParams[param.name] = param.type === 'number' ? 0 : '';
        }
      });
    } else {
      // Legacy action system
      switch (action.id) { // Use action.id not action.actionId
        case 'open_maps':
        case 'clipboard_copy':
        case 'share_content':
        case 'open_url':
          // These actions require user input - initialize empty
          break;
        case 'open_app':
          initParams.deeplink = '';
          break;
        case 'vibrate':
          initParams.duration = 500;
          break;
        case 'delay':
          initParams.seconds = 2;
          break;
        case 'open_email':
          initParams.to = '';
          break;
        default:
          // If action has parameters schema, initialize empty values
          if (action.parameters) {
            Object.keys(action.parameters).forEach(key => {
              const param = action.parameters[key];
              if (param.type === 'number' && param.default !== undefined) {
                initParams[key] = param.default;
              } else {
                initParams[key] = '';
              }
            });
          }
      }
    }
    
    setParameters(initParams);
  }, [action]);

  // Deeplink mappings for popular apps
  const APP_DEEPLINKS = {
    'instagram': 'instagram://',
    'facebook': 'fb://',
    'twitter': 'twitter://',
    'whatsapp': 'whatsapp://',
    'spotify': 'spotify://',
    'youtube': 'youtube://',
    'maps': 'comgooglemaps://',
    'gmail': 'googlegmail://',
    'chrome': 'googlechrome://',
    'photos': 'photos-redirect://',
    'camera': 'camera://',
    'calculator': 'calculator://',
    'calendar': 'calshow://',
    'clock': 'clock://',
    'settings': 'prefs://',
    'phone': 'tel://',
    'messages': 'sms://',
    'mail': 'mailto://',
    'netflix': 'nflx://',
    'amazon': 'com.amazon.mobile.shopping://',
    'discord': 'discord://',
    'telegram': 'telegram://',
    'tiktok': 'tiktok://',
    'reddit': 'reddit://',
    'linkedin': 'linkedin://',
    'snapchat': 'snapchat://',
    'pinterest': 'pinterest://',
  };

  const convertAppNameToDeeplink = (appName) => {
    const cleanedName = appName.toLowerCase().trim();
    
    // Direct match
    if (APP_DEEPLINKS[cleanedName]) {
      return APP_DEEPLINKS[cleanedName];
    }
    
    // Try to find partial matches
    for (const [key, deeplink] of Object.entries(APP_DEEPLINKS)) {
      if (cleanedName.includes(key) || key.includes(cleanedName)) {
        return deeplink;
      }
    }
    
    // If no match found, return the input with :// appended
    return cleanedName.includes('://') ? cleanedName : `${cleanedName}://`;
  };

  const validateParameters = () => {
    const newErrors = {};
    
    // Check for new quick action parameters
    if (action.config?.parameters && Array.isArray(action.config.parameters)) {
      action.config.parameters.forEach(param => {
        if (param.required) {
          const value = parameters[param.name];
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            newErrors[param.name] = true;
          }
        }
      });
    } else {
      // Legacy validation
      switch (action.id) {
        case 'clipboard_copy':
          if (!parameters.text?.trim()) {
            newErrors.text = true;
          }
          break;
        case 'open_maps':
          if (!parameters.destination?.trim()) {
            newErrors.destination = true;
          }
          break;
        case 'open_url':
          if (!parameters.url?.trim()) {
            newErrors.url = true;
          } else if (!parameters.url.startsWith('http')) {
            Alert.alert('Invalid URL', 'URL must start with http:// or https://');
            return false;
          }
          break;
        case 'share_content':
          if (!parameters.message?.trim()) {
            newErrors.message = true;
          }
          break;
        case 'open_app':
          if (!parameters.deeplink?.trim()) {
            newErrors.deeplink = true;
          }
          break;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateParameters()) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    // Create the configured action object
    const configuredAction = {
      id: `action_${Date.now()}`,
      actionId: action.id, // Use action.id (the actual action type)
      name: action.name,
      description: action.description,
      icon: action.icon,
      color: action.color,
      parameters: { ...parameters },
      delayBefore: Number(delayBefore) || 0,
      conditions: [],
      enabled: isEnabled,
    };

    // Include additional fields for quick actions
    if (action.appName) configuredAction.appName = action.appName;
    if (action.category) configuredAction.category = action.category;
    if (action.actionType) configuredAction.actionType = action.actionType;
    if (action.config) configuredAction.config = action.config;

    console.log("Configured action:", configuredAction);
    
    onConfigured(configuredAction);
    navigation.goBack();
  };

  const renderInputs = () => {
    // Check if this is a new quick action with config parameters
    if (action.config?.parameters && Array.isArray(action.config.parameters)) {
      return action.config.parameters.map((param) => {
        const isRequired = param.required || false;
        
        return (
          <Input
            key={param.name}
            label={param.label || param.name}
            placeholder={param.placeholder || `Enter ${param.name}`}
            value={parameters[param.name] || ''}
            theme={theme}
            onChange={(v) => {
              setParameters({ ...parameters, [param.name]: v });
              // Clear error when user starts typing
              if (errors[param.name]) {
                setErrors({ ...errors, [param.name]: false });
              }
            }}
            keyboard={param.type === 'number' ? 'number-pad' : 'default'}
            multiline={param.type === 'text' && param.name.includes('message')}
            required={isRequired}
            error={errors[param.name]}
            autoCapitalize={param.name === 'email' ? 'none' : 'sentences'}
            maxLength={param.maxLength}
          />
        );
      });
    }
    
    // Legacy input rendering
    switch (action.id) {
      case 'open_maps':
        return (
          <Input
            label="Destination"
            placeholder="Address, city, or place"
            value={parameters.destination || ''}
            onChange={(v) => setParameters({ ...parameters, destination: v })}
            theme={theme}
            required={true}
            error={errors.destination}
          />
        );

      case 'open_app':
        return (
          <>
            <Input
              label="App Name"
              placeholder="e.g., Instagram, Spotify, Camera"
              value={parameters.appName || ''}
              onChange={(v) => {
                const deeplink = convertAppNameToDeeplink(v);
                setParameters({ 
                  ...parameters, 
                  appName: v,
                  deeplink: deeplink
                });
              }}
              theme={theme}
              required={true}
              error={errors.deeplink}
            />
            <View style={styles.deeplinkPreview}>
              <Text style={[styles.deeplinkLabel, { color: theme.textMuted }]}>
                Deeplink:
              </Text>
              <Text style={[styles.deeplinkValue, { color: theme.textSecondary }]}>
                {parameters.deeplink || 'Enter app name above'}
              </Text>
            </View>
            <Text style={[styles.hint, { color: theme.textMuted }]}>
              Type the app name (e.g., "Instagram") and we'll convert it to the correct deeplink
            </Text>
          </>
        );

      case 'open_url':
        return (
          <Input
            label="Website URL"
            placeholder="https://example.com"
            value={parameters.url || ''}
            keyboard="url"
            onChange={(v) => setParameters({ ...parameters, url: v })}
            theme={theme}
            required={true}
            error={errors.url}
            autoCapitalize="none"
          />
        );

      case 'clipboard_copy':
        return (
          <Input
            label="Text to copy"
            placeholder="Anything you want copied"
            value={parameters.text || ''}
            multiline
            theme={theme}
            onChange={(v) => setParameters({ ...parameters, text: v })}
            required={true}
            error={errors.text}
          />
        );

      case 'share_content':
        return (
          <Input
            label="Message to share"
            placeholder="Share this with friends"
            value={parameters.message || ''}
            multiline
            theme={theme}
            onChange={(v) => setParameters({ ...parameters, message: v })}
            required={true}
            error={errors.message}
          />
        );

      case 'delay':
        return (
          <Input
            label="Wait time (seconds)"
            placeholder="2"
            keyboard="number-pad"
            value={String(parameters.seconds || 2)}
            theme={theme}
            onChange={(v) =>
              setParameters({ ...parameters, seconds: Math.max(1, Number(v) || 1) })
            }
          />
        );

      case 'vibrate':
        return (
          <Input
            label="Vibration duration (ms)"
            placeholder="500"
            keyboard="number-pad"
            value={String(parameters.duration || 500)}
            theme={theme}
            onChange={(v) =>
              setParameters({ ...parameters, duration: Math.max(100, Number(v) || 500) })
            }
          />
        );

      case 'open_email':
        return (
          <Input
            label="Recipient email (optional)"
            placeholder="friend@example.com"
            value={parameters.to || ''}
            onChange={(v) => setParameters({ ...parameters, to: v })}
            theme={theme}
            keyboard="email-address"
            autoCapitalize="none"
          />
        );

      default:
        // Generic parameter handling for legacy actions
        if (action.parameters) {
          return Object.keys(action.parameters).map((key) => {
            const param = action.parameters[key];
            const isRequired = param.required || false;
            
            return (
              <Input
                key={key}
                label={param.description || key}
                placeholder={param.placeholder || `Enter ${key}`}
                value={parameters[key] || ''}
                theme={theme}
                onChange={(v) => {
                  setParameters({ ...parameters, [key]: v });
                  // Clear error when user starts typing
                  if (errors[key]) {
                    setErrors({ ...errors, [key]: false });
                  }
                }}
                keyboard={param.type === 'number' ? 'number-pad' : 'default'}
                multiline={param.type === 'string' && key.includes('message')}
                required={isRequired}
                error={errors[key]}
              />
            );
          });
        }
        
        return (
          <Text style={[styles.helper, { color: theme.textMuted }]}>
            Nothing to set for this action.
          </Text>
        );
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bgPrimary }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.primary}
          />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>
          Configure action
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Action card */}
        <View style={[styles.card, { backgroundColor: theme.bgCard }]}>
          <MaterialCommunityIcons
            name={action.icon || 'cube-outline'}
            size={28}
            color="#fff"
            style={[
              styles.icon,
              { backgroundColor: action.color || theme.primary },
            ]}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>
              {action.name}
            </Text>
            <Text style={[styles.cardDesc, { color: theme.textMuted }]}>
              {action.description}
            </Text>
          </View>
        </View>

        {/* Required fields hint */}
        <View style={[styles.requiredHint, { backgroundColor: theme.bgCard }]}>
          <MaterialCommunityIcons 
            name="asterisk" 
            size={12} 
            color={theme.red} 
          />
          <Text style={[styles.requiredHintText, { color: theme.textMuted }]}>
            Indicates required field
          </Text>
        </View>

        {/* Inputs */}
        <View style={styles.section}>{renderInputs()}</View>

        {/* Timing */}
        <View style={styles.section}>
          <Input
            label="Delay before running (ms)"
            placeholder="0"
            keyboard="number-pad"
            value={String(delayBefore)}
            theme={theme}
            onChange={(v) => setDelayBefore(Number(v) || 0)}
          />
          <Text style={[styles.hint, { color: theme.textMuted }]}>
            Wait time before this action runs
          </Text>
        </View>

        {/* Enable/Disable */}
        <View style={[styles.toggleRow, { borderColor: theme.border }]}>
          <View>
            <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}>
              Enable action
            </Text>
            <Text style={[styles.toggleHint, { color: theme.textMuted }]}>
              Turn off to skip this action
            </Text>
          </View>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            trackColor={{ false: theme.border, true: theme.primary }}
          />
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.buttonText}>Add action</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontFamily: 'jakarta-bold',
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'jakarta-bold',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 14,
    fontFamily: 'jakarta-regular',
  },
  requiredHint: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  requiredHintText: {
    fontSize: 12,
    fontFamily: 'jakarta-regular',
    marginLeft: 6,
  },
  deeplinkPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  deeplinkLabel: {
    fontSize: 12,
    fontFamily: 'jakarta-medium',
    marginRight: 6,
  },
  deeplinkValue: {
    fontSize: 12,
    fontFamily: 'jakarta-regular',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'jakarta-regular',
    marginTop: 8,
    fontStyle: 'italic',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    borderTopWidth: 1,
  },
  toggleLabel: {
    fontSize: 15,
    fontFamily: 'jakarta-medium',
  },
  toggleHint: {
    fontSize: 12,
    fontFamily: 'jakarta-regular',
    marginTop: 2,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontFamily: 'jakarta-bold',
    color: '#fff',
  },
});