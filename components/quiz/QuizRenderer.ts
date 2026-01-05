/**
 * Quiz Renderer
 * DOM rendering and UI management for quizzes
 */

import type { Quiz, Question, QuizState, QuizResult, ResultBlurb } from './types';
import { QuizEngine } from './QuizEngine';
import { renderQuestion, attachQuestionEvents, questionStyles } from './questions';
import { labelWar, labelMask, formatScoresForBars, groupContributionsByCategory } from './scoring';

// ============================================================================
// QUIZ RENDERER CLASS
// ============================================================================

export class QuizRenderer {
  private engine: QuizEngine;
  private container: HTMLElement;
  private quiz: Quiz;
  private styleInjected: boolean = false;

  constructor(engine: QuizEngine, container: HTMLElement, quiz: Quiz) {
    this.engine = engine;
    this.container = container;
    this.quiz = quiz;

    this.injectStyles();
    this.bindEvents();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // INITIALIZATION
  // ─────────────────────────────────────────────────────────────────────────

  private injectStyles(): void {
    if (this.styleInjected) return;
    
    const styleId = 'unscarred-quiz-styles';
    if (document.getElementById(styleId)) {
      this.styleInjected = true;
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = questionStyles + this.getRendererStyles();
    document.head.appendChild(style);
    this.styleInjected = true;
  }

  private bindEvents(): void {
    // Listen to engine events for reactive updates
    this.engine.on('quiz:question-answered', () => this.updateUI());
    this.engine.on('quiz:navigation', () => this.renderCurrentQuestion());
    this.engine.on('quiz:completed', (event) => {
      const result = event.data.result as QuizResult;
      this.renderResults(result);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENDERING
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Render the complete quiz UI
   */
  render(): void {
    this.container.innerHTML = this.getQuizTemplate();
    this.renderCurrentQuestion();
    this.updateProgress();
    this.attachNavEvents();
  }

  /**
   * Render intro screen
   */
  renderIntro(): void {
    const archetypePreviews = this.quiz.scoring.categories
      .slice(0, 7)
      .map(cat => `
        <div class="archetype-preview">
          <span>${cat.icon || '🎯'}</span>
          <small>${cat.displayName || cat.name}</small>
        </div>
      `).join('');

    this.container.innerHTML = `
      <div class="quiz-intro">
        <div class="quiz-intro__badge">${this.quiz.title}</div>
        <h1>${this.quiz.title}</h1>
        <p class="quiz-intro__lead">${this.quiz.description || ''}</p>
        
        ${archetypePreviews ? `
          <div class="quiz-intro__archetypes">
            ${archetypePreviews}
          </div>
        ` : ''}
        
        <button class="btn btn--primary btn--lg" id="start-quiz">
          Start the Quiz →
        </button>
        
        <p class="quiz-intro__note">
          ${this.quiz.questionCount || this.quiz.questions.length} questions · 
          ${this.quiz.estimatedTime || '5 min'} · 
          No email required
        </p>
      </div>
    `;

    const startBtn = this.container.querySelector('#start-quiz');
    startBtn?.addEventListener('click', () => {
      this.engine.start();
      this.render();
    });
  }

  /**
   * Render current question
   */
  renderCurrentQuestion(): void {
    const questionWrap = this.container.querySelector('#question-wrap');
    if (!questionWrap) return;

    const question = this.engine.getCurrentQuestion();
    if (!question) {
      // No more questions - complete the quiz
      const result = this.engine.complete();
      this.renderResults(result);
      return;
    }

    const currentAnswer = this.engine.getAnswer(question.id);
    const html = renderQuestion(question, currentAnswer?.value, () => {});

    questionWrap.innerHTML = html;

    // Attach event handlers
    const questionContainer = questionWrap.querySelector('.question-container');
    if (questionContainer) {
      attachQuestionEvents(questionContainer as HTMLElement, question, (value) => {
        this.engine.submitAnswer(value);
        this.updateUI();
      });
    }

    this.updateProgress();
  }

  /**
   * Render results screen
   */
  renderResults(result: QuizResult): void {
    const blurb = this.quiz.results[result.resultKey] || this.getDefaultBlurb(result);
    
    // Format score bars
    const warScores = formatScoresForBars(
      Object.fromEntries(
        Object.entries(result.scores).filter(([k]) => 
          ['abandonment', 'exposure', 'entrapment', 'erasure'].includes(k)
        )
      ),
      labelWar
    );

    const maskScores = formatScoresForBars(
      Object.fromEntries(
        Object.entries(result.scores).filter(([k]) => 
          ['flooded', 'armored', 'phantom', 'analyzer'].includes(k)
        )
      ),
      labelMask
    );

    const maxWarScore = Math.max(...warScores.map(s => s.value), 1);
    const maxMaskScore = Math.max(...maskScores.map(s => s.value), 1);

    // War score bars
    const warBarsHTML = warScores.map(s => `
      <div class="score-row">
        <span class="score-label">${s.label}</span>
        <div class="score-track">
          <div class="score-fill" style="width: ${(s.value / maxWarScore) * 100}%"></div>
        </div>
        <span class="score-value">${s.value}</span>
      </div>
    `).join('');

    // Mask score bars
    const maskBarsHTML = maskScores.map(s => `
      <div class="score-row">
        <span class="score-label">${s.label}</span>
        <div class="score-track">
          <div class="score-fill" style="width: ${(s.value / maxMaskScore) * 100}%"></div>
        </div>
        <span class="score-value">${s.value}</span>
      </div>
    `).join('');

    // Contribution breakdown
    const contributionsByCategory = groupContributionsByCategory(result.contributions);
    let contributionHTML = '';
    Object.entries(contributionsByCategory).slice(0, 4).forEach(([category, contribs]) => {
      const categoryLabel = labelWar(category) || labelMask(category) || category;
      const itemsHTML = contribs.slice(0, 5).map((c, i) => `
        <li class="contribution-item">
          <span class="contribution-rank">${i + 1}.</span>
          <span class="contribution-label">${c.questionLabel}</span>
          <span class="contribution-answer">${c.answerText.substring(0, 50)}${c.answerText.length > 50 ? '...' : ''}</span>
        </li>
      `).join('');
      
      contributionHTML += `
        <div class="contribution-block">
          <div class="contribution-title">📍 ${categoryLabel}</div>
          <ul class="contribution-list">${itemsHTML}</ul>
        </div>
      `;
    });

    this.container.innerHTML = `
      <div class="quiz-results">
        <div class="result-header">
          <h1 class="result-title">${blurb.title}</h1>
          ${blurb.subtitle ? `<p class="result-subtitle">${blurb.subtitle}</p>` : ''}
        </div>

        <div class="result-card result-card--blurb">
          <p class="result-blurb">${blurb.blurb}</p>
        </div>

        ${blurb.nervousSystemNote ? `
          <div class="result-card result-card--nervous">
            <h3>🧠 Nervous System Note</h3>
            <p>${blurb.nervousSystemNote}</p>
          </div>
        ` : ''}

        <div class="score-bars">
          <div class="score-group">
            <div class="score-group-title">War Scores</div>
            ${warBarsHTML}
          </div>
          <div class="score-group">
            <div class="score-group-title">Mask Scores</div>
            ${maskBarsHTML}
          </div>
        </div>

        ${blurb.doThisWeek?.length ? `
          <div class="result-card result-card--do">
            <h3>✅ Do This Week</h3>
            <ul>
              ${blurb.doThisWeek.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${blurb.avoid?.length ? `
          <div class="result-card result-card--avoid">
            <h3>🚫 What to Avoid</h3>
            <ul>
              ${blurb.avoid.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <div class="contribution-breakdown">
          <div class="score-group-title">How You Got Here</div>
          ${contributionHTML}
        </div>

        <div class="result-actions">
          ${blurb.primaryCTA ? `
            <a href="${blurb.primaryCTA.url}" class="btn btn--primary">
              ${blurb.primaryCTA.text}
            </a>
          ` : ''}
          ${blurb.secondaryCTA ? `
            <a href="${blurb.secondaryCTA.url}" class="btn btn--secondary">
              ${blurb.secondaryCTA.text}
            </a>
          ` : ''}
          <button class="btn btn--ghost" id="restart-quiz">
            ↺ Take Again
          </button>
        </div>

        <div class="result-meta">
          <span>Primary: ${labelWar(result.primary.category) || result.primary.category}</span>
          <span>${new Date().toLocaleDateString()}</span>
        </div>
      </div>
    `;

    // Attach restart handler
    const restartBtn = this.container.querySelector('#restart-quiz');
    restartBtn?.addEventListener('click', () => {
      this.engine.restart();
      this.render();
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // UI UPDATES
  // ─────────────────────────────────────────────────────────────────────────

  private updateUI(): void {
    this.updateProgress();
    this.updateNavButtons();
  }

  private updateProgress(): void {
    const progressBar = this.container.querySelector('#progress-bar') as HTMLElement;
    const progressText = this.container.querySelector('#progress-text');

    if (progressBar) {
      progressBar.style.width = `${this.engine.getProgress()}%`;
    }

    if (progressText) {
      const current = this.engine.getCurrentVisibleIndex() + 1;
      const total = this.engine.getTotalQuestions();
      progressText.textContent = `Question ${current} of ${total}`;
    }
  }

  private updateNavButtons(): void {
    const backBtn = this.container.querySelector('#back-btn') as HTMLButtonElement;
    const nextBtn = this.container.querySelector('#next-btn') as HTMLButtonElement;

    if (backBtn) {
      const state = this.engine.getState();
      backBtn.disabled = state.currentQuestionIndex === 0;
    }

    if (nextBtn) {
      const question = this.engine.getCurrentQuestion();
      if (question) {
        const answer = this.engine.getAnswer(question.id);
        nextBtn.disabled = question.required !== false && !answer?.value;

        // Update button text
        const isLast = this.engine.getCurrentVisibleIndex() === this.engine.getTotalQuestions() - 1;
        nextBtn.innerHTML = isLast 
          ? 'Finish <span class="icon">✓</span>' 
          : 'Next <span class="icon">→</span>';
      }
    }
  }

  private attachNavEvents(): void {
    const backBtn = this.container.querySelector('#back-btn');
    const nextBtn = this.container.querySelector('#next-btn');

    backBtn?.addEventListener('click', () => {
      this.engine.previous();
    });

    nextBtn?.addEventListener('click', () => {
      const hasMore = this.engine.next();
      if (!hasMore) {
        const result = this.engine.complete();
        this.renderResults(result);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // TEMPLATES
  // ─────────────────────────────────────────────────────────────────────────

  private getQuizTemplate(): string {
    return `
      <div class="quiz-shell">
        <div class="quiz-card">
          <header class="quiz-header">
            <div class="quiz-title">${this.quiz.title}</div>
            ${this.quiz.subtitle ? `<div class="quiz-subtitle">${this.quiz.subtitle}</div>` : ''}
            <div class="progress-wrap">
              <div class="progress-bar" id="progress-bar"></div>
            </div>
            <div class="progress-meta">
              <span id="progress-text">Question 1 of ${this.engine.getTotalQuestions()}</span>
            </div>
          </header>

          <main id="question-wrap">
            <!-- Question rendered here -->
          </main>

          <footer class="quiz-footer">
            <div class="footer-nav">
              <div class="nav-left">
                <button class="nav-btn" id="back-btn" disabled>
                  <span class="icon">←</span> Back
                </button>
              </div>
              <div class="nav-right">
                <button class="nav-btn nav-btn--primary" id="next-btn" disabled>
                  Next <span class="icon">→</span>
                </button>
              </div>
            </div>
            <p class="quiz-footer-meta">
              Answer with what you actually do in the moment, not what you wish you would do.
            </p>
          </footer>
        </div>
      </div>
    `;
  }

  private getDefaultBlurb(result: QuizResult): ResultBlurb {
    return {
      title: `Your Result: ${result.primary.category}`,
      blurb: 'Your assessment has been completed. Review your scores below.',
    };
  }

  private getRendererStyles(): string {
    return `
      .quiz-shell {
        width: 100%;
        max-width: 900px;
        margin: 0 auto;
        padding: 24px 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
      }

      .quiz-card {
        background: rgba(12, 12, 18, 0.85);
        border-radius: 28px;
        border: 1px solid rgba(255,255,255,0.06);
        padding: 28px 24px 24px;
        width: 100%;
        max-width: 780px;
        box-shadow: 0 4px 24px rgba(0,0,0,0.4), 0 24px 80px rgba(0,0,0,0.6);
        backdrop-filter: blur(20px);
        animation: card-emerge 600ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      @keyframes card-emerge {
        from { opacity: 0; transform: translateY(30px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .quiz-header {
        margin-bottom: 24px;
      }

      .quiz-title {
        font-family: var(--font-display, Georgia, serif);
        font-size: 1.75rem;
        font-weight: 600;
        font-style: italic;
        color: var(--text-main, #ece8e1);
        line-height: 1.2;
        margin-bottom: 8px;
      }

      .quiz-subtitle {
        font-size: 0.88rem;
        font-weight: 300;
        color: var(--text-soft, #9a958c);
        margin-bottom: 16px;
      }

      .progress-wrap {
        width: 100%;
        background: rgba(0,0,0,0.4);
        border-radius: 999px;
        overflow: hidden;
        height: 6px;
        margin-top: 8px;
      }

      .progress-bar {
        height: 100%;
        width: 0%;
        background: linear-gradient(90deg, var(--primary, #a33b5c), var(--secondary, #7c5cbf), var(--accent, #c9763d));
        transition: width 400ms ease;
        border-radius: 999px;
        box-shadow: 0 0 20px rgba(163, 59, 92, 0.4);
      }

      .progress-meta {
        margin-top: 10px;
        font-size: 0.72rem;
        font-weight: 500;
        color: var(--text-dim, #5c5955);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .quiz-footer {
        margin-top: 24px;
      }

      .footer-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
      }

      .nav-btn {
        border-radius: 999px;
        padding: 10px 18px;
        font-family: inherit;
        font-size: 0.8rem;
        font-weight: 500;
        letter-spacing: 0.05em;
        border: 1px solid rgba(255,255,255,0.08);
        background: rgba(15, 15, 20, 0.6);
        color: var(--text-soft, #9a958c);
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 280ms ease;
      }

      .nav-btn:hover:not(:disabled) {
        background: rgba(25, 25, 32, 0.8);
        border-color: rgba(255,255,255,0.12);
        color: var(--text-main, #ece8e1);
        transform: translateY(-1px);
      }

      .nav-btn:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }

      .nav-btn--primary {
        background: linear-gradient(135deg, var(--primary, #a33b5c), #8a2a4a);
        border-color: rgba(255,255,255,0.1);
        color: var(--text-main, #ece8e1);
        font-weight: 600;
        text-transform: uppercase;
        box-shadow: 0 4px 20px rgba(163, 59, 92, 0.3);
      }

      .nav-btn--primary:hover:not(:disabled) {
        background: linear-gradient(135deg, #b8446a, var(--primary, #a33b5c));
        transform: translateY(-2px);
        box-shadow: 0 8px 32px rgba(163, 59, 92, 0.4);
      }

      .quiz-footer-meta {
        font-size: 0.75rem;
        font-style: italic;
        color: var(--text-dim, #5c5955);
        margin-top: 12px;
        text-align: center;
      }

      /* Results styles */
      .quiz-results {
        max-width: 600px;
        margin: 0 auto;
        padding: 24px;
      }

      .result-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .result-title {
        font-family: var(--font-display, Georgia, serif);
        font-size: 2rem;
        font-weight: 600;
        font-style: italic;
        color: var(--text-main, #ece8e1);
        margin-bottom: 8px;
      }

      .result-subtitle {
        font-size: 0.85rem;
        color: var(--text-dim, #5c5955);
        text-transform: uppercase;
        letter-spacing: 0.1em;
      }

      .result-card {
        background: rgba(20, 18, 25, 0.9);
        border-radius: 16px;
        padding: 20px;
        margin-bottom: 16px;
        border: 1px solid rgba(255,255,255,0.06);
      }

      .result-card--blurb {
        border-left: 3px solid var(--primary, #a33b5c);
      }

      .result-blurb {
        font-size: 1rem;
        line-height: 1.7;
        color: var(--text-soft, #9a958c);
        margin: 0;
      }

      .result-card h3 {
        font-size: 0.9rem;
        margin-bottom: 12px;
        color: var(--text-main, #ece8e1);
      }

      .result-card ul {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .result-card li {
        padding: 6px 0 6px 24px;
        position: relative;
        font-size: 0.9rem;
        color: var(--text-soft, #9a958c);
      }

      .result-card--do li::before {
        content: '→';
        position: absolute;
        left: 0;
        color: var(--sage, #7d9a8c);
      }

      .result-card--avoid li::before {
        content: '×';
        position: absolute;
        left: 0;
        color: var(--primary, #a33b5c);
      }

      .score-bars {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin: 24px 0;
        padding: 20px;
        background: rgba(10, 10, 15, 0.5);
        border-radius: 16px;
      }

      @media (max-width: 600px) {
        .score-bars { grid-template-columns: 1fr; }
      }

      .score-group-title {
        font-size: 0.68rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.16em;
        color: var(--accent, #c9763d);
        margin-bottom: 12px;
      }

      .score-row {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 0.75rem;
        color: var(--text-soft, #9a958c);
        padding: 4px 0;
      }

      .score-label {
        width: 100px;
        flex-shrink: 0;
      }

      .score-track {
        flex: 1;
        height: 4px;
        border-radius: 999px;
        background: rgba(0,0,0,0.4);
        overflow: hidden;
      }

      .score-fill {
        height: 100%;
        border-radius: 999px;
        background: linear-gradient(90deg, var(--secondary, #7c5cbf), var(--accent, #c9763d));
        transition: width 600ms cubic-bezier(0.16, 1, 0.3, 1);
      }

      .score-value {
        width: 24px;
        text-align: right;
        font-weight: 600;
        color: var(--text-dim, #5c5955);
        font-size: 0.7rem;
      }

      .contribution-breakdown {
        margin: 24px 0;
      }

      .contribution-block {
        background: rgba(15, 15, 20, 0.6);
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid rgba(255,255,255,0.04);
      }

      .contribution-title {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--accent, #c9763d);
        margin-bottom: 10px;
      }

      .contribution-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .contribution-item {
        display: flex;
        gap: 8px;
        font-size: 0.8rem;
        color: var(--text-soft, #9a958c);
        padding: 6px 0;
        border-bottom: 1px solid rgba(255,255,255,0.03);
      }

      .contribution-item:last-child {
        border-bottom: none;
      }

      .contribution-rank {
        color: var(--secondary, #7c5cbf);
        font-weight: 600;
        width: 20px;
      }

      .contribution-label {
        flex: 1;
      }

      .contribution-answer {
        color: var(--text-dim, #5c5955);
        font-style: italic;
        max-width: 40%;
        text-align: right;
      }

      .result-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        justify-content: center;
        margin: 32px 0;
      }

      .btn {
        display: inline-block;
        padding: 14px 28px;
        border-radius: 999px;
        text-decoration: none;
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        transition: all 300ms ease;
        border: none;
        cursor: pointer;
      }

      .btn--primary {
        background: linear-gradient(135deg, var(--primary, #a33b5c), #8a2a4a);
        color: white;
        box-shadow: 0 8px 30px rgba(163, 59, 92, 0.3);
      }

      .btn--primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 40px rgba(163, 59, 92, 0.4);
      }

      .btn--secondary {
        background: transparent;
        color: var(--text-soft, #9a958c);
        border: 1px solid rgba(255,255,255,0.15);
      }

      .btn--secondary:hover {
        border-color: rgba(255,255,255,0.3);
        color: var(--text-main, #ece8e1);
      }

      .btn--ghost {
        background: transparent;
        color: var(--text-dim, #5c5955);
        padding: 10px 20px;
        font-size: 0.8rem;
      }

      .btn--ghost:hover {
        color: var(--text-main, #ece8e1);
      }

      .result-meta {
        display: flex;
        justify-content: space-between;
        font-size: 0.72rem;
        color: var(--text-dim, #5c5955);
        text-transform: uppercase;
        letter-spacing: 0.1em;
        padding-top: 16px;
        border-top: 1px solid rgba(255,255,255,0.05);
      }

      /* Intro styles */
      .quiz-intro {
        text-align: center;
        max-width: 500px;
        margin: 0 auto;
        padding: 80px 24px;
      }

      .quiz-intro__badge {
        display: inline-block;
        padding: 8px 16px;
        background: rgba(163, 59, 92, 0.15);
        color: var(--primary, #a33b5c);
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        margin-bottom: 24px;
      }

      .quiz-intro h1 {
        font-family: var(--font-display, Georgia, serif);
        font-size: 2.5rem;
        font-weight: 600;
        font-style: italic;
        color: var(--text-main, #ece8e1);
        margin-bottom: 16px;
      }

      .quiz-intro__lead {
        font-size: 1.1rem;
        color: var(--text-soft, #9a958c);
        margin-bottom: 32px;
        line-height: 1.6;
      }

      .quiz-intro__archetypes {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 12px;
        margin-bottom: 32px;
      }

      .archetype-preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 12px;
        background: rgba(20, 18, 25, 0.8);
        border-radius: 12px;
        min-width: 70px;
      }

      .archetype-preview span {
        font-size: 1.5rem;
      }

      .archetype-preview small {
        font-size: 0.7rem;
        color: var(--text-dim, #5c5955);
      }

      .quiz-intro__note {
        font-size: 0.85rem;
        color: var(--text-dim, #5c5955);
        margin-top: 16px;
      }

      .btn--lg {
        padding: 18px 36px;
        font-size: 0.9rem;
      }
    `;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STATIC FACTORY
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Create renderer from engine and container
   */
  static create(engine: QuizEngine, containerSelector: string, quiz: Quiz): QuizRenderer | null {
    const container = document.querySelector(containerSelector) as HTMLElement;
    if (!container) {
      console.error(`[QuizRenderer] Container not found: ${containerSelector}`);
      return null;
    }
    return new QuizRenderer(engine, container, quiz);
  }
}




