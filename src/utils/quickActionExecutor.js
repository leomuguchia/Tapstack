import { Linking, Platform } from 'react-native';

class QuickActionExecutor {
  static async execute(quickAction) {
    const { actionType, config, parameters, appName } = quickAction;

    if (actionType !== 'deep_link') {
      throw new Error(`Unsupported action type: ${actionType}`);
    }

    // Check for missing required parameters
    const missingParams = QuickActionExecutor.checkMissingParameters(config, parameters);
    if (missingParams.length > 0) {
      throw new Error(`Missing required parameters: ${missingParams.join(', ')}`);
    }

    try {
      let result;
      if (Platform.OS === 'android') {
        result = await QuickActionExecutor.executeAndroid(quickAction);
      } else {
        result = await QuickActionExecutor.executeIOS(quickAction);
      }
      
      return result;
      
    } catch (error) {
      // Try fallback
      return await QuickActionExecutor.executeFallback(quickAction, error);
    }
  }

  static async executeIOS(quickAction) {
    const { config, parameters } = quickAction;
    let url = config.deepLink;

    // Inject parameters
    url = QuickActionExecutor.injectParameters(url, parameters);
    
    // Clean URL (remove empty query parameters)
    url = QuickActionExecutor.cleanUrl(url);

    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (!canOpen) {
        throw new Error(`Cannot open URL: ${url}`);
      }

      await Linking.openURL(url);
      return { success: true, url };
    } catch (error) {
      throw error;
    }
  }

  static async executeAndroid(quickAction) {
    const { actionId, config, parameters, appName } = quickAction;
    let url = config.deepLink;

    // Inject parameters
    url = QuickActionExecutor.injectParameters(url, parameters);
    url = QuickActionExecutor.cleanUrl(url);

    // Handle Maps specially for better Android support
    if (appName === 'Google Maps') {
      return await QuickActionExecutor.executeAndroidMaps(actionId, parameters);
    }

    // For all other apps including Bloomify, use standard deep links
    try {
      const canOpen = await Linking.canOpenURL(url);
      
      if (!canOpen) {
        throw new Error(`${appName} not installed`);
      }
      
      await Linking.openURL(url);
      return { success: true, url };
    } catch (error) {
      throw error;
    }
  }

  static async executeAndroidMaps(actionId, parameters) {
    const { destination, origin } = parameters || {};
    
    if (actionId === 'maps_navigation' && destination) {
      // Use geo: scheme for Android navigation
      const geoUrl = `geo:0,0?q=${encodeURIComponent(destination)}`;
      
      try {
        const canOpen = await Linking.canOpenURL(geoUrl);
        
        if (canOpen) {
          await Linking.openURL(geoUrl);
          return { success: true, url: geoUrl };
        }
        
        // Fallback to Google Maps URL
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
        await Linking.openURL(mapsUrl);
        return { success: true, url: mapsUrl, fallback: true };
      } catch (error) {
        throw error;
      }
    }
    
    if (actionId === 'maps_directions') {
      const directionsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin || '')}/${encodeURIComponent(destination || '')}`;
      
      try {
        await Linking.openURL(directionsUrl);
        return { success: true, url: directionsUrl };
      } catch (error) {
        throw error;
      }
    }
    
    throw new Error('Invalid maps action');
  }

  static async executeFallback(quickAction, originalError) {
    const { appName, config, parameters, actionId } = quickAction;
    let url = config.deepLink;
    
    // Inject parameters
    url = QuickActionExecutor.injectParameters(url, parameters);
    url = QuickActionExecutor.cleanUrl(url);

    // Web fallbacks for common apps
    let fallbackUrl = null;
    
    switch (appName) {
      case 'WhatsApp':
        fallbackUrl = 'https://web.whatsapp.com';
        break;
      case 'Instagram':
        fallbackUrl = 'https://instagram.com';
        break;
      case 'Facebook':
        fallbackUrl = 'https://facebook.com';
        break;
      case 'X':
        fallbackUrl = 'https://twitter.com';
        break;
      case 'Spotify':
        fallbackUrl = 'https://open.spotify.com';
        break;
      case 'Snapchat':
        fallbackUrl = 'https://snapchat.com';
        break;
      case 'TikTok':
        fallbackUrl = 'https://tiktok.com';
        break;
      case 'Pinterest':
        fallbackUrl = 'https://pinterest.com';
        break;
      case 'Bloomify':
        fallbackUrl = 'https://bloomifyinc.com'; 
        break;
      case 'Google Maps':
        if (actionId === 'maps_navigation') {
          fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parameters?.destination || '')}`;
        } else if (actionId === 'maps_directions') {
          fallbackUrl = `https://www.google.com/maps/dir/${encodeURIComponent(parameters?.origin || '')}/${encodeURIComponent(parameters?.destination || '')}`;
        }
        break;
      default:
        // Generic HTTP fallback
        if (url && url.startsWith('http')) {
          fallbackUrl = url;
        }
        break;
    }
    
    if (fallbackUrl) {
      try {
        const canOpen = await Linking.canOpenURL(fallbackUrl);
        
        if (canOpen) {
          await Linking.openURL(fallbackUrl);
          return { 
            success: true, 
            url: fallbackUrl, 
            fallback: true,
            originalError: originalError.message 
          };
        }
      } catch (error) {
        // Continue to throw original error
      }
    }
    
    throw new Error(`${appName} not available. Please install the app.`);
  }

  static injectParameters(url, parameters) {
    if (!parameters) return url;
    
    let result = url;
    Object.entries(parameters).forEach(([key, value]) => {
      if (value && value.trim() !== '') {
        result = result.replace(`{${key}}`, encodeURIComponent(value));
      }
    });
    
    return result;
  }

  static cleanUrl(url) {
    // Remove empty query parameters
    return url
      .replace(/\?&/g, '?')
      .replace(/&\?/g, '&')
      .replace(/\?$/, '')
      .replace(/&$/, '')
      .replace(/\{[^}]+\}/g, '');
  }

  static checkMissingParameters(config, parameters) {
    const missing = [];
    
    if (config.parameters) {
      config.parameters.forEach(param => {
        if (param.required) {
          const value = parameters?.[param.name];
          if (!value || value.trim() === '') {
            missing.push(param.label || param.name);
          }
        }
      });
    }
    
    return missing;
  }
}

export default QuickActionExecutor;