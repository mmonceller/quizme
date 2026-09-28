import { THEME_PRESETS, themeFromPreset } from './themes.ts';
import type { DisplaySettings, EndScreenSettings, QuizSettings, TextStyle } from './types.ts';

export const DEFAULT_DISPLAY: DisplaySettings = {
  width: 'wide',
  cardStyle: 'card',
  choiceBorders: true,
  showQuestionType: true,
  showPoints: true,
};

export const DEFAULT_END_SCREEN: EndScreenSettings = {
  showScore: true,
  showBreakdown: true,
  allowReview: true,
  allowReplay: true,
  title: '',
  message: '',
};

export const DEFAULT_QUESTION_STYLE: TextStyle = {
  fontFamily: 'inherit',
  fontSize: 28,
  bold: true,
  italic: false,
  underline: false,
  color: null,
  align: 'center',
};

export const DEFAULT_CHOICE_STYLE: TextStyle = {
  fontFamily: 'inherit',
  fontSize: 20,
  bold: false,
  italic: false,
  underline: false,
  color: null,
  align: 'left',
};

export function defaultSettings(): QuizSettings {
  return {
    theme: themeFromPreset(THEME_PRESETS[0]),
    questionStyle: { ...DEFAULT_QUESTION_STYLE },
    choiceStyle: { ...DEFAULT_CHOICE_STYLE },
    timer: {
      enabled: false,
      defaultSeconds: 30,
      style: 'ring',
      position: 'bottom-right',
      size: 'md',
      color: null,
      autoAdvance: false,
    },
    display: { ...DEFAULT_DISPLAY },
    endScreen: { ...DEFAULT_END_SCREEN },
    revealAnswers: true,
    interactive: true,
    shuffleQuestions: false,
    shuffleChoices: false,
  };
}

/** Fills in any settings keys missing from older saved data. */
export function withDefaultSettings(partial: Partial<QuizSettings> | undefined): QuizSettings {
  const d = defaultSettings();
  if (!partial) return d;
  return {
    ...d,
    ...partial,
    theme: { ...d.theme, ...partial.theme },
    questionStyle: { ...d.questionStyle, ...partial.questionStyle },
    choiceStyle: { ...d.choiceStyle, ...partial.choiceStyle },
    timer: { ...d.timer, ...partial.timer },
    display: { ...d.display, ...partial.display },
    endScreen: { ...d.endScreen, ...partial.endScreen },
  };
}
