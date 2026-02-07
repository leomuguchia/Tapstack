// src/services/actions/index.js
import { systemActions } from './system';
import { productivityActions } from './productivity';
import { automationActions } from './automation';
import { hardwareActions } from './hardware';
import { mediaActions } from './media';
import { deviceActions } from './device';
import { navigationActions } from './navigation';
import { communicationActions } from './communication'; 

export const actionRegistry = {
  // ==================== DEVICE ACTIONS ====================
  'vibrate': systemActions.executeVibrate,
  'open_camera': deviceActions.executeOpenCamera,
  
  // ==================== MEDIA ACTIONS ====================
  'media_play': mediaActions.executeMediaPlay,
  'media_pause': mediaActions.executeMediaPause,
  
  // ==================== COMMUNICATION ACTIONS ====================
  'open_email': communicationActions.executeEmail, 
  'share_content': communicationActions.executeShare, 
  
  // ==================== NAVIGATION ACTIONS ====================
  'open_maps': navigationActions.executeOpenMaps,
  
  // ==================== PRODUCTIVITY ACTIONS ====================
  'clipboard_copy': systemActions.executeClipboardCopy,
  'open_url': productivityActions.executeURLOpen,
  'open_app': productivityActions.executeOpenApp,
  
  // ==================== SYSTEM ACTIONS ====================
  'delay': systemActions.executeDelay,
  
  // ==================== EXISTING SAFE ACTIONS ====================
  'show_notification': systemActions.executeShowNotification,
  'http_request': automationActions.executeHTTPRequest,
  'storage_set': automationActions.executeStorageSet,
  'storage_get': automationActions.executeStorageGet,
  'wifi_toggle': hardwareActions.executeWifiToggle,
  'do_not_disturb_toggle': hardwareActions.executeDoNotDisturbToggle,
};

// Action metadata for display purposes
export const actionMetadata = {
  // ==================== DEVICE ACTIONS ====================
  'vibrate': { 
    name: 'Vibrate', 
    category: 'DEVICE',
    parameters: {
      duration: {
        type: 'number',
        default: 500,
        min: 100,
        max: 2000,
        description: 'Duration in milliseconds'
      }
    }
  },
  'open_camera': { 
    name: 'Open Camera', 
    category: 'DEVICE',
    parameters: {}
  },
  
  // ==================== MEDIA ACTIONS ====================
  'media_play': { 
    name: 'Play Media', 
    category: 'MEDIA',
    parameters: {}
  },
  'media_pause': { 
    name: 'Pause Media', 
    category: 'MEDIA',
    parameters: {}
  },
  
  // ==================== COMMUNICATION ACTIONS ====================
  'open_email': { 
    name: 'Open Email', 
    category: 'COMMUNICATION',
    parameters: {
      to: {
        type: 'string',
        required: false,
        placeholder: 'recipient@example.com',
        description: 'Recipient email'
      }
    }
  },
  'share_content': { 
    name: 'Share', 
    category: 'COMMUNICATION',
    parameters: {
      message: { 
        type: 'string', 
        required: false,
        placeholder: 'Share message',
        description: 'Message to share'
      }
    }
  },
  
  // ==================== NAVIGATION ACTIONS ====================
  'open_maps': { 
    name: 'Open Maps', 
    category: 'NAVIGATION',
    parameters: {
      destination: {
        type: 'string',
        required: false,
        placeholder: 'Address or place',
        description: 'Destination address'
      }
    }
  },
  
  // ==================== PRODUCTIVITY ACTIONS ====================
  'clipboard_copy': { 
    name: 'Copy to Clipboard', 
    category: 'PRODUCTIVITY',
    parameters: {
      text: {
        type: 'string',
        required: true,
        placeholder: 'Text to copy',
        description: 'Text to copy'
      }
    }
  },
  'open_url': { 
    name: 'Open Website', 
    category: 'PRODUCTIVITY',
    parameters: {
      url: {
        type: 'string',
        required: true,
        default: 'https://',
        placeholder: 'https://example.com',
        description: 'URL to open'
      }
    }
  },
  'open_app': { 
    name: 'Open App', 
    category: 'PRODUCTIVITY',
    parameters: {
      deeplink: {
        type: 'string',
        required: true,
        placeholder: 'instagram:// or spotify:',
        description: 'App deeplink'
      }
    }
  },
  
  // ==================== SYSTEM ACTIONS ====================
  'delay': { 
    name: 'Delay', 
    category: 'SYSTEM',
    parameters: {
      seconds: {
        type: 'number',
        default: 2,
        min: 1,
        max: 60,
        description: 'Seconds to wait'
      }
    }
  },
  
  // ==================== OTHER SAFE ACTIONS ====================
  'show_notification': { 
    name: 'Show Notification', 
    category: 'SYSTEM',
    parameters: {
      title: {
        type: 'string',
        required: true,
        description: 'Notification title'
      },
      message: {
        type: 'string',
        required: true,
        description: 'Notification message'
      }
    }
  },
  'http_request': { 
    name: 'HTTP Request', 
    category: 'AUTOMATION',
    parameters: {
      url: {
        type: 'string',
        required: true,
        description: 'Request URL'
      },
      method: {
        type: 'string',
        default: 'GET',
        options: ['GET', 'POST', 'PUT', 'DELETE'],
        description: 'HTTP method'
      }
    }
  },
  'storage_set': { 
    name: 'Set Storage', 
    category: 'AUTOMATION',
    parameters: {
      key: {
        type: 'string',
        required: true,
        description: 'Storage key'
      },
      value: {
        type: 'string',
        required: true,
        description: 'Value to store'
      }
    }
  },
  'storage_get': { 
    name: 'Get Storage', 
    category: 'AUTOMATION',
    parameters: {
      key: {
        type: 'string',
        required: true,
        description: 'Storage key'
      }
    }
  },
  'wifi_toggle': { 
    name: 'Toggle WiFi', 
    category: 'HARDWARE',
    parameters: {
      state: {
        type: 'string',
        default: 'toggle',
        options: ['on', 'off', 'toggle'],
        description: 'WiFi state'
      }
    }
  },
  'do_not_disturb_toggle': { 
    name: 'Toggle Do Not Disturb', 
    category: 'HARDWARE',
    parameters: {
      state: {
        type: 'string',
        default: 'toggle',
        options: ['on', 'off', 'toggle'],
        description: 'Do Not Disturb state'
      }
    }
  }
};