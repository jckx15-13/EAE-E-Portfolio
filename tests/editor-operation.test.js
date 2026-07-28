/**
 * EditorOperation Tests
 * Tests transactional operation execution with validation and rollback
 */

// Import dependencies
const EditorState = require('../editor-state.js');
const EditorValidator = require('../editor-validator.js');
const EditorErrorHandler = require('../editor-error-handler.js');
const EditorOperation = require('../editor-operation.js');

// Test successful operation
function testSuccessfulOperation() {
  const state = new EditorState({ test: 'data' });
  const op = new EditorOperation(state, 'TEST_OP', () => {
    return { test: 'newdata' };
  });
  const result = op.execute();
  console.assert(result.success === true, 'Operation should succeed');
  console.assert(result.data.test === 'newdata', 'State should update');
  console.log('✓ Successful operation test passed');
}

// Test failed operation with rollback
function testFailedOperationRollback() {
  const state = new EditorState({ test: 'original' });
  const op = new EditorOperation(state, 'FAIL_OP', () => {
    throw new Error('Operation failed');
  });
  const result = op.execute();
  console.assert(result.success === false, 'Operation should fail');
  console.assert(state.getCurrentState().test === 'original', 'State should rollback');
  console.log('✓ Failed operation rollback test passed');
}

// Test validation before operation
function testValidationBeforeOp() {
  const state = new EditorState({
    profile: { name: 'Test', headline: 'Test' },
    projects: [],
    achievements: [],
    sectionOrder: []
  });
  const validator = new EditorValidator();
  const op = new EditorOperation(
    state,
    'VALIDATE_OP',
    () => ({ profile: { name: '', headline: '' }, projects: [], achievements: [], sectionOrder: [] }),
    validator
  );
  const result = op.execute();
  console.assert(result.success === false, 'Should fail validation');
  console.log('✓ Validation before operation test passed');
}

// Test dry-run functionality
function testDryRun() {
  const state = new EditorState({ test: 'data' });
  const op = new EditorOperation(state, 'DRY_RUN', () => {
    return { test: 'newdata' };
  });
  const dryResult = op.dryRun();
  console.assert(dryResult.wouldSucceed === true, 'Dry run should indicate success');
  console.assert(state.getCurrentState().test === 'data', 'State should not change during dry run');
  console.log('✓ Dry run test passed');
}

// Test error handler integration
function testErrorHandlerIntegration() {
  const state = new EditorState({ test: 'data' });
  const errorHandler = new EditorErrorHandler();
  const op = new EditorOperation(
    state,
    'ERROR_OP',
    () => {
      throw new Error('Simulated error');
    },
    null,
    errorHandler
  );
  const result = op.execute();
  console.assert(result.success === false, 'Operation should fail');
  console.assert(errorHandler.errorLog.length > 0, 'Error should be logged');
  console.log('✓ Error handler integration test passed');
}

// Test duration tracking
function testDurationTracking() {
  const state = new EditorState({ test: 'data' });
  const op = new EditorOperation(state, 'TIMED_OP', () => {
    return { test: 'newdata' };
  });
  const result = op.execute();
  console.assert(result.success === true, 'Operation should succeed');
  console.assert(typeof result.duration === 'number', 'Duration should be tracked');
  console.assert(result.duration >= 0, 'Duration should be non-negative');
  console.log('✓ Duration tracking test passed');
}


// Test dry-run side effects warning
function testDryRunSideEffectsWarning() {
  let sideEffectCounter = 0;
  const badChangeFn = () => {
    sideEffectCounter++;
    return { data: 'new' };
  };
  
  const state = new EditorState({ data: 'old' });
  const op = new EditorOperation(state, 'SIDE_EFFECT', badChangeFn);
  op.dryRun();
  
  console.assert(sideEffectCounter === 1, 'Side effect occurs in dryRun (known limitation)');
  console.log('✓ Dry-run side effects warning documented');
}

// Run all tests
function runAllTests() {
  console.log('\n=== EditorOperation Tests ===\n');

  try {
    testSuccessfulOperation();
    testFailedOperationRollback();
    testValidationBeforeOp();
    testDryRun();
    testErrorHandlerIntegration();
    testDurationTracking();
    testDryRunSideEffectsWarning();

    console.log('\n✅ All EditorOperation tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed with error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Export for use in other test suites
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    testSuccessfulOperation,
    testFailedOperationRollback,
    testValidationBeforeOp,
    testDryRun,
    testErrorHandlerIntegration,
    testDurationTracking,
  testDryRunSideEffectsWarning
  };
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests();
}
