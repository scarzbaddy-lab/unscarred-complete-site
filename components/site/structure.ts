/**
 * Unscarred Site Structure
 * Complete navigation and page architecture
 * 
 * Two main paths:
 * 1. Main Site (unscarred.online) - Centered path for relationship healing
 * 2. All-Front War (unscarred.online/all-front-war) - Complex trauma/survival mode
 */

import type { SurvivorArchetype, WarType, MaskType } from '../quiz/types';

// ============================================================================
// SITE STRUCTURE TYPES
// ============================================================================

export interface SitePage {
  path: string;
  title: string;
  description: string;
  template?: PageTemplate;
  parent?: string;
  children?: string[];
  meta?: PageMeta;
  content?: PageContent;
}

export interface PageMeta {
  icon?: string;
  badge?: string;
  isNew?: boolean;
  isPopular?: boolean;
  requiresAuth?: boolean;
  hideFromNav?: boolean;
  order?: number;
}

export interface PageContent {
  heroTitle?: string;
  heroSubtitle?: string;
  sections?: ContentSection[];
}

export interface ContentSection {
  id: string;
  type: SectionType;
  title?: string;
  content?: string;
}

export type PageTemplate = 
  | 'home'
  | 'quiz'
  | 'assessment'
  | 'archetype'
  | 'resource'
  | 'article'
  | 'shop'
  | 'about'
  | 'landing';

export type SectionType = 
  | 'hero'
  | 'quiz-grid'
  | 'archetype-grid'
  | 'resource-list'
  | 'cta'
  | 'testimonial'
  | 'faq';

// ============================================================================
// MAIN SITE STRUCTURE
// ============================================================================

export const MAIN_SITE: Record<string, SitePage> = {
  // ─────────────────────────────────────────────────────────────────────────
  // HOME
  // ─────────────────────────────────────────────────────────────────────────
  '/': {
    path: '/',
    title: 'Home',
    description: 'What this is, who it\'s for. Turn scars into mirrors.',
    template: 'home',
    meta: { order: 0 },
    content: {
      heroTitle: 'Turn scars into mirrors, see what they reveal',
      heroSubtitle: 'Whether you want better relationships or you\'re fighting to survive - there\'s a path for you here.',
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // START - Quiz Funnel Entry
  // ─────────────────────────────────────────────────────────────────────────
  '/start': {
    path: '/start',
    title: 'Start Here',
    description: 'Quiz funnel entry point. Find your path.',
    template: 'landing',
    meta: { order: 1 },
    content: {
      heroTitle: 'Where are you right now?',
      heroSubtitle: 'Answer a few questions to find the right starting point.',
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ASSESSMENTS
  // ─────────────────────────────────────────────────────────────────────────
  '/assessments': {
    path: '/assessments',
    title: 'Assessments',
    description: 'Core diagnostic quizzes for self-understanding',
    template: 'landing',
    children: [
      '/assessments/attachment-style',
      '/assessments/wound-patterns',
      '/assessments/protection-mechanisms',
      '/assessments/mirror-archetypes',
    ],
    meta: { order: 2, icon: '🔍' },
  },

  '/assessments/attachment-style': {
    path: '/assessments/attachment-style',
    title: 'Attachment Style Assessment',
    description: 'Map your attachment patterns in relationships',
    template: 'assessment',
    parent: '/assessments',
    meta: { icon: '💕' },
  },

  '/assessments/wound-patterns': {
    path: '/assessments/wound-patterns',
    title: 'Wound Patterns Assessment',
    description: 'Identify core wounds driving your reactions',
    template: 'assessment',
    parent: '/assessments',
    meta: { icon: '🩹' },
  },

  '/assessments/protection-mechanisms': {
    path: '/assessments/protection-mechanisms',
    title: 'Protection Mechanisms',
    description: 'How your nervous system defends you',
    template: 'assessment',
    parent: '/assessments',
    meta: { icon: '🛡️' },
  },

  '/assessments/mirror-archetypes': {
    path: '/assessments/mirror-archetypes',
    title: 'Mirror Archetypes',
    description: 'Discover your survival archetype under stress',
    template: 'assessment',
    parent: '/assessments',
    meta: { icon: '🪞' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SURVIVOR TYPES - The 6 Archetypes
  // ─────────────────────────────────────────────────────────────────────────
  '/survivor-types': {
    path: '/survivor-types',
    title: 'Survivor Types',
    description: 'The 6 archetypes of trauma response',
    template: 'landing',
    children: [
      '/survivor-types/fixer',
      '/survivor-types/vanisher',
      '/survivor-types/analyzer',
      '/survivor-types/warrior',
      '/survivor-types/chameleon',
      '/survivor-types/performer',
    ],
    meta: { order: 3, icon: '🎭' },
  },

  '/survivor-types/fixer': {
    path: '/survivor-types/fixer',
    title: 'The Fixer',
    description: 'You survived by being needed, not by being seen.',
    template: 'archetype',
    parent: '/survivor-types',
    meta: { icon: '🔧' },
  },

  '/survivor-types/vanisher': {
    path: '/survivor-types/vanisher',
    title: 'The Vanisher',
    description: 'You leave before you are left.',
    template: 'archetype',
    parent: '/survivor-types',
    meta: { icon: '👻' },
  },

  '/survivor-types/analyzer': {
    path: '/survivor-types/analyzer',
    title: 'The Analyzer',
    description: 'You scan for risk and try to think your way to safety.',
    template: 'archetype',
    parent: '/survivor-types',
    meta: { icon: '🔍' },
  },

  '/survivor-types/warrior': {
    path: '/survivor-types/warrior',
    title: 'The Warrior',
    description: 'You protect fast. Defense keeps you strong.',
    template: 'archetype',
    parent: '/survivor-types',
    meta: { icon: '🛡️' },
  },

  '/survivor-types/chameleon': {
    path: '/survivor-types/chameleon',
    title: 'The Chameleon',
    description: 'You mirror what others need to keep the peace.',
    template: 'archetype',
    parent: '/survivor-types',
    meta: { icon: '🪞' },
  },

  '/survivor-types/performer': {
    path: '/survivor-types/performer',
    title: 'The Performer',
    description: 'You perform strength to stay safe, then crash when it\'s not mirrored back.',
    template: 'archetype',
    parent: '/survivor-types',
    meta: { icon: '🎭' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // RESOURCES
  // ─────────────────────────────────────────────────────────────────────────
  '/resources': {
    path: '/resources',
    title: 'Resources',
    description: 'Tools and frameworks for understanding patterns',
    template: 'landing',
    children: [
      '/resources/manipulation-detection',
      '/resources/coercive-control',
      '/resources/anxious-vs-accurate',
      '/resources/healing-frameworks',
    ],
    meta: { order: 4, icon: '📚' },
  },

  '/resources/manipulation-detection': {
    path: '/resources/manipulation-detection',
    title: 'Manipulation Detection',
    description: 'Recognize tactics before they work on you',
    template: 'resource',
    parent: '/resources',
    meta: { icon: '🎯' },
  },

  '/resources/coercive-control': {
    path: '/resources/coercive-control',
    title: 'Coercive Control',
    description: 'Patterns that don\'t look like "abuse" but remove your freedom',
    template: 'resource',
    parent: '/resources',
    meta: { icon: '🔒' },
  },

  '/resources/anxious-vs-accurate': {
    path: '/resources/anxious-vs-accurate',
    title: 'Anxious vs Accurate',
    description: 'Is your gut right or is it trauma talking?',
    template: 'resource',
    parent: '/resources',
    meta: { icon: '⚖️' },
  },

  '/resources/healing-frameworks': {
    path: '/resources/healing-frameworks',
    title: 'Healing Frameworks',
    description: 'Models that actually work for complex patterns',
    template: 'resource',
    parent: '/resources',
    meta: { icon: '🗺️' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHOP
  // ─────────────────────────────────────────────────────────────────────────
  '/shop': {
    path: '/shop',
    title: 'Shop',
    description: 'Workbooks, courses, and assessments',
    template: 'shop',
    meta: { order: 5, icon: '🛒' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ABOUT
  // ─────────────────────────────────────────────────────────────────────────
  '/about': {
    path: '/about',
    title: 'About',
    description: 'PhD in lived experience. Who I am and why I do this.',
    template: 'about',
    meta: { order: 6, icon: '👤' },
    content: {
      heroTitle: 'PhD in Lived Experience',
      heroSubtitle: 'I don\'t just study these patterns. I survived them.',
    }
  },
};

// ============================================================================
// ALL-FRONT WAR SITE STRUCTURE
// ============================================================================

export const ALL_FRONT_WAR: Record<string, SitePage> = {
  // ─────────────────────────────────────────────────────────────────────────
  // HOME - When Standard Trauma Work Fails You
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war': {
    path: '/all-front-war',
    title: 'All-Front War',
    description: 'When standard trauma work fails you',
    template: 'home',
    meta: { order: 0, icon: '⚔️' },
    content: {
      heroTitle: 'When Standard Trauma Work Fails You',
      heroSubtitle: 'For complex presentations that don\'t fit neat boxes.',
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // GROUND ZERO - Framework for Simultaneity/Multiplicity
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war/ground-zero': {
    path: '/all-front-war/ground-zero',
    title: 'Ground Zero',
    description: 'Framework for simultaneity and multiplicity',
    template: 'landing',
    parent: '/all-front-war',
    meta: { order: 1, icon: '🎯' },
    content: {
      heroTitle: 'Ground Zero',
      heroSubtitle: 'When you\'re fighting all wars at once. The framework for multiplicity.',
    }
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PRESENTATIONS - Complex Overlapping Conditions
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war/presentations': {
    path: '/all-front-war/presentations',
    title: 'Presentations',
    description: 'Complex overlapping conditions and patterns',
    template: 'landing',
    parent: '/all-front-war',
    children: [
      '/all-front-war/presentations/did-osdd',
      '/all-front-war/presentations/autism-trauma-overlap',
      '/all-front-war/presentations/adhd-or-hypervigilance',
      '/all-front-war/presentations/dissociation-vs-avoidance',
      '/all-front-war/presentations/psychosis-vs-complex-trauma',
      '/all-front-war/presentations/limerence',
      '/all-front-war/presentations/cptsd-reframed',
    ],
    meta: { order: 2, icon: '🧩' },
  },

  '/all-front-war/presentations/did-osdd': {
    path: '/all-front-war/presentations/did-osdd',
    title: 'DID/OSDD',
    description: 'Not "alters" - protective fragmentation',
    template: 'article',
    parent: '/all-front-war/presentations',
    meta: { icon: '🪞' },
    content: {
      heroTitle: 'Protective Fragmentation',
      heroSubtitle: 'Understanding DID/OSDD beyond the "alters" framework',
    }
  },

  '/all-front-war/presentations/autism-trauma-overlap': {
    path: '/all-front-war/presentations/autism-trauma-overlap',
    title: 'Autism + Trauma Overlap',
    description: 'Which is which? Untangling the signals.',
    template: 'article',
    parent: '/all-front-war/presentations',
    meta: { icon: '🧠' },
  },

  '/all-front-war/presentations/adhd-or-hypervigilance': {
    path: '/all-front-war/presentations/adhd-or-hypervigilance',
    title: 'ADHD or Hypervigilance?',
    description: 'When trauma looks like attention deficit',
    template: 'article',
    parent: '/all-front-war/presentations',
    meta: { icon: '⚡' },
  },

  '/all-front-war/presentations/dissociation-vs-avoidance': {
    path: '/all-front-war/presentations/dissociation-vs-avoidance',
    title: 'Dissociation vs Avoidance',
    description: 'Different mechanisms, different approaches',
    template: 'article',
    parent: '/all-front-war/presentations',
    meta: { icon: '🌫️' },
  },

  '/all-front-war/presentations/psychosis-vs-complex-trauma': {
    path: '/all-front-war/presentations/psychosis-vs-complex-trauma',
    title: 'Psychosis vs Complex Trauma',
    description: 'When the system breaks in similar ways',
    template: 'article',
    parent: '/all-front-war/presentations',
    meta: { icon: '💭' },
  },

  '/all-front-war/presentations/limerence': {
    path: '/all-front-war/presentations/limerence',
    title: 'Limerence',
    description: 'Anxious attachment on steroids',
    template: 'article',
    parent: '/all-front-war/presentations',
    meta: { icon: '💘' },
  },

  '/all-front-war/presentations/cptsd-reframed': {
    path: '/all-front-war/presentations/cptsd-reframed',
    title: 'CPTSD Reframed',
    description: 'Beyond the standard model',
    template: 'article',
    parent: '/all-front-war/presentations',
    meta: { icon: '🔄' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // PARTS WORK - Your Version
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war/parts-work': {
    path: '/all-front-war/parts-work',
    title: 'Parts Work',
    description: 'Internal system work when IFS doesn\'t fit',
    template: 'landing',
    parent: '/all-front-war',
    children: [
      '/all-front-war/parts-work/when-its-not-ifs',
      '/all-front-war/parts-work/internal-conflict-models',
      '/all-front-war/parts-work/working-with-simultaneity',
    ],
    meta: { order: 3, icon: '🎭' },
  },

  '/all-front-war/parts-work/when-its-not-ifs': {
    path: '/all-front-war/parts-work/when-its-not-ifs',
    title: 'When It\'s Not IFS',
    description: 'Your version of parts work',
    template: 'article',
    parent: '/all-front-war/parts-work',
    meta: { icon: '🔀' },
  },

  '/all-front-war/parts-work/internal-conflict-models': {
    path: '/all-front-war/parts-work/internal-conflict-models',
    title: 'Internal Conflict Models',
    description: 'Frameworks for understanding inner battles',
    template: 'article',
    parent: '/all-front-war/parts-work',
    meta: { icon: '⚖️' },
  },

  '/all-front-war/parts-work/working-with-simultaneity': {
    path: '/all-front-war/parts-work/working-with-simultaneity',
    title: 'Working with Simultaneity',
    description: 'When multiple things are true at once',
    template: 'article',
    parent: '/all-front-war/parts-work',
    meta: { icon: '🔄' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // MYTHS VS REALITY
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war/myths-vs-reality': {
    path: '/all-front-war/myths-vs-reality',
    title: 'Myths vs Reality',
    description: 'What they won\'t tell you about healing',
    template: 'landing',
    parent: '/all-front-war',
    children: [
      '/all-front-war/myths-vs-reality/therapy-lies',
      '/all-front-war/myths-vs-reality/diagnosis-traps',
      '/all-front-war/myths-vs-reality/why-cbt-fails',
      '/all-front-war/myths-vs-reality/medication-truths',
    ],
    meta: { order: 4, icon: '💡' },
  },

  '/all-front-war/myths-vs-reality/therapy-lies': {
    path: '/all-front-war/myths-vs-reality/therapy-lies',
    title: 'Therapy Lies',
    description: 'What they won\'t tell you',
    template: 'article',
    parent: '/all-front-war/myths-vs-reality',
    meta: { icon: '🤐' },
  },

  '/all-front-war/myths-vs-reality/diagnosis-traps': {
    path: '/all-front-war/myths-vs-reality/diagnosis-traps',
    title: 'Diagnosis Traps',
    description: 'When labels hurt more than help',
    template: 'article',
    parent: '/all-front-war/myths-vs-reality',
    meta: { icon: '🏷️' },
  },

  '/all-front-war/myths-vs-reality/why-cbt-fails': {
    path: '/all-front-war/myths-vs-reality/why-cbt-fails',
    title: 'Why CBT Fails',
    description: 'For complex trauma, logic isn\'t enough',
    template: 'article',
    parent: '/all-front-war/myths-vs-reality',
    meta: { icon: '🧠' },
  },

  '/all-front-war/myths-vs-reality/medication-truths': {
    path: '/all-front-war/myths-vs-reality/medication-truths',
    title: 'Medication Truths',
    description: 'What actually helps vs. what they prescribe',
    template: 'article',
    parent: '/all-front-war/myths-vs-reality',
    meta: { icon: '💊' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // WHAT ACTUALLY WORKS
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war/what-actually-works': {
    path: '/all-front-war/what-actually-works',
    title: 'What Actually Works',
    description: 'Approaches that help complex presentations',
    template: 'landing',
    parent: '/all-front-war',
    children: [
      '/all-front-war/what-actually-works/nervous-system-first',
      '/all-front-war/what-actually-works/pattern-interruption',
      '/all-front-war/what-actually-works/when-to-leave-therapy',
      '/all-front-war/what-actually-works/building-outside-system',
    ],
    meta: { order: 5, icon: '✅' },
  },

  '/all-front-war/what-actually-works/nervous-system-first': {
    path: '/all-front-war/what-actually-works/nervous-system-first',
    title: 'Nervous System First',
    description: 'Regulate before you process',
    template: 'article',
    parent: '/all-front-war/what-actually-works',
    meta: { icon: '🧘' },
  },

  '/all-front-war/what-actually-works/pattern-interruption': {
    path: '/all-front-war/what-actually-works/pattern-interruption',
    title: 'Pattern Interruption',
    description: 'Breaking the loop without breaking yourself',
    template: 'article',
    parent: '/all-front-war/what-actually-works',
    meta: { icon: '🔁' },
  },

  '/all-front-war/what-actually-works/when-to-leave-therapy': {
    path: '/all-front-war/what-actually-works/when-to-leave-therapy',
    title: 'When to Leave Therapy',
    description: 'Recognizing when it\'s not working',
    template: 'article',
    parent: '/all-front-war/what-actually-works',
    meta: { icon: '🚪' },
  },

  '/all-front-war/what-actually-works/building-outside-system': {
    path: '/all-front-war/what-actually-works/building-outside-system',
    title: 'Building Outside the System',
    description: 'Creating your own support structures',
    template: 'article',
    parent: '/all-front-war/what-actually-works',
    meta: { icon: '🏗️' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ASSESSMENTS (Specialized)
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war/assessments': {
    path: '/all-front-war/assessments',
    title: 'Specialized Assessments',
    description: 'Quizzes for complex presentations',
    template: 'landing',
    parent: '/all-front-war',
    children: [
      '/all-front-war/assessments/ground-zero-quiz',
      '/all-front-war/assessments/dissociation-tracker',
      '/all-front-war/assessments/trauma-vs-neurodivergence',
    ],
    meta: { order: 6, icon: '📋' },
  },

  '/all-front-war/assessments/ground-zero-quiz': {
    path: '/all-front-war/assessments/ground-zero-quiz',
    title: 'Ground Zero Quiz',
    description: 'For multiple conflicting patterns',
    template: 'assessment',
    parent: '/all-front-war/assessments',
    meta: { icon: '🎯' },
  },

  '/all-front-war/assessments/dissociation-tracker': {
    path: '/all-front-war/assessments/dissociation-tracker',
    title: 'Dissociation Tracker',
    description: 'Map your dissociative patterns',
    template: 'assessment',
    parent: '/all-front-war/assessments',
    meta: { icon: '🌫️' },
  },

  '/all-front-war/assessments/trauma-vs-neurodivergence': {
    path: '/all-front-war/assessments/trauma-vs-neurodivergence',
    title: 'Trauma vs Neurodivergence',
    description: 'Untangle what\'s what',
    template: 'assessment',
    parent: '/all-front-war/assessments',
    meta: { icon: '🧠' },
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SHOP (Specialized)
  // ─────────────────────────────────────────────────────────────────────────
  '/all-front-war/shop': {
    path: '/all-front-war/shop',
    title: 'War Room Shop',
    description: 'Specialized tools and workbooks for complex presentations',
    template: 'shop',
    parent: '/all-front-war',
    meta: { order: 7, icon: '🛒' },
  },
};

// ============================================================================
// COMBINED SITE MAP
// ============================================================================

export const FULL_SITE_MAP: Record<string, SitePage> = {
  ...MAIN_SITE,
  ...ALL_FRONT_WAR,
};

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

export interface NavItem {
  path: string;
  label: string;
  icon?: string;
  children?: NavItem[];
  isExternal?: boolean;
  badge?: string;
  highlight?: boolean;
}

export const MAIN_NAV: NavItem[] = [
  { path: '/start', label: 'Start Here', icon: '🚀' },
  { 
    path: '/assessments', 
    label: 'Assessments', 
    icon: '🔍',
    children: [
      { path: '/assessments/attachment-style', label: 'Attachment Style' },
      { path: '/assessments/wound-patterns', label: 'Wound Patterns' },
      { path: '/assessments/protection-mechanisms', label: 'Protection Mechanisms' },
      { path: '/assessments/mirror-archetypes', label: 'Mirror Archetypes' },
    ]
  },
  { 
    path: '/survivor-types', 
    label: 'Survivor Types', 
    icon: '🎭',
    children: [
      { path: '/survivor-types/fixer', label: 'The Fixer', icon: '🔧' },
      { path: '/survivor-types/vanisher', label: 'The Vanisher', icon: '👻' },
      { path: '/survivor-types/analyzer', label: 'The Analyzer', icon: '🔍' },
      { path: '/survivor-types/warrior', label: 'The Warrior', icon: '🛡️' },
      { path: '/survivor-types/chameleon', label: 'The Chameleon', icon: '🪞' },
      { path: '/survivor-types/performer', label: 'The Performer', icon: '🎭' },
    ]
  },
  { 
    path: '/resources', 
    label: 'Resources', 
    icon: '📚',
    children: [
      { path: '/resources/manipulation-detection', label: 'Manipulation Detection' },
      { path: '/resources/coercive-control', label: 'Coercive Control' },
      { path: '/resources/anxious-vs-accurate', label: 'Anxious vs Accurate' },
      { path: '/resources/healing-frameworks', label: 'Healing Frameworks' },
    ]
  },
  { path: '/shop', label: 'Shop', icon: '🛒' },
  { path: '/about', label: 'About', icon: '👤' },
  { 
    path: '/all-front-war', 
    label: 'War Path', 
    icon: '⚔️', 
    highlight: true,
    badge: 'Complex Trauma'
  },
];

export const WAR_NAV: NavItem[] = [
  { path: '/all-front-war', label: 'War Home', icon: '⚔️' },
  { path: '/all-front-war/ground-zero', label: 'Ground Zero', icon: '🎯' },
  { 
    path: '/all-front-war/presentations', 
    label: 'Presentations', 
    icon: '🧩',
    children: [
      { path: '/all-front-war/presentations/did-osdd', label: 'DID/OSDD' },
      { path: '/all-front-war/presentations/autism-trauma-overlap', label: 'Autism + Trauma' },
      { path: '/all-front-war/presentations/adhd-or-hypervigilance', label: 'ADHD or Hypervigilance' },
      { path: '/all-front-war/presentations/dissociation-vs-avoidance', label: 'Dissociation vs Avoidance' },
      { path: '/all-front-war/presentations/psychosis-vs-complex-trauma', label: 'Psychosis vs Complex Trauma' },
      { path: '/all-front-war/presentations/limerence', label: 'Limerence' },
      { path: '/all-front-war/presentations/cptsd-reframed', label: 'CPTSD Reframed' },
    ]
  },
  { 
    path: '/all-front-war/parts-work', 
    label: 'Parts Work', 
    icon: '🎭',
    children: [
      { path: '/all-front-war/parts-work/when-its-not-ifs', label: 'When It\'s Not IFS' },
      { path: '/all-front-war/parts-work/internal-conflict-models', label: 'Internal Conflict Models' },
      { path: '/all-front-war/parts-work/working-with-simultaneity', label: 'Working with Simultaneity' },
    ]
  },
  { 
    path: '/all-front-war/myths-vs-reality', 
    label: 'Myths vs Reality', 
    icon: '💡',
    children: [
      { path: '/all-front-war/myths-vs-reality/therapy-lies', label: 'Therapy Lies' },
      { path: '/all-front-war/myths-vs-reality/diagnosis-traps', label: 'Diagnosis Traps' },
      { path: '/all-front-war/myths-vs-reality/why-cbt-fails', label: 'Why CBT Fails' },
      { path: '/all-front-war/myths-vs-reality/medication-truths', label: 'Medication Truths' },
    ]
  },
  { 
    path: '/all-front-war/what-actually-works', 
    label: 'What Works', 
    icon: '✅',
    children: [
      { path: '/all-front-war/what-actually-works/nervous-system-first', label: 'Nervous System First' },
      { path: '/all-front-war/what-actually-works/pattern-interruption', label: 'Pattern Interruption' },
      { path: '/all-front-war/what-actually-works/when-to-leave-therapy', label: 'When to Leave Therapy' },
      { path: '/all-front-war/what-actually-works/building-outside-system', label: 'Building Outside System' },
    ]
  },
  { path: '/all-front-war/assessments', label: 'Assessments', icon: '📋' },
  { path: '/all-front-war/shop', label: 'Shop', icon: '🛒' },
  { path: '/', label: '← Main Site', icon: '🏠' },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getPage(path: string): SitePage | undefined {
  return FULL_SITE_MAP[path];
}

export function getChildren(path: string): SitePage[] {
  const page = FULL_SITE_MAP[path];
  if (!page?.children) return [];
  return page.children.map(childPath => FULL_SITE_MAP[childPath]).filter(Boolean);
}

export function getBreadcrumbs(path: string): SitePage[] {
  const crumbs: SitePage[] = [];
  let current = FULL_SITE_MAP[path];
  
  while (current) {
    crumbs.unshift(current);
    current = current.parent ? FULL_SITE_MAP[current.parent] : undefined;
  }
  
  return crumbs;
}

export function isWarPath(path: string): boolean {
  return path.startsWith('/all-front-war');
}

export function getNavigation(path: string): NavItem[] {
  return isWarPath(path) ? WAR_NAV : MAIN_NAV;
}

// ============================================================================
// ARCHETYPE DATA
// ============================================================================

export const SURVIVOR_ARCHETYPES: Record<SurvivorArchetype, {
  name: string;
  icon: string;
  tagline: string;
  clinical: string;
  profile: string;
  nervousSystem: string;
  doThisWeek: string[];
  avoid: string[];
  scripts: string[];
}> = {
  fixer: {
    name: 'The Fixer',
    icon: '🔧',
    tagline: 'You survived by being needed, not by being seen.',
    clinical: 'Codependent patterning',
    profile: 'You survived by being needed. Rest feels unsafe. You find worth in fixing others.',
    nervousSystem: 'Practice being seen without earning it.',
    doThisWeek: [
      'One boundary without explaining why',
      'One need stated without apologizing',
      'Notice when you\'re fixing to avoid your own feelings'
    ],
    avoid: ['Overgiving', 'Rescuing to feel secure'],
    scripts: ['Boundary with warmth', 'Need statement'],
  },
  vanisher: {
    name: 'The Vanisher',
    icon: '👻',
    tagline: 'You leave before you are left.',
    clinical: 'Avoidant collapse with dissociation',
    profile: 'Disappearing feels like control. The vanishing confirms your fear that love always ends.',
    nervousSystem: 'Visibility without pressure is the medicine.',
    doThisWeek: [
      'Practice visibility without pressure',
      'One space request instead of just leaving',
      'Notice the urge to vanish and pause'
    ],
    avoid: ['Ghosting repair', 'High stimulation dynamics'],
    scripts: ['Space request with return time', 'Reconnection phrase'],
  },
  analyzer: {
    name: 'The Analyzer',
    icon: '🔍',
    tagline: 'You scan for risk and try to think your way to safety.',
    clinical: 'Intellectualized defense',
    profile: 'Over-analysis becomes delay. You replay conversations trying to figure out what went wrong.',
    nervousSystem: 'The body trusts action. Small moves quiet the loop.',
    doThisWeek: [
      'One tiny move daily instead of more research',
      'One page limit on journaling',
      'One clean ask that ends with a question mark'
    ],
    avoid: ['Info binges that replace action', 'Long texts that explain instead of ask'],
    scripts: ['Clean ask', 'Decision line for today'],
  },
  warrior: {
    name: 'The Warrior',
    icon: '🛡️',
    tagline: 'You protect fast. Defense keeps you strong.',
    clinical: 'Defensive protection',
    profile: 'Defense keeps you strong and also keeps love at the door.',
    nervousSystem: 'Protection can soften when safety rises. Let the body see evidence.',
    doThisWeek: [
      'One proof hunt for safety',
      'One repair attempt with a soft opener',
      'One stretch toward receiving'
    ],
    avoid: ['Keeping score', 'Retaliation texts', 'Tests'],
    scripts: ['Soft opener for repair', 'Receiving line'],
  },
  chameleon: {
    name: 'The Chameleon',
    icon: '🪞',
    tagline: 'You mirror what others need to keep the peace.',
    clinical: 'Fawn response',
    profile: 'You learned that your real self wasn\'t safe. Showing up as yourself is the work.',
    nervousSystem: 'Connection without performance is the medicine.',
    doThisWeek: [
      'One preference stated without checking if it\'s okay',
      'One disagreement voiced gently',
      'Notice when you\'re mirroring'
    ],
    avoid: ['Overexposure too fast', 'Saying yes when you mean no'],
    scripts: ['Preference statement', 'Gentle no'],
  },
  performer: {
    name: 'The Performer',
    icon: '🎭',
    tagline: 'You perform strength to stay safe.',
    clinical: 'Achievement-based self-worth',
    profile: 'You perform strength to stay safe, then crash when it\'s not mirrored back.',
    nervousSystem: 'Connection without performance is the medicine.',
    doThisWeek: [
      'One conversation where you don\'t try to impress',
      'One vulnerability shared without managing the response',
      'Notice what you feel after the performance drops'
    ],
    avoid: ['Perfectionism targets', 'High standards under pressure'],
    scripts: ['Reality testing statement', 'Soft ask'],
  },
};

// ============================================================================
// WAR TYPE DATA
// ============================================================================

export const WAR_TYPES: Record<WarType, {
  name: string;
  icon: string;
  coreFear: string;
  bodySignal: string;
  triggerPattern: string;
}> = {
  abandonment: {
    name: 'Abandonment War',
    icon: '💔',
    coreFear: 'Being left once they really see you',
    bodySignal: 'Chest drops, panic spiraling',
    triggerPattern: 'Distance, silence, or perceived rejection',
  },
  exposure: {
    name: 'Exposure War',
    icon: '👁️',
    coreFear: 'Being seen as flawed, wrong, or "the bad one"',
    bodySignal: 'Shame flood, defensive heat',
    triggerPattern: 'Criticism, judgment, or being called out',
  },
  entrapment: {
    name: 'Entrapment War',
    icon: '🔒',
    coreFear: 'Losing freedom, being controlled or swallowed',
    bodySignal: 'Claustrophobic urgency, need to escape',
    triggerPattern: 'Demands, expectations, or pressure to commit',
  },
  erasure: {
    name: 'Erasure War',
    icon: '👻',
    coreFear: 'Being forgotten, replaced, or treated as background',
    bodySignal: 'Cold invisibility, bitter comparison',
    triggerPattern: 'Being sidelined, overlooked, or deprioritized',
  },
};

// ============================================================================
// MASK TYPE DATA
// ============================================================================

export const MASK_TYPES: Record<MaskType, {
  name: string;
  displayName: string;
  icon: string;
  description: string;
}> = {
  flooded: {
    name: 'flooded',
    displayName: 'Flooded Mirror',
    icon: '🌊',
    description: 'Emotions overwhelm and spill out. Big reactions, visible pain.',
  },
  armored: {
    name: 'armored',
    displayName: 'Armored Mirror',
    icon: '🛡️',
    description: 'Defense hardens. Cold, distant, superior. Protection through walls.',
  },
  phantom: {
    name: 'phantom',
    displayName: 'Phantom Performer',
    icon: '🎭',
    description: 'The calm, composed one. Hides the mess behind performance.',
  },
  analyzer: {
    name: 'analyzer',
    displayName: 'Hyper Analyzer',
    icon: '🔍',
    description: 'Goes into the head. Detaches to analyze instead of feel.',
  },
};









