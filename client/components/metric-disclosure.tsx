import type { ReactNode } from 'react';

type MetricDisclosureProps = {
  summary: ReactNode;
  source: string;
  calculation: string;
  note?: string;
  className?: string;
  summaryClassName?: string;
  contentClassName?: string;
};

export default function MetricDisclosure({
  summary,
  source,
  calculation,
  note,
  className = '',
  summaryClassName = '',
  contentClassName = ''
}: MetricDisclosureProps) {
  return (
    <details className={`metric-help-card ${className}`.trim()}>
      <summary className={`hint-summary cursor-pointer list-none ${summaryClassName}`.trim()}>{summary}</summary>
      <div className={`mt-3 space-y-2 border-t border-ink/8 pt-3 text-sm leading-7 text-ink/72 ${contentClassName}`.trim()}>
        <p>
          <span className="font-medium text-ink">資料來源: </span>
          {source}
        </p>
        <p>
          <span className="font-medium text-ink">計算方式: </span>
          {calculation}
        </p>
        {note ? <p className="soft-chip rounded-2xl px-3 py-2">{note}</p> : null}
      </div>
    </details>
  );
}