/**
 * Quiz Engine
 * Main controller for quiz lifecycle, state management, and orchestration
 */

import type {
  Quiz,
  Question,
  QuizState,
  QuizAnswer,
  QuizResult,
  QuizConfig,
  QuizEvent,
  QuizEventType,
  QuizEventHandler,
  QuizMetadata,
  ValidationResult,
} from './types';

import { ScoringEngine } from './scoring';
import { validateAnswer, isQuizComplete, calculateProgress, evaluateConditions } from './validation';

// ============================================================================
// QUIZ ENGINE CLASS
// ============================================================================

export class QuizEngine {
  private quiz: Quiz;
  private config: QuizConfig;
  private state: QuizState;
  private scoringEngine: ScoringEngine;
  private eventHandlers: Map<QuizEventType, QuizEventHandler[]>;
  private questionOrder: number[];

  constructor(quiz: Quiz, config: Partial<QuizConfig> = {}) {
    this.quiz = quiz;
    this.config = {
      theme: 'dark',
      autoAdvance: false,
      autoAdvanceDelay: 300,
      animationsEnabled: true,
      debugMode: false,
      persistAnswers: true,
      storageKey: `unscarred_quiz_${quiz.id}`,
      ...config,
    };

    this.scoringEngine = new ScoringEngine(quiz);
    this.eventHandlers = new Map();
    this.questionOrder = this.initializeQuestionOrder();
    this.state = this.initializeState();

    // Restore saved progress if enabled
    if (this.config.persistAnswers) {
      this.restoreProgress();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  private initializeState(): QuizState {
    return {
      quizId: this.quiz.id,
      currentQuestionIndex: 0,
      answers: {},
      startedAt: new Date(),
      metadata: {},
    };
  }

  private initializeQuestionOrder(): number[] {
    const order = this.quiz.questions.map((_, i) => i);
    
    if (this.quiz.options?.randomizeQuestions) {
      // Fisher-Yates shuffle
      for (let i = order.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [order[i], order[j]] = [order[j], order[i]];
      }
    }

    return order;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATE MANAGEMENT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Get current quiz state
   */
  getState(): QuizState {
    return { ...this.state };
  }

  /**
   * Get current question
   */
  getCurrentQuestion(): Question | null {
    const index = this.questionOrder[this.state.currentQuestionIndex];
    return this.quiz.questions[index] || null;
  }

  /**
   * Get question by index (accounting for ordering)
   */
  getQuestion(index: number): Question | null {
    const actualIndex = this.questionOrder[index];
    return this.quiz.questions[actualIndex] || null;
  }

  /**
   * Get all visible questions (accounting for conditional logic)
   */
  getVisibleQuestions(): Question[] {
    return this.quiz.questions.filter(q => {
      if (!q.conditionalDisplay) return true;
      return evaluateConditions(q.conditionalDisplay, this.state);
    });
  }

  /**
   * Get current answer for a question
   */
  getAnswer(questionId: string): QuizAnswer | undefined {
    return this.state.answers[questionId];
  }

  /**
   * Get current progress (0-100)
   */
  getProgress(): number {
    return calculateProgress(this.quiz.questions, this.state);
  }

  /**
   * Check if quiz is complete
   */
  isComplete(): boolean {
    return isQuizComplete(this.quiz.questions, this.state);
  }

  /**
   * Get total question count
   */
  getTotalQuestions(): number {
    return this.getVisibleQuestions().length;
  }

  /**
   * Get current visible question index
   */
  getCurrentVisibleIndex(): number {
    const visibleQuestions = this.getVisibleQuestions();
    const currentQuestion = this.getCurrentQuestion();
    if (!currentQuestion) return 0;
    return visibleQuestions.findIndex(q => q.id === currentQuestion.id);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ACTIONS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Start the quiz
   */
  start(): void {
    this.state = this.initializeState();
    this.emit('quiz:started', { quizId: this.quiz.id });
    
    if (this.config.debugMode) {
      console.log('[QuizEngine] Quiz started:', this.quiz.id);
    }
  }

  /**
   * Submit an answer for the current question
   */
  submitAnswer(value: unknown): ValidationResult {
    const question = this.getCurrentQuestion();
    if (!question) {
      return { isValid: false, errors: [{ questionId: '', message: 'No current question', code: 'required' }] };
    }

    // Validate the answer
    const validation = validateAnswer(question, value);
    if (!validation.isValid) {
      return validation;
    }

    // Store the answer
    this.state.answers[question.id] = {
      questionId: question.id,
      value,
      timestamp: new Date(),
    };

    // Emit event
    this.emit('quiz:question-answered', {
      questionId: question.id,
      value,
      questionIndex: this.state.currentQuestionIndex,
    });

    // Save progress
    if (this.config.persistAnswers) {
      this.saveProgress();
    }

    // Auto-advance if enabled
    if (this.config.autoAdvance) {
      setTimeout(() => {
        this.next();
      }, this.config.autoAdvanceDelay);
    }

    return { isValid: true, errors: [] };
  }

  /**
   * Navigate to next question
   */
  next(): boolean {
    const visibleQuestions = this.getVisibleQuestions();
    const currentQuestion = this.getCurrentQuestion();
    
    if (!currentQuestion) return false;

    // Find next visible question
    let nextIndex = this.state.currentQuestionIndex + 1;
    while (nextIndex < this.quiz.questions.length) {
      const question = this.getQuestion(nextIndex);
      if (question && (!question.conditionalDisplay || evaluateConditions(question.conditionalDisplay, this.state))) {
        break;
      }
      nextIndex++;
    }

    if (nextIndex >= this.quiz.questions.length) {
      // Quiz complete
      return false;
    }

    this.state.currentQuestionIndex = nextIndex;
    this.emit('quiz:navigation', { direction: 'next', index: nextIndex });

    if (this.config.persistAnswers) {
      this.saveProgress();
    }

    return true;
  }

  /**
   * Navigate to previous question
   */
  previous(): boolean {
    if (!this.quiz.options?.allowBackNavigation) {
      return false;
    }

    if (this.state.currentQuestionIndex <= 0) {
      return false;
    }

    // Find previous visible question
    let prevIndex = this.state.currentQuestionIndex - 1;
    while (prevIndex >= 0) {
      const question = this.getQuestion(prevIndex);
      if (question && (!question.conditionalDisplay || evaluateConditions(question.conditionalDisplay, this.state))) {
        break;
      }
      prevIndex--;
    }

    if (prevIndex < 0) return false;

    this.state.currentQuestionIndex = prevIndex;
    this.emit('quiz:navigation', { direction: 'back', index: prevIndex });

    if (this.config.persistAnswers) {
      this.saveProgress();
    }

    return true;
  }

  /**
   * Jump to specific question
   */
  goToQuestion(index: number): boolean {
    if (index < 0 || index >= this.quiz.questions.length) {
      return false;
    }

    const question = this.getQuestion(index);
    if (!question) return false;

    // Check if question should be visible
    if (question.conditionalDisplay && !evaluateConditions(question.conditionalDisplay, this.state)) {
      return false;
    }

    this.state.currentQuestionIndex = index;
    this.emit('quiz:navigation', { direction: 'jump', index });

    return true;
  }

  /**
   * Skip current question
   */
  skip(): boolean {
    const question = this.getCurrentQuestion();
    if (!question) return false;

    // Can't skip required questions
    if (question.required !== false) {
      return false;
    }

    this.emit('quiz:question-skipped', {
      questionId: question.id,
      questionIndex: this.state.currentQuestionIndex,
    });

    return this.next();
  }

  /**
   * Set metadata (gender, stage, etc.)
   */
  setMetadata(metadata: Partial<QuizMetadata>): void {
    this.state.metadata = {
      ...this.state.metadata,
      ...metadata,
    };

    if (this.config.persistAnswers) {
      this.saveProgress();
    }
  }

  /**
   * Complete the quiz and get results
   */
  complete(): QuizResult {
    this.state.completedAt = new Date();

    const result = this.scoringEngine.calculateResults(this.state);

    this.emit('quiz:completed', {
      result,
      duration: this.state.completedAt.getTime() - this.state.startedAt.getTime(),
    });

    // Clear saved progress
    if (this.config.persistAnswers) {
      this.clearProgress();
    }

    // Send to webhook if configured
    if (this.config.webhookUrl) {
      this.sendToWebhook(result);
    }

    return result;
  }

  /**
   * Restart the quiz
   */
  restart(): void {
    this.state = this.initializeState();
    this.questionOrder = this.initializeQuestionOrder();

    this.emit('quiz:restarted', { quizId: this.quiz.id });

    if (this.config.persistAnswers) {
      this.clearProgress();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────────────────

  private saveProgress(): void {
    try {
      const data = {
        state: this.state,
        questionOrder: this.questionOrder,
        savedAt: new Date().toISOString(),
      };
      localStorage.setItem(this.config.storageKey!, JSON.stringify(data));
    } catch (e) {
      if (this.config.debugMode) {
        console.warn('[QuizEngine] Failed to save progress:', e);
      }
    }
  }

  private restoreProgress(): void {
    try {
      const saved = localStorage.getItem(this.config.storageKey!);
      if (!saved) return;

      const data = JSON.parse(saved);
      
      // Check if saved data is recent (within 24 hours)
      const savedAt = new Date(data.savedAt);
      const hoursSinceSave = (Date.now() - savedAt.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceSave > 24) {
        this.clearProgress();
        return;
      }

      this.state = {
        ...data.state,
        startedAt: new Date(data.state.startedAt),
      };
      this.questionOrder = data.questionOrder;

      if (this.config.debugMode) {
        console.log('[QuizEngine] Progress restored from', savedAt);
      }
    } catch (e) {
      if (this.config.debugMode) {
        console.warn('[QuizEngine] Failed to restore progress:', e);
      }
    }
  }

  private clearProgress(): void {
    try {
      localStorage.removeItem(this.config.storageKey!);
    } catch (e) {
      // Ignore
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // EVENTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Subscribe to quiz events
   */
  on(eventType: QuizEventType, handler: QuizEventHandler): () => void {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, []);
    }
    this.eventHandlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) handlers.splice(index, 1);
      }
    };
  }

  private emit(type: QuizEventType, data: Record<string, unknown>): void {
    const event: QuizEvent = {
      type,
      quizId: this.quiz.id,
      timestamp: new Date(),
      data,
    };

    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(event);
        } catch (e) {
          if (this.config.debugMode) {
            console.error('[QuizEngine] Event handler error:', e);
          }
        }
      });
    }

    if (this.config.debugMode) {
      console.log('[QuizEngine] Event:', type, data);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // WEBHOOK
  // ─────────────────────────────────────────────────────────────────────────

  private async sendToWebhook(result: QuizResult): Promise<void> {
    if (!this.config.webhookUrl) return;

    try {
      await fetch(this.config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quizId: this.quiz.id,
          result,
          state: this.state,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      if (this.config.debugMode) {
        console.error('[QuizEngine] Webhook error:', e);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATIC HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create engine from quiz data
   */
  static create(quiz: Quiz, config?: Partial<QuizConfig>): QuizEngine {
    return new QuizEngine(quiz, config);
  }
}

// ============================================================================
// QUIZ STATE HELPERS
// ============================================================================

/**
 * Create initial quiz state
 */
export function createQuizState(quizId: string): QuizState {
  return {
    quizId,
    currentQuestionIndex: 0,
    answers: {},
    startedAt: new Date(),
  };
}

/**
 * Clone quiz state immutably
 */
export function cloneState(state: QuizState): QuizState {
  return {
    ...state,
    answers: { ...state.answers },
    metadata: state.metadata ? { ...state.metadata } : undefined,
  };
}

/**
 * Update answer in state immutably
 */
export function updateAnswer(state: QuizState, questionId: string, value: unknown): QuizState {
  return {
    ...state,
    answers: {
      ...state.answers,
      [questionId]: {
        questionId,
        value,
        timestamp: new Date(),
      },
    },
  };
}




