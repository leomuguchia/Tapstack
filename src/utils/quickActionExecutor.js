import { Linking, Platform, Alert } from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

class QuickActionExecutor {
  static async execute(quickAction) {
    console.log('🔍 Executing quick action:', quickAction.name);
    console.log('🔍 Platform:', Platform.OS);
    
    const { actionType, config, parameters, appName, actionId } = quickAction;

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
      
      console.log('✅ Execution result:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Execution error:', error);
      // Try fallback
      return await QuickActionExecutor.executeFallback(quickAction, error);
    }
  }

  static async executeIOS(quickAction) {
    const { config, parameters, name } = quickAction;
    let url = config.deepLink;
    
    console.log('📱 iOS - Original URL:', url);
    console.log('📱 iOS - Parameters:', parameters);

    // Inject parameters
    url = QuickActionExecutor.injectParameters(url, parameters);
    
    console.log('📱 iOS - Final URL:', url);

    // Clean URL (remove empty query parameters)
    url = QuickActionExecutor.cleanUrl(url);
    
    console.log('📱 iOS - Cleaned URL:', url);

    try {
      console.log('📱 iOS - Checking if URL can be opened...');
      const canOpen = await Linking.canOpenURL(url);
      console.log('📱 iOS - canOpenURL result:', canOpen);
      
      if (!canOpen) {
        throw new Error(`Cannot open URL: ${url}`);
      }

      console.log('📱 iOS - Opening URL...');
      await Linking.openURL(url);
      console.log('📱 iOS - URL opened successfully');
      
      return { success: true, url };
    } catch (error) {
      console.error('📱 iOS - Error opening URL:', error);
      throw error;
    }
  }

  static async executeAndroid(quickAction) {
    const { actionId, config, parameters, appName, name } = quickAction;
    let url = config.deepLink;
    
    console.log('🤖 Android - Action:', appName, actionId);
    console.log('🤖 Android - Original URL:', url);
    console.log('🤖 Android - Parameters:', parameters);

    // Inject parameters
    url = QuickActionExecutor.injectParameters(url, parameters);
    url = QuickActionExecutor.cleanUrl(url);
    
    console.log('🤖 Android - Final URL:', url);

    // Android-specific handling
    switch (appName) {
      case 'Google Maps':
        return await QuickActionExecutor.executeAndroidMaps(actionId, parameters, name);
      
      case 'Camera':
        return await QuickActionExecutor.executeAndroidCamera(name);
      
      case 'Calendar':
        return await QuickActionExecutor.executeAndroidCalendar(parameters, name);
      
      case 'Notes':
        return await QuickActionExecutor.executeAndroidNotes(name);
      
      case 'Phone':
        return await QuickActionExecutor.executeAndroidPhone(parameters, name);
      
      case 'Messages':
        return await QuickActionExecutor.executeAndroidSMS(parameters, name);
      
      default:
        // For most apps, use standard deep links
        console.log('🤖 Android - Using standard deep link');
        try {
          const canOpen = await Linking.canOpenURL(url);
          console.log('🤖 Android - canOpenURL result:', canOpen);
          
          if (!canOpen) {
            throw new Error(`${appName} not installed`);
          }
          
          console.log('🤖 Android - Opening URL...');
          await Linking.openURL(url);
          console.log('🤖 Android - URL opened successfully');
          
          return { success: true, url };
        } catch (error) {
          console.error('🤖 Android - Error:', error);
          throw error;
        }
    }
  }

  static async executeAndroidMaps(actionId, parameters, actionName) {
    console.log('🗺️ Android Maps - Action:', actionId);
    const { destination, origin } = parameters || {};
    
    if (actionId === 'maps_navigation' && destination) {
      // Use geo: scheme for Android navigation
      const geoUrl = `geo:0,0?q=${encodeURIComponent(destination)}`;
      console.log('🗺️ Android Maps - Geo URL:', geoUrl);
      
      try {
        const canOpen = await Linking.canOpenURL(geoUrl);
        console.log('🗺️ Android Maps - canOpen geo URL:', canOpen);
        
        if (canOpen) {
          await Linking.openURL(geoUrl);
          return { success: true, url: geoUrl };
        }
        
        // Fallback to Google Maps URL
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
        console.log('🗺️ Android Maps - Fallback URL:', mapsUrl);
        
        await Linking.openURL(mapsUrl);
        return { success: true, url: mapsUrl, fallback: true };
      } catch (error) {
        console.error('🗺️ Android Maps - Error:', error);
        throw error;
      }
    }
    
    if (actionId === 'maps_directions') {
      const directionsUrl = `https://www.google.com/maps/dir/${encodeURIComponent(origin || '')}/${encodeURIComponent(destination || '')}`;
      console.log('🗺️ Android Maps - Directions URL:', directionsUrl);
      
      try {
        await Linking.openURL(directionsUrl);
        return { success: true, url: directionsUrl };
      } catch (error) {
        console.error('🗺️ Android Maps - Error:', error);
        throw error;
      }
    }
    
    throw new Error('Invalid maps action');
  }

  static async executeAndroidCamera(actionName) {
    console.log('📸 Android Camera - Opening camera');
    
    try {
      // Try to open camera via intent
      console.log('📸 Android Camera - Starting camera intent...');
      await IntentLauncher.startActivityAsync(
        'android.media.action.IMAGE_CAPTURE',
        {
          extra: {
            'android.intent.extras.CAMERA_FACING': 0 // Rear camera
          }
        }
      );
      console.log('📸 Android Camera - Camera intent started');
      return { success: true, intent: 'IMAGE_CAPTURE' };
    } catch (error) {
      console.error('📸 Android Camera - Error:', error);
      
      // Alternative: Try to open a camera app
      const cameraUrl = 'content://media/internal/images/media';
      console.log('📸 Android Camera - Trying camera URL:', cameraUrl);
      
      try {
        const canOpen = await Linking.canOpenURL(cameraUrl);
        if (canOpen) {
          await Linking.openURL(cameraUrl);
          return { success: true, url: cameraUrl };
        }
        throw new Error('Camera not available');
      } catch (urlError) {
        throw new Error('Camera not available');
      }
    }
  }

  static async executeAndroidCalendar(parameters, actionName) {
    console.log('📅 Android Calendar - Creating event');
    const { title, date } = parameters || {};
    
    try {
      // Create intent data
      const startTime = date ? new Date(date).getTime() : Date.now();
      const endTime = startTime + 3600000; // 1 hour later
      
      console.log('📅 Android Calendar - Event data:', { title, startTime, endTime });
      
      await IntentLauncher.startActivityAsync('android.intent.action.INSERT', {
        data: 'content://com.android.calendar/events',
        extras: {
          'title': title || 'New Event',
          'beginTime': startTime,
          'endTime': endTime,
          'allDay': false
        }
      });
      
      console.log('📅 Android Calendar - Calendar intent started');
      return { success: true, intent: 'CALENDAR_INSERT' };
    } catch (error) {
      console.error('📅 Android Calendar - Error:', error);
      throw new Error('Calendar not available');
    }
  }

  static async executeAndroidNotes(actionName) {
    console.log('📝 Android Notes - Opening notes');
    
    // Try Google Keep first
    const keepUrl = 'com.google.android.keep://';
    console.log('📝 Android Notes - Keep URL:', keepUrl);
    
    try {
      const canOpen = await Linking.canOpenURL(keepUrl);
      console.log('📝 Android Notes - canOpen Keep:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(keepUrl);
        return { success: true, url: keepUrl };
      }
      
      // Fallback to web Keep
      const webKeepUrl = 'https://keep.google.com';
      console.log('📝 Android Notes - Fallback to web Keep');
      await Linking.openURL(webKeepUrl);
      return { success: true, url: webKeepUrl, fallback: true };
    } catch (error) {
      console.error('📝 Android Notes - Error:', error);
      throw new Error('Notes app not available');
    }
  }

  static async executeAndroidPhone(parameters, actionName) {
    console.log('📞 Android Phone - Making call');
    const { phoneNumber } = parameters || {};
    
    if (!phoneNumber) {
      throw new Error('Phone number required');
    }
    
    const telUrl = `tel:${phoneNumber}`;
    console.log('📞 Android Phone - Tel URL:', telUrl);
    
    try {
      const canOpen = await Linking.canOpenURL(telUrl);
      console.log('📞 Android Phone - canOpen tel:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(telUrl);
        return { success: true, url: telUrl };
      }
      
      // Try DIAL intent
      console.log('📞 Android Phone - Trying DIAL intent');
      await IntentLauncher.startActivityAsync('android.intent.action.DIAL', {
        data: telUrl
      });
      return { success: true, intent: 'DIAL' };
    } catch (error) {
      console.error('📞 Android Phone - Error:', error);
      throw new Error('Phone app not available');
    }
  }

  static async executeAndroidSMS(parameters, actionName) {
    console.log('💬 Android SMS - Sending message');
    const { phoneNumber, message } = parameters || {};
    
    if (!phoneNumber) {
      throw new Error('Phone number required');
    }
    
    const smsUrl = `sms:${phoneNumber}${message ? `?body=${encodeURIComponent(message)}` : ''}`;
    console.log('💬 Android SMS - SMS URL:', smsUrl);
    
    try {
      const canOpen = await Linking.canOpenURL(smsUrl);
      console.log('💬 Android SMS - canOpen SMS:', canOpen);
      
      if (canOpen) {
        await Linking.openURL(smsUrl);
        return { success: true, url: smsUrl };
      }
      
      throw new Error('Messaging app not available');
    } catch (error) {
      console.error('💬 Android SMS - Error:', error);
      throw new Error('Messaging app not available');
    }
  }

  static async executeFallback(quickAction, originalError) {
    console.log('🔄 Trying fallback for:', quickAction.name);
    const { appName, config, parameters } = quickAction;
    let url = config.deepLink;
    
    // Inject parameters
    url = QuickActionExecutor.injectParameters(url, parameters);
    url = QuickActionExecutor.cleanUrl(url);
    
    console.log('🔄 Fallback - Original URL:', url);

    // Web fallbacks for common apps
    let fallbackUrl = null;
    
    switch (appName) {
      case 'WhatsApp':
        fallbackUrl = 'https://web.whatsapp.com';
        break;
      case 'Instagram':
        fallbackUrl = 'https://instagram.com';
        break;
      case 'Spotify':
        fallbackUrl = 'https://open.spotify.com';
        break;
      case 'Google Maps':
        if (quickAction.actionId === 'maps_navigation') {
          fallbackUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(parameters?.destination || '')}`;
        } else if (quickAction.actionId === 'maps_directions') {
          fallbackUrl = `https://www.google.com/maps/dir/${encodeURIComponent(parameters?.origin || '')}/${encodeURIComponent(parameters?.destination || '')}`;
        }
        break;
      default:
        // Generic HTTP fallback
        if (url.startsWith('http')) {
          fallbackUrl = url;
        }
        break;
    }
    
    console.log('🔄 Fallback - Selected URL:', fallbackUrl);
    
    if (fallbackUrl) {
      try {
        const canOpen = await Linking.canOpenURL(fallbackUrl);
        console.log('🔄 Fallback - canOpen:', canOpen);
        
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
        console.error('🔄 Fallback - Error:', error);
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