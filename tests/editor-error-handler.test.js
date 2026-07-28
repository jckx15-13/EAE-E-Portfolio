/**
 * EditorErrorHandler Test Suite
 * Comprehensive tests for error categorization, recovery suggestions, error logging,
 * and listener management
 */

// Load EditorErrorHandler
const EditorErrorHandler = require('../editor-error-handler.js');

// Test 1: Error categorization with correct suggestion keys
function testErrorCategorization() {
  const handler = new EditorErrorHandler();
  const validationError = new Error('Validation failed');
  validationError.code = 'VALIDATION_ERROR';
  const category = handler.categorizeError(validationError);
  console.assert(category === 'VALIDATION_ERROR', 'Should categorize as VALIDATION_ERROR');
  console.log('✓ Test 1: Error categorization test passed');
}

// Test 2: Error recovery suggestions
function testRecoverySuggestions() {
  const handler = new EditorErrorHandler();
  const suggestions = handler.getRecoverySuggestions('SAVE_FAILED');
  console.assert(suggestions.length > 0, 'Should provide suggestions');
  console.assert(suggestions.some(s => s.includes('Check')), 'Should include diagnostic steps');
  console.log('✓ Test 2: Recovery suggestions test passed');
}

// Test 3: Error logging
function testErrorLogging() {
  const handler = new EditorErrorHandler();
  handler.log('TEST_ERROR', 'Test message', { detail: 'info' });
  const logs = handler.getErrorLogs();
  console.assert(logs.length > 0, 'Should log errors');
  console.assert(logs[0].code === 'TEST_ERROR', 'Should store error code');
  console.log('✓ Test 3: Error logging test passed');
}

// Test 4: Case-insensitive error code matching
function testCaseInsensitiveMatching() {
  const handler = new EditorErrorHandler();
  
  const err1 = new Error('Test');
  err1.code = 'validation_error'; // lowercase
  const cat1 = handler.categorizeError(err1);
  console.assert(cat1 === 'VALIDATION_ERROR', 'Should handle lowercase validation error');
  
  const err2 = new Error('Test');
  err2.code = 'SaVe_FaIlEd'; // mixed case
  const cat2 = handler.categorizeError(err2);
  console.assert(cat2 === 'SAVE_FAILED', 'Should handle mixed case save error');
  
  const err3 = new Error('Test');
  err3.code = 'CONFLICT_ERROR'; // uppercase
  const cat3 = handler.categorizeError(err3);
  console.assert(cat3 === 'CONFLICT_DETECTED', 'Should handle uppercase conflict error');
  
  console.log('✓ Test 4: Case-insensitive matching test passed');
}

// Test 5: Error codes with missing code/name properties
function testErrorCodesWithMissingProperties() {
  const handler = new EditorErrorHandler();
  
  const err1 = new Error('Generic error'); // Error.name = 'Error', no code
  const cat1 = handler.categorizeError(err1);
  console.assert(cat1 === 'UNKNOWN_ERROR', 'Should return UNKNOWN_ERROR for generic error');
  
  const err2 = { code: undefined }; // No code or name
  const cat2 = handler.categorizeError(err2);
  console.assert(cat2 === 'UNKNOWN_ERROR', 'Should return UNKNOWN_ERROR for missing properties');
  
  const err3 = {}; // Empty object
  const cat3 = handler.categorizeError(err3);
  console.assert(cat3 === 'UNKNOWN_ERROR', 'Should return UNKNOWN_ERROR for empty error object');
  
  console.log('✓ Test 5: Missing properties handling test passed');
}

// Test 6: getErrorLogs() with various limits
function testErrorLogsWithLimits() {
  const handler = new EditorErrorHandler();
  
  // Log 10 errors
  for (let i = 0; i < 10; i++) {
    handler.log(`ERROR_${i}`, `Error message ${i}`);
  }
  
  // Test default limit (20)
  const logs20 = handler.getErrorLogs();
  console.assert(logs20.length === 10, 'Should return all 10 logs with default limit');
  
  // Test custom limit
  const logs5 = handler.getErrorLogs(5);
  console.assert(logs5.length === 5, 'Should return exactly 5 logs with limit 5');
  
  // Test limit larger than available logs
  const logs50 = handler.getErrorLogs(50);
  console.assert(logs50.length === 10, 'Should return all available logs even if limit is larger');
  
  // Test limit of 1
  const logs1 = handler.getErrorLogs(1);
  console.assert(logs1.length === 1, 'Should return exactly 1 log with limit 1');
  console.assert(logs1[0].code === 'ERROR_9', 'Should return the most recent error');
  
  console.log('✓ Test 6: getErrorLogs() with limits test passed');
}

// Test 7: clearErrorLogs() behavior
function testClearErrorLogs() {
  const handler = new EditorErrorHandler();
  
  // Log some errors
  handler.log('ERROR_1', 'Error 1');
  handler.log('ERROR_2', 'Error 2');
  handler.log('ERROR_3', 'Error 3');
  
  const logsBefore = handler.getErrorLogs();
  console.assert(logsBefore.length === 3, 'Should have 3 errors before clearing');
  
  // Clear the logs
  handler.clearErrorLogs();
  
  const logsAfter = handler.getErrorLogs();
  console.assert(logsAfter.length === 0, 'Should have 0 errors after clearing');
  
  // Log new errors after clearing
  handler.log('ERROR_4', 'Error 4');
  const logsAfterNew = handler.getErrorLogs();
  console.assert(logsAfterNew.length === 1, 'Should accept new errors after clearing');
  console.assert(logsAfterNew[0].code === 'ERROR_4', 'Should be the new error');
  
  console.log('✓ Test 7: clearErrorLogs() behavior test passed');
}

// Test 8: Listener unsubscribe functionality
function testListenerUnsubscribe() {
  const handler = new EditorErrorHandler();
  let callCount1 = 0;
  let callCount2 = 0;
  
  // Subscribe two listeners
  const unsubscribe1 = handler.onError(() => {
    callCount1++;
  });
  
  const unsubscribe2 = handler.onError(() => {
    callCount2++;
  });
  
  // Log an error - both should be called
  handler.log('ERROR_1', 'Test 1');
  console.assert(callCount1 === 1, 'First listener should be called once');
  console.assert(callCount2 === 1, 'Second listener should be called once');
  
  // Unsubscribe first listener
  unsubscribe1();
  handler.log('ERROR_2', 'Test 2');
  console.assert(callCount1 === 1, 'First listener should not be called after unsubscribe');
  console.assert(callCount2 === 2, 'Second listener should be called again');
  
  // Unsubscribe second listener
  unsubscribe2();
  handler.log('ERROR_3', 'Test 3');
  console.assert(callCount1 === 1, 'First listener count should remain 1');
  console.assert(callCount2 === 2, 'Second listener count should remain 2');
  
  // Re-subscribe and verify it works again
  handler.onError(() => {
    callCount1++;
  });
  handler.log('ERROR_4', 'Test 4');
  console.assert(callCount1 === 2, 'New listener should be called');
  
  console.log('✓ Test 8: Listener unsubscribe functionality test passed');
}

// Test 9: Error code type consistency with createUserMessage
function testErrorCodeTypeConsistency() {
  const handler = new EditorErrorHandler();
  
  // Test that categorizeError() returns codes that work with createUserMessage()
  const validationErr = new Error('Test');
  validationErr.code = 'VALIDATION_ERROR';
  const validationCode = handler.categorizeError(validationErr);
  const validationMsg = handler.createUserMessage(validationCode);
  console.assert(validationMsg.title.includes('Validation'), 'Should create proper validation message');
  
  const saveErr = new Error('Test');
  saveErr.code = 'SAVE_FAILED';
  const saveCode = handler.categorizeError(saveErr);
  const saveMsg = handler.createUserMessage(saveCode);
  console.assert(saveMsg.title.includes('Save'), 'Should create proper save message');
  
  console.log('✓ Test 9: Error code type consistency test passed');
}

// Run all tests
testErrorCategorization();
testRecoverySuggestions();
testErrorLogging();
testCaseInsensitiveMatching();
testErrorCodesWithMissingProperties();
testErrorLogsWithLimits();
testClearErrorLogs();
testListenerUnsubscribe();
testErrorCodeTypeConsistency();

console.log('');
console.log('✅ All 9 EditorErrorHandler tests passed!');
