# Unscarred Component System

Reusable TypeScript components for building quizzes, assessments, and navigating the site structure.

## Site Architecture

```
Main Site (unscarred.online)
├── /                           → Home - what this is, who it's for
├── /start                      → Quiz funnel entry point
├── /assessments
│   ├── /attachment-style       → Attachment patterns
│   ├── /wound-patterns         → Core wounds
│   ├── /protection-mechanisms  → Defense systems
│   └── /mirror-archetypes      → Survival archetypes
├── /survivor-types             → The 6 Archetypes
│   ├── /fixer                  → Codependent patterning
│   ├── /vanisher               → Avoidant collapse
│   ├── /analyzer               → Intellectualized defense
│   ├── /warrior                → Defensive protection
│   ├── /chameleon              → Fawn response
│   └── /performer              → Achievement-based worth
├── /resources
│   ├── /manipulation-detection → Recognize tactics
│   ├── /coercive-control       → Hidden control patterns
│   ├── /anxious-vs-accurate    → Gut check tools
│   └── /healing-frameworks     → What actually works
├── /shop                       → Workbooks, courses, assessments
└── /about                      → PhD in lived experience

All-Front War (unscarred.online/all-front-war)
├── /                           → "When standard trauma work fails you"
├── /ground-zero                → Framework for simultaneity/multiplicity
├── /presentations
│   ├── /did-osdd               → Protective fragmentation
│   ├── /autism-trauma-overlap  → Which is which?
│   ├── /adhd-or-hypervigilance → Trauma vs neurodivergence
│   ├── /dissociation-vs-avoidance
│   ├── /psychosis-vs-complex-trauma
│   ├── /limerence              → Anxious attachment on steroids
│   └── /cptsd-reframed         → Beyond the standard model
├── /parts-work
│   ├── /when-its-not-ifs       → Your version of parts work
│   ├── /internal-conflict-models
│   └── /working-with-simultaneity
├── /myths-vs-reality
│   ├── /therapy-lies           → What they won't tell you
│   ├── /diagnosis-traps        → When labels hurt
│   ├── /why-cbt-fails          → Logic isn't enough
│   └── /medication-truths      → What actually helps
├── /what-actually-works
│   ├── /nervous-system-first   → Regulate before process
│   ├── /pattern-interruption   → Breaking the loop
│   ├── /when-to-leave-therapy  → Recognizing it's not working
│   └── /building-outside-system
├── /assessments
│   ├── /ground-zero-quiz       → Multiple conflicting patterns
│   ├── /dissociation-tracker   → Map dissociative patterns
│   └── /trauma-vs-neurodivergence
└── /shop                       → Specialized tools/workbooks
```

## Quick Start

### Creating a Quiz

```typescript
import { createQuiz } from './components';
import type { Quiz } from './components';

const myQuiz: Quiz = {
  id: 'my-quiz',
  title: 'My Assessment',
  questions: [
    {
      id: 'q1',
      type: 'binary',
      text: 'Do you often feel overwhelmed in relationships?',
      scoringCategory: 'flooded',
    },
    {
      id: 'q2',
      type: 'single-choice',
      label: 'Conflict response',
      text: 'What happens when someone criticizes you?',
      options: [
        { letter: 'A', text: 'I defend immediately', mask: 'armored', war: 'exposure' },
        { letter: 'B', text: 'I shut down', mask: 'phantom', war: 'entrapment' },
        { letter: 'C', text: 'I try to fix it', mask: 'phantom', war: 'abandonment' },
        { letter: 'D', text: 'I analyze their words', mask: 'analyzer', war: 'erasure' },
      ],
    },
  ],
  scoring: {
    type: 'composite',
    categories: [
      { id: 'abandonment', name: 'Abandonment', displayName: 'Abandonment War' },
      { id: 'exposure', name: 'Exposure', displayName: 'Exposure War' },
      // ... more categories
    ],
  },
  results: {
    'abandonment-flooded': {
      title: 'Abandonment War + Flooded Mirror',
      blurb: 'Your system is on high alert for loss.',
    },
  },
};

// Initialize and render
const instance = createQuiz(myQuiz, '#quiz-container');
if (instance) {
  instance.renderer.renderIntro(); // Show intro screen
  // or
  instance.renderer.render(); // Start immediately
}
```

### Using the Quiz Engine Directly

```typescript
import { QuizEngine, ScoringEngine } from './components/quiz';

const engine = new QuizEngine(myQuiz, {
  autoAdvance: true,
  persistAnswers: true,
  debugMode: true,
});

// Subscribe to events
engine.on('quiz:completed', (event) => {
  console.log('Results:', event.data.result);
});

// Control the quiz
engine.start();
engine.submitAnswer('A');
engine.next();
const results = engine.complete();
```

### Question Types

| Type | Description | Use Case |
|------|-------------|----------|
| `single-choice` | Select one option | Standard quiz questions |
| `multi-choice` | Select multiple | Complex pattern mapping |
| `binary` | Yes/No | Quick assessments |
| `likert` | Scale rating | Intensity measures |
| `slider` | Continuous scale | Spectrum measurements |
| `scenario` | Situational | Behavior prediction |
| `text-input` | Free text | Open responses |

### Scoring Types

| Type | Description |
|------|-------------|
| `highest-wins` | Top scoring category wins |
| `composite` | Combines two dimensions (war + mask) |
| `threshold` | Multiple categories can trigger |
| `weighted-average` | Weighted mean across categories |
| `spectrum` | Position on a continuum |

## Component Structure

```
components/
├── index.ts              → Main exports
├── README.md             → This file
├── quiz/
│   ├── index.ts          → Quiz exports
│   ├── types.ts          → TypeScript interfaces
│   ├── QuizEngine.ts     → State management & logic
│   ├── QuizRenderer.ts   → DOM rendering
│   ├── questions/
│   │   └── index.ts      → Question type renderers
│   ├── scoring/
│   │   └── index.ts      → Scoring logic
│   └── validation/
│       └── index.ts      → Form validation
└── site/
    └── structure.ts      → Site navigation & pages
```

## Key Concepts

### The 6 Survivor Archetypes

1. **Fixer** 🔧 - Survives by being needed, not seen
2. **Vanisher** 👻 - Leaves before being left
3. **Analyzer** 🔍 - Thinks way to safety
4. **Warrior** 🛡️ - Defends fast, keeps love out
5. **Chameleon** 🪞 - Mirrors others to keep peace
6. **Performer** 🎭 - Performs strength, crashes when unmirrored

### The 4 Wars

1. **Abandonment** 💔 - Fear of being left once seen
2. **Exposure** 👁️ - Fear of being seen as flawed
3. **Entrapment** 🔒 - Fear of losing freedom
4. **Erasure** 👻 - Fear of being forgotten/replaced

### The 4 Masks

1. **Flooded** 🌊 - Emotions overwhelm and spill
2. **Armored** 🛡️ - Cold, distant protection
3. **Phantom** 🎭 - Calm performer hiding the mess
4. **Analyzer** 🔍 - Detaches to analyze instead of feel

### Ground Zero

When someone scores high across multiple wars/masks simultaneously, they receive the "Ground Zero" result - indicating complex overlapping patterns that need specialized approaches.

## Validation

```typescript
import { validateAnswer, validators, composeValidators } from './components';

// Validate a single answer
const result = validateAnswer(question, userAnswer);
if (!result.isValid) {
  console.log(result.errors);
}

// Create custom validators
const validateName = composeValidators(
  validators.required,
  validators.minLength(2),
  validators.maxLength(50)
);
```

## Site Navigation

```typescript
import { 
  getPage, 
  getBreadcrumbs, 
  isWarPath, 
  getNavigation 
} from './components';

// Get page data
const page = getPage('/survivor-types/fixer');
console.log(page.title); // "The Fixer"

// Get breadcrumbs
const crumbs = getBreadcrumbs('/all-front-war/presentations/did-osdd');
// [War Home, Presentations, DID/OSDD]

// Check if on war path
if (isWarPath(currentPath)) {
  // Show war-specific navigation
}

// Get appropriate navigation
const nav = getNavigation(currentPath);
```

## Events

The QuizEngine emits events you can subscribe to:

| Event | Data | When |
|-------|------|------|
| `quiz:started` | `{ quizId }` | Quiz begins |
| `quiz:question-answered` | `{ questionId, value }` | Answer submitted |
| `quiz:navigation` | `{ direction, index }` | Next/back navigation |
| `quiz:completed` | `{ result, duration }` | Quiz finished |
| `quiz:restarted` | `{ quizId }` | Quiz reset |

## Integration Notes

- All components are vanilla TypeScript - no framework dependencies
- CSS uses CSS custom properties matching your existing design system
- LocalStorage used for progress persistence (optional)
- Webhook support for sending results to external systems



