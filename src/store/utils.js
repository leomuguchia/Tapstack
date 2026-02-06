import { SHORTCUT_TRIGGERS } from './constants';
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