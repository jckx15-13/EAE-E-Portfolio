/**
 * EditorErrorHandler: Manages error recovery, user feedback, and graceful failures
 * Ensures users can always recover from errors without losing work
 */
class EditorErrorHandler {
  constructor() {
    this.errorLog = [];
    this.maxLogSize = 100;
    this.listeners = [];
  }

  /**
   * Categorize error by type/code
   * @returns {string} Error category
   */
  categorizeError(error) {
    const code = error.code || error.name || '';
    
    if (code.includes('VALIDATION')) return 'validation';
    if (code.includes('SAVE') || code.includes('NETWORK')) return 'save';
    if (code.includes('CONFLICT')) return 'conflict';
    if (code.includes('PARSE') || code.includes('SYNTAX')) return 'parse';
    if (code.includes('PERMISSION')) return 'permission';
    
    return 'unknown';
  }

  /**
   * Log an error with context
   */
  log(code, message, context = {}) {
    const entry = {
      code,
      message,
      context,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'node'
    };

    this.errorLog.push(entry);

    // Limit log size
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Persist to localStorage for debugging (only in browser)
    if (typeof localStorage !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('eaeEditorErrorLog') || '[]');
        stored.push(entry);
        if (stored.length > this.maxLogSize) stored.shift();
        localStorage.setItem('eaeEditorErrorLog', JSON.stringify(stored));
      } catch (e) {
        console.warn('Could not persist error log:', e);
      }
    }

    console.error(`[EditorError ${code}] ${message}`, context);
    this.notifyListeners('error', { code, message, context });
  }

  /**
   * Get recovery suggestions for an error code
   * @returns {array} Suggested recovery steps
   */
  getRecoverySuggestions(errorCode) {
    const suggestions = {
      'VALIDATION_ERROR': [
        'Check that all required fields are filled in',
        'Verify that text fields do not exceed character limits',
        'Check for broken references to missing projects or achievements'
      ],
      'SAVE_FAILED': [
        'Check your internet connection',
        'Verify the server is running (node server.js)',
        'Try saving again in a few seconds',
        'Check browser console for detailed error message (F12 → Console tab)'
      ],
      'CONFLICT_DETECTED': [
        'Your changes conflict with recent edits',
        'Review the conflicting changes in the recovery dialog',
        'Choose which version to keep, then try again'
      ],
      'PARSE_ERROR': [
        'Your data.js file has a syntax error',
        'Click "Restore from Backup" to revert to last known good version',
        'Use the Export feature to download a clean copy'
      ],
      'PERMISSION_ERROR': [
        'You do not have permission to make this edit',
        'Check if admin mode is properly enabled (?admin=1)',
        'Reload the page and try again'
      ],
      'UNKNOWN_ERROR': [
        'An unexpected error occurred',
        'Try refreshing the page',
        'Check the browser console (F12) for details',
        'Clear browser cache and retry'
      ]
    };

    return suggestions[errorCode] || suggestions['UNKNOWN_ERROR'];
  }

  /**
   * Create user-friendly error message
   */
  createUserMessage(errorCode, context = {}) {
    const friendlyMessages = {
      'VALIDATION_ERROR': 'Your changes have errors. Please review them before saving.',
      'SAVE_FAILED': 'Could not save to server. Your changes are safe — please check your connection.',
      'CONFLICT_DETECTED': 'Someone edited this at the same time. Choose which version to keep.',
      'PARSE_ERROR': 'The data file is corrupted. Use the recovery tool to restore.',
      'PERMISSION_ERROR': 'You do not have permission to make this change.',
      'UNKNOWN_ERROR': 'Something unexpected happened. Please try again or contact support.'
    };

    const message = friendlyMessages[errorCode] || 'An error occurred';
    return {
      title: this.getCategoryTitle(this.categorizeError({ code: errorCode })),
      message: message,
      details: context.details || null,
      suggestions: this.getRecoverySuggestions(errorCode)
    };
  }

  getCategoryTitle(category) {
    const titles = {
      'validation': '⚠️ Validation Error',
      'save': '💾 Save Error',
      'conflict': '⚔️ Conflict Detected',
      'parse': '🔧 Data Error',
      'permission': '🔒 Permission Denied',
      'unknown': '❌ Error'
    };
    return titles[category] || 'Error';
  }

  /**
   * Get recent error logs
   */
  getErrorLogs(limit = 20) {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error logs
   */
  clearErrorLogs() {
    this.errorLog = [];
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('eaeEditorErrorLog');
      } catch (e) {
        console.warn('Could not clear error log:', e);
      }
    }
  }

  /**
   * Subscribe to errors
   */
  onError(callback) {
    this.listeners.push(callback);
  }

  notifyListeners(eventType, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(eventType, payload);
      } catch (err) {
        console.error('Error listener failed:', err);
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorErrorHandler;
}
