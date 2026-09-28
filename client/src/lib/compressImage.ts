/** The server stores each image in a single database value, capped just under 2 MB. */
export const MAX_UPLOAD_BYTES = 1_900_000;

const TARGET_BYTES = 900_000;
const QUALITIES = [0.85, 0.72, 0.6, 0.45];

function toBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

/**
 * Downscales and re-encodes photos in the browser so uploads stay small. GIFs (which may be
 * animated) and SVGs are returned unchanged, as is anything already small enough.
 */
export async function compressImage(file: File, maxDimension = 1600): Promise<File> {
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  if (scale === 1 && file.size <= TARGET_BYTES) {
    bitmap.close();
    return file;
  }

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext('2d');
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  let best: Blob | null = null;
  for (const quality of QUALITIES) {
    let blob = await toBlob(canvas, 'image/webp', quality);
    // Browsers without WebP encoding fall back to PNG; use JPEG on a white background instead.
    if (blob && blob.type !== 'image/webp') {
      ctx.globalCompositeOperation = 'destination-over';
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      blob = await toBlob(canvas, 'image/jpeg', quality);
    }
    if (!blob) break;
    best = blob;
    if (blob.size <= TARGET_BYTES) break;
  }

  if (!best || best.size >= file.size) return file;
  const ext = best.type === 'image/webp' ? 'webp' : 'jpg';
  return new File([best], `${file.name.replace(/\.[^.]+$/, '') || 'image'}.${ext}`, { type: best.type });
}

/** Compresses an image and rejects it if it's still too big to store. */
export async function prepareUpload(file: File, maxDimension?: number): Promise<File> {
  const out = await compressImage(file, maxDimension);
  if (out.size > MAX_UPLOAD_BYTES) {
    throw new Error('That image is too large. Please choose one under 1.9 MB, or a JPG/PNG photo we can shrink.');
  }
  return out;
}
