/**
 * EditorState: Manages undo/redo stack, atomic snapshots, and state history
 * All editor operations flow through this to ensure consistency and recoverability
 */
class EditorState {
  constructor(initialData, maxSnapshots = 50) {
    this.maxSnapshots = maxSnapshots;
    this.undoStack = [];
    this.redoStack = [];
    this.currentState = JSON.parse(JSON.stringify(initialData));
    this.listeners = [];
    this.operationLog = [];
    this.lastSavedState = JSON.parse(JSON.stringify(initialData));
  }

  /**
   * Push a new snapshot after an operation
   * @param {string} operationName - Human-readable operation description
   * @param {object} newState - The new state after operation
   */
  pushSnapshot(operationName, newState) {
    // Deep copy to prevent external mutation
    const snapshot = {
      name: operationName,
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(newState)),
      before: JSON.parse(JSON.stringify(this.currentState))
    };

    // Save current state to undo stack
    this.undoStack.push({
      ...snapshot,
      state: this.currentState
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

    // Notify listeners
    this.notifyListeners('stateChanged', {
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
      state: this.currentState,
      before: snapshot.before
    });

    this.currentState = snapshot.before;
    this.notifyListeners('stateChanged', {
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
      state: snapshot.before,
      before: this.currentState
    });

    this.currentState = snapshot.state;
    this.notifyListeners('stateChanged', {
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
    return JSON.parse(JSON.stringify(this.currentState));
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
    this.lastSavedState = JSON.parse(JSON.stringify(this.currentState));
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
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  /**
   * Notify all listeners of state change
   */
  notifyListeners(eventType, payload) {
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
      state: JSON.parse(JSON.stringify(this.currentState)),
      timestamp: Date.now(),
      historyLength: this.undoStack.length
    };
  }

  /**
   * Restore from backup snapshot
   */
  restoreFromBackup(snapshot) {
    this.currentState = JSON.parse(JSON.stringify(snapshot.state));
    this.undoStack = [];
    this.redoStack = [];
    this.notifyListeners('restored', { timestamp: snapshot.timestamp });
  }
}

// Export for use in script.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorState;
}
