/**
 * EditorValidator: Validates data schema, detects conflicts, checks dependencies
 * Ensures all edits maintain data integrity before they're committed
 */
class EditorValidator {
  constructor() {
    this.requiredFields = {
      'profile': ['name', 'headline'],
      'projects': [],
      'achievements': [],
      'sectionOrder': []
    };

    this.fieldConstraints = {
      'profile.name': { minLength: 1, maxLength: 100 },
      'profile.headline': { minLength: 1, maxLength: 200 },
      'projects[].title': { minLength: 1, maxLength: 150 },
      'achievements[].name': { minLength: 1, maxLength: 150 }
    };

    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate entire data schema
   * @returns {object} { valid: boolean, errors: string[], warnings: string[] }
   */
  validateDataSchema(data) {
    this.errors = [];
    this.warnings = [];

    if (!data || typeof data !== 'object') {
      this.errors.push('Data must be a valid object');
      return { valid: false, errors: this.errors, warnings: this.warnings };
    }

    // Check for null/undefined in critical paths
    ['profile', 'projects', 'achievements'].forEach(key => {
      if (!data[key]) {
        this.errors.push(`Missing required section: ${key}`);
      }
    });

    // Validate profile
    if (data.profile) {
      if (!data.profile.name || typeof data.profile.name !== 'string') {
        this.errors.push('profile.name is required and must be a string');
      }
      if (data.profile.name && data.profile.name.length === 0) {
        this.errors.push('profile.name cannot be empty');
      }
    }

    // Validate arrays
    if (data.projects && !Array.isArray(data.projects)) {
      this.errors.push('projects must be an array');
    }
    if (data.achievements && !Array.isArray(data.achievements)) {
      this.errors.push('achievements must be an array');
    }

    // Validate section order
    if (data.sectionOrder && !Array.isArray(data.sectionOrder)) {
      this.errors.push('sectionOrder must be an array');
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Validate a single field value
   * @returns {object} { valid: boolean, error?: string }
   */
  validateField(fieldPath, value) {
    const constraint = this.fieldConstraints[fieldPath];
    
    if (!constraint) {
      // No constraint defined, but basic type check
      if (value === null || value === undefined) {
        if (fieldPath.includes('name') || fieldPath.includes('title')) {
          return { valid: false, error: `${fieldPath} is required` };
        }
      }
      return { valid: true };
    }

    // Check constraints
    if (constraint.minLength && (!value || value.length < constraint.minLength)) {
      return { valid: false, error: `${fieldPath} must be at least ${constraint.minLength} characters` };
    }

    if (constraint.maxLength && value && value.length > constraint.maxLength) {
      return { valid: false, error: `${fieldPath} cannot exceed ${constraint.maxLength} characters` };
    }

    return { valid: true };
  }

  /**
   * Check for broken references and dependencies
   * @returns {object} { valid: boolean, errors: string[] }
   */
  checkDependencies(data) {
    this.errors = [];

    if (!data.projects || !data.achievements) {
      return { valid: true, errors: [] };
    }

    // Build a map of achievement IDs
    const achievementIds = new Set(data.achievements.map(a => a.id));

    // Check projects reference valid achievements
    data.projects.forEach(project => {
      if (project.achievements && Array.isArray(project.achievements)) {
        project.achievements.forEach(achId => {
          if (!achievementIds.has(achId)) {
            this.errors.push(
              `Project "${project.title}" references achievement "${achId}" which does not exist`
            );
          }
        });
      }
    });

    // Check for orphaned achievements (optional warning)
    if (data.projects.length > 0) {
      const referencedIds = new Set();
      data.projects.forEach(project => {
        if (project.achievements) {
          project.achievements.forEach(id => referencedIds.add(id));
        }
      });

      data.achievements.forEach(ach => {
        if (!referencedIds.has(ach.id)) {
          this.warnings.push(`Achievement "${ach.name}" is not referenced by any project`);
        }
      });
    }

    return {
      valid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  /**
   * Detect conflicting edits (if two edits modify same path simultaneously)
   * @returns {object} { conflict: boolean, message?: string }
   */
  detectConflict(path1, path2, edit1, edit2) {
    // Simple conflict: same path modified
    if (path1 === path2 && edit1.value !== edit2.value) {
      return {
        conflict: true,
        message: `Conflict on ${path1}: two different values provided`,
        path: path1,
        value1: edit1.value,
        value2: edit2.value
      };
    }

    // Array insertion conflict: inserting at same index
    if (path1 === path2 && edit1.action === 'insert' && edit2.action === 'insert') {
      if (edit1.index === edit2.index) {
        return {
          conflict: true,
          message: `Conflict: both trying to insert at ${path1}[${edit1.index}]`,
          path: path1,
          index: edit1.index
        };
      }
    }

    return { conflict: false };
  }

  /**
   * Validate before save
   * @returns {object} { canSave: boolean, errors: string[], warnings: string[] }
   */
  validateBeforeSave(data) {
    const schemaValidation = this.validateDataSchema(data);
    const dependencyValidation = this.checkDependencies(data);

    const allErrors = [
      ...schemaValidation.errors,
      ...dependencyValidation.errors
    ];

    const allWarnings = [
      ...schemaValidation.warnings,
      ...dependencyValidation.warnings
    ];

    return {
      canSave: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = EditorValidator;
}
