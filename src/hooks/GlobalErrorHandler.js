const listeners = {
  network: new Set(),
  auth: new Set(),
  server: new Set(),
  system: new Set(), 
  info: new Set(),
};

export const emitError = (type, payload) => {
  if (listeners[type]) {
    listeners[type].forEach((listener) => listener({ type, ...payload }));
  }
};

export const subscribeError = (type, listener) => {
  if (!listeners[type]) {
    listeners[type] = new Set();
  }
  listeners[type].add(listener);
  return () => listeners[type].delete(listener);
};

// Helper functions for specific error types
export const showNetworkError = (title, message) => {
  emitError('network', { title, message });
};

export const showServerError = (title, message) => {
  emitError('server', { title, message });
};

export const showSystemError = (title, message) => {
  emitError('system', { title, message });
};

export const showInfoError = (title, message) => {
  emitError('info', { title, message });
};

export default { 
  emitError, 
  subscribeError, 
  showNetworkError,
  showServerError,
  showSystemError,
  showInfoError
};