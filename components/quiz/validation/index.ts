/**
 * Quiz Form Validation
 * Validation utilities for quiz answers and form inputs
 */

import type {
  Question,
  QuizState,
  ValidationResult,
  ValidationError,
  ValidationErrorCode,
  ConditionalLogic,
  Condition,
  MultiChoiceQuestion,
  TextInputQuestion,
  SliderQuestion,
} from '../types';

// ============================================================================
// MAIN VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a single answer against its question requirements
 */
export function validateAnswer(
  question: Question,
  value: unknown
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check required
  if (question.required !== false && isEmpty(value)) {
    errors.push({
      questionId: question.id,
      message: 'This question requires an answer',
      code: 'required',
    });
    return { isValid: false, errors };
  }

  // Skip further validation if empty and not required
  if (isEmpty(value)) {
    return { isValid: true, errors: [] };
  }

  // Type-specific validation
  switch (question.type) {
    case 'multi-choice':
      errors.push(...validateMultiChoice(question as MultiChoiceQuestion, value));
      break;
    case 'text-input':
      errors.push(...validateTextInput(question as TextInputQuestion, value));
      break;
    case 'slider':
      errors.push(...validateSlider(question as SliderQuestion, value));
      break;
    case 'likert':
      errors.push(...validateLikert(question, value));
      break;
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate all answers in a quiz state
 */
export function validateQuizState(
  questions: Question[],
  state: QuizState
): ValidationResult {
  const allErrors: ValidationError[] = [];

  questions.forEach(question => {
    // Check conditional display
    if (question.conditionalDisplay && !evaluateConditions(question.conditionalDisplay, state)) {
      return; // Skip validation for hidden questions
    }

    const answer = state.answers[question.id];
    const result = validateAnswer(question, answer?.value);
    allErrors.push(...result.errors);
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
}

/**
 * Check if quiz is complete (all required questions answered)
 */
export function isQuizComplete(questions: Question[], state: QuizState): boolean {
  return questions.every(question => {
    // Skip conditional questions that shouldn't be shown
    if (question.conditionalDisplay && !evaluateConditions(question.conditionalDisplay, state)) {
      return true;
    }

    // Check if required questions have answers
    if (question.required !== false) {
      const answer = state.answers[question.id];
      return !isEmpty(answer?.value);
    }

    return true;
  });
}

/**
 * Get list of unanswered required questions
 */
export function getUnansweredQuestions(questions: Question[], state: QuizState): Question[] {
  return questions.filter(question => {
    if (question.conditionalDisplay && !evaluateConditions(question.conditionalDisplay, state)) {
      return false;
    }
    if (question.required === false) {
      return false;
    }
    const answer = state.answers[question.id];
    return isEmpty(answer?.value);
  });
}

// ============================================================================
// TYPE-SPECIFIC VALIDATORS
// ============================================================================

function validateMultiChoice(question: MultiChoiceQuestion, value: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const selections = Array.isArray(value) ? value : [];

  if (question.minSelections && selections.length < question.minSelections) {
    errors.push({
      questionId: question.id,
      message: `Please select at least ${question.minSelections} option${question.minSelections > 1 ? 's' : ''}`,
      code: 'min-selections',
    });
  }

  if (question.maxSelections && selections.length > question.maxSelections) {
    errors.push({
      questionId: question.id,
      message: `Please select no more than ${question.maxSelections} option${question.maxSelections > 1 ? 's' : ''}`,
      code: 'max-selections',
    });
  }

  return errors;
}

function validateTextInput(question: TextInputQuestion, value: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const text = String(value || '');

  if (question.minLength && text.length < question.minLength) {
    errors.push({
      questionId: question.id,
      message: `Please enter at least ${question.minLength} characters`,
      code: 'min-length',
    });
  }

  if (question.maxLength && text.length > question.maxLength) {
    errors.push({
      questionId: question.id,
      message: `Please enter no more than ${question.maxLength} characters`,
      code: 'max-length',
    });
  }

  if (question.validationPattern) {
    const regex = new RegExp(question.validationPattern);
    if (!regex.test(text)) {
      errors.push({
        questionId: question.id,
        message: 'Please enter a valid format',
        code: 'pattern',
      });
    }
  }

  return errors;
}

function validateSlider(question: SliderQuestion, value: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const num = typeof value === 'number' ? value : parseFloat(String(value));

  if (isNaN(num)) {
    errors.push({
      questionId: question.id,
      message: 'Please select a value',
      code: 'invalid-format',
    });
    return errors;
  }

  if (num < question.min || num > question.max) {
    errors.push({
      questionId: question.id,
      message: `Please select a value between ${question.min} and ${question.max}`,
      code: 'out-of-range',
    });
  }

  return errors;
}

function validateLikert(question: Question, value: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const num = typeof value === 'number' ? value : parseFloat(String(value));

  if (isNaN(num)) {
    errors.push({
      questionId: question.id,
      message: 'Please select a rating',
      code: 'invalid-format',
    });
  }

  return errors;
}

// ============================================================================
// CONDITIONAL LOGIC EVALUATION
// ============================================================================

/**
 * Evaluate conditional display logic
 */
export function evaluateConditions(logic: ConditionalLogic, state: QuizState): boolean {
  const results = logic.conditions.map(condition => evaluateCondition(condition, state));

  if (logic.operator === 'AND') {
    return results.every(Boolean);
  } else {
    return results.some(Boolean);
  }
}

function evaluateCondition(condition: Condition, state: QuizState): boolean {
  const answer = state.answers[condition.questionId];
  const answerValue = answer?.value;

  switch (condition.operator) {
    case 'equals':
      return answerValue === condition.value;

    case 'not-equals':
      return answerValue !== condition.value;

    case 'contains':
      if (Array.isArray(answerValue)) {
        return answerValue.includes(condition.value);
      }
      return String(answerValue).includes(String(condition.value));

    case 'not-contains':
      if (Array.isArray(answerValue)) {
        return !answerValue.includes(condition.value);
      }
      return !String(answerValue).includes(String(condition.value));

    case 'greater-than':
      return Number(answerValue) > Number(condition.value);

    case 'less-than':
      return Number(answerValue) < Number(condition.value);

    case 'in-range':
      if (Array.isArray(condition.value) && condition.value.length === 2) {
        const num = Number(answerValue);
        return num >= condition.value[0] && num <= condition.value[1];
      }
      return false;

    default:
      return false;
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a value is empty
 */
export function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  return false;
}

/**
 * Sanitize text input (remove harmful content)
 */
export function sanitizeText(text: string): string {
  return text
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get error message for a specific question
 */
export function getErrorForQuestion(
  errors: ValidationError[],
  questionId: string
): ValidationError | undefined {
  return errors.find(e => e.questionId === questionId);
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: ValidationError[]): string {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0].message;
  return `Please fix ${errors.length} issues:\n${errors.map(e => `• ${e.message}`).join('\n')}`;
}

// ============================================================================
// FORM FIELD VALIDATORS
// ============================================================================

export const validators = {
  required: (value: unknown): string | null => {
    return isEmpty(value) ? 'This field is required' : null;
  },

  email: (value: unknown): string | null => {
    if (isEmpty(value)) return null;
    return isValidEmail(String(value)) ? null : 'Please enter a valid email address';
  },

  minLength: (min: number) => (value: unknown): string | null => {
    if (isEmpty(value)) return null;
    return String(value).length >= min ? null : `Must be at least ${min} characters`;
  },

  maxLength: (max: number) => (value: unknown): string | null => {
    if (isEmpty(value)) return null;
    return String(value).length <= max ? null : `Must be no more than ${max} characters`;
  },

  pattern: (regex: RegExp, message: string) => (value: unknown): string | null => {
    if (isEmpty(value)) return null;
    return regex.test(String(value)) ? null : message;
  },

  range: (min: number, max: number) => (value: unknown): string | null => {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a number';
    return num >= min && num <= max ? null : `Must be between ${min} and ${max}`;
  },
};

/**
 * Compose multiple validators
 */
export function composeValidators(
  ...validators: Array<(value: unknown) => string | null>
): (value: unknown) => string | null {
  return (value: unknown) => {
    for (const validator of validators) {
      const error = validator(value);
      if (error) return error;
    }
    return null;
  };
}

// ============================================================================
// PROGRESS TRACKING
// ============================================================================

/**
 * Calculate quiz progress percentage
 */
export function calculateProgress(questions: Question[], state: QuizState): number {
  const visibleQuestions = questions.filter(q => {
    if (!q.conditionalDisplay) return true;
    return evaluateConditions(q.conditionalDisplay, state);
  });

  if (visibleQuestions.length === 0) return 100;

  const answered = visibleQuestions.filter(q => {
    const answer = state.answers[q.id];
    return !isEmpty(answer?.value);
  });

  return Math.round((answered.length / visibleQuestions.length) * 100);
}

/**
 * Get current question index accounting for conditional logic
 */
export function getVisibleQuestionIndex(
  questions: Question[],
  currentIndex: number,
  state: QuizState
): number {
  let visibleIndex = 0;
  for (let i = 0; i < currentIndex && i < questions.length; i++) {
    const q = questions[i];
    if (!q.conditionalDisplay || evaluateConditions(q.conditionalDisplay, state)) {
      visibleIndex++;
    }
  }
  return visibleIndex;
}

/**
 * Get total visible question count
 */
export function getVisibleQuestionCount(questions: Question[], state: QuizState): number {
  return questions.filter(q => {
    if (!q.conditionalDisplay) return true;
    return evaluateConditions(q.conditionalDisplay, state);
  }).length;
}




