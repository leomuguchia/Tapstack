// src/services/actions/automationActions.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const automationActions = {
  async executeHTTPRequest(parameters) {
    const { url, method = 'GET', headers = {}, body, timeout = 10000 } = parameters;
    
    if (!url) {
      throw new Error('URL is required for HTTP request');
    }
    
    const startTime = Date.now();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        },
        signal: controller.signal
      };
      
      if (body && method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(body);
      }
      
      const response = await fetch(url, options);
      const responseTime = Date.now() - startTime;
      
      clearTimeout(timeoutId);
      
      let responseData;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json();
      } else {
        responseData = await response.text();
      }
      
      return {
        executed: true,
        status: response.status,
        statusText: response.statusText,
        data: responseData,
        executionTime: responseTime,
        headers: Object.fromEntries(response.headers.entries())
      };
      
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error(`Request timed out after ${timeout}ms`);
      }
      
      throw new Error(`HTTP request failed: ${error.message}`);
    }
  },
  
  async executeStorageSet(parameters) {
    const { key, value } = parameters;
    
    if (!key) {
      throw new Error('Storage key is required');
    }
    
    await AsyncStorage.setItem(key, JSON.stringify(value));
    
    return { executed: true, key, valueType: typeof value };
  },
  
  async executeStorageGet(parameters) {
    const { key, defaultValue = null } = parameters;
    
    if (!key) {
      throw new Error('Storage key is required');
    }
    
    const value = await AsyncStorage.getItem(key);
    
    return {
      executed: true,
      key,
      value: value ? JSON.parse(value) : defaultValue,
      found: value !== null
    };
  }
};