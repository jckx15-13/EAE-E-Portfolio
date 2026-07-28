/**
 * EditorOperation: Transactional wrapper for all editor changes
 * Ensures atomic operations with validation, logging, and automatic rollback on failure
 */
class EditorOperation {
  constructor(editorState, operationName, changeFn, validator = null, errorHandler = null) {
    this.editorState = editorState;
    this.operationName = operationName;
    this.changeFn = changeFn;
    this.validator = validator;
    this.errorHandler = errorHandler;
    this.beforeState = null;
    this.afterState = null;
    this.validationResult = null;
    this.startTime = null;
  }

  /**
   * Execute the operation with full transaction semantics
   * @returns {object} { success: boolean, data?: object, error?: Error }
   */
  execute() {
    this.startTime = Date.now();
    
    try {
      // 1. Save before state for rollback
      this.beforeState = this.editorState.getCurrentState();

      // 2. Apply the change
      this.afterState = this.changeFn();

      // 3. Validate new state if validator available
      if (this.validator) {
        this.validationResult = this.validator.validateBeforeSave(this.afterState);
        if (!this.validationResult.canSave) {
          const err = new Error('Validation failed: ' + this.validationResult.errors.join(', '));
          err.code = 'VALIDATION_ERROR';
          err.validationErrors = this.validationResult.errors;
          throw err;
        }
      }

      // 4. Push to undo stack
      this.editorState.pushSnapshot(this.operationName, this.afterState);

      const duration = Date.now() - this.startTime;
      
      return {
        success: true,
        data: this.afterState,
        duration,
        operationName: this.operationName
      };

    } catch (error) {
      // Rollback on any error
      this.editorState.currentState = this.beforeState;

      // Log error if handler available
      if (this.errorHandler) {
        this.errorHandler.log(
          error.code || 'OPERATION_FAILED',
          error.message,
          {
            operation: this.operationName,
            validationErrors: error.validationErrors || null,
            beforeState: this.beforeState,
            attemptedState: this.afterState
          }
        );
      } else {
        console.error(`[EditorOperation ${this.operationName}] ${error.message}`, error);
      }

      return {
        success: false,
        error: error,
        errorCode: error.code || 'OPERATION_FAILED',
        operationName: this.operationName,
        validationErrors: error.validationErrors || null
      };
    }
  }

  /**
   * Check if operation would succeed (dry-run)
   * @returns {object} { wouldSucceed: boolean, errors?: string[] }
   */
  dryRun() {
    try {
      const testState = this.changeFn();
      
      if (this.validator) {
        const validation = this.validator.validateBeforeSave(testState);
        return {
          wouldSucceed: validation.canSave,
          errors: validation.errors,
          warnings: validation.warnings
        };
      }

      return { wouldSucceed: true, errors: [] };

    } catch (error) {
      return {
        wouldSucceed: false,
        errors: [error.message]
      };
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorOperation;
}
