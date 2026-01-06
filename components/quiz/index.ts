/**
 * Unscarred Quiz Component System
 * Main entry point - exports all quiz components
 */

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  // Core Question Types
  Question,
  QuestionType,
  BaseQuestion,
  SingleChoiceQuestion,
  MultiChoiceQuestion,
  BinaryQuestion,
  LikertQuestion,
  SliderQuestion,
  ScenarioQuestion,
  MatrixQuestion,
  RankingQuestion,
  TextInputQuestion,
  ImageChoiceQuestion,

  // Options & Scales
  ChoiceOption,
  ScenarioOption,
  ImageOption,
  LikertScale,
  MatrixRow,
  MatrixColumn,
  RankingItem,

  // Scoring
  ScoreContribution,
  ScoringConfig,
  ScoringCategory,
  ScoringType,
  ScoreThreshold,
  GroundZeroConfig,
  TieBreakerConfig,

  // Results
  QuizResult,
  ResultDimension,
  CategoryScores,
  AnswerContribution,
  ResultBlurb,
  CTAConfig,

  // Quiz Structure
  Quiz,
  QuizSection,
  QuizOptions,

  // State
  QuizState,
  QuizAnswer,
  QuizMetadata,

  // Conditional Logic
  ConditionalLogic,
  Condition,
  ConditionOperator,

  // Validation
  ValidationResult,
  ValidationError,
  ValidationErrorCode,

  // Archetypes & Types
  SurvivorArchetype,
  ArchetypeProfile,
  WarType,
  WarProfile,
  MaskType,
  MaskProfile,

  // Events
  QuizEvent,
  QuizEventType,
  QuizEventHandler,

  // Config
  QuizConfig,
} from './types';

// ============================================================================
// CLASS EXPORTS
// ============================================================================

export { QuizEngine, createQuizState, cloneState, updateAnswer } from './QuizEngine';
export { QuizRenderer } from './QuizRenderer';
export { ScoringEngine } from './scoring';

// ============================================================================
// QUESTION RENDERING
// ============================================================================

export {
  renderQuestion,
  attachQuestionEvents,
  questionStyles,
} from './questions';

// ============================================================================
// SCORING UTILITIES
// ============================================================================

export {
  calculatePercentage,
  normalizeScores,
  getTopCategories,
  scoresAreTied,
  calculateSpread,
  labelWar,
  labelMask,
  labelArchetype,
  formatScoresForBars,
  groupContributionsByCategory,
  WAR_MASK_SCORING,
  ARCHETYPE_SCORING,
} from './scoring';

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

export {
  validateAnswer,
  validateQuizState,
  isQuizComplete,
  getUnansweredQuestions,
  evaluateConditions,
  isEmpty,
  sanitizeText,
  isValidEmail,
  getErrorForQuestion,
  formatValidationErrors,
  validators,
  composeValidators,
  calculateProgress,
  getVisibleQuestionIndex,
  getVisibleQuestionCount,
} from './validation';

// ============================================================================
// QUICK START FACTORY
// ============================================================================

import type { Quiz, QuizConfig } from './types';
import { QuizEngine } from './QuizEngine';
import { QuizRenderer } from './QuizRenderer';

/**
 * Create and initialize a complete quiz instance
 * 
 * @example
 * ```typescript
 * import { createQuiz, myQuizData } from './components/quiz';
 * 
 * const { engine, renderer } = createQuiz(myQuizData, '#quiz-container');
 * renderer.renderIntro(); // Show intro screen
 * // or
 * renderer.render(); // Start immediately
 * ```
 */
export function createQuiz(
  quiz: Quiz,
  containerSelector: string,
  config?: Partial<QuizConfig>
): { engine: QuizEngine; renderer: QuizRenderer } | null {
  const engine = new QuizEngine(quiz, config);
  const renderer = QuizRenderer.create(engine, containerSelector, quiz);
  
  if (!renderer) {
    console.error('[createQuiz] Failed to create renderer');
    return null;
  }

  return { engine, renderer };
}

// ============================================================================
// EXAMPLE QUIZ DEFINITION
// ============================================================================

/**
 * Example quiz structure for reference
 * Copy and modify this for new quizzes
 */
export const EXAMPLE_QUIZ: Quiz = {
  id: 'example-quiz',
  title: 'Example Assessment',
  subtitle: 'A demonstration of the quiz system',
  description: 'This is an example quiz showing various question types and scoring.',
  version: '1.0.0',
  estimatedTime: '3 min',
  
  questions: [
    {
      id: 'q1',
      type: 'binary',
      label: 'Quick check',
      text: 'When someone cancels plans, do you assume the worst?',
      positiveLabel: 'Yes, I spiral',
      negativeLabel: 'No, I stay calm',
      scoringCategory: 'abandonment',
    },
    {
      id: 'q2',
      type: 'single-choice',
      label: 'Conflict response',
      text: 'During an argument, what happens first?',
      options: [
        { letter: 'A', text: 'I flood with emotion', mask: 'flooded', war: 'abandonment' },
        { letter: 'B', text: 'I go cold and detached', mask: 'armored', war: 'exposure' },
        { letter: 'C', text: 'I try to fix everything', mask: 'phantom', war: 'abandonment' },
        { letter: 'D', text: 'I analyze what went wrong', mask: 'analyzer', war: 'erasure' },
      ],
    },
    {
      id: 'q3',
      type: 'likert',
      label: 'Self-assessment',
      text: 'I often feel like I\'m "too much" for people.',
      scale: {
        points: 5,
        labels: ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'],
      },
      scoringCategory: 'flooded',
    },
  ],
  
  scoring: {
    type: 'composite',
    categories: [
      { id: 'abandonment', name: 'Abandonment', displayName: 'Abandonment War' },
      { id: 'exposure', name: 'Exposure', displayName: 'Exposure War' },
      { id: 'entrapment', name: 'Entrapment', displayName: 'Entrapment War' },
      { id: 'erasure', name: 'Erasure', displayName: 'Erasure War' },
      { id: 'flooded', name: 'Flooded', displayName: 'Flooded Mirror' },
      { id: 'armored', name: 'Armored', displayName: 'Armored Mirror' },
      { id: 'phantom', name: 'Phantom', displayName: 'Phantom Performer' },
      { id: 'analyzer', name: 'Analyzer', displayName: 'Hyper Analyzer' },
    ],
    groundZeroThreshold: {
      minCategories: 3,
      maxSpread: 2,
      minScore: 3,
    },
  },
  
  results: {
    'abandonment-flooded': {
      title: 'Abandonment War + Flooded Mirror',
      blurb: 'Your system is on high alert for loss and rejection.',
      nervousSystemNote: 'The panic is your body trying to keep you safe.',
      doThisWeek: [
        'Practice one grounding technique when panic hits',
        'Notice the trigger before the spiral',
      ],
      avoid: ['Testing behaviors', 'Seeking reassurance compulsively'],
      primaryCTA: { text: 'Learn More', url: '/survivor-types/fixer' },
    },
    // Add more result combinations...
  },
  
  options: {
    showProgress: true,
    showQuestionNumbers: true,
    allowBackNavigation: true,
    requireAllQuestions: true,
    showResultsBreakdown: true,
  },
};










