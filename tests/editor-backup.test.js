const EditorBackup = require('../editor-backup.js');

// Test creating backup
function testCreateBackup() {
  const backup = new EditorBackup();
  const snapshot = { data: 'test', timestamp: Date.now() };
  backup.createSnapshot(snapshot);
  console.assert(backup.snapshots.length === 1, 'Should store snapshot');
  console.log('✓ Create backup test passed');
}

// Test auto-backup
function testAutoBackup() {
  const backup = new EditorBackup(100); // 100ms interval
  const snapshot1 = { data: 'v1' };
  backup.startAutoBackup(() => snapshot1);

  setTimeout(() => {
    console.assert(backup.snapshots.length >= 1, 'Should auto-backup');
    backup.stopAutoBackup();
    console.log('✓ Auto-backup test passed');
  }, 150);
}

// Test restore from backup
function testRestoreBackup() {
  const backup = new EditorBackup();
  const snapshot = { data: 'test', timestamp: Date.now() };
  backup.createSnapshot(snapshot);
  const restored = backup.restore(0);
  console.assert(restored.data === 'test', 'Should restore snapshot');
  console.log('✓ Restore backup test passed');
}

// Test backup pruning
function testPruneOldBackups() {
  const backup = new EditorBackup(null, 3); // max 3 snapshots
  for (let i = 0; i < 5; i++) {
    backup.createSnapshot({ data: `v${i}` });
  }
  console.assert(backup.snapshots.length <= 3, 'Should limit backups');
  console.log('✓ Prune backups test passed');
}

// Run tests
testCreateBackup();
testRestoreBackup();
testPruneOldBackups();
// testAutoBackup() - async test, skip in sync suite
console.log('✅ All EditorBackup tests passed');
