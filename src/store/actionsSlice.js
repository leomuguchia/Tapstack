// store/slices/actionsSlice.js
import { createSlice } from '@reduxjs/toolkit';
import { createSelector as createReselectSelector } from 'reselect';

const ACTION_CATEGORIES = {
  HARDWARE: 'HARDWARE',
  MEDIA: 'MEDIA',
  APP: 'APP',
  SYSTEM: 'SYSTEM',
  AUTOMATION: 'AUTOMATION',
  ACCESSIBILITY: 'ACCESSIBILITY',
  PLATFORM: 'PLATFORM',
  COMMUNICATION: 'COMMUNICATION',
  PRODUCTIVITY: 'PRODUCTIVITY'
};

const initialState = {
  discoveredActions: [],
  failedActions: [],
  contextAvailability: {
    foreground: [],
    background: [],
    locked: [],
    offline: [],
    requiresScreenOn: []
  },
  permissions: {},
  hiddenActions: [],
  favoriteActions: [],
  recentActions: [],
  usageStats: {},
  discoveryStatus: {
    lastScan: null,
    scanning: false,
    totalDiscovered: 0,
    failedScans: 0,
    platform: null,
    deviceModel: null,
    osVersion: null
  },
  systemCapabilities: {
    hardware: [],
    apis: [],
    features: []
  },
  status: 'idle',
  error: null
};

const actionsSlice = createSlice({
  name: 'actions',
  initialState,
  reducers: {
    addDiscoveredActions: (state, action) => {
      const actions = Array.isArray(action.payload?.actions) ? action.payload.actions : [];
      const systemInfo = action.payload?.systemInfo || {};

      const existingIds = new Set((state.discoveredActions || []).map(a => a.id));
      const trulyNew = actions.filter(a => !existingIds.has(a.id));

      const timestampedActions = trulyNew.map(a => ({
        ...a,
        discoveredAt: Date.now(),
        lastVerified: Date.now(),
        verificationCount: 1,
        systemInfo: {
          platform: systemInfo.platform,
          discoveredWith: systemInfo.scanType || 'initial',
          confidence: a.confidence || 'high'
        }
      }));

      state.discoveredActions = [...(state.discoveredActions || []), ...timestampedActions];

      state.discoveryStatus = {
        ...state.discoveryStatus,
        lastScan: Date.now(),
        totalDiscovered: state.discoveredActions.length,
        ...systemInfo
      };
    },

    updateSystemCapabilities: (state, action) => {
      state.systemCapabilities = {
        ...state.systemCapabilities,
        ...action.payload
      };
    },

    markActionFailed: (state, action) => {
      const { id, reason, errorCode } = action.payload;

      state.discoveredActions = state.discoveredActions.filter(a => a.id !== id);

      state.failedActions.push({
        id,
        failedAt: Date.now(),
        reason,
        errorCode,
        type: 'system_failure'
      });

      state.discoveryStatus.failedScans++;
    },

    verifyActions: (state) => {
      state.discoveryStatus.scanning = true;
    },

    updateVerificationResults: (state, action) => {
      const { working, broken } = action.payload;

      working.forEach(actionId => {
        const action = state.discoveredActions.find(a => a.id === actionId);
        if (action) {
          action.lastVerified = Date.now();
          action.verificationCount = (action.verificationCount || 0) + 1;
          action.systemInfo.confidence = 'verified';
        }
      });

      broken.forEach(({ id, reason }) => {
        state.discoveredActions = state.discoveredActions.filter(a => a.id !== id);
        state.failedActions.push({
          id,
          failedAt: Date.now(),
          reason,
          type: 'verification_failed'
        });
      });

      state.discoveryStatus.scanning = false;
    },

    logActionUsage: (state, action) => {
      const { id, success, context, executionTime } = action.payload;

      if (!state.usageStats[id]) {
        state.usageStats[id] = {
          used: 0,
          lastUsed: null,
          successCount: 0,
          failureCount: 0,
          totalExecutionTime: 0,
          contexts: {},
          averageExecutionTime: 0
        };
      }

      const stats = state.usageStats[id];
      stats.used++;
      stats.lastUsed = Date.now();

      if (success) {
        stats.successCount++;
        if (executionTime) {
          stats.totalExecutionTime += executionTime;
          stats.averageExecutionTime = stats.totalExecutionTime / stats.successCount;
        }
      } else {
        stats.failureCount++;
      }

      if (context) {
        stats.contexts[context] = (stats.contexts[context] || 0) + 1;
      }

      if (!state.recentActions.includes(id)) {
        state.recentActions.unshift(id);
        if (state.recentActions.length > 15) state.recentActions.pop();
      }
    },

    updateActionContextAvailability: (state, action) => {
      const { actionId, availableIn, requires } = action.payload;

      if (availableIn) {
        Object.keys(availableIn).forEach(context => {
          const isAvailable = availableIn[context];
          const contextArray = state.contextAvailability[context] || [];

          if (isAvailable && !contextArray.includes(actionId)) {
            contextArray.push(actionId);
          } else if (!isAvailable) {
            const index = contextArray.indexOf(actionId);
            if (index > -1) contextArray.splice(index, 1);
          }
        });
      }

      const actionIndex = state.discoveredActions.findIndex(a => a.id === actionId);
      if (actionIndex > -1 && requires) {
        state.discoveredActions[actionIndex].requires = {
          ...state.discoveredActions[actionIndex].requires,
          ...requires
        };
      }
    },

    toggleFavoriteAction: (state, action) => {
      const id = action.payload;
      const index = state.favoriteActions.indexOf(id);
      if (index >= 0) state.favoriteActions.splice(index, 1);
      else state.favoriteActions.push(id);
    },

    hideAction: (state, action) => {
      const id = action.payload;
      if (!state.hiddenActions.includes(id)) state.hiddenActions.push(id);
    },

    showAction: (state, action) => {
      const id = action.payload;
      state.hiddenActions = state.hiddenActions.filter(actionId => actionId !== id);
    },

    updatePermissions: (state, action) => {
      state.permissions = { ...state.permissions, ...action.payload };
    },

    cleanupFailedActions: (state) => {
      const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      state.failedActions = state.failedActions.filter(a => a.failedAt > weekAgo);
    },

    resetDiscovery: (state) => {
      state.discoveredActions = [];
      state.failedActions = [];
      state.hiddenActions = [];
      state.favoriteActions = [];
      state.recentActions = [];
      state.usageStats = {};
      state.discoveryStatus = {
        lastScan: null,
        scanning: false,
        totalDiscovered: 0,
        failedScans: 0,
        platform: null,
        deviceModel: null,
        osVersion: null
      };
    },

    batchHideActions: (state, action) => {
      const ids = action.payload;
      ids.forEach(id => {
        if (!state.hiddenActions.includes(id)) state.hiddenActions.push(id);
      });
    },

    batchShowActions: (state, action) => {
      const ids = action.payload;
      state.hiddenActions = state.hiddenActions.filter(id => !ids.includes(id));
    },

    clearRecentActions: (state) => {
      state.recentActions = [];
    },

    clearFavorites: (state) => {
      state.favoriteActions = [];
    },

    setDiscoveryError: (state, action) => {
      state.error = action.payload;
      state.status = 'failed';
    },

    clearDiscoveryError: (state) => {
      state.error = null;
      state.status = 'idle';
    }
  }
});

// ==================== SELECTORS ====================
const selectActionsRoot = (state) => state.actions;

export const selectAllActions = createReselectSelector(
  [selectActionsRoot],
  (actions) => actions.discoveredActions.filter(a => !actions.hiddenActions.includes(a.id))
);

export const selectAllActionsIncludingHidden = createReselectSelector(
  [selectActionsRoot],
  (actions) => actions.discoveredActions
);

export const selectAvailableActions = createReselectSelector(
  [selectAllActions, (state, context) => context || 'foreground'],
  (allActions) => allActions
);

export const selectOfflineActions = createReselectSelector(
  [selectActionsRoot],
  (actions) => {
    const offlineIds = actions.contextAvailability.offline || [];
    return actions.discoveredActions.filter(a => offlineIds.includes(a.id) && !actions.hiddenActions.includes(a.id));
  }
);

export const selectBackgroundActions = createReselectSelector(
  [selectActionsRoot],
  (actions) => {
    const backgroundIds = actions.contextAvailability.background || [];
    return actions.discoveredActions.filter(a => backgroundIds.includes(a.id) && !actions.hiddenActions.includes(a.id));
  }
);

export const selectFavoriteActions = createReselectSelector(
  [selectActionsRoot],
  (actions) => {
    const actionMap = Object.fromEntries(actions.discoveredActions.map(a => [a.id, a]));
    return actions.favoriteActions.map(id => actionMap[id]).filter(a => a && !actions.hiddenActions.includes(a.id));
  }
);

export const selectRecentActions = createReselectSelector(
  [selectActionsRoot],
  (actions) => {
    const actionMap = Object.fromEntries(actions.discoveredActions.map(a => [a.id, a]));
    return actions.recentActions.map(id => actionMap[id]).filter(a => a && !actions.hiddenActions.includes(a.id));
  }
);

export const selectActionById = createReselectSelector(
  [selectAllActionsIncludingHidden, (state, actionId) => actionId],
  (allActions, actionId) => allActions.find(a => a.id === actionId)
);

export const selectActionsByCategory = createReselectSelector(
  [selectAllActions, (state, category) => category],
  (allActions, category) => allActions.filter(a => a.category === category)
);

export const selectActionsRequiringPermission = createReselectSelector(
  [selectAllActions, (state, permission) => permission],
  (allActions, permission) =>
    allActions.filter(a => a.requiresPermission === permission || (Array.isArray(a.requiresPermission) && a.requiresPermission.includes(permission)))
);

export const selectMostUsedActions = createReselectSelector(
  [selectActionsRoot],
  (actions) => {
    const actionMap = Object.fromEntries(actions.discoveredActions.map(a => [a.id, a]));
    return Object.entries(actions.usageStats)
      .sort(([, a], [, b]) => b.used - a.used)
      .map(([id]) => actionMap[id])
      .filter(a => a && !actions.hiddenActions.includes(a.id))
      .slice(0, 10);
  }
);

export const selectReliableActions = createReselectSelector(
  [selectActionsRoot],
  (actions) =>
    actions.discoveredActions
      .filter(a => {
        const stats = actions.usageStats[a.id];
        if (!stats || stats.used < 3) return false;
        const successRate = stats.successCount / stats.used;
        return successRate >= 0.9 && !actions.hiddenActions.includes(a.id);
      })
      .sort((a, b) => {
        const statsA = actions.usageStats[a.id] || { successCount: 0, used: 0 };
        const statsB = actions.usageStats[b.id] || { successCount: 0, used: 0 };
        return (statsB.successCount / Math.max(statsB.used, 1)) - (statsA.successCount / Math.max(statsA.used, 1));
      })
);

export const selectHiddenActions = createReselectSelector(
  [selectActionsRoot],
  (actions) => {
    const actionMap = Object.fromEntries(actions.discoveredActions.map(a => [a.id, a]));
    return actions.hiddenActions.map(id => actionMap[id]).filter(Boolean);
  }
);

export const selectSystemCapabilities = createReselectSelector(
  [selectActionsRoot],
  (actions) => actions.systemCapabilities
);

export const selectDiscoveryStatus = createReselectSelector(
  [selectActionsRoot],
  (actions) => actions.discoveryStatus
);

export const selectActionUsageStats = createReselectSelector(
  [selectActionsRoot],
  (actions) => actions.usageStats
);

export const {
  addDiscoveredActions,
  updateSystemCapabilities,
  markActionFailed,
  verifyActions,
  updateVerificationResults,
  logActionUsage,
  updateActionContextAvailability,
  toggleFavoriteAction,
  hideAction,
  showAction,
  updatePermissions,
  cleanupFailedActions,
  resetDiscovery,
  batchHideActions,
  batchShowActions,
  clearRecentActions,
  clearFavorites,
  setDiscoveryError,
  clearDiscoveryError
} = actionsSlice.actions;

export default actionsSlice.reducer;
