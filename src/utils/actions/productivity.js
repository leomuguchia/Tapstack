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