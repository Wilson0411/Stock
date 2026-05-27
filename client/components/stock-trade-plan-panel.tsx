'use client';

import { useState } from 'react';

import MetricDisclosure from '@/components/metric-disclosure';
import TradePlanVariantToggle from '@/components/trade-plan-variant-toggle';
import type { TradePlan, TradePlanVariantId } from '@/lib/market';

function PriceHint({ label, value, reasons }: { label: string; value: number | null; reasons: string[] }) {
  if (value === null) {
    return (
      <div className="content-wrap rounded-[22px] bg-foam px-4 py-4 text-sm text-ink/60">
        <p>{label}</p>
        <p className="mt-2">暫不提供</p>
      </div>
    );
  }

  return (
    <details className="hint-card content-wrap rounded-[22px] border border-ink/8 bg-white/82 px-4 py-4 text-sm text-ink/60 shadow-sm">
      <summary className="hint-summary flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <p>{label}</p>
          <p className="numeric mt-2 text-2xl font-semibold text-ink">{value.toFixed(2)}</p>
        </div>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/70">點開看理由</span>
      </summary>
      <div className="mt-3 space-y-2 border-t border-ink/8 pt-3 text-xs leading-6 text-ink/72">
        {reasons.map((reason) => (
          <p key={`${label}-${reason}`} className="soft-chip content-wrap rounded-2xl px-3 py-2">
            {reason}
          </p>
        ))}
        <p>
          <span className="font-medium text-ink">資料來源: </span>
          TWSE 當日行情、Yahoo 歷史價格與 buildTradePlan 交易計畫模型。
        </p>
        <p>
          <span className="font-medium text-ink">計算方式: </span>
          依目前所選版本，綜合支撐/壓力、事件階段、價量結構與市況，推導對應進場、停利與停損價位。
        </p>
      </div>
    </details>
  );
}

type StockTradePlanPanelProps = {
  tradePlan: TradePlan;
};

export default function StockTradePlanPanel({ tradePlan }: StockTradePlanPanelProps) {
  const [selectedVariant, setSelectedVariant] = useState<TradePlanVariantId>(tradePlan.defaultVariant);
  const activePlan = tradePlan.variants[selectedVariant];

  return (
    <section className="glass-card rounded-[30px] p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-ink">交易計畫</h2>
          <p className="mt-1 text-sm text-ink/60">切換保守版或積極版後，各價位卡都可以展開看為何抓在這裡。</p>
        </div>
        <TradePlanVariantToggle value={selectedVariant} onChange={setSelectedVariant} />
      </div>

      <div className="mt-4 rounded-[22px] border border-ink/8 bg-white/85 px-4 py-4 text-sm text-ink/72 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${activePlan.stance === '可進場' ? 'badge-positive' : activePlan.stance === '等待突破' ? 'badge-warning' : activePlan.stance === '避免進場' ? 'badge-danger' : 'badge-neutral'}`}>
            {activePlan.label} {activePlan.stance}
          </span>
          <span className="rounded-full bg-foam px-3 py-1 text-xs text-ink/60">{activePlan.description}</span>
        </div>
        <p className="mt-3 leading-7">{activePlan.preferredSide !== '觀望' ? `${activePlan.preferredSide}主劇本: ` : ''}{activePlan.summary}</p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <PriceHint label={activePlan.primarySetup?.entryLabel ?? '建議進場'} value={activePlan.entry?.price ?? null} reasons={activePlan.entry?.reasons ?? []} />
        <PriceHint label={activePlan.primarySetup?.exitLabel ?? '建議停利'} value={activePlan.takeProfit?.price ?? null} reasons={activePlan.takeProfit?.reasons ?? []} />
        <PriceHint label={activePlan.primarySetup?.stopLabel ?? '建議停損'} value={activePlan.stopLoss?.price ?? null} reasons={activePlan.stopLoss?.reasons ?? []} />
      </div>

      <MetricDisclosure
        className="content-wrap mt-4 rounded-[22px] bg-[linear-gradient(135deg,#0b1720,#12354a)] px-4 py-4 text-sm text-white/82 shadow-lg"
        source="交易計畫模型中的 entry / target / stop 價位。"
        calculation="做多用 (停利 - 進場) / (進場 - 停損)；做空用 (進場 - 回補) / (停損 - 進場)，依所選版本的價位配置重新計算。"
        summary={<p>{activePlan.riskRewardRatio !== null ? `${activePlan.primarySetup?.side ?? '主劇本'}估算風險報酬比 ${activePlan.riskRewardRatio}。` : '目前暫無可用的風險報酬比。'}</p>}
      />

      {activePlan.alternateSetup ? (
        <div className="content-wrap mt-4 rounded-[22px] border border-ink/8 bg-white/88 px-4 py-4 text-sm leading-7 text-ink/72 shadow-sm">
          <p className="font-medium text-ink">備用{activePlan.alternateSetup.side}劇本</p>
          <p className="mt-2">{activePlan.alternateSetup.summary}</p>
          <p className="mt-2">
            {activePlan.alternateSetup.entry ? `${activePlan.alternateSetup.entryLabel} ${activePlan.alternateSetup.entry.price.toFixed(2)}，` : ''}
            {activePlan.alternateSetup.exit ? `${activePlan.alternateSetup.exitLabel} ${activePlan.alternateSetup.exit.price.toFixed(2)}，` : ''}
            {activePlan.alternateSetup.stopLoss ? `${activePlan.alternateSetup.stopLabel} ${activePlan.alternateSetup.stopLoss.price.toFixed(2)}。` : ''}
          </p>
        </div>
      ) : null}
    </section>
  );
}