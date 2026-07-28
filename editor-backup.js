/**
 * EditorBackup: Automatic backup system with restore capability
 * Creates periodic snapshots for recovery and disaster recovery
 */
class EditorBackup {
  constructor(autoBackupIntervalMs = null, maxSnapshots = 20) {
    // Validate parameters
    if (autoBackupIntervalMs !== null && autoBackupIntervalMs <= 0) {
      throw new Error('autoBackupIntervalMs must be positive or null');
    }
    if (maxSnapshots < 1) {
      throw new Error('maxSnapshots must be >= 1');
    }

    this.snapshots = [];
    this.maxSnapshots = maxSnapshots;
    this.autoBackupIntervalMs = autoBackupIntervalMs;
    this.autoBackupTimer = null;
    this.autoBackupFn = null;
    this.listeners = [];

    // Load persisted snapshots to prevent data loss
    this.loadPersistedSnapshots();
  }

  /**
   * Create a manual snapshot
   */
  createSnapshot(data) {
    const snapshot = {
      id: `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      size: JSON.stringify(data).length,
      data: JSON.parse(JSON.stringify(data)), // Deep copy
      manual: true
    };

    this.snapshots.push(snapshot);

    // Prune old snapshots
    if (this.snapshots.length > this.maxSnapshots) {
      const removed = this.snapshots.shift();
      this.notifyListeners('snapshotPruned', { id: removed.id });
    }

    // Persist to localStorage
    this.persistSnapshots();
    this.notifyListeners('snapshotCreated', snapshot);

    return snapshot;
  }

  /**
   * Start automatic backups
   * @param {function} getDataFn - Function that returns current data to backup
   */
  startAutoBackup(getDataFn) {
    if (this.autoBackupTimer) return; // Already running

    this.autoBackupFn = getDataFn;
    this.autoBackupTimer = setInterval(() => {
      try {
        const data = getDataFn();
        const snapshot = {
          id: `auto-backup-${Date.now()}`,
          timestamp: new Date().toISOString(),
          size: JSON.stringify(data).length,
          data: JSON.parse(JSON.stringify(data)),
          manual: false
        };

        this.snapshots.push(snapshot);

        if (this.snapshots.length > this.maxSnapshots) {
          const removed = this.snapshots.shift();
          this.notifyListeners('snapshotPruned', { id: removed.id });
        }

        this.persistSnapshots();
        this.notifyListeners('autoBackupCreated', snapshot);

      } catch (error) {
        console.error('Auto-backup failed:', error);
        this.notifyListeners('autoBackupFailed', { error: error.message });
      }
    }, this.autoBackupIntervalMs);

    console.log(`Auto-backup started (every ${this.autoBackupIntervalMs}ms)`);
  }

  /**
   * Stop automatic backups
   */
  stopAutoBackup() {
    if (this.autoBackupTimer) {
      clearInterval(this.autoBackupTimer);
      this.autoBackupTimer = null;
      this.notifyListeners('autoBackupStopped', {});
      console.log('Auto-backup stopped');
    }
  }

  /**
   * Restore from a snapshot by index
   */
  restore(index) {
    if (index < 0 || index >= this.snapshots.length) {
      throw new Error(`Invalid snapshot index: ${index}`);
    }

    const snapshot = this.snapshots[index];
    return JSON.parse(JSON.stringify(snapshot.data));
  }

  /**
   * Get restore point by ID
   */
  restoreById(id) {
    const snapshot = this.snapshots.find(s => s.id === id);
    if (!snapshot) {
      throw new Error(`Snapshot not found: ${id}`);
    }
    return JSON.parse(JSON.stringify(snapshot.data));
  }

  /**
   * Get list of available restore points
   */
  listRestorePoints() {
    return this.snapshots.map((s, idx) => ({
      index: idx,
      id: s.id,
      timestamp: s.timestamp,
      size: s.size,
      manual: s.manual,
      age: this.getRelativeTime(s.timestamp)
    }));
  }

  /**
   * Get human-readable age (e.g., "5 minutes ago")
   */
  getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now - then;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  /**
   * Export snapshots for external backup
   */
  exportBackups() {
    return {
      version: 1,
      exported: new Date().toISOString(),
      count: this.snapshots.length,
      snapshots: this.snapshots
    };
  }

  /**
   * Import backups from external source
   */
  importBackups(backup) {
    if (!backup.snapshots || !Array.isArray(backup.snapshots)) {
      throw new Error('Invalid backup format');
    }

    this.snapshots = backup.snapshots.map(s => ({
      ...s,
      data: JSON.parse(JSON.stringify(s.data))
    }));

    this.persistSnapshots();
    this.notifyListeners('backupsImported', { count: this.snapshots.length });
  }

  /**
   * Persist snapshots to localStorage
   * @returns {boolean} True if persisted successfully, false otherwise
   */
  persistSnapshots() {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    try {
      const backupData = {
        version: 1,
        exported: new Date().toISOString(),
        snapshots: this.snapshots
      };
      localStorage.setItem('eaeEditorBackups', JSON.stringify(backupData));
      return true;
    } catch (error) {
      console.warn('Could not persist backups:', error);
      return false;
    }
  }

  /**
   * Load persisted snapshots from localStorage
   */
  loadPersistedSnapshots() {
    if (typeof localStorage === 'undefined') {
      return;
    }
    try {
      const stored = localStorage.getItem('eaeEditorBackups');
      if (stored) {
        const backupData = JSON.parse(stored);
        this.snapshots = backupData.snapshots || [];
        console.log(`Loaded ${this.snapshots.length} persisted backup snapshots`);
      }
    } catch (error) {
      console.warn('Could not load persisted backups:', error);
    }
  }

  /**
   * Clear all backups
   */
  clearAll() {
    this.snapshots = [];
    try {
      localStorage.removeItem('eaeEditorBackups');
    } catch (e) {
      console.warn('Could not clear backups:', e);
    }
    this.notifyListeners('backupsCleared', {});
  }

  /**
   * Subscribe to backup events
   * @returns {function} Unsubscribe function to remove the listener
   */
  onBackupEvent(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners(eventType, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(eventType, payload);
      } catch (err) {
        console.error('Backup listener error:', err);
      }
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorBackup;
}
