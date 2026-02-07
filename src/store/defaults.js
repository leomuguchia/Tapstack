import { createShortcutObject } from './utils';
import { generateId } from '../utils/idGen';
import { createQuickActionObject } from './utils';
import { Platform } from 'react-native';

export const defaultShortcuts = [
  createShortcutObject({
    id: 'shortcut_morning_routine',
    name: 'Morning Routine',
    description: 'Start your day right',
    icon: 'sunny',
    color: '#FF6B35',
    category: 'routine',
    tags: ['morning', 'daily', 'routine'],
    actions: [
      {
        id: 'action_open_news',
        actionId: 'open_url',
        parameters: { url: 'https://news.google.com' },
        delayBefore: 0,
        conditions: []
      },
      {
        id: 'action_play_music',
        actionId: 'media_play',
        parameters: {},
        delayBefore: 1000,
        conditions: []
      }
    ],
    metadata: { favorite: false }
  }, true),

  createShortcutObject({
    id: 'shortcut_work_mode',
    name: 'Work Mode',
    description: 'Enter focus mode',
    icon: 'briefcase',
    color: '#3B82F6',
    category: 'productivity',
    tags: ['work', 'focus', 'productivity'],
    actions: [
      {
        id: 'action_pause_media',
        actionId: 'media_pause',
        parameters: {},
        delayBefore: 0,
        conditions: []
      },
      {
        id: 'action_vibrate_notify',
        actionId: 'vibrate',
        parameters: { duration: 500 },
        delayBefore: 500,
        conditions: []
      },
      {
        id: 'action_open_calendar',
        actionId: 'open_app',
        parameters: { deeplink: Platform === 'android' ? 'calculator' :  'calshow' },
        delayBefore: 1000,
        conditions: []
      }
    ],
    metadata: { favorite: true }
  }, true),

  createShortcutObject({
    id: 'shortcut_bedtime',
    name: 'Bedtime',
    description: 'Wind down for sleep',
    icon: 'moon',
    color: '#8B5CF6',
    category: 'routine',
    tags: ['night', 'sleep', 'routine'],
    actions: [
      {
        id: 'action_pause_media',
        actionId: 'media_pause',
        parameters: {},
        delayBefore: 0,
        conditions: []
      },
      {
        id: 'action_open_netflix',
        actionId: 'open_app',
        parameters: { deeplink: 'netflix://' },
        delayBefore: 1000,
        conditions: []
      },
      {
        id: 'action_vibrate',
        actionId: 'vibrate',
        parameters: { duration: 300 },
        delayBefore: 2000,
        conditions: []
      }
    ],
    metadata: { favorite: false }
  }, true),

  createShortcutObject({
    id: 'shortcut_quick_capture',
    name: 'Quick Capture',
    description: 'Capture and share quickly',
    icon: 'camera',
    color: '#10B981',
    category: 'media',
    tags: ['photo', 'camera', 'share'],
    actions: [
      {
        id: 'action_open_camera',
        actionId: 'open_camera',
        parameters: {},
        delayBefore: 0,
        conditions: []
      },
      {
        id: 'action_delay_for_camera',
        actionId: 'delay',
        parameters: { seconds: 3 },
        delayBefore: 1000,
        conditions: []
      },
      {
        id: 'action_share_photo',
        actionId: 'share_content',
        parameters: { message: 'Check this out!' },
        delayBefore: 1000,
        conditions: []
      }
    ],
    metadata: { favorite: true }
  }, true),

  createShortcutObject({
    id: 'shortcut_commute',
    name: 'Commute',
    description: 'Get ready for your commute',
    icon: 'car',
    color: '#3B82F6',
    category: 'navigation',
    tags: ['travel', 'navigation', 'music'],
    actions: [
      {
        id: 'action_open_maps',
        actionId: 'open_maps',
        parameters: { destination: 'Work' },
        delayBefore: 0,
        conditions: []
      },
      {
        id: 'action_play_music',
        actionId: 'media_play',
        parameters: {},
        delayBefore: 1000,
        conditions: []
      },
      {
        id: 'action_copy_address',
        actionId: 'clipboard_copy',
        parameters: { text: 'Heading to work' },
        delayBefore: 1000,
        conditions: []
      }
    ],
    metadata: { favorite: true }
  }, true)
];

export const DEFAULT_QUICK_ACTIONS = [
  createQuickActionObject({
    id: 'quick_insta_story',
    actionId: 'instagram_story',
    name: 'Instagram Story',
    description: 'Open Instagram story camera instantly',
    icon: 'camera',
    color: '#E4405F',
    appName: 'Instagram',
    category: 'social',
    actionType: 'deep_link',
    deeplink: 'instagram://story-camera',
    config: { 
      deepLink: 'instagram://story-camera',
      parameters: []
    },
    parameters: {},
    metadata: { favorite: true, runCount: 0 }
  }, true),

  createQuickActionObject(
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
  }
  , true),

  createQuickActionObject({
    id: 'quick_navigate_home',
    actionId: 'maps_navigation',
    name: 'Navigate Home',
    description: 'Open Maps to navigate home instantly',
    icon: 'home',
    color: '#34A853',
    appName: 'Google Maps',
    category: 'navigation',
    actionType: 'deep_link',
    deeplink: 'google.navigation:q=Home',
    config: { // ← ADD THIS (match your COMMON_APP_ACTIONS template)
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
    },
    parameters: { destination: 'Home' },
    metadata: { favorite: true, runCount: 0 }
  }, true),

  createQuickActionObject({
    id: 'quick_spotify',
    actionId: 'spotify_play',
    name: 'Play Music',
    description: 'Open Spotify and play instantly',
    icon: 'musical-notes',
    color: '#1DB954',
    appName: 'Spotify',
    category: 'media',
    actionType: 'deep_link',
    deeplink: 'spotify:play',
    config: { // ← ADD THIS (match your COMMON_APP_ACTIONS template)
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
    },
    parameters: {},
    metadata: { favorite: false, runCount: 0 }
  }, true),

  createQuickActionObject(
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
   }, true)
];