// src/services/actions/navigationActions.js
import { Linking, Platform } from 'react-native';

export const navigationActions = {
  async executeOpenMaps(parameters) {
    // This is for the 'open_maps' action
    const { destination } = parameters;
    
    if (!destination) {
      // Just open maps app
      if (Platform.OS === 'ios') {
        await Linking.openURL('maps://');
      } else {
        await Linking.openURL('geo:0,0');
      }
      return { executed: true, message: 'Maps app opened' };
    }
    
    // Open maps with destination
    const encodedDestination = encodeURIComponent(destination);
    const url = Platform.select({
      ios: `maps://?q=${encodedDestination}`,
      android: `geo:0,0?q=${encodedDestination}`,
      default: `https://www.google.com/maps/search/?api=1&query=${encodedDestination}`
    });
    
    try {
      await Linking.openURL(url);
      return { 
        executed: true, 
        message: `Opened maps for: ${destination}`,
        destination: destination 
      };
    } catch (error) {
      throw new Error(`Could not open maps: ${error.message}`);
    }
  }
};