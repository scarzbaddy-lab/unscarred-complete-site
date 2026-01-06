/**
 * Quiz Question Components
 * Reusable question type renderers
 */

import type {
  Question,
  QuestionType,
  SingleChoiceQuestion,
  MultiChoiceQuestion,
  BinaryQuestion,
  LikertQuestion,
  SliderQuestion,
  ScenarioQuestion,
  ChoiceOption,
} from '../types';

// ============================================================================
// QUESTION RENDERER FACTORY
// ============================================================================

export type QuestionRenderer = (
  question: Question,
  selectedValue: unknown,
  onAnswer: (value: unknown) => void,
  options?: RenderOptions
) => string;

export interface RenderOptions {
  animationDelay?: number;
  showLetters?: boolean;
  theme?: 'dark' | 'light';
}

const renderers: Record<QuestionType, QuestionRenderer> = {
  'single-choice': renderSingleChoice,
  'multi-choice': renderMultiChoice,
  'binary': renderBinary,
  'likert': renderLikert,
  'slider': renderSlider,
  'scenario': renderScenario,
  'matrix': renderMatrix,
  'ranking': renderRanking,
  'text-input': renderTextInput,
  'image-choice': renderImageChoice,
};

export function renderQuestion(
  question: Question,
  selectedValue: unknown,
  onAnswer: (value: unknown) => void,
  options?: RenderOptions
): string {
  const renderer = renderers[question.type];
  if (!renderer) {
    console.warn(`No renderer for question type: ${question.type}`);
    return '';
  }
  return renderer(question, selectedValue, onAnswer, options);
}

// ============================================================================
// SINGLE CHOICE RENDERER
// ============================================================================

function renderSingleChoice(
  question: Question,
  selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  options?: RenderOptions
): string {
  const q = question as SingleChoiceQuestion;
  const showLetters = options?.showLetters ?? true;
  
  const optionsHTML = q.options.map((opt, index) => {
    const isSelected = selectedValue === opt.letter || selectedValue === opt.value;
    const letter = opt.letter || String.fromCharCode(65 + index);
    const delay = (options?.animationDelay ?? 50) * index;
    
    return `
      <button 
        class="quiz-option ${isSelected ? 'selected' : ''}" 
        data-value="${opt.letter || opt.value || index}"
        data-letter="${letter}"
        style="animation-delay: ${delay}ms"
      >
        ${showLetters ? `<span class="option-letter">${letter}.</span>` : ''}
        <span class="option-text">${opt.text}</span>
      </button>
    `;
  }).join('');

  return `
    <div class="question-container question-single-choice">
      ${renderQuestionHeader(q)}
      <div class="options-wrap">
        ${optionsHTML}
      </div>
    </div>
  `;
}

// ============================================================================
// MULTI CHOICE RENDERER
// ============================================================================

function renderMultiChoice(
  question: Question,
  selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  options?: RenderOptions
): string {
  const q = question as MultiChoiceQuestion;
  const selected = Array.isArray(selectedValue) ? selectedValue : [];
  const showLetters = options?.showLetters ?? true;
  
  const minMax = q.minSelections || q.maxSelections 
    ? `<span class="selection-hint">Select ${q.minSelections || 1}${q.maxSelections ? `-${q.maxSelections}` : '+'}</span>`
    : '';

  const optionsHTML = q.options.map((opt, index) => {
    const isSelected = selected.includes(opt.letter || opt.value || index);
    const letter = opt.letter || String.fromCharCode(65 + index);
    const delay = (options?.animationDelay ?? 50) * index;
    
    return `
      <button 
        class="quiz-option quiz-option--checkbox ${isSelected ? 'selected' : ''}" 
        data-value="${opt.letter || opt.value || index}"
        data-letter="${letter}"
        style="animation-delay: ${delay}ms"
      >
        <span class="checkbox-indicator">${isSelected ? '✓' : ''}</span>
        ${showLetters ? `<span class="option-letter">${letter}.</span>` : ''}
        <span class="option-text">${opt.text}</span>
      </button>
    `;
  }).join('');

  return `
    <div class="question-container question-multi-choice">
      ${renderQuestionHeader(q)}
      ${minMax}
      <div class="options-wrap options-wrap--multi">
        ${optionsHTML}
      </div>
    </div>
  `;
}

// ============================================================================
// BINARY RENDERER
// ============================================================================

function renderBinary(
  question: Question,
  selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  _options?: RenderOptions
): string {
  const q = question as BinaryQuestion;
  const positiveLabel = q.positiveLabel || 'Yes, this is me';
  const negativeLabel = q.negativeLabel || 'No, not really';
  const positiveValue = q.positiveValue ?? 1;
  const negativeValue = q.negativeValue ?? 0;

  return `
    <div class="question-container question-binary">
      ${renderQuestionHeader(q)}
      <div class="options-wrap options-wrap--binary">
        <button 
          class="quiz-option quiz-option--yes ${selectedValue === positiveValue ? 'selected' : ''}" 
          data-value="${positiveValue}"
        >
          <span class="option-text">${positiveLabel}</span>
        </button>
        <button 
          class="quiz-option quiz-option--no ${selectedValue === negativeValue ? 'selected' : ''}" 
          data-value="${negativeValue}"
        >
          <span class="option-text">${negativeLabel}</span>
        </button>
      </div>
    </div>
  `;
}

// ============================================================================
// LIKERT SCALE RENDERER
// ============================================================================

function renderLikert(
  question: Question,
  selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  _options?: RenderOptions
): string {
  const q = question as LikertQuestion;
  const scale = q.scale;
  
  const pointsHTML = scale.labels.map((label, index) => {
    const value = scale.values ? scale.values[index] : index + 1;
    const isSelected = selectedValue === value;
    
    return `
      <button 
        class="likert-point ${isSelected ? 'selected' : ''}" 
        data-value="${value}"
        title="${label}"
      >
        <span class="likert-circle"></span>
        <span class="likert-label">${label}</span>
      </button>
    `;
  }).join('');

  return `
    <div class="question-container question-likert">
      ${renderQuestionHeader(q)}
      <div class="likert-scale" data-points="${scale.points}">
        ${pointsHTML}
      </div>
    </div>
  `;
}

// ============================================================================
// SLIDER RENDERER
// ============================================================================

function renderSlider(
  question: Question,
  selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  _options?: RenderOptions
): string {
  const q = question as SliderQuestion;
  const value = typeof selectedValue === 'number' ? selectedValue : q.defaultValue ?? q.min;
  
  return `
    <div class="question-container question-slider">
      ${renderQuestionHeader(q)}
      <div class="slider-wrap">
        <span class="slider-label slider-label--min">${q.minLabel || q.min}</span>
        <input 
          type="range" 
          class="slider-input"
          min="${q.min}" 
          max="${q.max}" 
          step="${q.step || 1}"
          value="${value}"
        />
        <span class="slider-label slider-label--max">${q.maxLabel || q.max}</span>
      </div>
      <div class="slider-value">${value}</div>
    </div>
  `;
}

// ============================================================================
// SCENARIO RENDERER
// ============================================================================

function renderScenario(
  question: Question,
  selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  options?: RenderOptions
): string {
  const q = question as ScenarioQuestion;
  const showLetters = options?.showLetters ?? true;
  
  const optionsHTML = q.options.map((opt, index) => {
    const isSelected = selectedValue === opt.letter || selectedValue === opt.value;
    const letter = opt.letter || String.fromCharCode(65 + index);
    const delay = (options?.animationDelay ?? 50) * index;
    
    return `
      <button 
        class="quiz-option quiz-option--scenario ${isSelected ? 'selected' : ''}" 
        data-value="${opt.letter || opt.value || index}"
        data-letter="${letter}"
        style="animation-delay: ${delay}ms"
      >
        ${showLetters ? `<span class="option-letter">${letter}.</span>` : ''}
        <span class="option-text">${opt.text}</span>
        ${opt.consequence ? `<span class="option-consequence">${opt.consequence}</span>` : ''}
      </button>
    `;
  }).join('');

  return `
    <div class="question-container question-scenario">
      ${renderQuestionHeader(q)}
      <div class="scenario-block">
        <p class="scenario-text">${q.scenario}</p>
      </div>
      <div class="options-wrap options-wrap--scenario">
        ${optionsHTML}
      </div>
    </div>
  `;
}

// ============================================================================
// MATRIX RENDERER (Placeholder)
// ============================================================================

function renderMatrix(
  question: Question,
  _selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  _options?: RenderOptions
): string {
  return `
    <div class="question-container question-matrix">
      ${renderQuestionHeader(question)}
      <div class="matrix-placeholder">
        Matrix question renderer - coming soon
      </div>
    </div>
  `;
}

// ============================================================================
// RANKING RENDERER (Placeholder)
// ============================================================================

function renderRanking(
  question: Question,
  _selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  _options?: RenderOptions
): string {
  return `
    <div class="question-container question-ranking">
      ${renderQuestionHeader(question)}
      <div class="ranking-placeholder">
        Ranking question renderer - coming soon
      </div>
    </div>
  `;
}

// ============================================================================
// TEXT INPUT RENDERER
// ============================================================================

function renderTextInput(
  question: Question,
  selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  _options?: RenderOptions
): string {
  const q = question as any; // TextInputQuestion
  const value = typeof selectedValue === 'string' ? selectedValue : '';
  const isTextarea = q.rows && q.rows > 1;
  
  const inputHTML = isTextarea
    ? `<textarea 
        class="text-input text-input--textarea"
        placeholder="${q.placeholder || ''}"
        rows="${q.rows}"
        ${q.minLength ? `minlength="${q.minLength}"` : ''}
        ${q.maxLength ? `maxlength="${q.maxLength}"` : ''}
      >${value}</textarea>`
    : `<input 
        type="text"
        class="text-input"
        value="${value}"
        placeholder="${q.placeholder || ''}"
        ${q.minLength ? `minlength="${q.minLength}"` : ''}
        ${q.maxLength ? `maxlength="${q.maxLength}"` : ''}
      />`;

  return `
    <div class="question-container question-text-input">
      ${renderQuestionHeader(q)}
      <div class="text-input-wrap">
        ${inputHTML}
        ${q.maxLength ? `<span class="char-count">${value.length}/${q.maxLength}</span>` : ''}
      </div>
    </div>
  `;
}

// ============================================================================
// IMAGE CHOICE RENDERER (Placeholder)
// ============================================================================

function renderImageChoice(
  question: Question,
  _selectedValue: unknown,
  _onAnswer: (value: unknown) => void,
  _options?: RenderOptions
): string {
  return `
    <div class="question-container question-image-choice">
      ${renderQuestionHeader(question)}
      <div class="image-choice-placeholder">
        Image choice renderer - coming soon
      </div>
    </div>
  `;
}

// ============================================================================
// SHARED HEADER RENDERER
// ============================================================================

function renderQuestionHeader(question: Question): string {
  return `
    <div class="question-header">
      ${question.label ? `<div class="question-label">${question.label}</div>` : ''}
      <p class="question-text">${question.text}</p>
      ${question.subtext ? `<p class="question-subtext">${question.subtext}</p>` : ''}
      ${question.helpText ? `<p class="question-help">${question.helpText}</p>` : ''}
    </div>
  `;
}

// ============================================================================
// CSS STYLES (to be injected or imported)
// ============================================================================

export const questionStyles = `
  .question-container {
    background: linear-gradient(165deg, rgba(20, 20, 28, 0.9), rgba(10, 10, 15, 0.95));
    border-radius: 20px;
    padding: 24px 20px;
    border: 1px solid rgba(255,255,255,0.06);
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    animation: question-fade 400ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes question-fade {
    from { opacity: 0; transform: translateX(20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .question-header {
    margin-bottom: 24px;
  }

  .question-label {
    font-size: 0.68rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    color: var(--accent, #c9763d);
    margin-bottom: 8px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
  }

  .question-label::before {
    content: "";
    width: 16px;
    height: 1px;
    background: linear-gradient(90deg, var(--accent, #c9763d), transparent);
  }

  .question-text {
    font-family: var(--font-display, Georgia, serif);
    font-size: 1.2rem;
    font-weight: 400;
    line-height: 1.55;
    color: var(--text-main, #ece8e1);
    margin: 0;
  }

  .question-subtext {
    font-size: 0.85rem;
    font-weight: 300;
    color: var(--text-soft, #9a958c);
    margin-top: 8px;
    font-style: italic;
  }

  .question-help {
    font-size: 0.8rem;
    color: var(--text-dim, #5c5955);
    margin-top: 12px;
    padding: 12px;
    background: rgba(0,0,0,0.2);
    border-radius: 8px;
  }

  .options-wrap {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .options-wrap--binary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .quiz-option {
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: linear-gradient(135deg, rgba(18, 18, 24, 0.8), rgba(12, 12, 18, 0.9));
    padding: 14px 16px;
    text-align: left;
    color: var(--text-main, #ece8e1);
    font-family: inherit;
    font-size: 0.9rem;
    font-weight: 400;
    line-height: 1.55;
    cursor: pointer;
    display: flex;
    gap: 14px;
    align-items: flex-start;
    transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    animation: answer-slide-in 400ms cubic-bezier(0.16, 1, 0.3, 1) backwards;
  }

  @keyframes answer-slide-in {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }

  .quiz-option:hover {
    background: linear-gradient(135deg, rgba(25, 22, 30, 0.95), rgba(15, 14, 20, 0.98));
    transform: translateX(4px);
    border-color: rgba(163, 59, 92, 0.2);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  }

  .quiz-option.selected {
    border-color: var(--primary, #a33b5c);
    background: linear-gradient(135deg, rgba(163, 59, 92, 0.12), rgba(15, 12, 18, 0.95));
    box-shadow: 0 12px 40px rgba(163, 59, 92, 0.15);
    transform: translateX(6px);
  }

  .quiz-option.selected .option-letter {
    color: var(--primary, #a33b5c);
    background: rgba(163, 59, 92, 0.2);
  }

  .option-letter {
    font-family: var(--font-display, Georgia, serif);
    font-weight: 700;
    font-size: 1rem;
    color: var(--text-dim, #5c5955);
    width: 22px;
    height: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(255,255,255,0.03);
    flex-shrink: 0;
    transition: all 280ms ease;
  }

  .option-text {
    flex: 1;
    padding-top: 1px;
  }

  /* Binary specific */
  .quiz-option--yes:hover {
    border-color: var(--sage, #7d9a8c);
    background: rgba(125, 156, 132, 0.1);
  }

  .quiz-option--no:hover {
    border-color: var(--primary, #a33b5c);
    background: rgba(163, 59, 92, 0.1);
  }

  /* Likert scale */
  .likert-scale {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 16px 0;
  }

  .likert-point {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 280ms ease;
    flex: 1;
  }

  .likert-circle {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid rgba(255,255,255,0.2);
    background: transparent;
    transition: all 280ms ease;
  }

  .likert-point:hover .likert-circle {
    border-color: var(--primary, #a33b5c);
    transform: scale(1.1);
  }

  .likert-point.selected .likert-circle {
    border-color: var(--primary, #a33b5c);
    background: var(--primary, #a33b5c);
    box-shadow: 0 0 12px rgba(163, 59, 92, 0.5);
  }

  .likert-label {
    font-size: 0.7rem;
    color: var(--text-dim, #5c5955);
    text-align: center;
    max-width: 80px;
    line-height: 1.3;
  }

  /* Slider */
  .slider-wrap {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 24px 0;
  }

  .slider-input {
    flex: 1;
    height: 6px;
    appearance: none;
    background: rgba(255,255,255,0.1);
    border-radius: 999px;
    cursor: pointer;
  }

  .slider-input::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: var(--primary, #a33b5c);
    box-shadow: 0 0 12px rgba(163, 59, 92, 0.5);
    cursor: grab;
  }

  .slider-label {
    font-size: 0.8rem;
    color: var(--text-soft, #9a958c);
    white-space: nowrap;
  }

  .slider-value {
    text-align: center;
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--primary, #a33b5c);
  }

  /* Scenario */
  .scenario-block {
    background: rgba(0,0,0,0.25);
    border-left: 3px solid var(--secondary, #7c5cbf);
    padding: 16px 20px;
    margin-bottom: 20px;
    border-radius: 0 12px 12px 0;
  }

  .scenario-text {
    font-style: italic;
    color: var(--text-soft, #9a958c);
    line-height: 1.7;
    margin: 0;
  }

  .option-consequence {
    display: block;
    font-size: 0.75rem;
    color: var(--text-dim, #5c5955);
    margin-top: 6px;
    font-style: italic;
  }

  /* Text input */
  .text-input-wrap {
    position: relative;
  }

  .text-input {
    width: 100%;
    padding: 16px;
    background: rgba(0,0,0,0.3);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    color: var(--text-main, #ece8e1);
    font-family: inherit;
    font-size: 1rem;
    line-height: 1.6;
    resize: vertical;
    transition: border-color 280ms ease;
  }

  .text-input:focus {
    outline: none;
    border-color: var(--primary, #a33b5c);
    box-shadow: 0 0 0 3px rgba(163, 59, 92, 0.1);
  }

  .text-input::placeholder {
    color: var(--text-dim, #5c5955);
  }

  .char-count {
    position: absolute;
    bottom: 8px;
    right: 12px;
    font-size: 0.7rem;
    color: var(--text-dim, #5c5955);
  }

  /* Multi-choice checkbox */
  .checkbox-indicator {
    width: 20px;
    height: 20px;
    border: 2px solid rgba(255,255,255,0.2);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    color: var(--primary, #a33b5c);
    flex-shrink: 0;
    transition: all 280ms ease;
  }

  .quiz-option--checkbox.selected .checkbox-indicator {
    border-color: var(--primary, #a33b5c);
    background: rgba(163, 59, 92, 0.2);
  }

  .selection-hint {
    display: block;
    font-size: 0.75rem;
    color: var(--text-dim, #5c5955);
    margin-bottom: 12px;
    font-style: italic;
  }
`;

// ============================================================================
// EVENT ATTACHMENT HELPER
// ============================================================================

export function attachQuestionEvents(
  container: HTMLElement,
  question: Question,
  onAnswer: (value: unknown) => void
): void {
  const options = container.querySelectorAll('.quiz-option');
  
  options.forEach(option => {
    option.addEventListener('click', () => {
      const value = (option as HTMLElement).dataset.value;
      
      if (question.type === 'multi-choice') {
        // Handle multi-select toggle
        const currentSelected = container.querySelectorAll('.quiz-option.selected');
        const selectedValues = Array.from(currentSelected).map(
          el => (el as HTMLElement).dataset.value
        );
        
        const index = selectedValues.indexOf(value);
        if (index > -1) {
          selectedValues.splice(index, 1);
        } else {
          selectedValues.push(value);
        }
        
        onAnswer(selectedValues);
      } else {
        onAnswer(value);
      }
    });
  });

  // Slider events
  const slider = container.querySelector('.slider-input') as HTMLInputElement;
  if (slider) {
    slider.addEventListener('input', () => {
      const valueDisplay = container.querySelector('.slider-value');
      if (valueDisplay) valueDisplay.textContent = slider.value;
    });
    slider.addEventListener('change', () => {
      onAnswer(parseFloat(slider.value));
    });
  }

  // Text input events
  const textInput = container.querySelector('.text-input') as HTMLInputElement | HTMLTextAreaElement;
  if (textInput) {
    textInput.addEventListener('input', () => {
      onAnswer(textInput.value);
      const charCount = container.querySelector('.char-count');
      if (charCount) {
        const max = textInput.getAttribute('maxlength');
        charCount.textContent = `${textInput.value.length}/${max}`;
      }
    });
  }

  // Likert events
  const likertPoints = container.querySelectorAll('.likert-point');
  likertPoints.forEach(point => {
    point.addEventListener('click', () => {
      const value = (point as HTMLElement).dataset.value;
      onAnswer(parseFloat(value || '0'));
    });
  });
}










