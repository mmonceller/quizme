import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';
import { IconUser } from '@/components/icons';
import { mediaUrl } from '@/api/config';

/** Circular profile picture picker with a local preview. */
export function AvatarPicker({
  file,
  currentUrl,
  onChange,
  size = 96,
}: {
  file: File | null;
  currentUrl?: string | null;
  onChange: (file: File | null) => void;
  size?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const src = preview ?? mediaUrl(currentUrl);

  return (
    <button
      type="button"
      onClick={() => input.current?.click()}
      style={{ width: size, height: size }}
      className="group relative shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100"
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-slate-400">
          <IconUser className="h-1/2 w-1/2" strokeWidth={1.3} />
        </span>
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-slate-900/45 text-white opacity-0 transition-opacity group-hover:opacity-100">
        <Camera className="h-5 w-5" />
      </span>
      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          onChange(e.target.files?.[0] ?? null);
          e.target.value = '';
        }}
      />
    </button>
  );
}
