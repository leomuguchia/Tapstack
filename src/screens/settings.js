import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert,
  Switch,
  Platform 
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useDispatch } from 'react-redux';
import { resetShortcuts } from '../store/shortcutsSlice';

export default function SettingsScreen() {
  const { theme, currentTheme, setTheme, hapticsEnabled, toggleHaptics } = useTheme();
  const dispatch = useDispatch();
  
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleResetShortcuts = () => {
    Alert.alert(
      'Reset All Shortcuts',
      'This will remove all your shortcuts and restore default ones. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset', 
          style: 'destructive',
          onPress: () => {
            dispatch(resetShortcuts());
            Alert.alert('Success', 'All shortcuts have been reset.');
          }
        }
      ]
    );
  };

  const themeOptions = [
    { id: 'light', label: 'Light', icon: 'sunny' },
    { id: 'dark', label: 'Dark', icon: 'moon' },
    { id: 'system', label: 'System', icon: 'phone-portrait' }
  ];

  const hapticOptions = [
    { id: 'light', label: 'Light', description: 'Subtle vibrations' },
    { id: 'medium', label: 'Medium', description: 'Standard vibrations' },
    { id: 'strong', label: 'Strong', description: 'Pronounced vibrations' },
    { id: 'off', label: 'Off', description: 'No vibrations' }
  ];

  const appInfo = {
    name: 'Tapstack',
    version: '1.0.0',
    description: 'Tapstack is a powerful automation app that lets you create custom shortcuts to streamline your daily tasks. Create multi-action workflows triggered by manual taps, time, location, or device events.',
    features: [
      'Create custom shortcuts with multiple actions',
      'Drag-and-drop action sequencing',
      'Various trigger types (manual, time, location)',
      'Discover new actions automatically',
      'Organize shortcuts with tags and categories'
    ],
    developer: 'Leoapps',
    contact: 'support@leoapps.com'
  };

  const SettingItem = ({ 
    label, 
    value, 
    danger, 
    icon,
    isExpanded,
    onPress,
    hasChevron = true,
    children 
  }) => (
    <View>
      <TouchableOpacity
        style={[
          styles.item,
          { 
            borderBottomColor: theme.borderSubtle,
            backgroundColor: theme.bgCard,
            marginBottom: isExpanded ? 0 : 8,
            borderBottomWidth: isExpanded ? 0 : 1
          },
        ]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.itemLeft}>
          {icon && (
            <Ionicons 
              name={icon} 
              size={20} 
              color={danger ? '#E5484D' : theme.primary}
              style={styles.itemIcon}
            />
          )}
          <Text
            style={[
              styles.label,
              { 
                color: danger ? '#E5484D' : theme.textPrimary, 
                fontFamily: theme.fontMedium
              },
            ]}
          >
            {label}
          </Text>
        </View>
        
        <View style={styles.itemRight}>
          {value && (
            <Text style={[styles.value, { color: theme.textMuted }]}>{value}</Text>
          )}
          {hasChevron && (
            <Ionicons 
              name={isExpanded ? 'chevron-up' : 'chevron-down'} 
              size={18} 
              color={theme.textMuted}
              style={styles.chevron}
            />
          )}
        </View>
      </TouchableOpacity>
      
      {isExpanded && children && (
        <View style={[styles.expandedContent, { backgroundColor: theme.bgCard }]}>
          {children}
        </View>
      )}
    </View>
  );

  const ThemeSelector = () => (
    <View style={styles.selectorContainer}>
      {themeOptions.map((option) => (
        <TouchableOpacity
          key={option.id}
          style={[
            styles.option,
            { 
              backgroundColor: currentTheme=== option.id ? theme.primary + '20' : theme.bgTertiary,
              borderColor: currentTheme=== option.id ? theme.primary : 'transparent'
            }
          ]}
          onPress={() => {
            setTheme(option.id);
            setExpandedSection(null);
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={option.icon} 
            size={20} 
            color={currentTheme=== option.id ? theme.primary : theme.textSecondary}
          />
          <Text style={[
            styles.optionLabel,
            { 
              color: currentTheme=== option.id ? theme.primary : theme.textPrimary,
              fontFamily: theme.fontMedium
            }
          ]}>
            {option.label}
          </Text>
          {currentTheme=== option.id && (
            <Ionicons 
              name="checkmark-circle" 
              size={20} 
              color={theme.primary}
              style={styles.checkIcon}
            />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const HapticsSelector = () => (
    <View style={styles.selectorContainer}>
      <View style={styles.hapticsHeader}>
        <Text style={[styles.hapticsTitle, { color: theme.textPrimary }]}>
          Haptic Feedback
        </Text>
        <Switch
          value={hapticsEnabled}
          onValueChange={toggleHaptics}
          trackColor={{ false: theme.bgTertiary, true: theme.primary + '80' }}
          thumbColor={hapticsEnabled ? theme.primary : theme.textMuted}
          ios_backgroundColor={theme.bgTertiary}
        />
      </View>
      
      {hapticsEnabled && (
        <View style={styles.hapticOptions}>
          {hapticOptions.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.hapticOption,
                { 
                  backgroundColor: theme.bgTertiary,
                  borderColor: 'transparent'
                }
              ]}
              activeOpacity={0.7}
            >
              <View style={styles.hapticOptionLeft}>
                <Text style={[
                  styles.hapticOptionLabel,
                  { color: theme.textPrimary, fontFamily: theme.fontMedium }
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.hapticOptionDescription,
                  { color: theme.textMuted, fontFamily: theme.fontRegular }
                ]}>
                  {option.description}
                </Text>
              </View>
              <View style={[
                styles.radio,
                { borderColor: theme.textMuted }
              ]}>
                {option.id === 'medium' && (
                  <View style={[
                    styles.radioInner,
                    { backgroundColor: theme.primary }
                  ]} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  const AboutSection = () => (
    <View style={styles.aboutContainer}>
      <View style={styles.appHeader}>
        <View style={[styles.appIcon, { backgroundColor: theme.primary }]}>
          <Ionicons name="flash" size={32} color="#fff" />
        </View>
        <View style={styles.appInfo}>
          <Text style={[styles.appName, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
            {appInfo.name}
          </Text>
          <Text style={[styles.appVersion, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
            Version {appInfo.version}
          </Text>
        </View>
      </View>
      
      <Text style={[styles.description, { color: theme.textPrimary, fontFamily: theme.fontRegular }]}>
        {appInfo.description}
      </Text>
      
      <Text style={[styles.sectionTitle, { color: theme.textPrimary, fontFamily: theme.fontBold, marginTop: 20 }]}>
        Key Features
      </Text>
      {appInfo.features.map((feature, index) => (
        <View key={index} style={styles.featureItem}>
          <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
          <Text style={[styles.featureText, { color: theme.textPrimary, fontFamily: theme.fontRegular }]}>
            {feature}
          </Text>
        </View>
      ))}
      
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: theme.textMuted, fontFamily: theme.fontMedium }]}>
          Developer
        </Text>
        <Text style={[styles.infoValue, { color: theme.textPrimary, fontFamily: theme.fontRegular }]}>
          {appInfo.developer}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={[styles.infoLabel, { color: theme.textMuted, fontFamily: theme.fontMedium }]}>
          Contact
        </Text>
        <TouchableOpacity>
          <Text style={[styles.infoValue, { color: theme.primary, fontFamily: theme.fontRegular }]}>
            {appInfo.contact}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: theme.textPrimary, fontFamily: theme.fontBold }]}>
          Settings
        </Text>
        
        <Text style={[styles.sectionHeader, { color: theme.textMuted, fontFamily: theme.fontMedium }]}>
          APPEARANCE
        </Text>
        
        <SettingItem
          label="Theme"
          value={currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
          icon="color-palette"
          isExpanded={expandedSection === 'theme'}
          onPress={() => toggleSection('theme')}
        >
          <ThemeSelector />
        </SettingItem>
        
        <SettingItem
          label="Haptics"
          value={hapticsEnabled ? 'On' : 'Off'}
          icon="phone-portrait"
          isExpanded={expandedSection === 'haptics'}
          onPress={() => toggleSection('haptics')}
        >
          <HapticsSelector />
        </SettingItem>
        
        <Text style={[styles.sectionHeader, { 
          color: theme.textMuted, 
          fontFamily: theme.fontMedium,
          marginTop: 24 
        }]}>
          ABOUT
        </Text>
        
        <SettingItem
          label="About Tapstack"
          icon="information-circle"
          isExpanded={expandedSection === 'about'}
          onPress={() => toggleSection('about')}
        >
          <AboutSection />
        </SettingItem>
        
        <Text style={[styles.sectionHeader, { 
          color: theme.textMuted, 
          fontFamily: theme.fontMedium,
          marginTop: 24 
        }]}>
          DATA
        </Text>
        
        <SettingItem
          label="Reset all shortcuts"
          danger
          icon="refresh"
          hasChevron={false}
          onPress={handleResetShortcuts}
        />
        
        <SettingItem
          label="Export shortcuts"
          icon="download"
          hasChevron={false}
          onPress={() => Alert.alert('Coming Soon', 'Export functionality will be available in the next update.')}
        />
        
        <SettingItem
          label="Import shortcuts"
          icon="cloud-upload"
          hasChevron={false}
          onPress={() => Alert.alert('Coming Soon', 'Import functionality will be available in the next update.')}
        />
        
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.textMuted, fontFamily: theme.fontRegular }]}>
            © {new Date().getFullYear()} {appInfo.name}. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    marginBottom: 32,
  },
  sectionHeader: {
    fontSize: 13,
    letterSpacing: 0.5,
    marginBottom: 12,
    marginTop: 8,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 12,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemIcon: {
    marginRight: 12,
  },
  label: {
    fontSize: 17,
    flex: 1,
  },
  value: {
    fontSize: 15,
    marginRight: 8,
  },
  chevron: {
    marginLeft: 4,
  },
  expandedContent: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  selectorContainer: {
    marginTop: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  optionLabel: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  checkIcon: {
    marginLeft: 8,
  },
  hapticsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  hapticsTitle: {
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  hapticOptions: {
    marginTop: 8,
  },
  hapticOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 8,
  },
  hapticOptionLeft: {
    flex: 1,
  },
  hapticOptionLabel: {
    fontSize: 16,
    marginBottom: 2,
  },
  hapticOptionDescription: {
    fontSize: 14,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  aboutContainer: {
    paddingTop: 8,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  appIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  appInfo: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 20,
    marginLeft: 10,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 15,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
});