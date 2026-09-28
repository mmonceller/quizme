import { mediaUrl } from '@/api/config';
import { cn, initials } from '@/lib/utils';

const COLORS = ['bg-brand-600', 'bg-slate-600', 'bg-teal-700', 'bg-amber-700', 'bg-rose-800', 'bg-indigo-800'];

export function Avatar({
  user,
  size = 40,
  className,
}: {
  user: { firstName: string; lastName: string; avatarUrl: string | null; username?: string };
  size?: number;
  className?: string;
}) {
  const color = COLORS[(user.username ?? user.firstName).length % COLORS.length];
  return user.avatarUrl ? (
    <img
      src={mediaUrl(user.avatarUrl)}
      alt=""
      style={{ width: size, height: size }}
      className={cn('shrink-0 rounded-full object-cover ring-2 ring-white', className)}
    />
  ) : (
    <span
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className={cn('flex shrink-0 items-center justify-center rounded-full font-medium tracking-wide text-white ring-2 ring-white', color, className)}
    >
      {initials(user)}
    </span>
  );
}
