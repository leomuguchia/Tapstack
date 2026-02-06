import { createShortcutObject } from './utils';

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
        id: 'action_wifi_on',
        actionId: 'media_play', // placeholder for now
        parameters: {},
        delayBefore: 0,
        conditions: []
      },
      {
        id: 'action_open_news',
        actionId: 'url_open',
        parameters: { url: 'https://news.google.com' },
        delayBefore: 500,
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
        id: 'action_vibrate',
        actionId: 'vibrate',
        parameters: { duration: 300 },
        delayBefore: 500,
        conditions: []
      }
    ],
    metadata: { favorite: false }
  }, true)
];
