// src/screens/LoadingCapabilitiesScreen.js
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import useActionDiscovery from '../hooks/useActionDiscovery';
import { selectDiscoveryStatus } from '../store/actionsSlice';
import { SafeAreaView } from 'react-native-safe-area-context';

const LoadingCapabilitiesScreen = () => {
  const navigation = useNavigation();
  const discoveryStatus = useSelector(selectDiscoveryStatus);
  const { discoverActions, isScanning } = useActionDiscovery();
  
  const [progressMessage, setProgressMessage] = useState('Initializing...');
  const [detectedCount, setDetectedCount] = useState(0);

  useEffect(() => {
    const loadCapabilities = async () => {
      setProgressMessage('Checking what your device can do...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setProgressMessage('Discovering available actions...');
      
      try {
        const actions = await discoverActions();
        setDetectedCount(actions.length);
        setProgressMessage(`Found ${actions.length} actions!`);
        await new Promise(resolve => setTimeout(resolve, 1200));

        // Navigate to main app
        navigation.replace('Main');
      } catch (error) {
        setProgressMessage('Could not detect actions. Using defaults...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        navigation.replace('Home');
      }
    };

    loadCapabilities();
  }, [discoverActions, navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header / Logo */}
        <View style={styles.header}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>⚡</Text>
          </View>
          <Text style={styles.title}>Action Bridge</Text>
          <Text style={styles.subtitle}>Smart Action System</Text>
        </View>
        
        {/* Progress Section */}
        <View style={styles.progressSection}>
          <ActivityIndicator 
            size="large" 
            color="#3B82F6" 
            animating={isScanning}
          />
          <Text style={styles.message}>{progressMessage}</Text>
          
          {detectedCount > 0 && (
            <View style={styles.statsBox}>
              <Text style={styles.statsText}>
                {detectedCount} actions detected
              </Text>
            </View>
          )}
        </View>
        
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>What's happening?</Text>
          <Text style={styles.infoText}>
            We're checking what actions your device supports, like sending
            messages, making calls, sharing content, and more.
          </Text>
          <Text style={styles.infoText}>
            This only happens on first launch or after updates.
          </Text>
        </View>
        
        {/* Platform Info */}
        <View style={styles.platformInfo}>
          <Text style={styles.platformText}>
            {discoveryStatus ? (
              <>
                Platform: {discoveryStatus.platform || 'Unknown'}{'\n'}
                Device: {discoveryStatus.deviceModel || 'Unknown'}{'\n'}
                OS Version: {discoveryStatus.osVersion || 'Unknown'}{'\n'}
                Last Scan: {discoveryStatus.lastScan ? new Date(discoveryStatus.lastScan).toLocaleString() : 'N/A'}{'\n'}
                Scanning: {discoveryStatus.scanning ? 'Yes' : 'No'}{'\n'}
                Actions Found: {discoveryStatus.totalDiscovered || 0}{'\n'}
                Failed Scans: {discoveryStatus.failedScans || 0}
              </>
            ) : (
              'Detecting device info...'
            )}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  content: { flex: 1, padding: 24, justifyContent: 'space-between' },
  header: { alignItems: 'center', marginTop: 60, marginBottom: 40 },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: { fontSize: 40, color: 'white' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#6B7280' },
  progressSection: { alignItems: 'center', marginBottom: 40 },
  message: { fontSize: 18, fontWeight: '600', color: '#111827', textAlign: 'center', marginTop: 24, marginBottom: 16 },
  statsBox: { backgroundColor: '#EFF6FF', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 8 },
  statsText: { fontSize: 14, color: '#1D4ED8', fontWeight: '500' },
  infoSection: { backgroundColor: '#F3F4F6', padding: 20, borderRadius: 12, marginBottom: 40 },
  infoTitle: { fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  platformInfo: { alignItems: 'center', paddingBottom: 20 },
  platformText: { fontSize: 12, color: '#9CA3AF', textAlign: 'center' },
});

export default LoadingCapabilitiesScreen;
