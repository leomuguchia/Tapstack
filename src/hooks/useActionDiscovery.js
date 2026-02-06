// hooks/useActionDiscovery.js
import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Platform, Linking, Vibration, Share, Clipboard } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { 
  addDiscoveredActions,
  updateSystemCapabilities
} from '../store/actionsSlice';
import ACTION_CATALOG from '../store/constants';

// ==================== MINIMAL MOBILE CAPABILITY DETECTION ====================

const CAPABILITY_DETECTORS = {
  wifi_adapter: async () => ({ supported: true, method: 'mobile_assumption', confidence: 0.99 }),
  network_api: async () => {
    try {
      const state = await NetInfo.fetch();
      return { supported: true, isConnected: state.isConnected, type: state.type, method: 'netinfo' };
    } catch {
      return { supported: true, method: 'assumption', confidence: 0.9 };
    }
  },
  bluetooth_adapter: async () => ({ supported: true, method: 'mobile_assumption', confidence: 0.9 }),
  vibration_motor: async () => ({ supported: true, method: 'mobile_assumption', confidence: 0.99 }),
  gps_chip: async () => ({ supported: true, method: 'mobile_assumption', confidence: 0.98 }),
  camera_hardware: async () => ({ supported: true, method: 'mobile_assumption', confidence: 0.99 }),
  sim_card: async () => ({ supported: Platform.OS === 'ios' || Platform.OS === 'android', method: 'mobile_assumption', confidence: 0.99 }),
  vibration_api: async () => ({ supported: true, method: 'react_native_vibration' }),
  share_api: async () => ({ supported: true, method: 'react_native_share' }),
  clipboard_api: async () => ({ supported: true, method: 'react_native_clipboard' }),
  sms_api: async () => {
    try {
      const canOpen = await Linking.canOpenURL('sms:');
      return { supported: canOpen, method: 'sms_url_scheme' };
    } catch {
      return { supported: Platform.OS === 'ios' || Platform.OS === 'android', method: 'platform_assumption', confidence: 0.95 };
    }
  },
  telephony_api: async () => {
    try {
      const canOpen = await Linking.canOpenURL('tel:');
      return { supported: canOpen, method: 'tel_url_scheme' };
    } catch {
      return { supported: Platform.OS === 'ios' || Platform.OS === 'android', method: 'platform_assumption', confidence: 0.99 };
    }
  },
  email_api: async () => {
    try {
      const canOpen = await Linking.canOpenURL('mailto:test@example.com');
      return { supported: canOpen, method: 'mailto_url_scheme' };
    } catch {
      return { supported: true, method: 'assumption', confidence: 0.8 };
    }
  },
  camera_api: async () => {
    try {
      const canOpen = await Linking.canOpenURL('camera:');
      return { supported: canOpen, method: 'camera_url_scheme' };
    } catch {
      return { supported: Platform.OS === 'ios' || Platform.OS === 'android', method: 'platform_assumption', confidence: 0.95 };
    }
  },
  maps_api: async () => {
    const scheme = Platform.OS === 'ios' ? 'maps:' : 'geo:';
    try {
      const canOpen = await Linking.canOpenURL(scheme);
      return { supported: canOpen, method: 'maps_url_scheme' };
    } catch {
      return { supported: true, method: 'assumption', confidence: 0.9 };
    }
  },
  local_storage_api: async () => ({ supported: true, method: 'async_storage' }),
  fetch_api: async () => ({ supported: true, method: 'react_native_fetch' }),
  wifi_control_api: async () => ({ supported: false, method: 'requires_library', note: 'Install react-native-wifi for control', installRequired: true }),
  bluetooth_control_api: async () => ({ supported: false, method: 'requires_library', note: 'Install react-native-ble-plx for control', installRequired: true }),
  torch_api: async () => ({ supported: false, method: 'requires_library', note: 'Requires camera library for torch', installRequired: true }),
  media_control_api: async () => ({ supported: true, method: 'system_media', note: 'Limited media control available' }),
};

// ==================== USE ACTION DISCOVERY HOOK ====================

const useActionDiscovery = () => {
  const dispatch = useDispatch();
  const [isScanning, setIsScanning] = useState(false);
  const capabilitiesCache = useRef({});

  const getAllRequiredCapabilities = useCallback(() => {
  const capabilities = new Set();

  console.log('🔹 ACTION_CATALOG:', ACTION_CATALOG);

  if (!Array.isArray(ACTION_CATALOG)) {
    console.warn('⚠️ ACTION_CATALOG is not an array!');
    return [];
  }

  ACTION_CATALOG.forEach((action, idx) => {
    if (!action) {
      console.warn(`⚠️ ACTION_CATALOG[${idx}] is undefined or null`);
      return;
    }

    if (!Array.isArray(action.requiredCapabilities)) {
      console.log(`ℹ️ ACTION '${action?.id}' has no requiredCapabilities or is not an array`);
      return;
    }

    action.requiredCapabilities.forEach(cap => {
      if (!CAPABILITY_DETECTORS[cap]) {
        console.warn(`⚠️ No detector found for capability '${cap}' in action '${action.id}'`);
        return;
      }
      capabilities.add(cap);
    });
  });

  console.log('🔹 Extracted capabilities:', Array.from(capabilities));
  return Array.from(capabilities);
});

  const detectCapability = useCallback(async (capabilityId) => {
    if (capabilitiesCache.current[capabilityId]) return capabilitiesCache.current[capabilityId];
    
    const detector = CAPABILITY_DETECTORS[capabilityId];
    if (!detector) {
      const result = { supported: false, method: 'no_detector' };
      capabilitiesCache.current[capabilityId] = result;
      return result;
    }

    try {
      const result = await detector();
      capabilitiesCache.current[capabilityId] = result;
      return result;
    } catch (error) {
      const result = { supported: false, method: 'detection_failed', error: error.message };
      capabilitiesCache.current[capabilityId] = result;
      return result;
    }
  }, []);

  const isActionSupportedOnPlatform = useCallback((action) => {
    if (!action.platformSupport || action.platformSupport.includes('all')) return true;
    return action.platformSupport.includes(Platform.OS);
  }, []);

  const canActionBeSupported = useCallback((action, capabilities) => {
    if (!isActionSupportedOnPlatform(action)) return { supported: false, reason: 'platform' };
    
    if (Array.isArray(action.requiredCapabilities)) {
      for (const cap of action.requiredCapabilities) {
        if (!capabilities[cap]?.supported) {
          return { supported: false, reason: 'missing_capability', missing: cap };
        }
      }
    }

    return { supported: true };
  }, [isActionSupportedOnPlatform]);

  const discoverActions = useCallback(async () => {
    setIsScanning(true);
    try {
      const allCaps = getAllRequiredCapabilities();
      const capabilities = {};
      
      await Promise.all(allCaps.map(async cap => {
        capabilities[cap] = await detectCapability(cap);
      }));
      
      const discoveredActions = [];
      
      ACTION_CATALOG.forEach(action => {
        if (!isActionSupportedOnPlatform(action)) return;
        
        const supportCheck = canActionBeSupported(action, capabilities);
        if (supportCheck.supported) {
          discoveredActions.push({
            id: action.id,
            name: action.name,
            description: action.description,
            category: action.category,
            icon: action.icon,
            color: action.color,
            parameters: action.parameters || {},
            metadata: {
              discoveredAt: Date.now(),
              platform: Platform.OS,
              confidence: 'high',
              capabilities: Array.isArray(action.requiredCapabilities) ? action.requiredCapabilities : []
            }
          });
        }
      });
      
      dispatch(addDiscoveredActions({
        actions: discoveredActions,
        systemInfo: {
          platform: Platform.OS,
          osVersion: Platform.Version,
          scanType: 'mobile_minimal',
          timestamp: Date.now(),
          totalActions: discoveredActions.length
        }
      }));
      
      const hardwareCapabilities = {};
      const apiCapabilities = {};
      
      Object.entries(capabilities).forEach(([key, value]) => {
        if (key.includes('_adapter') || key.includes('_chip') || key.includes('_hardware')) {
          hardwareCapabilities[key] = value.supported;
        } else if (key.includes('_api')) {
          apiCapabilities[key] = value.supported;
        }
      });
      
      dispatch(updateSystemCapabilities({
        hardware: hardwareCapabilities,
        apis: apiCapabilities,
        timestamp: Date.now()
      }));
      
      return discoveredActions;
    } catch (error) {
      console.error('❌ Discovery failed:', error);
      return [];
    } finally {
      setIsScanning(false);
    }
  }, [getAllRequiredCapabilities, detectCapability, isActionSupportedOnPlatform, canActionBeSupported, dispatch]);

  const isActionAvailable = useCallback(async (actionId) => {
    const action = ACTION_CATALOG.find(a => a.id === actionId);
    if (!action || !isActionSupportedOnPlatform(action)) return false;
    
    if (!Array.isArray(action.requiredCapabilities)) return true;
    
    for (const cap of action.requiredCapabilities) {
      const capability = await detectCapability(cap);
      if (!capability.supported) return false;
    }
    
    return true;
  }, [detectCapability, isActionSupportedOnPlatform]);

  return {
    discoverActions,
    isScanning,
    isActionAvailable,
    rescan: discoverActions,
    clearCache: () => { capabilitiesCache.current = {}; }
  };
};

export default useActionDiscovery;
