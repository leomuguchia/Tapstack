// src/services/actions/productivityActions.js
import { Linking, Platform } from 'react-native';

export const productivityActions = {
  async executeURLOpen(parameters) {
    const { url } = parameters;
    
    if (!url) {
      throw new Error('URL is required');
    }
    
    // Ensure URL has protocol
    let formattedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('mailto:') && !url.startsWith('tel:')) {
      formattedUrl = `https://${url}`;
    }
    
    const supported = await Linking.canOpenURL(formattedUrl);
    if (!supported) {
      throw new Error(`Cannot open "${url}" on this device`);
    }
    
    await Linking.openURL(formattedUrl);
    return { executed: true, url: formattedUrl };
  },

  async executeOpenApp(parameters) {
  const { deeplink } = parameters;
  
  if (!deeplink) {
    throw new Error('Deeplink is required to open an app');
  }
  
  const validPrefixes = [
    'http://', 'https://', 'mailto:', 'tel:', 'sms:', 
    'instagram://', 'twitter://', 'facebook://', 'whatsapp://',
    'spotify:', 'youtube://', 'maps://', 'geo:',
    'calshow:',
    'calendar:', 
    'netflix://', 
    'facebook://', 'messenger://', 'telegram://', 'slack://',
    'whatsapp://', 'discord://', 'reddit://', 'tiktok://',
    'zoom://', 'teams://', 'gmail://', 'outlook://',
    'photos://', 'camera://', 'notes://', 'reminders://'
  ];
  
  // Also accept custom scheme patterns (like com.google.calendar)
  const customSchemePattern = /^[a-zA-Z0-9_]+:/;
  
  const isValid = validPrefixes.some(prefix => deeplink.startsWith(prefix)) ||
                  customSchemePattern.test(deeplink);
  
  if (!isValid) {
    throw new Error(`Invalid deeplink format. Valid formats:\n${validPrefixes.join('\n')}`);
  }
  
  try {
    const supported = await Linking.canOpenURL(deeplink);
    
    if (!supported) {
      throw new Error(`App not installed or can't handle this deeplink: ${deeplink}`);
    }
    
    await Linking.openURL(deeplink);
    return { 
      executed: true, 
      message: `Opened app with deeplink: ${deeplink}`,
      deeplink: deeplink 
    };
  } catch (error) {
    throw new Error(`Failed to open app: ${error.message}`);
  }
  },
  
  async executeMapsOpen(parameters) {
    const { address, latitude, longitude, query } = parameters;
    
    let url;
    
    if (Platform.OS === 'ios') {
      if (address) {
        url = `maps:?q=${encodeURIComponent(address)}`;
      } else if (latitude && longitude) {
        url = `maps:?ll=${latitude},${longitude}`;
      } else if (query) {
        url = `maps:?q=${encodeURIComponent(query)}`;
      } else {
        throw new Error('Address, coordinates, or search query is required');
      }
    } else {
      // Android
      if (address) {
        url = `geo:0,0?q=${encodeURIComponent(address)}`;
      } else if (latitude && longitude) {
        url = `geo:${latitude},${longitude}`;
      } else if (query) {
        url = `geo:0,0?q=${encodeURIComponent(query)}`;
      } else {
        throw new Error('Address, coordinates, or search query is required');
      }
    }
    
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      throw new Error('Maps app is not available on this device');
    }
    
    await Linking.openURL(url);
    return { executed: true };
  }
};