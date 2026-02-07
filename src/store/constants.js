// src/store/constants/actionCatalog.js
import { generateId } from '../utils/idGen';
import { createQuickActionObject } from './utils';

export const ACTION_CATEGORIES = {
  DEVICE: 'DEVICE',
  MEDIA: 'MEDIA', 
  COMMUNICATION: 'COMMUNICATION',
  PRODUCTIVITY: 'PRODUCTIVITY',
  NAVIGATION: 'NAVIGATION',
  SYSTEM: 'SYSTEM'
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
    platformSupport: ['android', 'ios'],
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
  {
  id: 'camera_open',
  title: 'Open Camera',
  description: 'Quick camera access',
  icon: 'camera',
  color: '#5856D6',
  appName: 'Camera',
  category: 'media',
  actionType: 'deep_link',
  config: {
    deepLink: 'camera://',
    parameters: []
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
    platformSupport: ['android', 'ios'],
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
    platformSupport: ['android', 'ios'],
    parameters: {}
  },

  // ==================== COMMUNICATION ACTIONS ====================
  {
    id: 'open_email',
    name: 'Open Email',
    description: 'Open email composer',
    category: ACTION_CATEGORIES.COMMUNICATION,
    icon: 'email',
    color: '#EA4335',
    requiredCapabilities: ['email_api'],
    platformSupport: ['android', 'ios'],
    parameters: {
      to: {
        type: 'string',
        required: false,
        placeholder: 'recipient@example.com',
        description: 'Recipient email'
      }
    }
  },
  {
    id: 'share_content',
    name: 'Share',
    description: 'Share content with apps',
    category: ACTION_CATEGORIES.COMMUNICATION,
    icon: 'share-variant',
    color: '#8B5CF6',
    requiredCapabilities: ['share_api'],
    platformSupport: ['android', 'ios'],
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
  {
    id: 'open_maps',
    name: 'Open Maps',
    description: 'Open maps with destination',
    category: ACTION_CATEGORIES.NAVIGATION,
    icon: 'map',
    color: '#34A853',
    requiredCapabilities: ['maps_api'],
    platformSupport: ['android', 'ios'],
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
  {
    id: 'clipboard_copy',
    name: 'Copy to Clipboard',
    description: 'Copy text to clipboard',
    category: ACTION_CATEGORIES.PRODUCTIVITY,
    icon: 'content-copy',
    color: '#6B7280',
    requiredCapabilities: ['clipboard_api'],
    platformSupport: ['android', 'ios'],
    parameters: {
      text: {
        type: 'string',
        required: true,
        placeholder: 'Text to copy',
        description: 'Text to copy'
      }
    }
  },
  {
    id: 'open_url',
    name: 'Open Website',
    description: 'Open a URL in browser',
    category: ACTION_CATEGORIES.PRODUCTIVITY,
    icon: 'web',
    color: '#3B82F6',
    requiredCapabilities: ['url_open_api'],
    platformSupport: ['android', 'ios'],
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
  {
    id: 'open_app',
    name: 'Open App',
    description: 'Open an installed app',
    category: ACTION_CATEGORIES.PRODUCTIVITY,
    icon: 'application',
    color: '#F97316',
    requiredCapabilities: ['deeplink_api'],
    platformSupport: ['android', 'ios'],
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
  {
    id: 'delay',
    name: 'Delay',
    description: 'Wait before next action',
    category: ACTION_CATEGORIES.SYSTEM,
    icon: 'clock',
    color: '#6B7280',
    requiredCapabilities: [],
    platformSupport: ['android', 'ios'],
    parameters: {
      seconds: {
        type: 'number',
        default: 2,
        min: 1,
        max: 60,
        description: 'Seconds to wait'
      }
    }
  }
];

export default ACTION_CATALOG;

// ==================== COMMON APP ACTIONS TEMPLATES ====================
export const COMMON_APP_ACTIONS = [
  {
    id: 'maps_navigation',
    title: 'Navigate',
    description: 'Open Maps with destination',
    icon: 'navigate',
    color: '#34A853',
    appName: 'Google Maps',
    category: 'navigation',
    actionType: 'deep_link',
    config: {
      deepLink: 'google.navigation:q={destination}',
      parameters: [
        {
          name: 'destination',
          type: 'text',
          label: 'Destination',
          required: true,
          placeholder: 'Enter address or place'
        }
      ]
    }
  },
  {
    id: 'maps_directions',
    title: 'Directions',
    description: 'Get directions between two points',
    icon: 'map',
    color: '#4285F4',
    appName: 'Google Maps',
    category: 'navigation',
    actionType: 'deep_link',
    config: {
      deepLink: 'https://www.google.com/maps/dir/{origin}/{destination}',
      parameters: [
        {
          name: 'origin',
          type: 'text',
          label: 'From',
          required: false,
          placeholder: 'Starting point (optional)'
        },
        {
          name: 'destination',
          type: 'text',
          label: 'To',
          required: true,
          placeholder: 'Destination'
        }
      ]
    }
  },
  {
    id: 'whatsapp_new_chat',
    title: 'New Chat',
    description: 'Start new WhatsApp chat',
    icon: 'chatbubble',
    color: '#25D366',
    appName: 'WhatsApp',
    category: 'communication',
    actionType: 'deep_link',
    config: {
      deepLink: 'https://wa.me/{phoneNumber}?text={message}',
      parameters: [
        {
          name: 'phoneNumber',
          type: 'text',
          label: 'Phone Number',
          required: true,
          placeholder: 'e.g., 1234567890'
        },
        {
          name: 'message',
          type: 'text',
          label: 'Message',
          required: false,
          placeholder: 'Hi there! (optional)'
        }
      ]
    }
  },
  {
    id: 'whatsapp_call',
    title: 'WhatsApp Call',
    description: 'Call via WhatsApp',
    icon: 'phone-dial',
    color: '#075E54',
    appName: 'WhatsApp',
    category: 'communication',
    actionType: 'deep_link',
    config: {
      deepLink: 'https://wa.me/{phoneNumber}?text=Call',
      parameters: [
        {
          name: 'phoneNumber',
          type: 'text',
          label: 'Phone Number',
          required: true,
          placeholder: 'e.g., 1234567890'
        }
      ]
    }
  },
  {
    id: 'instagram_story',
    title: 'Create Story',
    description: 'Open Instagram story camera',
    icon: 'camera',
    color: '#E4405F',
    appName: 'Instagram',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'instagram://story-camera',
      parameters: []
    }
  },
  {
    id: 'instagram_post',
    title: 'Create Post',
    description: 'Open Instagram post creator',
    icon: 'image',
    color: '#E1306C',
    appName: 'Instagram',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'instagram://create',
      parameters: []
    }
  },
  {
    id: 'phone_call',
    title: 'Make Call',
    description: 'Make a phone call',
    icon: 'call',
    color: '#25D366',
    appName: 'Phone',
    category: 'communication',
    actionType: 'deep_link',
    config: {
      deepLink: 'tel:{phoneNumber}',
      parameters: [
        {
          name: 'phoneNumber',
          type: 'text',
          label: 'Phone Number',
          required: true,
          placeholder: 'e.g., 1234567890'
        }
      ]
    }
  },
  {
    id: 'sms_send',
    title: 'Send SMS',
    description: 'Send text message',
    icon: 'chatbox',
    color: '#34B7F1',
    appName: 'Messages',
    category: 'communication',
    actionType: 'deep_link',
    config: {
      deepLink: 'sms:{phoneNumber}?body={message}',
      parameters: [
        {
          name: 'phoneNumber',
          type: 'text',
          label: 'Phone Number',
          required: true,
          placeholder: 'e.g., 1234567890'
        },
        {
          name: 'message',
          type: 'text',
          label: 'Message',
          required: true,
          placeholder: 'Type your message'
        }
      ]
    }
  },
  {
    id: 'email_compose',
    title: 'Compose Email',
    description: 'Open email composer',
    icon: 'mail',
    color: '#EA4335',
    appName: 'Gmail',
    category: 'communication',
    actionType: 'deep_link',
    config: {
      deepLink: 'mailto:{to}?subject={subject}&body={body}',
      parameters: [
        {
          name: 'to',
          type: 'text',
          label: 'To',
          required: true,
          placeholder: 'recipient@example.com'
        },
        {
          name: 'subject',
          type: 'text',
          label: 'Subject',
          required: false,
          placeholder: 'Email subject (optional)'
        },
        {
          name: 'body',
          type: 'text',
          label: 'Body',
          required: false,
          placeholder: 'Email body (optional)'
        }
      ]
    }
  },
  {
    id: 'camera_open',
    title: 'Open Camera',
    description: 'Quick camera access',
    icon: 'camera',
    color: '#5856D6',
    appName: 'Camera',
    category: 'media',
    actionType: 'deep_link',
    config: {
      deepLink: 'camera:',
      parameters: []
    }
  },
  {
    id: 'notes_new',
    title: 'New Note',
    description: 'Create a quick note',
    icon: 'document-text',
    color: '#FF9500',
    appName: 'Notes',
    category: 'productivity',
    actionType: 'deep_link',
    config: {
      deepLink: 'notes:create',
      parameters: [
        {
          name: 'title',
          type: 'text',
          label: 'Title',
          required: false,
          placeholder: 'Note title (optional)'
        },
        {
          name: 'content',
          type: 'text',
          label: 'Content',
          required: false,
          placeholder: 'Note content (optional)'
        }
      ]
    }
  },
  {
    id: 'calendar_event',
    title: 'Add Event',
    description: 'Create calendar event',
    icon: 'calendar',
    color: '#FF2D55',
    appName: 'Calendar',
    category: 'productivity',
    actionType: 'deep_link',
    config: {
      deepLink: 'calshow:',
      parameters: [
        {
          name: 'title',
          type: 'text',
          label: 'Event Title',
          required: true,
          placeholder: 'Meeting, Appointment, etc.'
        },
        {
          name: 'date',
          type: 'date',
          label: 'Date',
          required: false,
          placeholder: 'Select date (optional)'
        }
      ]
    }
  },
  {
    id: 'spotify_play',
    title: 'Play Music',
    description: 'Play on Spotify',
    icon: 'musical-notes',
    color: '#1DB954',
    appName: 'Spotify',
    category: 'media',
    actionType: 'deep_link',
    config: {
      deepLink: 'spotify:play',
      parameters: [
        {
          name: 'playlist',
          type: 'text',
          label: 'Playlist/Album',
          required: false,
          placeholder: 'Search (optional)'
        }
      ]
    }
  },
  // ==================== BLOOMIFY APP ACTIONS ====================
  {
    id: 'bloomify_open',
    title: 'Open Bloomify',
    description: 'Open Bloomify app',
    icon: 'flower',
    color: '#23aa01', 
    appName: 'Bloomify',
    category: 'productivity',
    actionType: 'deep_link',
    config: {
      deepLink: 'bloomify://',
      parameters: []
    }
  },
  {
    id: 'bloomify_provider',
    title: 'Bloomify Provider',
    description: 'Open specific provider in Bloomify',
    icon: 'business',
    color: '#23aa01',
    appName: 'Bloomify',
    category: 'productivity',
    actionType: 'deep_link',
    config: {
      deepLink: 'bloomify://provider/{providerID}',
      parameters: [
        {
          name: 'providerID',
          type: 'text',
          label: 'Provider ID',
          required: true,
          placeholder: 'Enter provider ID'
        }
      ]
    }
  },
  {
    id: 'bloomify_dashboard',
    title: 'Bloomify Dashboard',
    description: 'Open Bloomify dashboard',
    icon: 'grid',
    color: '#23aa01',
    appName: 'Bloomify',
    category: 'productivity',
    actionType: 'deep_link',
    config: {
      deepLink: 'bloomify://dashboard',
      parameters: []
    }
  },
  {
    id: 'snapchat_create_snap',
    title: 'Create Snap',
    description: 'Open Snapchat camera to create a snap',
    icon: 'camera',
    color: '#FFFC00',
    appName: 'Snapchat',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'snapchat://camera',
      parameters: []
    }
  },
  {
    id: 'snapchat_add_friend',
    title: 'Add Friend',
    description: 'Add friend on Snapchat',
    icon: 'person-add',
    color: '#FFFC00',
    appName: 'Snapchat',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'snapchat://add/{username}',
      parameters: [
        {
          name: 'username',
          type: 'text',
          label: 'Snapchat Username',
          required: true,
          placeholder: 'Enter Snapchat username'
        }
      ]
    }
  },
  {
    id: 'facebook_create_post',
    title: 'Create Post',
    description: 'Open Facebook post composer',
    icon: 'logo-facebook',
    color: '#1877F2',
    appName: 'Facebook',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'fb://composer',
      parameters: [
        {
          name: 'text',
          type: 'text',
          label: 'Post Text',
          required: false,
          placeholder: 'What\'s on your mind? (optional)'
        }
      ]
    }
  },
  {
    id: 'facebook_open',
    title: 'Open Facebook',
    description: 'Open Facebook app',
    icon: 'logo-facebook',
    color: '#1877F2',
    appName: 'Facebook',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'fb://',
      parameters: []
    }
  },
  {
    id: 'x_create_tweet',
    title: 'Create Post',
    description: 'Create a new post on X (Twitter)',
    icon: 'logo-twitter',
    color: '#000000',
    appName: 'X',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'twitter://compose?text={text}',
      parameters: [
        {
          name: 'text',
          type: 'text',
          label: 'Post Text',
          required: false,
          placeholder: 'What\'s happening? (optional)'
        }
      ]
    }
  },
  {
    id: 'x_search',
    title: 'Search X',
    description: 'Search on X (Twitter)',
    icon: 'search',
    color: '#000000',
    appName: 'X',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'twitter://search?query={query}',
      parameters: [
        {
          name: 'query',
          type: 'text',
          label: 'Search Query',
          required: true,
          placeholder: 'Search X/Twitter'
        }
      ]
    }
  },
  {
    id: 'x_profile',
    title: 'Open X Profile',
    description: 'Open profile on X (Twitter)',
    icon: 'person',
    color: '#000000',
    appName: 'X',
    category: 'social',
    actionType: 'deep_link',
    config: {
      deepLink: 'twitter://user?screen_name={username}',
      parameters: [
        {
          name: 'username',
          type: 'text',
          label: 'Username',
          required: true,
          placeholder: 'Enter X/Twitter username'
        }
      ]
    }
  },
  {
  id: 'tiktok_create',
  title: 'Create Video',
  description: 'Open TikTok camera to create a video',
  icon: 'play-circle',
  color: '#000000',
  appName: 'TikTok',
  category: 'social',
  actionType: 'deep_link',
  config: {
    deepLink: 'tiktok://create',
    parameters: []
  }
  },
  {
  id: 'tiktok_profile',
  title: 'Open Profile',
  description: 'Open profile on TikTok',
  icon: 'person',
  color: '#25F4EE',
  appName: 'TikTok',
  category: 'social',
  actionType: 'deep_link',
  config: {
    deepLink: 'tiktok://user/{username}',
    parameters: [
    {
      name: 'username',
      type: 'text',
      label: 'Username',
      required: true,
      placeholder: 'Enter TikTok username'
    }
    ]
  }
  },
  {
  id: 'pinterest_create_pin',
  title: 'Create Pin',
  description: 'Create a new pin on Pinterest',
  icon: 'image',
  color: '#E60023',
  appName: 'Pinterest',
  category: 'social',
  actionType: 'deep_link',
  config: {
    deepLink: 'pinterest://create',
    parameters: [
    {
      name: 'description',
      type: 'text',
      label: 'Description',
      required: false,
      placeholder: 'Pin description (optional)'
    }
    ]
  }
  }
];