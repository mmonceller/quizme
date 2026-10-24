export type Gender = 'male' | 'female' | 'non_binary' | 'prefer_not_to_say' | 'other';

export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
}

export interface Group {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: string;
  quizCount?: number;
  folderCount?: number;
}

export interface Folder {
  id: string;
  groupId: string;
  parentId: string | null;
  name: string;
  createdAt: string;
}

/* ---------- Styling ---------- */

export interface TextStyle {
  fontFamily: string;
  fontSize: number; // px, base size before responsive scaling
  bold: boolean;
  italic: boolean;
  underline: boolean;
  color: string | null; // null = inherit from theme
  align: 'left' | 'center' | 'right';
}

export interface Theme {
  presetId: string;
  background: string; // any CSS background (color or gradient)
  backgroundImage: string | null;
  overlay: number; // 0..0.85, darkens background images
  cardBg: string;
  textColor: string;
  accent: string;
  choiceBg: string;
  choiceText: string;
  fontFamily: string;
}

export type TimerStyle = 'ring' | 'bar' | 'digital' | 'bubble';
export type TimerPosition = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
export type TimerSize = 'sm' | 'md' | 'lg';

export interface TimerSettings {
  enabled: boolean;
  defaultSeconds: number;
  style: TimerStyle;
  position: TimerPosition;
  size: TimerSize;
  color: string | null; // null = theme accent
  autoAdvance: boolean;
}

export type StageWidth = 'standard' | 'wide' | 'full';
/** card = panel with border, borderless = panel only, none = content sits directly on the background */
export type CardStyle = 'card' | 'borderless' | 'none';

export interface DisplaySettings {
  width: StageWidth;
  cardStyle: CardStyle;
  choiceBorders: boolean;
  showQuestionType: boolean;
  showPoints: boolean;
}

export interface EndScreenSettings {
  showScore: boolean;
  showBreakdown: boolean;
  allowReview: boolean;
  allowReplay: boolean;
  /** empty = automatic headline based on the score */
  title: string;
  message: string;
}

export interface QuizSettings {
  theme: Theme;
  questionStyle: TextStyle;
  choiceStyle: TextStyle;
  timer: TimerSettings;
  display: DisplaySettings;
  endScreen: EndScreenSettings;
  revealAnswers: boolean;
  interactive: boolean;
  shuffleQuestions: boolean;
  shuffleChoices: boolean;
}

/* ---------- Questions ---------- */

export type QuestionType =
  | 'multiple_choice'
  | 'true_false'
  | 'identification'
  | 'fill_blank'
  | 'matching'
  | 'enumeration'
  | 'sequencing'
  | 'word_search'
  | 'maze';

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  prompt: string;
  image: string | null;
  points: number;
  /** null = use quiz default, 0 = no timer for this question */
  timerSeconds: number | null;
  revealAnswer: 'inherit' | 'show' | 'hide';
  questionStyle?: Partial<TextStyle>;
  choiceStyle?: Partial<TextStyle>;
}

export interface Choice {
  id: string;
  text: string;
  image: string | null;
  correct: boolean;
  /** choice icon key, used when the question's labels are set to 'icons' */
  icon?: string | null;
}

/** How each choice is marked: letters (A, B, C), sign-language letters, both, custom icons, or nothing. */
export type ChoiceLabelStyle = 'letters' | 'sign' | 'both' | 'icons' | 'none';
export type ChoiceColumns = 'auto' | '1' | '2' | '3' | '4';
export type ChoiceSize = 'sm' | 'md' | 'lg' | 'xl';

export interface ChoiceLayout {
  labels: ChoiceLabelStyle;
  columns: ChoiceColumns;
  size: ChoiceSize;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple_choice';
  choices: Choice[];
  layout?: Partial<ChoiceLayout>;
  /** set on sanitized (public) payloads when more than one choice is correct */
  multiSelect?: boolean;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: 'true_false';
  answer: boolean;
}

export interface IdentificationQuestion extends BaseQuestion {
  type: 'identification';
  answers: string[];
  caseSensitive: boolean;
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill_blank';
  /** sentence with blanks written as [[answer]] or [[answer|alternate]] */
  text: string;
  caseSensitive: boolean;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: 'matching';
  pairs: MatchingPair[];
  /** shuffled right-hand options, present on sanitized payloads */
  options?: string[];
}

export interface EnumerationQuestion extends BaseQuestion {
  type: 'enumeration';
  answers: string[];
  ordered: boolean;
  caseSensitive: boolean;
}

export interface SequenceItem {
  id: string;
  text: string;
}

export interface SequencingQuestion extends BaseQuestion {
  type: 'sequencing';
  items: SequenceItem[]; // in correct order
}

export type WordDirection = 'horizontal' | 'vertical' | 'diagonal';
/** easy = random filler letters, medium = filler drawn from the words' letters, hard = medium + look-alike decoys */
export type WordSearchDifficulty = 'easy' | 'medium' | 'hard';

export interface WordSearchOptions {
  /** The grid is size × size letters. */
  size: number;
  directions: WordDirection[];
  /** Words may also read backwards along the allowed directions. */
  reverse: boolean;
  difficulty: WordSearchDifficulty;
  showWordList: boolean;
}

export interface WordPlacement {
  word: string;
  row: number;
  col: number;
  dr: number;
  dc: number;
}

export interface WordSearchQuestion extends BaseQuestion {
  type: 'word_search';
  /** As entered by the author; letters are normalized (A–Z) for the grid. */
  words: string[];
  /** Points per word, aligned with `words` (missing entries count as 1). The question's points are their sum. */
  wordPoints?: number[];
  options: WordSearchOptions;
  seed: number;
  /** One string of letters per row. */
  grid: string[];
  /** Where each word sits; removed from public payloads. */
  placements: WordPlacement[];
  /** Set on public payloads when the word list is hidden, so found words can be recognized. */
  wordHashes?: string[];
}

export type MazeShape = 'rectangle' | 'square' | 'circle' | 'ring' | 'diamond' | 'triangle' | 'hexagon' | 'heart';
export type MazeSize = 'sm' | 'md' | 'lg' | 'xl';
export type MazeAnchor =
  | 'top-left'
  | 'top'
  | 'top-right'
  | 'left'
  | 'center'
  | 'right'
  | 'bottom-left'
  | 'bottom'
  | 'bottom-right'
  | 'random'
  | 'custom';

export interface MazeOptions {
  shape: MazeShape;
  size: MazeSize;
  start: MazeAnchor;
  end: MazeAnchor;
}

export type Cell = [row: number, col: number];

/** What marks the maze start or finish: the default dot, a built-in picture, or an uploaded image. */
export type MazeMarker = { type: 'dot' } | { type: 'preset'; id: string } | { type: 'image'; url: string };

export interface MazeQuestion extends BaseQuestion {
  type: 'maze';
  options: MazeOptions;
  seed: number;
  /** One string per row; each char is a hex digit of open sides (1 N, 2 E, 4 S, 8 W) or "." outside the shape. */
  cells: string[];
  start: Cell;
  end: Cell;
  startMarker?: MazeMarker;
  endMarker?: MazeMarker;
}

export type Question =
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | IdentificationQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | EnumerationQuestion
  | SequencingQuestion
  | WordSearchQuestion
  | MazeQuestion;

/* ---------- Answers ---------- */

export type Answer =
  | string[] // multiple_choice (choice ids), fill_blank (per blank), enumeration, sequencing (item ids)
  | number[][] // word_search (found segments [r1, c1, r2, c2]), maze (path of [row, col])
  | boolean // true_false
  | string // identification
  | Record<string, string> // matching: pairId -> chosen right text
  | null;

export type AnswerMap = Record<string, Answer>;

export interface GradeResult {
  earned: number;
  max: number;
  correct: boolean;
}

/* ---------- Quizzes ---------- */

export type Permission = 'owner' | 'edit' | 'view';

export interface QuizSummary {
  id: string;
  groupId: string | null;
  folderId: string | null;
  title: string;
  description: string;
  questionCount: number;
  version: number;
  responseCount: number;
  publicEnabled: boolean;
  theme: Theme;
  updatedAt: string;
  createdAt: string;
  owner?: PublicUser;
  permission?: Permission;
}

export interface Quiz {
  id: string;
  groupId: string | null;
  folderId: string | null;
  title: string;
  description: string;
  questions: Question[];
  settings: QuizSettings;
  version: number;
  publicEnabled: boolean;
  publicToken: string | null;
  createdAt: string;
  updatedAt: string;
  owner: PublicUser;
  permission: Permission;
  responsesOnCurrentVersion: number;
  totalResponses: number;
}

export interface VersionChanges {
  added: number;
  removed: number;
  modified: number;
}

export interface QuizVersionSummary {
  version: number;
  note: string;
  changes: VersionChanges | null;
  questionCount: number;
  responseCount: number;
  createdAt: string;
  createdBy: PublicUser | null;
}

export interface QuizSnapshot {
  title: string;
  description: string;
  questions: Question[];
  settings: QuizSettings;
}

export interface QuizVersion extends QuizVersionSummary {
  snapshot: QuizSnapshot;
}

export interface QuizShare {
  user: PublicUser;
  permission: 'edit' | 'view';
  createdAt: string;
}

export interface ResponseSummary {
  id: string;
  version: number;
  participantName: string;
  birthday: string;
  score: number;
  maxScore: number;
  durationSeconds: number | null;
  submittedAt: string;
}

export interface ResponseDetail extends ResponseSummary {
  answers: AnswerMap;
  results: Record<string, GradeResult>;
  snapshot: QuizSnapshot;
}

export interface PublicQuiz {
  title: string;
  description: string;
  version: number;
  questions: Question[];
  settings: QuizSettings;
  ownerName: string;
}
