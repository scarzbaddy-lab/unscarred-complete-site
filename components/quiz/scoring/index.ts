/**
 * Quiz Scoring System
 * Assessment scoring logic, calculations, and result determination
 */

import type {
  Quiz,
  Question,
  QuizState,
  QuizResult,
  ScoringConfig,
  ScoringCategory,
  CategoryScores,
  AnswerContribution,
  ResultDimension,
  ScoreContribution,
  ChoiceOption,
  SingleChoiceQuestion,
  BinaryQuestion,
  LikertQuestion,
} from '../types';

// ============================================================================
// MAIN SCORING ENGINE
// ============================================================================

export class ScoringEngine {
  private quiz: Quiz;
  private config: ScoringConfig;

  constructor(quiz: Quiz) {
    this.quiz = quiz;
    this.config = quiz.scoring;
  }

  /**
   * Calculate complete quiz results from state
   */
  calculateResults(state: QuizState): QuizResult {
    const scores = this.calculateCategoryScores(state);
    const contributions = this.getAnswerContributions(state);
    
    const { primary, secondary } = this.determinePrimaryResult(scores);
    const isGroundZero = this.checkGroundZero(scores);
    
    const resultKey = isGroundZero 
      ? 'ground-zero' 
      : this.buildResultKey(primary, secondary, scores);

    return {
      resultKey,
      primary,
      secondary,
      scores,
      contributions,
      isGroundZero,
      timestamp: new Date(),
      metadata: state.metadata,
    };
  }

  /**
   * Calculate scores for all categories
   */
  calculateCategoryScores(state: QuizState): CategoryScores {
    const scores: CategoryScores = {};
    
    // Initialize all categories to 0
    this.config.categories.forEach(cat => {
      scores[cat.id] = 0;
    });

    // Process each answer
    Object.entries(state.answers).forEach(([questionId, answer]) => {
      const question = this.quiz.questions.find(q => q.id === questionId);
      if (!question) return;

      const contributions = this.getScoreContributionsFromAnswer(question, answer.value);
      contributions.forEach(contrib => {
        const weight = contrib.weight ?? 1;
        scores[contrib.category] = (scores[contrib.category] || 0) + (contrib.value * weight);
      });
    });

    return scores;
  }

  /**
   * Get score contributions from a single answer
   */
  private getScoreContributionsFromAnswer(
    question: Question,
    answerValue: unknown
  ): ScoreContribution[] {
    const contributions: ScoreContribution[] = [];

    switch (question.type) {
      case 'single-choice':
      case 'scenario': {
        const q = question as SingleChoiceQuestion;
        const option = q.options.find(
          opt => opt.letter === answerValue || opt.value === answerValue
        );
        if (option) {
          // Direct score contributions
          if (option.scores) {
            contributions.push(...option.scores);
          }
          // Legacy war/mask format
          if (option.war) {
            contributions.push({ category: option.war, value: 1 });
          }
          if (option.mask) {
            contributions.push({ category: option.mask, value: 1 });
          }
          if (option.archetype) {
            contributions.push({ category: option.archetype, value: 1 });
          }
        }
        break;
      }

      case 'binary': {
        const q = question as BinaryQuestion;
        const score = answerValue === (q.positiveValue ?? 1) ? 1 : 0;
        if (q.scoringCategory && score > 0) {
          contributions.push({ category: q.scoringCategory, value: score });
        }
        break;
      }

      case 'likert': {
        const q = question as LikertQuestion;
        let score = typeof answerValue === 'number' ? answerValue : 0;
        if (q.reverseCoded) {
          const max = q.scale.points;
          score = max - score + 1;
        }
        if (q.scoringCategory) {
          contributions.push({ category: q.scoringCategory, value: score });
        }
        break;
      }

      case 'multi-choice': {
        const values = Array.isArray(answerValue) ? answerValue : [answerValue];
        const q = question as SingleChoiceQuestion;
        values.forEach(val => {
          const option = q.options.find(
            opt => opt.letter === val || opt.value === val
          );
          if (option?.scores) {
            contributions.push(...option.scores);
          }
        });
        break;
      }

      case 'slider': {
        const q = question as any;
        if (q.scoringCategory && typeof answerValue === 'number') {
          contributions.push({ category: q.scoringCategory, value: answerValue });
        }
        break;
      }
    }

    return contributions;
  }

  /**
   * Get detailed answer contributions for results breakdown
   */
  private getAnswerContributions(state: QuizState): AnswerContribution[] {
    const contributions: AnswerContribution[] = [];

    Object.entries(state.answers).forEach(([questionId, answer]) => {
      const question = this.quiz.questions.find(q => q.id === questionId);
      if (!question) return;

      const scoreContribs = this.getScoreContributionsFromAnswer(question, answer.value);
      if (scoreContribs.length === 0) return;

      const answerText = this.getAnswerText(question, answer.value);

      contributions.push({
        questionId,
        questionLabel: question.label || question.id,
        answerText,
        categories: scoreContribs,
      });
    });

    return contributions;
  }

  /**
   * Get human-readable answer text
   */
  private getAnswerText(question: Question, value: unknown): string {
    if (question.type === 'single-choice' || question.type === 'scenario') {
      const q = question as SingleChoiceQuestion;
      const option = q.options.find(
        opt => opt.letter === value || opt.value === value
      );
      return option?.text || String(value);
    }
    if (question.type === 'binary') {
      const q = question as BinaryQuestion;
      return value === (q.positiveValue ?? 1) 
        ? (q.positiveLabel || 'Yes') 
        : (q.negativeLabel || 'No');
    }
    return String(value);
  }

  /**
   * Determine primary and secondary result dimensions
   */
  private determinePrimaryResult(scores: CategoryScores): {
    primary: ResultDimension;
    secondary?: ResultDimension;
  } {
    const sorted = Object.entries(scores)
      .filter(([_, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    if (sorted.length === 0) {
      return {
        primary: { category: 'unknown', score: 0 },
      };
    }

    const [primaryKey, primaryScore] = sorted[0];
    const category = this.config.categories.find(c => c.id === primaryKey);
    const maxScore = category?.maxScore || this.estimateMaxScore(primaryKey);

    const primary: ResultDimension = {
      category: primaryKey,
      score: primaryScore,
      percentage: maxScore > 0 ? (primaryScore / maxScore) * 100 : 0,
      level: this.getScoreLevel(primaryKey, primaryScore),
    };

    let secondary: ResultDimension | undefined;
    if (sorted.length > 1) {
      const [secondaryKey, secondaryScore] = sorted[1];
      const secondaryCategory = this.config.categories.find(c => c.id === secondaryKey);
      const secondaryMax = secondaryCategory?.maxScore || this.estimateMaxScore(secondaryKey);

      secondary = {
        category: secondaryKey,
        score: secondaryScore,
        percentage: secondaryMax > 0 ? (secondaryScore / secondaryMax) * 100 : 0,
        level: this.getScoreLevel(secondaryKey, secondaryScore),
      };
    }

    return { primary, secondary };
  }

  /**
   * Estimate max possible score for a category
   */
  private estimateMaxScore(categoryId: string): number {
    let max = 0;
    this.quiz.questions.forEach(q => {
      if (q.type === 'single-choice' || q.type === 'scenario') {
        const sq = q as SingleChoiceQuestion;
        sq.options.forEach(opt => {
          if (opt.scores) {
            opt.scores.forEach(sc => {
              if (sc.category === categoryId) {
                max += sc.value * (sc.weight ?? 1);
              }
            });
          }
          if (opt.war === categoryId || opt.mask === categoryId) {
            max += 1;
          }
        });
      }
    });
    return max || 10; // Fallback
  }

  /**
   * Get score level based on thresholds
   */
  private getScoreLevel(categoryId: string, score: number): string {
    const category = this.config.categories.find(c => c.id === categoryId);
    if (!category?.thresholds) return 'unknown';

    for (const threshold of category.thresholds) {
      if (score >= threshold.min && score <= threshold.max) {
        return threshold.level;
      }
    }
    return 'unknown';
  }

  /**
   * Check if this is a "ground zero" all-fronts result
   */
  private checkGroundZero(scores: CategoryScores): boolean {
    const gzConfig = this.config.groundZeroThreshold;
    if (!gzConfig) return false;

    const warScores = ['abandonment', 'exposure', 'entrapment', 'erasure']
      .map(war => scores[war] || 0)
      .filter(score => score >= gzConfig.minScore);

    if (warScores.length < gzConfig.minCategories) return false;

    const max = Math.max(...warScores);
    const min = Math.min(...warScores);
    
    return (max - min) <= gzConfig.maxSpread;
  }

  /**
   * Build the result key string (e.g., "abandonment-flooded")
   */
  private buildResultKey(
    primary: ResultDimension,
    secondary: ResultDimension | undefined,
    scores: CategoryScores
  ): string {
    // For composite scoring (war + mask)
    if (this.config.type === 'composite') {
      const warCategories = ['abandonment', 'exposure', 'entrapment', 'erasure'];
      const maskCategories = ['flooded', 'armored', 'phantom', 'analyzer'];

      const topWar = this.getTopFromList(scores, warCategories);
      const topMask = this.getTopFromList(scores, maskCategories);

      if (topWar && topMask) {
        return `${topWar}-${topMask}`;
      }
    }

    // For highest-wins, just return primary
    if (secondary) {
      return `${primary.category}-${secondary.category}`;
    }
    
    return primary.category;
  }

  /**
   * Get the highest scoring category from a specific list
   */
  private getTopFromList(scores: CategoryScores, categories: string[]): string | null {
    let top: string | null = null;
    let topScore = -1;

    categories.forEach(cat => {
      const score = scores[cat] || 0;
      if (score > topScore) {
        topScore = score;
        top = cat;
      }
    });

    return top;
  }
}

// ============================================================================
// SCORING UTILITIES
// ============================================================================

/**
 * Calculate percentage for a score
 */
export function calculatePercentage(score: number, max: number): number {
  if (max <= 0) return 0;
  return Math.round((score / max) * 100);
}

/**
 * Normalize scores to 0-100 scale
 */
export function normalizeScores(scores: CategoryScores, maxScores: Record<string, number>): CategoryScores {
  const normalized: CategoryScores = {};
  Object.entries(scores).forEach(([category, score]) => {
    const max = maxScores[category] || 10;
    normalized[category] = calculatePercentage(score, max);
  });
  return normalized;
}

/**
 * Get top N scoring categories
 */
export function getTopCategories(scores: CategoryScores, n: number = 3): Array<{ category: string; score: number }> {
  return Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([category, score]) => ({ category, score }));
}

/**
 * Check if two scores are within a threshold (for tie detection)
 */
export function scoresAreTied(score1: number, score2: number, threshold: number = 2): boolean {
  return Math.abs(score1 - score2) <= threshold;
}

/**
 * Calculate score spread (difference between highest and lowest)
 */
export function calculateSpread(scores: CategoryScores): number {
  const values = Object.values(scores);
  if (values.length === 0) return 0;
  return Math.max(...values) - Math.min(...values);
}

// ============================================================================
// CATEGORY LABEL HELPERS
// ============================================================================

export function labelWar(key: string): string {
  const labels: Record<string, string> = {
    abandonment: 'Abandonment War',
    exposure: 'Exposure War',
    entrapment: 'Entrapment War',
    erasure: 'Erasure War',
  };
  return labels[key] || key;
}

export function labelMask(key: string): string {
  const labels: Record<string, string> = {
    flooded: 'Flooded Mirror',
    armored: 'Armored Mirror',
    phantom: 'Phantom Performer',
    analyzer: 'Hyper Analyzer',
  };
  return labels[key] || key;
}

export function labelArchetype(key: string): string {
  const labels: Record<string, string> = {
    fixer: 'The Fixer',
    vanisher: 'The Vanisher',
    analyzer: 'The Analyzer',
    warrior: 'The Warrior',
    chameleon: 'The Chameleon',
    performer: 'The Performer',
  };
  return labels[key] || key;
}

// ============================================================================
// RESULT FORMATTERS
// ============================================================================

/**
 * Format scores as bar chart data
 */
export function formatScoresForBars(
  scores: CategoryScores,
  labelFn: (key: string) => string = (k) => k
): Array<{ label: string; value: number; key: string }> {
  return Object.entries(scores)
    .map(([key, value]) => ({
      key,
      label: labelFn(key),
      value,
    }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Group contributions by category
 */
export function groupContributionsByCategory(
  contributions: AnswerContribution[]
): Record<string, AnswerContribution[]> {
  const grouped: Record<string, AnswerContribution[]> = {};

  contributions.forEach(contrib => {
    contrib.categories.forEach(cat => {
      if (!grouped[cat.category]) {
        grouped[cat.category] = [];
      }
      grouped[cat.category].push(contrib);
    });
  });

  return grouped;
}

// ============================================================================
// PRESET SCORING CONFIGURATIONS
// ============================================================================

export const WAR_MASK_SCORING: ScoringConfig = {
  type: 'composite',
  categories: [
    { id: 'abandonment', name: 'Abandonment', displayName: 'Abandonment War', color: '#a33b5c' },
    { id: 'exposure', name: 'Exposure', displayName: 'Exposure War', color: '#7c5cbf' },
    { id: 'entrapment', name: 'Entrapment', displayName: 'Entrapment War', color: '#c9763d' },
    { id: 'erasure', name: 'Erasure', displayName: 'Erasure War', color: '#5c8a8c' },
    { id: 'flooded', name: 'Flooded', displayName: 'Flooded Mirror', color: '#4a90d9' },
    { id: 'armored', name: 'Armored', displayName: 'Armored Mirror', color: '#888888' },
    { id: 'phantom', name: 'Phantom', displayName: 'Phantom Performer', color: '#9b59b6' },
    { id: 'analyzer', name: 'Analyzer', displayName: 'Hyper Analyzer', color: '#27ae60' },
  ],
  groundZeroThreshold: {
    minCategories: 3,
    maxSpread: 2,
    minScore: 3,
  },
};

export const ARCHETYPE_SCORING: ScoringConfig = {
  type: 'highest-wins',
  categories: [
    { id: 'fixer', name: 'Fixer', displayName: 'The Fixer', icon: '🔧' },
    { id: 'vanisher', name: 'Vanisher', displayName: 'The Vanisher', icon: '👻' },
    { id: 'analyzer', name: 'Analyzer', displayName: 'The Analyzer', icon: '🔍' },
    { id: 'warrior', name: 'Warrior', displayName: 'The Warrior', icon: '🛡️' },
    { id: 'chameleon', name: 'Chameleon', displayName: 'The Chameleon', icon: '🪞' },
    { id: 'performer', name: 'Performer', displayName: 'The Performer', icon: '🎭' },
  ],
};










