import { useRef, useState } from 'react';
import { ImagePlus, Trash2 } from 'lucide-react';
import { uploadApi } from '@/api/endpoints';
import { errorMessage } from '@/api/client';
import { mediaUrl } from '@/api/config';
import { useToast } from '@/components/feedback/ToastProvider';
import { Spinner } from '@/components/ui';
import { cn } from '@/lib/utils';

export function ImageUpload({
  value,
  onChange,
  label = 'Add image',
  compact,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  compact?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    try {
      onChange(await uploadApi.image(file));
    } catch (err) {
      toast(errorMessage(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const picker = (
    <input
      ref={input}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => {
        void upload(e.target.files?.[0]);
        e.target.value = '';
      }}
    />
  );

  if (value) {
    return (
      <div className={cn('group relative inline-block overflow-hidden rounded-xl border border-slate-200 bg-slate-50', compact ? 'h-14 w-14' : 'max-w-xs')}>
        <img src={mediaUrl(value)} alt="" className={cn('object-cover', compact ? 'h-full w-full' : 'max-h-48 w-full object-contain')} />
        <div className="absolute inset-0 flex items-center justify-center gap-1 bg-slate-900/50 opacity-0 transition group-hover:opacity-100">
          <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-white/90 p-1.5 text-slate-700" aria-label="Replace image">
            <ImagePlus className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => onChange(null)} className="rounded-lg bg-white/90 p-1.5 text-rose-600" aria-label="Remove image">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        {picker}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      disabled={busy}
      title={label}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 text-[13px] font-medium text-slate-500 transition-colors hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800',
        compact ? 'h-11 w-11 shrink-0' : 'px-4 py-2.5',
      )}
    >
      {busy ? <Spinner className="h-4 w-4" /> : <ImagePlus className="h-4 w-4" />}
      {!compact && label}
      {picker}
    </button>
  );
}
