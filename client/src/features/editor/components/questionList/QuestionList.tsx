import { cn } from '@/lib/utils';
import { DesktopQuestionList } from './DesktopQuestionList';
import { QuestionChipStrip } from './QuestionChipStrip';
import { QuestionNavigator } from './QuestionNavigator';
import { useOverflows } from './useOverflows';
import type { QuestionListProps } from './types';

/**
 * Vertical list on desktop. On mobile, a chip strip while it fits the width,
 * otherwise a compact prev/next navigator with a full-list picker sheet.
 */
export function QuestionList(props: QuestionListProps) {
  const [stripRef, overflows] = useOverflows<HTMLDivElement>([props.questions.length]);

  return (
    <>
      <div className="relative lg:hidden">
        <QuestionChipStrip
          ref={stripRef}
          {...props}
          hidden={overflows}
          className={cn(overflows && 'pointer-events-none invisible absolute inset-x-0 top-0')}
        />
        {overflows && <QuestionNavigator {...props} />}
      </div>
      <DesktopQuestionList {...props} />
    </>
  );
}
