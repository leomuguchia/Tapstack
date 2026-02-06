// src/services/actions/index.js
import { communicationActions } from './communication';
import { systemActions } from './system';
import { productivityActions } from './productivity';
import { automationActions } from './automation';
import { hardwareActions } from './hardware';
import { mediaActions } from './media';

// Registry of all available actions
export const actionRegistry = {
  // Communication Actions
  'sms_send': communicationActions.executeSMS,
  'call_make': communicationActions.executeCall,
  'email_send': communicationActions.executeEmail,
  
  // System Actions
  'clipboard_copy': systemActions.executeClipboardCopy,
  'share_content': systemActions.executeShare,
  'vibrate': systemActions.executeVibrate,
  'show_notification': systemActions.executeShowNotification,
  
  // Productivity Actions
  'url_open': productivityActions.executeURLOpen,
  'open_url': productivityActions.executeURLOpen, // Alias
  'maps_open': productivityActions.executeMapsOpen,
  
  // Automation Actions
  'http_request': automationActions.executeHTTPRequest,
  'storage_set': automationActions.executeStorageSet,
  'storage_get': automationActions.executeStorageGet,
  
  // Hardware Actions (simulated for now)
  'wifi_toggle': hardwareActions.executeWifiToggle,
  'do_not_disturb_toggle': hardwareActions.executeDoNotDisturbToggle,
  
  // Media Actions (simulated for now)
  'media_play': mediaActions.executeMediaPlay,
  'media_pause': mediaActions.executeMediaPause
};

// Action metadata for display purposes
export const actionMetadata = {
  'sms_send': { name: 'Send SMS', category: 'COMMUNICATION' },
  'call_make': { name: 'Make Call', category: 'COMMUNICATION' },
  'email_send': { name: 'Send Email', category: 'COMMUNICATION' },
  'clipboard_copy': { name: 'Copy to Clipboard', category: 'SYSTEM' },
  'share_content': { name: 'Share Content', category: 'SYSTEM' },
  'vibrate': { name: 'Vibrate Device', category: 'SYSTEM' },
  'show_notification': { name: 'Show Notification', category: 'SYSTEM' },
  'url_open': { name: 'Open Website', category: 'PRODUCTIVITY' },
  'open_url': { name: 'Open Website', category: 'PRODUCTIVITY' },
  'maps_open': { name: 'Open Maps', category: 'PRODUCTIVITY' },
  'http_request': { name: 'HTTP Request', category: 'AUTOMATION' },
  'storage_set': { name: 'Set Storage', category: 'AUTOMATION' },
  'storage_get': { name: 'Get Storage', category: 'AUTOMATION' },
  'wifi_toggle': { name: 'Toggle WiFi', category: 'HARDWARE' },
  'do_not_disturb_toggle': { name: 'Toggle Do Not Disturb', category: 'HARDWARE' },
  'media_play': { name: 'Play Media', category: 'MEDIA' },
  'media_pause': { name: 'Pause Media', category: 'MEDIA' }
};