import type { ResponseSummary } from '@shared/types';

const escape = (v: string | number | null) => {
  const s = v === null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function downloadResponsesCsv(title: string, responses: ResponseSummary[]) {
  const header = ['Name', 'Birthday', 'Score', 'Max score', 'Percent', 'Version', 'Duration (s)', 'Submitted'];
  const rows = responses.map((r) => [
    r.participantName,
    r.birthday,
    r.score,
    r.maxScore,
    r.maxScore ? Math.round((r.score / r.maxScore) * 100) : 0,
    r.version,
    r.durationSeconds,
    new Date(r.submittedAt).toLocaleString(),
  ]);
  const csv = [header, ...rows].map((row) => row.map(escape).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `${title.replace(/[^\w\- ]+/g, '').trim() || 'quiz'} - responses.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
