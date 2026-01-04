/**
 * Unscarred Component System
 * Main entry point for all reusable components
 * 
 * Site Structure:
 * ├── Main Site (unscarred.online)
 * │   ├── / (home)
 * │   ├── /start (quiz funnel)
 * │   ├── /assessments
 * │   ├── /survivor-types (6 archetypes)
 * │   ├── /resources
 * │   ├── /shop
 * │   └── /about
 * │
 * └── All-Front War (unscarred.online/all-front-war)
 *     ├── /ground-zero
 *     ├── /presentations
 *     ├── /parts-work
 *     ├── /myths-vs-reality
 *     ├── /what-actually-works
 *     ├── /assessments
 *     └── /shop
 */

// ============================================================================
// QUIZ SYSTEM
// ============================================================================

export {
  // Factory function
  createQuiz,
  
  // Core classes
  QuizEngine,
  QuizRenderer,
  ScoringEngine,
  
  // State helpers
  createQuizState,
  cloneState,
  updateAnswer,
  
  // Question rendering
  renderQuestion,
  attachQuestionEvents,
  questionStyles,
  
  // Scoring utilities
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
  
  // Validation utilities
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
  
  // Example quiz
  EXAMPLE_QUIZ,
} from './quiz';

// Re-export all types
export type {
  Question,
  QuestionType,
  Quiz,
  QuizState,
  QuizResult,
  QuizConfig,
  ScoringConfig,
  ValidationResult,
  SurvivorArchetype,
  WarType,
  MaskType,
} from './quiz';

// ============================================================================
// SITE STRUCTURE
// ============================================================================

export {
  // Site maps
  MAIN_SITE,
  ALL_FRONT_WAR,
  FULL_SITE_MAP,
  
  // Navigation
  MAIN_NAV,
  WAR_NAV,
  
  // Helpers
  getPage,
  getChildren,
  getBreadcrumbs,
  isWarPath,
  getNavigation,
  
  // Data
  SURVIVOR_ARCHETYPES,
  WAR_TYPES,
  MASK_TYPES,
} from './site/structure';

// Re-export site types
export type {
  SitePage,
  PageMeta,
  PageContent,
  ContentSection,
  PageTemplate,
  SectionType,
  NavItem,
} from './site/structure';



