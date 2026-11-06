// The accounts and numbers from the question, kept on hand while the working is done.
// The question scrolls out of sight on a phone, and a calculation that needs a figure from a statement should never
// leave you hunting for it.
import type { StoryBeat, TableDiagram } from '../engine/types';
import { DataTable } from './Diagrams';

export function Figures({ data, prompt, title = 'The figures' }: { data?: TableDiagram; prompt: (string | StoryBeat)[]; title?: string }) {
  const lines = prompt.map((b) => (typeof b === 'string' ? b : b.text)).filter((t) => /\d/.test(t));
  if (!data && lines.length === 0) return null;
  return (
    <details className="figures" open>
      <summary>
        {title} <span className="muted">· tap to hide</span>
      </summary>
      {lines.map((t, i) => (
        <p key={i}>{t}</p>
      ))}
      {data && <DataTable d={data} compact />}
    </details>
  );
}
