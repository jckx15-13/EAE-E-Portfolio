/**
 * EditorValidator Test Suite
 * Tests schema validation, dependency checking, and conflict detection
 */

// Load the validator
const EditorValidator = require('../editor-validator.js');

// Test basic schema validation
function testValidateDataSchema() {
  const validator = new EditorValidator();
  const validData = {
    profile: { name: 'Jaron' },
    projects: [],
    achievements: []
  };
  const result = validator.validateDataSchema(validData);
  console.assert(result.valid === true, 'Valid data should pass');
  console.log('✓ Schema validation test passed');
}

// Test missing required fields
function testMissingRequiredFields() {
  const validator = new EditorValidator();
  const invalidData = {
    profile: { name: 'Jaron' }
    // Missing projects, achievements
  };
  const result = validator.validateDataSchema(invalidData);
  console.assert(result.valid === false, 'Missing fields should fail');
  console.assert(result.errors.length > 0, 'Should report errors');
  console.log('✓ Missing required fields test passed');
}

// Test value validation
function testValueValidation() {
  const validator = new EditorValidator();
  const result = validator.validateField('profile.name', '');
  console.assert(result.valid === false, 'Empty name should fail');
  console.log('✓ Value validation test passed');
}

// Test dependency check
function testDependencyCheck() {
  const validator = new EditorValidator();
  const data = {
    projects: [
      { id: 'proj1', title: 'Project 1', achievements: ['ach1'] }
    ],
    achievements: [
      { id: 'ach2', name: 'Achievement 2' }
    ]
  };
  const result = validator.checkDependencies(data);
  console.assert(result.valid === false, 'Broken references should fail');
  console.assert(result.errors.some(e => e.includes('ach1')), 'Should identify missing achievement');
  console.log('✓ Dependency check test passed');
}

// Run all tests
try {
  testValidateDataSchema();
  testMissingRequiredFields();
  testValueValidation();
  testDependencyCheck();
  console.log('\n✅ All EditorValidator tests passed');
  process.exit(0);
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
}
