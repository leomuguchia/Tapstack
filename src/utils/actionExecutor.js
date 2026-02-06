import AsyncStorage from '@react-native-async-storage/async-storage';
import { actionRegistry, actionMetadata } from './actions/actionRegistry';

class ActionExecutor {
  constructor(dispatch) {
    this.dispatch = dispatch;
    this.actionHistory = [];
  }

  // ===== PARAMETER RESOLUTION =====

  resolveParameters(actionId, parameters = {}) {
    const meta = actionMetadata[actionId];
    if (!meta || !meta.parameters) return {};

    const resolved = {};

    for (const key of Object.keys(meta.parameters)) {
      const schema = meta.parameters[key];
      const incoming = parameters[key];

      if (typeof incoming !== 'object' && incoming !== undefined) {
        resolved[key] = incoming;
        continue;
      }

      if (incoming && typeof incoming === 'object' && 'default' in incoming) {
        resolved[key] = incoming.default;
        continue;
      }

      if ('default' in schema) {
        resolved[key] = schema.default;
      }
    }

    return resolved;
  }

  // ===== ACTION EXECUTION =====

  async executeAction(action, parameters = {}, context = {}) {
    const startTime = Date.now();

    try {
      const registryEntry = actionRegistry[action.id];

      if (!registryEntry) {
        throw new Error(`Action "${action.id}" is not available`);
      }

      const executor =
        typeof registryEntry === 'function'
          ? registryEntry
          : registryEntry.execute;

      if (typeof executor !== 'function') {
        throw new Error(`No executor found for action "${action.id}"`);
      }

      const resolvedParameters = this.resolveParameters(action.id, parameters);

      console.log(`▶️ Executing action: ${action.id}`, resolvedParameters);

      const result = await executor(resolvedParameters);
      const executionTime = Date.now() - startTime;

      this.logActionToHistory({
        actionId: action.id,
        actionName: action.name,
        parameters: resolvedParameters,
        success: true,
        executionTime,
        timestamp: Date.now(),
        context
      });

      return { success: true, result, executionTime };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const message = error.message || 'Unknown error';

      console.error(`❌ Failed to execute action ${action.id}:`, error);

      this.logActionToHistory({
        actionId: action.id,
        actionName: action.name,
        parameters,
        success: false,
        executionTime,
        timestamp: Date.now(),
        context,
        error: message
      });

      return {
        success: false,
        error: this.getUserFriendlyError(action, error),
        actionId: action.id,
        actionName: this.getActionDisplayName(action.id),
        executionTime
      };
    }
  }

  // ===== SHORTCUT EXECUTION =====

  async executeShortcut(shortcut) {
    console.log(`🚀 Executing shortcut: ${shortcut.name} with ${shortcut.actions.length} actions`);

    const startTime = Date.now();
    const results = [];

    for (let i = 0; i < shortcut.actions.length; i++) {
      const step = shortcut.actions[i];

      if (i > 0 && step.delayBefore > 0) {
        await this.delay(step.delayBefore);
      }

      const actionDef = this.getActionDefinition(step.actionId);
      const result = await this.executeAction(
        actionDef,
        step.parameters,
        { shortcutId: shortcut.id }
      );

      results.push(result);

      if (!result.success && shortcut.stopOnFailure) break;
    }

    await this.logShortcutToHistory({
      shortcutId: shortcut.id,
      shortcutName: shortcut.name,
      startTime,
      endTime: Date.now(),
      totalTime: Date.now() - startTime,
      success: results.every(r => r.success),
      results
    });

    return {
      success: results.every(r => r.success),
      results
    };
  }

  // ===== HELPERS =====

  getActionDefinition(actionId) {
    const meta = actionMetadata[actionId];
    return meta
      ? { id: actionId, name: meta.name, category: meta.category }
      : { id: actionId, name: this.getActionDisplayName(actionId) };
  }

  getActionDisplayName(actionId) {
    return actionId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  getUserFriendlyError(action, error) {
    return `${action.name} couldn't be completed. ${error.message}`;
  }

  logActionToHistory(entry) {
    this.actionHistory.unshift(entry);
    if (this.actionHistory.length > 100) this.actionHistory.pop();

    console.log('📝 Action logged:', {
      actionId: entry.actionId,
      success: entry.success,
      time: entry.executionTime
    });
  }

  async logShortcutToHistory(entry) {
    const key = 'shortcutHistory';
    const existing = await AsyncStorage.getItem(key);
    const history = existing ? JSON.parse(existing) : [];

    history.unshift(entry);
    await AsyncStorage.setItem(key, JSON.stringify(history.slice(0, 50)));
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ActionExecutor;
