/**
 * Unscarred Quiz System - TypeScript Interfaces
 * Core type definitions for assessments, quizzes, and scoring
 */

// ============================================================================
// CORE QUESTION TYPES
// ============================================================================

export type QuestionType = 
  | 'single-choice'      // One answer from multiple options
  | 'multi-choice'       // Multiple answers allowed
  | 'binary'             // Yes/No or Agree/Disagree
  | 'likert'             // Scale rating (1-5, 1-7, etc.)
  | 'slider'             // Continuous scale
  | 'scenario'           // Situational response
  | 'matrix'             // Grid of related items
  | 'ranking'            // Order items by preference
  | 'text-input'         // Free text response
  | 'image-choice';      // Visual options

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  text: string;
  subtext?: string;
  label?: string;                    // Category label (e.g., "Stage check", "Last fight")
  required?: boolean;
  helpText?: string;
  conditionalDisplay?: ConditionalLogic;
}

// ============================================================================
// QUESTION VARIANTS
// ============================================================================

export interface SingleChoiceQuestion extends BaseQuestion {
  type: 'single-choice';
  options: ChoiceOption[];
  randomizeOptions?: boolean;
}

export interface MultiChoiceQuestion extends BaseQuestion {
  type: 'multi-choice';
  options: ChoiceOption[];
  minSelections?: number;
  maxSelections?: number;
  randomizeOptions?: boolean;
}

export interface BinaryQuestion extends BaseQuestion {
  type: 'binary';
  positiveLabel?: string;            // Default: "Yes, this is me"
  negativeLabel?: string;            // Default: "No, not really"
  positiveValue?: number;            // Default: 1
  negativeValue?: number;            // Default: 0
  scoringCategory?: string;          // Category this contributes to
}

export interface LikertQuestion extends BaseQuestion {
  type: 'likert';
  scale: LikertScale;
  reverseCoded?: boolean;            // For reverse-scored items
  scoringCategory?: string;
}

export interface SliderQuestion extends BaseQuestion {
  type: 'slider';
  min: number;
  max: number;
  step?: number;
  minLabel?: string;
  maxLabel?: string;
  defaultValue?: number;
  scoringCategory?: string;
}

export interface ScenarioQuestion extends BaseQuestion {
  type: 'scenario';
  scenario: string;                  // The situational description
  options: ScenarioOption[];
}

export interface MatrixQuestion extends BaseQuestion {
  type: 'matrix';
  rows: MatrixRow[];
  columns: MatrixColumn[];
}

export interface RankingQuestion extends BaseQuestion {
  type: 'ranking';
  items: RankingItem[];
  minRank?: number;                  // Minimum items to rank
  maxRank?: number;                  // Maximum items to rank
}

export interface TextInputQuestion extends BaseQuestion {
  type: 'text-input';
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  validationPattern?: string;
  rows?: number;                     // For textarea
}

export interface ImageChoiceQuestion extends BaseQuestion {
  type: 'image-choice';
  options: ImageOption[];
  columns?: number;                  // Grid layout
}

// Union type of all questions
export type Question = 
  | SingleChoiceQuestion
  | MultiChoiceQuestion
  | BinaryQuestion
  | LikertQuestion
  | SliderQuestion
  | ScenarioQuestion
  | MatrixQuestion
  | RankingQuestion
  | TextInputQuestion
  | ImageChoiceQuestion;

// ============================================================================
// OPTION & SCALE TYPES
// ============================================================================

export interface ChoiceOption {
  letter?: string;                   // A, B, C, D...
  text: string;
  value?: string | number;
  
  // Scoring contributions
  scores?: ScoreContribution[];      // Multiple category contributions
  mask?: string;                     // Mirror mask type
  war?: string;                      // War type
  archetype?: string;                // Survivor archetype
  
  // Metadata
  metaStage?: string;                // For stage-setting questions
  icon?: string;
  imageUrl?: string;
}

export interface ScenarioOption extends ChoiceOption {
  consequence?: string;              // What this choice indicates
  intensity?: number;                // How strongly this indicates a pattern
}

export interface ImageOption {
  id: string;
  imageUrl: string;
  alt: string;
  label?: string;
  scores?: ScoreContribution[];
}

export interface LikertScale {
  points: number;                    // 5, 7, etc.
  labels: string[];                  // ["Strongly Disagree", ..., "Strongly Agree"]
  values?: number[];                 // Custom values if not 1-n
}

export interface MatrixRow {
  id: string;
  text: string;
  scoringCategory?: string;
}

export interface MatrixColumn {
  id: string;
  label: string;
  value: number;
}

export interface RankingItem {
  id: string;
  text: string;
  scoringCategory?: string;
}

// ============================================================================
// SCORING SYSTEM
// ============================================================================

export interface ScoreContribution {
  category: string;                  // Category name
  value: number;                     // Points to add
  weight?: number;                   // Multiplier (default: 1)
}

export interface ScoringConfig {
  type: ScoringType;
  categories: ScoringCategory[];
  groundZeroThreshold?: GroundZeroConfig;  // For detecting "all fronts" patterns
  tieBreaker?: TieBreakerConfig;
}

export type ScoringType = 
  | 'highest-wins'                   // Category with highest score
  | 'threshold'                      // Multiple categories can trigger
  | 'weighted-average'               // Weighted mean across categories
  | 'composite'                      // Combined war + mask style
  | 'spectrum';                      // Position on a spectrum

export interface ScoringCategory {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  color?: string;
  icon?: string;
  maxScore?: number;
  thresholds?: ScoreThreshold[];
}

export interface ScoreThreshold {
  min: number;
  max: number;
  level: string;                     // e.g., "low", "moderate", "high"
  label?: string;
  description?: string;
}

export interface GroundZeroConfig {
  minCategories: number;             // Minimum categories that must score high
  maxSpread: number;                 // Maximum difference between top scores
  minScore: number;                  // Minimum score for each category
}

export interface TieBreakerConfig {
  method: 'first' | 'last' | 'random' | 'secondary-category';
  secondaryCategory?: string;
}

// ============================================================================
// RESULTS & OUTCOMES
// ============================================================================

export interface QuizResult {
  resultKey: string;                 // e.g., "abandonment-flooded"
  primary: ResultDimension;
  secondary?: ResultDimension;
  scores: CategoryScores;
  contributions: AnswerContribution[];
  isGroundZero?: boolean;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface ResultDimension {
  category: string;
  score: number;
  percentage?: number;
  level?: string;
}

export interface CategoryScores {
  [category: string]: number;
}

export interface AnswerContribution {
  questionId: string;
  questionLabel: string;
  answerText: string;
  categories: ScoreContribution[];
}

export interface ResultBlurb {
  title: string;
  subtitle?: string;
  blurb: string;
  clinicalNote?: string;
  nervousSystemNote?: string;
  doThisWeek?: string[];
  avoid?: string[];
  scripts?: string[];
  primaryCTA?: CTAConfig;
  secondaryCTA?: CTAConfig;
}

export interface CTAConfig {
  text: string;
  url: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
}

// ============================================================================
// QUIZ STRUCTURE
// ============================================================================

export interface Quiz {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  
  // Metadata
  version: string;
  createdAt?: Date;
  updatedAt?: Date;
  estimatedTime?: string;            // "5 min"
  questionCount?: number;
  
  // Content
  questions: Question[];
  sections?: QuizSection[];
  
  // Scoring & Results
  scoring: ScoringConfig;
  results: Record<string, ResultBlurb>;
  
  // Options
  options?: QuizOptions;
}

export interface QuizSection {
  id: string;
  title: string;
  description?: string;
  questionIds: string[];
}

export interface QuizOptions {
  randomizeQuestions?: boolean;
  showProgress?: boolean;
  showQuestionNumbers?: boolean;
  allowBackNavigation?: boolean;
  requireAllQuestions?: boolean;
  showResultsBreakdown?: boolean;
  collectEmail?: boolean;
  emailRequired?: boolean;
  genderSelection?: boolean;
  saveProgress?: boolean;
}

// ============================================================================
// QUIZ STATE
// ============================================================================

export interface QuizState {
  quizId: string;
  currentQuestionIndex: number;
  answers: Record<string, QuizAnswer>;
  startedAt: Date;
  completedAt?: Date;
  metadata?: QuizMetadata;
}

export interface QuizAnswer {
  questionId: string;
  value: string | number | string[] | number[];
  timestamp: Date;
}

export interface QuizMetadata {
  stage?: string;                    // "in_it", "tangled", etc.
  gender?: 'woman' | 'man' | 'other';
  email?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

// ============================================================================
// CONDITIONAL LOGIC
// ============================================================================

export interface ConditionalLogic {
  conditions: Condition[];
  operator: 'AND' | 'OR';
}

export interface Condition {
  questionId: string;
  operator: ConditionOperator;
  value: string | number | string[] | number[];
}

export type ConditionOperator = 
  | 'equals'
  | 'not-equals'
  | 'contains'
  | 'not-contains'
  | 'greater-than'
  | 'less-than'
  | 'in-range';

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  questionId: string;
  field?: string;
  message: string;
  code: ValidationErrorCode;
}

export type ValidationErrorCode = 
  | 'required'
  | 'min-length'
  | 'max-length'
  | 'pattern'
  | 'min-selections'
  | 'max-selections'
  | 'out-of-range'
  | 'invalid-format';

// ============================================================================
// SURVIVOR ARCHETYPES (Your 6 Types)
// ============================================================================

export type SurvivorArchetype = 
  | 'fixer'
  | 'vanisher'
  | 'analyzer'
  | 'warrior'
  | 'chameleon'
  | 'performer';

export interface ArchetypeProfile {
  id: SurvivorArchetype;
  name: string;
  icon: string;
  tagline: string;
  profile: string;
  clinicalLabel: string;
  nervousSystemNote: string;
  doThisWeek: string[];
  avoid: string[];
  scripts: string[];
  relatedWars: string[];
  primaryProgram: CTAConfig;
  secondaryProgram: CTAConfig;
}

// ============================================================================
// WAR TYPES
// ============================================================================

export type WarType = 
  | 'abandonment'
  | 'exposure'
  | 'entrapment'
  | 'erasure';

export interface WarProfile {
  id: WarType;
  name: string;
  icon: string;
  coreFear: string;
  bodySignal: string;
  triggerPattern: string;
  protectionStyle: string;
  healingPath: string;
}

// ============================================================================
// MASK TYPES
// ============================================================================

export type MaskType = 
  | 'flooded'
  | 'armored'
  | 'phantom'
  | 'analyzer';

export interface MaskProfile {
  id: MaskType;
  name: string;
  displayName: string;
  icon: string;
  description: string;
  underPressure: string;
  healingFocus: string;
}

// ============================================================================
// EVENT SYSTEM
// ============================================================================

export type QuizEventType = 
  | 'quiz:started'
  | 'quiz:question-answered'
  | 'quiz:question-skipped'
  | 'quiz:navigation'
  | 'quiz:completed'
  | 'quiz:results-viewed'
  | 'quiz:restarted'
  | 'quiz:email-submitted';

export interface QuizEvent {
  type: QuizEventType;
  quizId: string;
  timestamp: Date;
  data: Record<string, unknown>;
}

export type QuizEventHandler = (event: QuizEvent) => void;

// ============================================================================
// CONFIGURATION
// ============================================================================

export interface QuizConfig {
  // Theming
  theme?: 'dark' | 'light' | 'auto';
  accentColor?: string;
  
  // Behavior
  autoAdvance?: boolean;             // Auto-advance on answer
  autoAdvanceDelay?: number;         // Delay in ms
  animationsEnabled?: boolean;
  
  // Integration
  webhookUrl?: string;               // POST results to URL
  analyticsEnabled?: boolean;
  debugMode?: boolean;
  
  // Storage
  storageKey?: string;               // LocalStorage key prefix
  persistAnswers?: boolean;
}









