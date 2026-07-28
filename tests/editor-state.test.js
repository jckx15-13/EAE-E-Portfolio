// Test EditorState initialization
function testEditorStateInit() {
  const state = new EditorState(window.PORTFOLIO_DATA);
  console.assert(state.canUndo() === false, 'Should have no undo initially');
  console.assert(state.canRedo() === false, 'Should have no redo initially');
  console.log('✓ EditorState initialization test passed');
}

// Test push operation
function testPushSnapshot() {
  const state = new EditorState({ test: 'data' });
  state.pushSnapshot('Test operation 1', { test: 'data2' });
  console.assert(state.canUndo() === true, 'Should be able to undo after push');
  console.log('✓ Push snapshot test passed');
}

// Test undo
function testUndo() {
  const state = new EditorState({ test: 'data1' });
  state.pushSnapshot('Op1', { test: 'data2' });
  state.pushSnapshot('Op2', { test: 'data3' });
  const undone = state.undo();
  console.assert(undone.test === 'data2', 'Undo should restore previous state');
  console.assert(state.canRedo() === true, 'Should be able to redo after undo');
  console.log('✓ Undo test passed');
}

// Test redo
function testRedo() {
  const state = new EditorState({ test: 'data1' });
  state.pushSnapshot('Op1', { test: 'data2' });
  state.undo();
  const redone = state.redo();
  console.assert(redone.test === 'data2', 'Redo should restore next state');
  console.assert(state.canRedo() === false, 'Should not be able to redo at end of stack');
  console.log('✓ Redo test passed');
}

// Test snapshot arity
function testMaxSnapshots() {
  const state = new EditorState({}, 5); // max 5 snapshots
  for (let i = 0; i < 10; i++) {
    state.pushSnapshot(`Op${i}`, { data: i });
  }
  const undoCount = [state.canUndo()];
  for (let i = 0; i < 10; i++) {
    if (state.canUndo()) {
      state.undo();
      undoCount.push(state.canUndo());
    } else {
      break;
    }
  }
  console.assert(undoCount.filter(x => x).length <= 5, 'Should limit snapshots to max');
  console.log('✓ Max snapshots test passed');
}

// Run all tests
testEditorStateInit();
testPushSnapshot();
testUndo();
testRedo();
testMaxSnapshots();
console.log('✅ All EditorState tests passed');
