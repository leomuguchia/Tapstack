// store/slices/quickActionsSlice.js
import { createSlice, createSelector } from '@reduxjs/toolkit';
import { createSelector as createReselectSelector } from 'reselect';
import { generateId } from '../utils/idGen';

// Common app actions that users can add
const COMMON_APP_ACTIONS = [
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
  }
];

const initialState = {
  // Pre-defined app actions that users can choose from
  availableAppActions: COMMON_APP_ACTIONS,
  
  // User's configured quick actions
  userQuickActions: [],
  
  // Recently used quick actions
  recentQuickActions: [],
  
  status: 'idle',
  error: null
};

const quickActionsSlice = createSlice({
  name: 'quickActions',
  initialState,
  reducers: {
    // Add a new quick action with user configuration
    addQuickAction: (state, action) => {
      const { actionId, name, icon, color, parameters } = action.payload;
      
      // Find the base action template
      const baseAction = state.availableAppActions.find(a => a.id === actionId);
      
      if (!baseAction) {
        console.error(`Action template not found: ${actionId}`);
        return;
      }
      
      const newQuickAction = {
        id: generateId('quick'),
        actionId,
        name: name || baseAction.title,
        description: baseAction.description,
        icon: icon || baseAction.icon,
        color: color || baseAction.color,
        appName: baseAction.appName,
        category: baseAction.category,
        actionType: baseAction.actionType,
        parameters: parameters || {},
        config: baseAction.config,
        metadata: {
          createdAt: Date.now(),
          updatedAt: Date.now(),
          runCount: 0,
          lastRun: null,
          favorite: false
        }
      };
      
      state.userQuickActions.push(newQuickAction);
    },
    
    // Update quick action
    updateQuickAction: (state, action) => {
      const { id, updates } = action.payload;
      const actionIndex = state.userQuickActions.findIndex(a => a.id === id);
      
      if (actionIndex >= 0) {
        state.userQuickActions[actionIndex] = {
          ...state.userQuickActions[actionIndex],
          ...updates,
          metadata: {
            ...state.userQuickActions[actionIndex].metadata,
            updatedAt: Date.now()
          }
        };
      }
    },
    
    // Delete quick action
    deleteQuickAction: (state, action) => {
      const id = action.payload;
      state.userQuickActions = state.userQuickActions.filter(a => a.id !== id);
      state.recentQuickActions = state.recentQuickActions.filter(a => a !== id);
    },
    
    // Record quick action usage
    recordQuickActionRun: (state, action) => {
      const id = action.payload;
      const actionIndex = state.userQuickActions.findIndex(a => a.id === id);
      
      if (actionIndex >= 0) {
        const quickAction = state.userQuickActions[actionIndex];
        quickAction.metadata.runCount += 1;
        quickAction.metadata.lastRun = Date.now();
        quickAction.metadata.updatedAt = Date.now();
        
        // Add to recent
        state.recentQuickActions = state.recentQuickActions.filter(a => a !== id);
        state.recentQuickActions.unshift(id);
        
        // Keep recent list manageable
        if (state.recentQuickActions.length > 10) {
          state.recentQuickActions.pop();
        }
      }
    },
    
    // Toggle favorite
    toggleQuickActionFavorite: (state, action) => {
      const id = action.payload;
      const actionIndex = state.userQuickActions.findIndex(a => a.id === id);
      
      if (actionIndex >= 0) {
        state.userQuickActions[actionIndex].metadata.favorite = 
          !state.userQuickActions[actionIndex].metadata.favorite;
      }
    },
    
    // Reorder quick actions
    reorderQuickActions: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      const [removed] = state.userQuickActions.splice(fromIndex, 1);
      state.userQuickActions.splice(toIndex, 0, removed);
    },
    
    // Reset quick actions
    resetQuickActions: (state) => {
      state.userQuickActions = [];
      state.recentQuickActions = [];
    }
  }
});

// ==================== SELECTORS ====================

const selectQuickActionsRoot = (state) => state.quickActions;

// Basic selectors
export const selectAvailableAppActions = createReselectSelector(
  [selectQuickActionsRoot],
  (quickActions) => quickActions.availableAppActions
);

export const selectUserQuickActions = createReselectSelector(
  [selectQuickActionsRoot],
  (quickActions) => quickActions.userQuickActions
);

export const selectRecentQuickActionIds = createReselectSelector(
  [selectQuickActionsRoot],
  (quickActions) => quickActions.recentQuickActions
);

// Derived selectors
export const selectQuickActionById = createReselectSelector(
  [selectUserQuickActions, (_, actionId) => actionId],
  (userQuickActions, actionId) => 
    userQuickActions.find(action => action.id === actionId)
);

export const selectFavoriteQuickActions = createReselectSelector(
  [selectUserQuickActions],
  (userQuickActions) => 
    userQuickActions.filter(action => action.metadata.favorite)
);

export const selectQuickActionsByCategory = createReselectSelector(
  [selectUserQuickActions, (_, category) => category],
  (userQuickActions, category) => 
    userQuickActions.filter(action => action.category === category)
);

export const selectRecentQuickActions = createReselectSelector(
  [selectUserQuickActions, selectRecentQuickActionIds],
  (userQuickActions, recentIds) => {
    const actionMap = {};
    userQuickActions.forEach(action => {
      actionMap[action.id] = action;
    });
    
    return recentIds
      .map(id => actionMap[id])
      .filter(Boolean);
  }
);

export const selectAvailableActionsByCategory = createReselectSelector(
  [selectAvailableAppActions],
  (availableActions) => {
    const grouped = {};
    availableActions.forEach(action => {
      if (!grouped[action.category]) {
        grouped[action.category] = [];
      }
      grouped[action.category].push(action);
    });
    return grouped;
  }
);

export const {
  addQuickAction,
  updateQuickAction,
  deleteQuickAction,
  recordQuickActionRun,
  toggleQuickActionFavorite,
  reorderQuickActions,
  resetQuickActions
} = quickActionsSlice.actions;

export default quickActionsSlice.reducer;