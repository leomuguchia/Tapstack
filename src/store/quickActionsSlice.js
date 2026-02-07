// store/slices/quickActionsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { createSelector as createReselectSelector } from 'reselect';
import { createQuickActionObject, buildActionUrl, addToRecentList } from './utils';
import { DEFAULT_QUICK_ACTIONS } from './defaults';
import { COMMON_APP_ACTIONS } from './constants';
import { generateId } from '../utils/idGen';

// Initial state - note: we don't store favoriteQuickActions in state, it's derived
const initialState = {
  availableAppActions: COMMON_APP_ACTIONS,
  userQuickActions: DEFAULT_QUICK_ACTIONS,
  recentQuickActions: DEFAULT_QUICK_ACTIONS.slice(0, 2).map(action => action.id), // First 2 default actions
  status: 'idle',
  error: null
};

const quickActionsSlice = createSlice({
  name: 'quickActions',
  initialState,
  reducers: {
    // Create a new quick action from template
    createQuickAction: (state, action) => {
      const { actionId, name, icon, color, parameters } = action.payload;
      
      const baseAction = state.availableAppActions.find(a => a.id === actionId);
      if (!baseAction) {
        console.error(`Action template not found: ${actionId}`);
        return;
      }
      
      const newQuickAction = createQuickActionObject({
        actionId,
        name: name || baseAction.title,
        description: baseAction.description,
        icon: icon || baseAction.icon,
        color: color || baseAction.color,
        appName: baseAction.appName,
        category: baseAction.category,
        actionType: baseAction.actionType,
        config: baseAction.config,
        parameters: parameters || {},
        isDefault: false
      });
      
      state.userQuickActions.push(newQuickAction);
      state.recentQuickActions = addToRecentList(state.recentQuickActions, newQuickAction.id);
    },
    
    // Add a new quick action (compatibility with old code)
    addQuickAction: (state, action) => {
      const { actionId, name, icon, color, parameters } = action.payload;
      
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
          favorite: false,
          hidden: false
        },
        isDefault: false
      };
      
      state.userQuickActions.push(newQuickAction);
      state.recentQuickActions = addToRecentList(state.recentQuickActions, newQuickAction.id);
    },
    
    // Update quick action
    updateQuickAction: (state, action) => {
      const { id, updates } = action.payload;
      const actionIndex = state.userQuickActions.findIndex(a => a.id === id);
      
      if (actionIndex >= 0) {
        const updatedAction = {
          ...state.userQuickActions[actionIndex],
          ...updates,
          metadata: {
            ...state.userQuickActions[actionIndex].metadata,
            updatedAt: Date.now()
          }
        };
        
        // If parameters were updated, rebuild the URL
        if (updates.parameters && state.userQuickActions[actionIndex].config) {
          const builtUrl = buildActionUrl(
            state.userQuickActions[actionIndex], 
            updates.parameters
          );
          // Store built URL in metadata for quick access
          updatedAction.metadata.builtUrl = builtUrl;
        }
        
        state.userQuickActions[actionIndex] = updatedAction;
      }
    },
    
    // Delete quick action
    deleteQuickAction: (state, action) => {
      const id = action.payload;
      const quickAction = state.userQuickActions.find(a => a.id === id);
      
      // Only allow deletion of non-default actions
      if (quickAction && !quickAction.isDefault) {
        state.userQuickActions = state.userQuickActions.filter(a => a.id !== id);
        state.recentQuickActions = state.recentQuickActions.filter(a => a !== id);
      }
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
        
        state.recentQuickActions = addToRecentList(state.recentQuickActions, id);
      }
    },
    
    // Toggle favorite
    toggleQuickActionFavorite: (state, action) => {
      const id = action.payload;
      const actionIndex = state.userQuickActions.findIndex(a => a.id === id);
      
      if (actionIndex >= 0) {
        state.userQuickActions[actionIndex].metadata.favorite = 
          !state.userQuickActions[actionIndex].metadata.favorite;
        state.userQuickActions[actionIndex].metadata.updatedAt = Date.now();
      }
    },
    
    // Reorder quick actions
    reorderQuickActions: (state, action) => {
      const { fromIndex, toIndex } = action.payload;
      
      // Make a copy to avoid mutating while iterating
      const actions = [...state.userQuickActions];
      const [removed] = actions.splice(fromIndex, 1);
      actions.splice(toIndex, 0, removed);
      
      state.userQuickActions = actions;
    },
    
    // Reset quick actions
    resetQuickActions: (state) => {
      // Keep only default actions
      const defaultActions = state.userQuickActions.filter(a => a.isDefault);
      
      return {
        ...initialState,
        userQuickActions: [
          ...DEFAULT_QUICK_ACTIONS,
          ...defaultActions.filter(defaultAction => 
            !DEFAULT_QUICK_ACTIONS.some(da => da.id === defaultAction.id)
          )
        ]
      };
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

export const selectVisibleQuickActions = createReselectSelector(
  [selectUserQuickActions],
  (quickActions) => quickActions.filter(action => !action.metadata?.hidden)
);

export const selectCustomQuickActions = createReselectSelector(
  [selectUserQuickActions],
  (quickActions) => quickActions.filter(action => !action.isDefault)
);

export const selectDefaultQuickActions = createReselectSelector(
  [selectUserQuickActions],
  (quickActions) => quickActions.filter(action => action.isDefault)
);

// Additional utility selectors
export const selectQuickActionsCount = createReselectSelector(
  [selectUserQuickActions],
  (quickActions) => quickActions.length
);

export const selectCustomQuickActionsCount = createReselectSelector(
  [selectCustomQuickActions],
  (customActions) => customActions.length
);

export const selectQuickActionCategories = createReselectSelector(
  [selectUserQuickActions],
  (quickActions) => {
    const categories = new Set();
    quickActions.forEach(action => categories.add(action.category));
    return Array.from(categories);
  }
);

// Export actions and reducer
export const {
  createQuickAction,
  addQuickAction,
  updateQuickAction,
  deleteQuickAction,
  recordQuickActionRun,
  toggleQuickActionFavorite,
  reorderQuickActions,
  resetQuickActions
} = quickActionsSlice.actions;

export default quickActionsSlice.reducer;