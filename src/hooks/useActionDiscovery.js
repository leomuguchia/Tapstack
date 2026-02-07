// hooks/useActionDiscovery.js
import { useState, useCallback, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { Platform, Linking, Vibration, Share, Clipboard } from 'react-native';
import { 
  addDiscoveredActions,
  updateSystemCapabilities
} from '../store/actionsSlice';
import ACTION_CATALOG from '../store/constants';

// ==================== V1-SAFE CAPABILITY DETECTORS ====================
const CAPABILITY_DETECTORS = {
  // Vibration
  vibration_api: async () => ({ 
    supported: true, 
    method: 'react_native_vibration'
  }),
  
  // Camera (just opening)
  camera_api: async () => ({ 
    supported: true, 
    method: 'camera_intent'
  }),
  
  // Media control
  media_control_api: async () => ({ 
    supported: true, 
    method: 'system_media'
  }),
  
  // Email
  email_api: async () => ({ 
    supported: true, 
    method: 'mailto_intent'
  }),
  
  // Sharing
  share_api: async () => ({ 
    supported: true, 
    method: 'react_native_share'
  }),
  
  // Maps
  maps_api: async () => ({ 
    supported: true, 
    method: 'maps_intent'
  }),
  
  // Clipboard
  clipboard_api: async () => ({ 
    supported: true, 
    method: 'react_native_clipboard'
  }),
  
  // URL opening
  url_open_api: async () => ({ 
    supported: true, 
    method: 'linking_api'
  }),
  
  // Deeplink opening
  deeplink_api: async () => ({ 
    supported: true, 
    method: 'linking_api'
  })
};

const useActionDiscovery = () => {
  const dispatch = useDispatch();
  const [isScanning, setIsScanning] = useState(false);
  const capabilitiesCache = useRef({});

  const getAllRequiredCapabilities = useCallback(() => {
    if (!ACTION_CATALOG || !Array.isArray(ACTION_CATALOG)) {
      return [];
    }
    
    const capabilities = new Set();
    
    ACTION_CATALOG.forEach((action) => {
      if (!action || !Array.isArray(action.requiredCapabilities)) return;
      
      action.requiredCapabilities.forEach(cap => {
        if (CAPABILITY_DETECTORS[cap]) {
          capabilities.add(cap);
        }
      });
    });
    
    return Array.from(capabilities);
  }, []);

  const discoverActions = useCallback(async () => {
    setIsScanning(true);
    
    try {
      if (!ACTION_CATALOG || !Array.isArray(ACTION_CATALOG) || ACTION_CATALOG.length === 0) {
        return [];
      }
      
      // Get capabilities
      const allCaps = getAllRequiredCapabilities();
      const capabilities = {};
      for (const cap of allCaps) {
        capabilities[cap] = { supported: true };
      }
      
      // Map actions from catalog
      const discoveredActions = ACTION_CATALOG.map(action => ({
        id: action.id,
        name: action.name,
        description: action.description,
        category: action.category,
        icon: action.icon,
        color: action.color,
        parameters: action.parameters || {},
        platformSupport: action.platformSupport || ['android', 'ios'],
        supported: true,
        metadata: {
          discoveredAt: Date.now(),
          platform: Platform.OS
        }
      }));
      
      // Dispatch discovered actions
      dispatch(addDiscoveredActions({
        actions: discoveredActions,
        systemInfo: {
          platform: Platform.OS,
          scanType: 'initial'
        }
      }));
      
      // Dispatch system capabilities
      const systemCapabilities = {};
      Object.keys(capabilities).forEach(key => {
        systemCapabilities[key] = true;
      });
      
      dispatch(updateSystemCapabilities({
        capabilities: systemCapabilities,
        timestamp: Date.now()
      }));
      
      return discoveredActions;
      
    } catch (error) {
      console.error('Action discovery failed:', error);
      return [];
    } finally {
      setIsScanning(false);
    }
  }, [getAllRequiredCapabilities, dispatch]);

  return {
    discoverActions,
    isScanning
  };
};

export default useActionDiscovery;