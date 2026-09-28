import { useState } from 'react';
import { cn } from '@/lib/utils';
import { sitePath } from '@/api/config';

/** American Sign Language fingerspelled letter (public-domain artwork in /public/sign-language). */
export function SignLetter({ letter, className }: { letter: string; className?: string }) {
  const [failed, setFailed] = useState(false);
  const key = letter.toLowerCase();
  if (failed) return <span className={cn('flex items-center justify-center font-bold', className)}>{letter}</span>;
  return (
    <img
      src={sitePath(`sign-language/${key}.svg`)}
      alt={`Sign language letter ${letter}`}
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('aspect-[3/4] object-contain select-none', className)}
    />
  );
}
