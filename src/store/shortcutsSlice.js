import { createSlice, createSelector } from '@reduxjs/toolkit';
import { createSelector as createReselectSelector } from 'reselect';
import { SHORTCUT_TRIGGERS } from './constants';
import { generateId } from '../utils/idGen';
import { defaultShortcuts } from './defaults';
import { createShortcutObject } from './utils';

// Helper function to update shortcut metadata consistently
const updateShortcutMetadata = (shortcut) => ({
  ...shortcut,
  metadata: {
    ...shortcut.metadata,
    updatedAt: Date.now()
  }
});

// Helper function to create folder object
const createFolderObject = (data) => ({
  id: data.id || generateId('folder'),
  name: data.name,
  icon: data.icon || 'folder',
  color: data.color || '#6B7280',
  shortcutIds: data.shortcutIds || []
});

// Default folders
const defaultFolders = [
  createFolderObject({
    id: 'folder_routines',
    name: 'Routines',
    icon: 'repeat',
    color: '#10B981',
    shortcutIds: ['shortcut_morning_routine', 'shortcut_bedtime']
  }),
  createFolderObject({
    id: 'folder_work',
    name: 'Work',
    icon: 'briefcase',
    color: '#3B82F6',
    shortcutIds: ['shortcut_work_mode']
  })
];

// Helper function to add to recent list
const addToRecentList = (list, itemId, maxLength = 10) => {
  const filtered = list.filter(id => id !== itemId);
  const updated = [itemId, ...filtered];
  return updated.slice(0, maxLength);
};

// Initial state
const initialState = {
  shortcuts: defaultShortcuts,
  folders: defaultFolders,
  recentShortcuts: ['shortcut_morning_routine', 'shortcut_work_mode'],
  favoriteShortcuts: ['shortcut_work_mode'],
  status: 'idle',
  error: null
};

const shortcutsSlice = createSlice({
  name: 'shortcuts',
  initialState,
  reducers: {
    // Create a new shortcut
    createShortcut: (state, action) => {
      const newShortcut = createShortcutObject(action.payload, false);
      state.shortcuts.push(newShortcut);
      state.recentShortcuts = addToRecentList(state.recentShortcuts, newShortcut.id);
    },
    
    // Update shortcut properties
    updateShortcut: (state, action) => {
      const { id, updates } = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === id);
      
      if (shortcutIndex >= 0) {
        state.shortcuts[shortcutIndex] = updateShortcutMetadata({
          ...state.shortcuts[shortcutIndex],
          ...updates
        });
      }
    },
    
    // Delete a shortcut (only non-default ones)
    deleteShortcut: (state, action) => {
      const id = action.payload;
      const shortcut = state.shortcuts.find(s => s.id === id);
      
      if (shortcut && !shortcut.isDefault) {
        // Remove shortcut
        state.shortcuts = state.shortcuts.filter(s => s.id !== id);
        
        // Clean up references
        state.recentShortcuts = state.recentShortcuts.filter(sid => sid !== id);
        state.favoriteShortcuts = state.favoriteShortcuts.filter(sid => sid !== id);
        
        // Remove from folders
        state.folders = state.folders.map(folder => ({
          ...folder,
          shortcutIds: folder.shortcutIds.filter(sid => sid !== id)
        }));
      }
    },
    
    // Add action to shortcut
    addActionToShortcut: (state, action) => {
      const { shortcutId, actionData } = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === shortcutId);
      
      if (shortcutIndex >= 0) {
        const newAction = {
          ...actionData,
          id: actionData.id || generateId('actinst'),
          delayBefore: actionData.delayBefore || 0,
          conditions: actionData.conditions || []
        };
        
        state.shortcuts[shortcutIndex].actions.push(newAction);
        state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
      }
    },
    
    // Update action in shortcut
    updateActionInShortcut: (state, action) => {
      const { shortcutId, actionId, updates } = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === shortcutId);
      
      if (shortcutIndex >= 0) {
        const actionIndex = state.shortcuts[shortcutIndex].actions.findIndex(a => a.id === actionId);
        if (actionIndex >= 0) {
          state.shortcuts[shortcutIndex].actions[actionIndex] = {
            ...state.shortcuts[shortcutIndex].actions[actionIndex],
            ...updates
          };
          state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
        }
      }
    },
    
    // Remove action from shortcut
    removeActionFromShortcut: (state, action) => {
      const { shortcutId, actionId } = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === shortcutId);
      
      if (shortcutIndex >= 0) {
        state.shortcuts[shortcutIndex].actions = 
          state.shortcuts[shortcutIndex].actions.filter(a => a.id !== actionId);
        state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
      }
    },
    
    // Reorder actions in shortcut
    reorderActionsInShortcut: (state, action) => {
      const { shortcutId, fromIndex, toIndex } = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === shortcutId);
      
      if (shortcutIndex >= 0) {
        const actions = state.shortcuts[shortcutIndex].actions;
        const [removed] = actions.splice(fromIndex, 1);
        actions.splice(toIndex, 0, removed);
        state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
      }
    },
    
    // Toggle shortcut enabled/disabled
    toggleShortcutEnabled: (state, action) => {
      const id = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === id);
      
      if (shortcutIndex >= 0) {
        state.shortcuts[shortcutIndex].enabled = !state.shortcuts[shortcutIndex].enabled;
        state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
      }
    },
    
    // Toggle shortcut visibility (hide/show)
    toggleShortcutVisibility: (state, action) => {
      const id = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === id);
      
      if (shortcutIndex >= 0) {
        state.shortcuts[shortcutIndex].hidden = !state.shortcuts[shortcutIndex].hidden;
        state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
      }
    },
    
    // Toggle shortcut favorite
    toggleShortcutFavorite: (state, action) => {
      const id = action.payload;
      
      // Update favorites list
      const favoriteIndex = state.favoriteShortcuts.indexOf(id);
      if (favoriteIndex >= 0) {
        state.favoriteShortcuts.splice(favoriteIndex, 1);
      } else {
        state.favoriteShortcuts.push(id);
      }
      
      // Update shortcut metadata
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === id);
      if (shortcutIndex >= 0) {
        state.shortcuts[shortcutIndex].metadata.favorite = !state.shortcuts[shortcutIndex].metadata.favorite;
        state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
      }
    },

    updateActionParameters: (state, action) => {
      const { shortcutId, actionId, parameters } = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === shortcutId);
  
      if (shortcutIndex >= 0) {
        const actionIndex = state.shortcuts[shortcutIndex].actions.findIndex(a => a.id === actionId);
        if (actionIndex >= 0) {
          state.shortcuts[shortcutIndex].actions[actionIndex].parameters = {
            ...state.shortcuts[shortcutIndex].actions[actionIndex].parameters,
            ...parameters
          };
          state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
        }
      }
    },
    
    // Update shortcut trigger
    updateShortcutTrigger: (state, action) => {
      const { shortcutId, trigger } = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === shortcutId);
      
      if (shortcutIndex >= 0) {
        state.shortcuts[shortcutIndex].trigger = trigger;
        state.shortcuts[shortcutIndex] = updateShortcutMetadata(state.shortcuts[shortcutIndex]);
      }
    },
    
    // Record shortcut execution
    recordShortcutRun: (state, action) => {
      const id = action.payload;
      const shortcutIndex = state.shortcuts.findIndex(s => s.id === id);
      
      if (shortcutIndex >= 0) {
        const shortcut = state.shortcuts[shortcutIndex];
        shortcut.metadata.runCount += 1;
        shortcut.metadata.lastRun = Date.now();
        shortcut.metadata.updatedAt = Date.now();
        
        // Add to recent shortcuts
        state.recentShortcuts = addToRecentList(state.recentShortcuts, id);
      }
    },
    
    // Create a new folder
    createFolder: (state, action) => {
      const newFolder = createFolderObject(action.payload);
      state.folders.push(newFolder);
    },
    
    // Add shortcut to folder
    addShortcutToFolder: (state, action) => {
      const { folderId, shortcutId } = action.payload;
      const folderIndex = state.folders.findIndex(f => f.id === folderId);
      
      if (folderIndex >= 0 && !state.folders[folderIndex].shortcutIds.includes(shortcutId)) {
        state.folders[folderIndex].shortcutIds.push(shortcutId);
      }
    },
    
    // Remove shortcut from folder
    removeShortcutFromFolder: (state, action) => {
      const { folderId, shortcutId } = action.payload;
      const folderIndex = state.folders.findIndex(f => f.id === folderId);
      
      if (folderIndex >= 0) {
        state.folders[folderIndex].shortcutIds = 
          state.folders[folderIndex].shortcutIds.filter(id => id !== shortcutId);
      }
    },
    
    // Reset shortcuts - FIXED VERSION
    resetShortcuts: (state) => {
      // Reset to initial state, but keep only unique default shortcuts
      const currentDefaultShortcuts = state.shortcuts.filter(s => s.isDefault);
      
      // Create a map to remove duplicates
      const uniqueShortcutsMap = new Map();
      
      // Add default shortcuts first (from the predefined list)
      defaultShortcuts.forEach(shortcut => {
        uniqueShortcutsMap.set(shortcut.id, shortcut);
      });
      
      // Add any current default shortcuts that might have modifications
      currentDefaultShortcuts.forEach(shortcut => {
        // Only add if not already in map (shouldn't happen, but just in case)
        if (!uniqueShortcutsMap.has(shortcut.id)) {
          uniqueShortcutsMap.set(shortcut.id, shortcut);
        }
      });
      
      // Convert map back to array
      const uniqueShortcuts = Array.from(uniqueShortcutsMap.values());
      
      return {
        ...initialState,
        shortcuts: uniqueShortcuts,
        folders: [...defaultFolders]
      };
    },
    
    // Add this new reducer to clean up duplicates
    cleanupDuplicateShortcuts: (state) => {
      const seen = new Set();
      const uniqueShortcuts = [];
      
      state.shortcuts.forEach(shortcut => {
        if (!seen.has(shortcut.id)) {
          seen.add(shortcut.id);
          uniqueShortcuts.push(shortcut);
        }
      });
      
      state.shortcuts = uniqueShortcuts;
    }
  }
});

// ==================== SELECTORS ====================

const selectShortcutsRoot = (state) => state.shortcuts;

// Basic selectors
export const selectAllShortcuts = createReselectSelector(
  [selectShortcutsRoot],
  (shortcuts) => shortcuts.shortcuts
);

export const selectRecentShortcutIds = createReselectSelector(
  [selectShortcutsRoot],
  (shortcuts) => shortcuts.recentShortcuts
);

export const selectFavoriteShortcutIds = createReselectSelector(
  [selectShortcutsRoot],
  (shortcuts) => shortcuts.favoriteShortcuts
);

export const selectFolders = createReselectSelector(
  [selectShortcutsRoot],
  (shortcuts) => shortcuts.folders
);

// Derived selectors
export const selectVisibleShortcuts = createReselectSelector(
  [selectAllShortcuts],
  (shortcuts) => shortcuts.filter(shortcut => 
    !shortcut.hidden && shortcut.enabled
  )
);

export const selectShortcutById = createReselectSelector(
  [selectAllShortcuts, (_, shortcutId) => shortcutId],
  (shortcuts, shortcutId) => 
    shortcuts.find(shortcut => shortcut.id === shortcutId)
);

// Memoized composite selectors
export const selectFavoriteShortcuts = createReselectSelector(
  [selectAllShortcuts, selectFavoriteShortcutIds],
  (shortcuts, favoriteIds) => {
    const shortcutMap = {};
    shortcuts.forEach(shortcut => {
      shortcutMap[shortcut.id] = shortcut;
    });
    
    return favoriteIds
      .map(id => shortcutMap[id])
      .filter(Boolean);
  }
);

export const selectRecentShortcuts = createReselectSelector(
  [selectAllShortcuts, selectRecentShortcutIds],
  (shortcuts, recentIds) => {
    const shortcutMap = {};
    shortcuts.forEach(shortcut => {
      shortcutMap[shortcut.id] = shortcut;
    });
    
    return recentIds
      .map(id => shortcutMap[id])
      .filter(Boolean); 
  }
);

export const selectShortcutsByCategory = createReselectSelector(
  [selectAllShortcuts, (_, category) => category],
  (shortcuts, category) => 
    shortcuts.filter(shortcut => shortcut.category === category)
);

export const selectCustomShortcuts = createReselectSelector(
  [selectAllShortcuts],
  (shortcuts) => shortcuts.filter(shortcut => !shortcut.isDefault)
);

export const selectDefaultShortcuts = createReselectSelector(
  [selectAllShortcuts],
  (shortcuts) => shortcuts.filter(shortcut => shortcut.isDefault)
);

export const selectShortcutsInFolder = createReselectSelector(
  [selectAllShortcuts, selectFolders, (_, folderId) => folderId],
  (shortcuts, folders, folderId) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return [];
    
    const shortcutMap = {};
    shortcuts.forEach(shortcut => {
      shortcutMap[shortcut.id] = shortcut;
    });
    
    return folder.shortcutIds
      .map(id => shortcutMap[id])
      .filter(Boolean);
  }
);

export const selectRecentlyUsedShortcuts = createReselectSelector(
  [selectAllShortcuts],
  (shortcuts) => {
    const now = Date.now();
    const sevenDaysAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentShortcuts = shortcuts.filter(shortcut => 
      shortcut.metadata.lastRun && 
      shortcut.metadata.lastRun >= sevenDaysAgo
    );
    
    const sortedRecent = recentShortcuts.sort((a, b) => 
      b.metadata.lastRun - a.metadata.lastRun
    );
    
    return sortedRecent.slice(0, 5);
  }
);

export const selectAllShortcutRuns = createReselectSelector(
  [selectAllShortcuts],
  (shortcuts) => {
    // Filter shortcuts that have been run at least once
    const shortcutRuns = shortcuts
      .filter(shortcut => shortcut.metadata.lastRun)
      .map(shortcut => ({
        id: shortcut.id,
        shortcutId: shortcut.id,
        shortcutName: shortcut.name,
        timestamp: shortcut.metadata.lastRun,
        runCount: shortcut.metadata.runCount,
        category: shortcut.category,
        icon: shortcut.icon,
        color: shortcut.color,
        actions: shortcut.actions.length
      }));
    
    // Sort by most recent first
    return shortcutRuns.sort((a, b) => b.timestamp - a.timestamp);
  }
);

// Optional: Selector to get runs by time period
export const selectShortcutRunsByPeriod = createReselectSelector(
  [selectAllShortcutRuns, (_, period) => period],
  (runs, period) => {
    const now = Date.now();
    let cutoffTime;
    
    switch(period) {
      case 'today':
        cutoffTime = now - (24 * 60 * 60 * 1000);
        break;
      case 'week':
        cutoffTime = now - (7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        cutoffTime = now - (30 * 24 * 60 * 60 * 1000);
        break;
      default:
        return runs;
    }
    
    return runs.filter(run => run.timestamp >= cutoffTime);
  }
);

// Selector for total stats
export const selectShortcutStats = createReselectSelector(
  [selectAllShortcuts],
  (shortcuts) => {
    const totalRuns = shortcuts.reduce((sum, shortcut) => sum + shortcut.metadata.runCount, 0);
    const activeShortcuts = shortcuts.filter(s => s.enabled && !s.hidden).length;
    const favoriteShortcuts = shortcuts.filter(s => s.metadata.favorite).length;
    
    const runsToday = shortcuts.reduce((sum, shortcut) => {
      const now = Date.now();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      return sum + (shortcut.metadata.lastRun >= todayStart.getTime() ? 1 : 0);
    }, 0);
    
    return {
      totalRuns,
      activeShortcuts,
      favoriteShortcuts,
      runsToday,
      totalShortcuts: shortcuts.length
    };
  }
);

// Export actions and reducer
export const {
  createShortcut,
  updateShortcut,
  deleteShortcut,
  addActionToShortcut,
  updateActionInShortcut,
  removeActionFromShortcut,
  reorderActionsInShortcut,
  toggleShortcutEnabled,
  toggleShortcutVisibility,
  toggleShortcutFavorite,
  updateShortcutTrigger,
  recordShortcutRun,
  createFolder,
  addShortcutToFolder,
  removeShortcutFromFolder,
  resetShortcuts,
  cleanupDuplicateShortcuts,  
} = shortcutsSlice.actions;

export default shortcutsSlice.reducer;