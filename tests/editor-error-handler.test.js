/**
 * EditorErrorHandler Test Suite
 * Tests error categorization, recovery suggestions, and error logging
 */

// Load EditorErrorHandler
const EditorErrorHandler = require('../editor-error-handler.js');

// Test error categorization
function testErrorCategorization() {
  const handler = new EditorErrorHandler();
  const validationError = new Error('Validation failed');
  validationError.code = 'VALIDATION_ERROR';
  const category = handler.categorizeError(validationError);
  console.assert(category === 'validation', 'Should categorize as validation');
  console.log('✓ Error categorization test passed');
}

// Test error recovery suggestions
function testRecoverySuggestions() {
  const handler = new EditorErrorHandler();
  const suggestions = handler.getRecoverySuggestions('SAVE_FAILED');
  console.assert(suggestions.length > 0, 'Should provide suggestions');
  console.assert(suggestions.some(s => s.includes('Check')), 'Should include diagnostic steps');
  console.log('✓ Recovery suggestions test passed');
}

// Test error logging
function testErrorLogging() {
  const handler = new EditorErrorHandler();
  handler.log('TEST_ERROR', 'Test message', { detail: 'info' });
  const logs = handler.getErrorLogs();
  console.assert(logs.length > 0, 'Should log errors');
  console.assert(logs[0].code === 'TEST_ERROR', 'Should store error code');
  console.log('✓ Error logging test passed');
}

// Run tests
testErrorCategorization();
testRecoverySuggestions();
testErrorLogging();
console.log('✅ All EditorErrorHandler tests passed');
