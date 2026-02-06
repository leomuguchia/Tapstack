
// Shortcut trigger types
export const SHORTCUT_TRIGGERS = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled',
  DEVICE_EVENT: 'device_event',
  APP_LAUNCH: 'app_launch'
};

// src/store/constants/actionCatalog.js
export const ACTION_CATEGORIES = {
  DEVICE: 'DEVICE',
  MEDIA: 'MEDIA',
  COMMUNICATION: 'COMMUNICATION',
  SYSTEM: 'SYSTEM',
  PRODUCTIVITY: 'PRODUCTIVITY'
};

const ACTION_CATALOG = [
  // ==================== DEVICE ACTIONS ====================
  {
    id: 'vibrate',
    name: 'Vibrate',
    description: 'Make device vibrate',
    category: ACTION_CATEGORIES.DEVICE,
    icon: 'vibrate',
    color: '#EC4899',
    requiredCapabilities: ['vibration_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      duration: {
        type: 'number',
        default: 500,
        description: 'Duration in milliseconds'
      }
    }
  },
  {
    id: 'take_photo',
    name: 'Take Photo',
    description: 'Capture a photo using the camera',
    category: ACTION_CATEGORIES.DEVICE,
    icon: 'camera',
    color: '#F59E0B',
    requiredCapabilities: ['camera_api'],
    platformSupport: ['ios', 'android'],
    parameters: {}
  },
  {
    id: 'adjust_brightness',
    name: 'Adjust Brightness',
    description: 'Change screen brightness',
    category: ACTION_CATEGORIES.DEVICE,
    icon: 'brightness-6',
    color: '#FBBF24',
    requiredCapabilities: ['media_control_api'], // placeholder, real control may need native module
    platformSupport: ['ios', 'android'],
    parameters: {
      level: {
        type: 'number',
        default: 50,
        description: 'Brightness level (0-100)'
      }
    }
  },
  {
    id: 'adjust_volume',
    name: 'Adjust Volume',
    description: 'Change device volume',
    category: ACTION_CATEGORIES.DEVICE,
    icon: 'volume-high',
    color: '#3B82F6',
    requiredCapabilities: ['media_control_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      level: {
        type: 'number',
        default: 50,
        description: 'Volume level (0-100)'
      }
    }
  },

  // ==================== COMMUNICATION ACTIONS ====================
  {
    id: 'call_make',
    name: 'Make Call',
    description: 'Place a phone call',
    category: ACTION_CATEGORIES.COMMUNICATION,
    icon: 'phone',
    color: '#10B981',
    requiredCapabilities: ['telephony_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      phoneNumber: {
        type: 'string',
        required: true,
        description: 'Phone number to call'
      }
    }
  },
  {
    id: 'sms_send',
    name: 'Send SMS',
    description: 'Send a text message',
    category: ACTION_CATEGORIES.COMMUNICATION,
    icon: 'message-text',
    color: '#06B6D4',
    requiredCapabilities: ['sms_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      phoneNumber: {
        type: 'string',
        required: true,
        description: 'Recipient phone number'
      },
      message: {
        type: 'string',
        default: '',
        description: 'Message text'
      }
    }
  },
  {
    id: 'email_send',
    name: 'Send Email',
    description: 'Compose and send email',
    category: ACTION_CATEGORIES.COMMUNICATION,
    icon: 'email',
    color: '#EC4899',
    requiredCapabilities: ['email_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      to: {
        type: 'string',
        required: true,
        description: 'Recipient email address'
      },
      subject: {
        type: 'string',
        default: ''
      },
      body: {
        type: 'string',
        default: ''
      }
    }
  },
  {
    id: 'share_content',
    name: 'Share',
    description: 'Share content with apps',
    category: ACTION_CATEGORIES.SYSTEM,
    icon: 'share-variant',
    color: '#8B5CF6',
    requiredCapabilities: ['share_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      title: { type: 'string', description: 'Share title' },
      message: { type: 'string', description: 'Share message' },
      url: { type: 'string', description: 'URL to share' }
    }
  },

  // ==================== MEDIA ACTIONS ====================
  {
    id: 'media_play',
    name: 'Play Media',
    description: 'Start media playback',
    category: ACTION_CATEGORIES.MEDIA,
    icon: 'play',
    color: '#10B981',
    requiredCapabilities: ['media_control_api'],
    platformSupport: ['ios', 'android'],
    parameters: {}
  },
  {
    id: 'media_pause',
    name: 'Pause Media',
    description: 'Pause media playback',
    category: ACTION_CATEGORIES.MEDIA,
    icon: 'pause',
    color: '#F59E0B',
    requiredCapabilities: ['media_control_api'],
    platformSupport: ['ios', 'android'],
    parameters: {}
  },

  // ==================== PRODUCTIVITY ACTIONS ====================
  {
    id: 'clipboard_copy',
    name: 'Copy to Clipboard',
    description: 'Copy text to clipboard',
    category: ACTION_CATEGORIES.SYSTEM,
    icon: 'content-copy',
    color: '#6B7280',
    requiredCapabilities: ['clipboard_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      text: {
        type: 'string',
        required: true,
        description: 'Text to copy'
      }
    }
  },
  {
    id: 'url_open',
    name: 'Open Website',
    description: 'Open a URL in the browser',
    category: ACTION_CATEGORIES.PRODUCTIVITY,
    icon: 'web',
    color: '#3B82F6',
    requiredCapabilities: ['fetch_api'],
    platformSupport: ['ios', 'android'],
    parameters: {
      url: {
        type: 'string',
        required: true,
        default: 'https://',
        description: 'URL to open'
      }
    }
  },
  {
    id: 'app_open',
    name: 'Open App',
    description: 'Open an installed app',
    category: ACTION_CATEGORIES.PRODUCTIVITY,
    icon: 'application',
    color: '#F97316',
    requiredCapabilities: ['local_storage_api'], // placeholder: any detection available
    platformSupport: ['ios', 'android'],
    parameters: {
      appId: {
        type: 'string',
        required: true,
        description: 'Bundle ID or package name of the app'
      }
    }
  }
];

export default ACTION_CATALOG;
