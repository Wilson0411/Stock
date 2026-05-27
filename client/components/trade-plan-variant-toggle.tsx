'use client';

import type { TradePlanVariantId } from '@/lib/market';

type TradePlanVariantToggleProps = {
  value: TradePlanVariantId;
  onChange: (value: TradePlanVariantId) => void;
  className?: string;
};

const VARIANT_OPTIONS: Array<{ id: TradePlanVariantId; label: string; description: string }> = [
  { id: 'conservative', label: '保守版', description: '等突破確認' },
  { id: 'aggressive', label: '積極版', description: '允許較早試單' }
];

export default function TradePlanVariantToggle({ value, onChange, className = '' }: TradePlanVariantToggleProps) {
  return (
    <div className={`inline-flex flex-wrap gap-2 ${className}`.trim()}>
      {VARIANT_OPTIONS.map((option) => {
        const active = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${active ? 'solid-ink' : 'bg-foam text-ink/82 hover:bg-white'}`}
          >
            {option.label}
            <span className={`ml-2 text-xs ${active ? 'text-current opacity-70' : 'text-ink/62'}`}>{option.description}</span>
          </button>
        );
      })}
    </div>
  );
}