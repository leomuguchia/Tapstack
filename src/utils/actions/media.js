// src/services/actions/mediaActions.js
import { Alert } from 'react-native';

export const mediaActions = {
  async executeMediaPlay() {
    Alert.alert(
      'Play Media',
      'This shortcut would play media if available.\n\nMedia playback depends on active media session and device permissions.',
      [{ text: 'OK' }]
    );
    
    return { 
      executed: true, 
      simulated: true,
      note: 'Media playback depends on active media session.',
      help: 'Ensure media is loaded and app has media playback permissions.'
    };
  },
  
  async executeMediaPause() {
    Alert.alert(
      'Pause Media',
      'This shortcut would pause media if available.\n\nMedia control depends on active media session and device permissions.',
      [{ text: 'OK' }]
    );
    
    return { 
      executed: true, 
      simulated: true,
      note: 'Media control depends on active media session.',
      help: 'Ensure media is playing and app has media control permissions.'
    };
  }
};