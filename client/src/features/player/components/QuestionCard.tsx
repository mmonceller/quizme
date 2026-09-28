import type { Answer, Question, QuizSettings } from '@shared/types';
import { mergeStyle, textStyleCss } from '../theme/themeStyles';
import { ThemedCard } from '../theme/ThemedStage';
import { DisplayProvider, resolveDisplay } from '../theme/DisplayContext';
import { cn } from '@/lib/utils';
import { mediaUrl } from '@/api/config';
import type { AnswerViewProps } from '../answers/types';
import { MultipleChoiceView } from '../answers/MultipleChoiceView';
import { TrueFalseView } from '../answers/TrueFalseView';
import { IdentificationView } from '../answers/IdentificationView';
import { FillBlankView } from '../answers/FillBlankView';
import { MatchingView } from '../answers/MatchingView';
import { EnumerationView } from '../answers/EnumerationView';
import { SequencingView } from '../answers/SequencingView';

export const QUESTION_TYPE_LABELS: Record<Question['type'], string> = {
  multiple_choice: 'Multiple choice',
  true_false: 'True or false',
  identification: 'Identification',
  fill_blank: 'Fill in the blanks',
  matching: 'Matching type',
  enumeration: 'Enumeration',
  sequencing: 'Sequencing',
};

function AnswerArea(props: AnswerViewProps) {
  const { q, solution } = props;
  switch (q.type) {
    case 'multiple_choice':
      return <MultipleChoiceView {...props} q={q} solution={solution as typeof q | null} />;
    case 'true_false':
      return <TrueFalseView {...props} q={q} solution={solution as typeof q | null} />;
    case 'identification':
      return <IdentificationView {...props} q={q} solution={solution as typeof q | null} />;
    case 'fill_blank':
      return <FillBlankView {...props} q={q} solution={solution as typeof q | null} />;
    case 'matching':
      return <MatchingView {...props} q={q} solution={solution as typeof q | null} />;
    case 'enumeration':
      return <EnumerationView {...props} q={q} solution={solution as typeof q | null} />;
    case 'sequencing':
      return <SequencingView {...props} q={q} solution={solution as typeof q | null} />;
  }
}

interface QuestionCardProps {
  question: Question;
  solution: Question | null;
  settings: QuizSettings;
  answer: Answer | undefined;
  onAnswer?: (answer: Answer) => void;
  interactive: boolean;
  locked: boolean;
  number?: number;
  compact?: boolean;
  /** Stretch to the parent's height on sm+ screens (used by the player stage). */
  fill?: boolean;
}

const FILL = 'sm:flex sm:flex-1 sm:flex-col';

export function QuestionCard({ question, solution, settings, answer, onAnswer, interactive, locked, number, compact, fill = false }: QuestionCardProps) {
  const theme = settings.theme;
  const display = resolveDisplay(settings);
  const qStyle = mergeStyle(settings.questionStyle, question.questionStyle);
  const cStyle = mergeStyle(settings.choiceStyle, question.choiceStyle);
  const qCss = textStyleCss(compact ? { ...qStyle, fontSize: Math.min(qStyle.fontSize, 22) } : qStyle, theme, theme.textColor, compact ? 1 : undefined);
  const cCss = textStyleCss(compact ? { ...cStyle, fontSize: Math.min(cStyle.fontSize, 17) } : cStyle, theme, theme.choiceText, compact ? 1 : undefined);
  const showPrompt = question.prompt.trim() || question.type !== 'fill_blank';
  const typeLabel = number !== undefined || display.showQuestionType;
  const showMeta = typeLabel || display.showPoints;
  const padding = display.cardStyle === 'none' ? 'clamp(4px, 1cqi, 16px)' : compact ? 'clamp(16px, 3cqi, 24px)' : 'clamp(20px, 3.5cqi, 56px)';

  return (
    <DisplayProvider value={{ ...display, fill }}>
      <div className={cn('@container', fill && FILL)}>
        <ThemedCard theme={theme} variant={display.cardStyle} style={{ padding }} className={cn(fill && FILL)}>
          <div className={cn('@container', fill && FILL)}>
            {showMeta && (
              <div
                className="mb-[1em] flex items-center justify-between gap-2 font-bold tracking-wide uppercase opacity-60"
                style={{ fontSize: compact ? '12px' : 'clamp(11px, 1.5cqi, 20px)' }}
              >
                <span>
                  {number !== undefined && `Question ${number}`}
                  {number !== undefined && display.showQuestionType && ' · '}
                  {display.showQuestionType && QUESTION_TYPE_LABELS[question.type]}
                </span>
                {display.showPoints && (
                  <span>
                    {question.points} {question.points === 1 ? 'pt' : 'pts'}
                  </span>
                )}
              </div>
            )}
            {showPrompt && (
              <h2 className="mb-[0.75em] whitespace-pre-wrap break-words" style={qCss}>
                {question.prompt || <span className="opacity-40">Untitled question</span>}
              </h2>
            )}
            {question.image && (
              <div className="mb-5 flex justify-center">
                <img src={mediaUrl(question.image)} alt="" className="max-h-[40vh] rounded-2xl object-contain shadow-md" />
              </div>
            )}
            <AnswerArea
              q={question}
              solution={solution}
              answer={answer}
              onChange={onAnswer ?? (() => {})}
              interactive={interactive}
              locked={locked}
              theme={theme}
              choiceCss={cCss}
            />
          </div>
        </ThemedCard>
      </div>
    </DisplayProvider>
  );
}
