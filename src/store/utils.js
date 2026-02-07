import { generateId } from '../utils/idGen';

export const createShortcutObject = (data, isDefault = false) => ({
  id: data.id || generateId('short'),
  name: data.name,
  description: data.description || '',
  icon: data.icon || 'cube',
  color: data.color || '#3B82F6',
  category: data.category || 'general',
  tags: data.tags || [],
  isDefault,
  enabled: data.enabled !== undefined ? data.enabled : true,
  hidden: data.hidden || false,
  trigger: data.trigger || {
    type: SHORTCUT_TRIGGERS.MANUAL,
    parameters: {}
  },
  actions: data.actions || [],
  metadata: {
    createdAt: data.metadata?.createdAt || Date.now(),
    updatedAt: Date.now(),
    runCount: data.metadata?.runCount || 0,
    lastRun: data.metadata?.lastRun || null,
    favorite: data.metadata?.favorite || false
  }
});

// Helper function to create a quick action object
export const createQuickActionObject = ({
  actionId,
  name,
  description,
  icon,
  color,
  appName,
  category,
  actionType,
  config,
  parameters = {},
  metadata = {},
  isDefault = false
}) => {
  return {
    id: generateId('quick'),
    actionId,
    name,
    description,
    icon,
    color,
    appName,
    category,
    actionType,
    config,
    parameters,
    metadata: {
      createdAt: Date.now(),
      updatedAt: Date.now(),
      runCount: 0,
      lastRun: null,
      favorite: false,
      hidden: false,
      ...metadata
    },
    isDefault
  };
};

// Helper function to build URL from action and parameters
export const buildActionUrl = (action, parameters) => {
  if (!action.config || !action.config.deepLink) {
    return null;
  }
  
  let url = action.config.deepLink;
  
  if (parameters && action.config.parameters && action.config.parameters.length > 0) {
    Object.entries(parameters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url = url.replace(`{${key}}`, encodeURIComponent(value));
      }
    });
  }
  
  // Clean up any remaining placeholders
  return url.replace(/\{[^}]+\}/g, '');
};

// Helper function for recent list
export const addToRecentList = (list, itemId, maxLength = 10) => {
  const filtered = list.filter(id => id !== itemId);
  const updated = [itemId, ...filtered];
  return updated.slice(0, maxLength);
};

// Shortcut trigger types
export const SHORTCUT_TRIGGERS = {
  MANUAL: 'manual',
  SCHEDULED: 'scheduled',
  DEVICE_EVENT: 'device_event',
  APP_LAUNCH: 'app_launch'
};