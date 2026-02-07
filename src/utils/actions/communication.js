// src/services/actions/communication.js
import { Linking, Share } from 'react-native';

export const communicationActions = {
  async executeEmail(parameters) {
    const { to } = parameters || {};
    
    try {
      if (to) {
        await Linking.openURL(`mailto:${to}`);
        return { success: true, message: `Opened email app to ${to}` };
      } else {
        await Linking.openURL('mailto:');
        return { success: true, message: 'Opened email app' };
      }
    } catch (error) {
      throw new Error(`Could not open email app: ${error.message}`);
    }
  },
  
  async executeShare(parameters) {
    const { message = 'Check this out!' } = parameters || {};
    
    try {
      const result = await Share.share({
        message: message,
      });
      
      return { 
        success: true, 
        message: 'Content shared successfully',
        result 
      };
    } catch (error) {
      throw new Error(`Could not share content: ${error.message}`);
    }
  }
};