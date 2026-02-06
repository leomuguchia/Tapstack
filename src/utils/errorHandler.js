export const handleActionErrors = (results) => {
  const errors = results.filter(r => !r.success);
  
  if (errors.length === 0) return null;
  
  const errorGroups = {
    ACTION_UNAVAILABLE: [],
    PERMISSION_REQUIRED: [],
    NETWORK_ERROR: [],
    PARAMETER_MISSING: [],
    TIMEOUT_ERROR: []
  };
  
  errors.forEach(error => {
    if (error.errorType && errorGroups[error.errorType]) {
      errorGroups[error.errorType].push(error);
    }
  });
  
  // Return the most relevant error to show
  if (errorGroups.ACTION_UNAVAILABLE.length > 0) {
    const actions = errorGroups.ACTION_UNAVAILABLE.map(e => 
      e.actionName || e.actionId.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    );
    
    return {
      type: 'ACTION_UNAVAILABLE',
      message: actions.length === 1 
        ? `"${actions[0]}" isn't available on this device`
        : `${actions.length} actions aren't available`,
      actions,
      severity: 'error'
    };
  }
  
  if (errorGroups.PERMISSION_REQUIRED.length > 0) {
    return {
      type: 'PERMISSION_REQUIRED',
      message: `${errorGroups.PERMISSION_REQUIRED.length} action(s) need permissions`,
      count: errorGroups.PERMISSION_REQUIRED.length,
      severity: 'warning'
    };
  }
  
  if (errorGroups.PARAMETER_MISSING.length > 0) {
    return {
      type: 'PARAMETER_MISSING',
      message: 'Some actions need more information',
      count: errorGroups.PARAMETER_MISSING.length,
      severity: 'warning'
    };
  }
  
  if (errorGroups.NETWORK_ERROR.length > 0) {
    return {
      type: 'NETWORK_ERROR',
      message: 'Network connection issues',
      count: errorGroups.NETWORK_ERROR.length,
      severity: 'error'
    };
  }
  
  if (errorGroups.TIMEOUT_ERROR.length > 0) {
    return {
      type: 'TIMEOUT_ERROR',
      message: 'Some actions took too long',
      count: errorGroups.TIMEOUT_ERROR.length,
      severity: 'warning'
    };
  }
  
  // Generic error
  return {
    type: 'UNKNOWN',
    message: `${errors.length} action(s) failed`,
    severity: 'error'
  };
};

export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Never run';
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
  return `${Math.floor(days/7)} week${Math.floor(days/7) !== 1 ? 's' : ''} ago`;
};