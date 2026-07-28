/**
 * EditorState: Manages undo/redo stack, atomic snapshots, and state history
 * All editor operations flow through this to ensure consistency and recoverability
 */
class EditorState {
  constructor(initialData, maxSnapshots = 50) {
    this.maxSnapshots = maxSnapshots;
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = this._deepCopy(initialData);
    this.listeners = [];
    this.operationLog = [];
    this.lastSavedState = this._deepCopy(initialData);
  }

  /**
   * Create a deep copy of an object (JSON-safe only)
   * @private
   */
  _deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Push a new snapshot after an operation
   * @param {string} operationName - Human-readable operation description
   * @param {object} newState - The new state after operation
   * @throws {Error} If operationName or newState is invalid
   */
  pushSnapshot(operationName, newState) {
    // Validate input
    if (!operationName || typeof operationName !== 'string') {
      throw new Error('operationName must be a non-empty string');
    }
    if (newState === null || typeof newState !== 'object') {
      throw new Error('newState must be a serializable object');
    }
    // Test serializability
    try {
      JSON.stringify(newState);
    } catch (e) {
      throw new Error('newState must be JSON-serializable: ' + e.message);
    }

    // Deep copy to prevent external mutation
    const snapshot = {
      name: operationName,
      timestamp: Date.now(),
      state: this._deepCopy(newState),
      before: this._deepCopy(this.currentState)
    };

    // Save to undo stack (snapshot fields are correct: state is NEW, before is OLD)
    this.undoStack.push({
      name: snapshot.name,
      timestamp: snapshot.timestamp,
      state: snapshot.state,
      before: snapshot.before
    });

    // Limit stack size
    if (this.undoStack.length > this.maxSnapshots) {
      this.undoStack.shift();
    }

    // Clear redo stack on new operation
    this.redoStack = [];

    // Update current state
    this.currentState = snapshot.state;

    // Log operation
    this.operationLog.push({
      op: operationName,
      at: snapshot.timestamp,
      valid: true
    });

    // Limit operation log size to prevent memory leak
    if (this.operationLog.length > this.maxSnapshots) {
      this.operationLog.shift();
    }

    // Notify listeners
    this._notifyListeners('stateChanged', {
      operation: operationName,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  /**
   * Undo last operation
   * @returns {object} The restored state
   */
  undo() {
    if (!this.canUndo()) return null;

    const snapshot = this.undoStack.pop();
    this.redoStack.push({
      name: snapshot.name,
      timestamp: snapshot.timestamp,
      state: snapshot.state,
      before: this.currentState
    });

    this.currentState = snapshot.before;
    this._notifyListeners('stateChanged', {
      operation: `Undo: ${snapshot.name}`,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });

    return this.currentState;
  }

  /**
   * Redo last undone operation
   * @returns {object} The restored state
   */
  redo() {
    if (!this.canRedo()) return null;

    const snapshot = this.redoStack.pop();
    this.undoStack.push({
      name: snapshot.name,
      timestamp: snapshot.timestamp,
      state: snapshot.state,
      before: this.currentState
    });

    this.currentState = snapshot.state;
    this._notifyListeners('stateChanged', {
      operation: `Redo: ${snapshot.name}`,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });

    return this.currentState;
  }

  canUndo() {
    return this.undoStack.length > 0;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  getCurrentState() {
    return this._deepCopy(this.currentState);
  }

  /**
   * Get history of recent operations
   * @param {number} limit - How many to return (default 10)
   * @returns {array} Recent operations
   */
  getHistory(limit = 10) {
    return this.operationLog.slice(-limit).reverse();
  }

  /**
   * Mark current state as saved (for dirty-flag detection)
   */
  markSaved() {
    this.lastSavedState = this._deepCopy(this.currentState);
  }

  /**
   * Check if current state differs from last saved
   * @returns {boolean} True if unsaved changes exist
   */
  isDirty() {
    return JSON.stringify(this.currentState) !== JSON.stringify(this.lastSavedState);
  }

  /**
   * Subscribe to state changes
   * @param {Function} callback - Called with (eventType, payload) on state change
   * @returns {Function} Unsubscribe function
   */
  onChange(callback) {
    this.listeners.push(callback);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  /**
   * Unsubscribe from state changes
   * @param {Function} callback - The callback to remove
   */
  offChange(callback) {
    this.listeners = this.listeners.filter(cb => cb !== callback);
  }

  /**
   * Notify all listeners of state change
   * @private
   */
  _notifyListeners(eventType, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(eventType, payload);
      } catch (err) {
        console.error('Listener error:', err);
      }
    });
  }

  /**
   * Create a backup snapshot for recovery
   */
  createBackupSnapshot() {
    return {
      state: this._deepCopy(this.currentState),
      timestamp: Date.now(),
      historyLength: this.undoStack.length
    };
  }

  /**
   * Restore from backup snapshot
   */
  restoreFromBackup(snapshot) {
    this.currentState = this._deepCopy(snapshot.state);
    this.undoStack = [];
    this.redoStack = [];
    this._notifyListeners('restored', { timestamp: snapshot.timestamp });
  }
}

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorState;
}
