'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useEffect, useState } from 'react';

import MetricDisclosure from '@/components/metric-disclosure';
import type { MarketSnapshot, PriceHistoryPoint, StockRiskItem, TradeLevel } from '@/lib/market';

const WATCHLIST_STORAGE_KEY = 'stock-risk-watchlist';
type RuleCategory = StockRiskItem['ruleSignals'][number]['category'];
type MetricHelpCopy = {
  source: string;
  calculation: string;
  note?: string;
};

function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value.toFixed(2)}`;
  }

  return value.toFixed(2);
}

function formatPercentage(value: number | null): string {
  if (value === null) {
    return '暫無';
  }

  return `${value.toFixed(1)}%`;
}

function formatLargeNumber(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(2)} 億`;
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(1)} 萬`;
  }

  return value.toLocaleString('zh-TW');
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Taipei'
  }).format(new Date(value));
}

function stockDetailRoute(code: string): Route {
  return `/stocks/${code}` as Route;
}

function ruleSignalScore(item: StockRiskItem): number {
  return item.ruleSignals.reduce((score, signal) => {
    const severityWeight = signal.severity === '高' ? 3 : signal.severity === '中' ? 2 : 1;
    return score + severityWeight;
  }, 0);
}

function homeMetricHelp(key: string): MetricHelpCopy {
  switch (key) {
    case 'overview.totalUniverse':
      return {
        source: 'TWSE STOCK_DAY_ALL，並且目前只保留上市股票。',
        calculation: '把納入模型評分的上市股票筆數直接計數，也就是 scored.length。',
        note: '這不是加權指數成分股數，而是目前這個雷達頁面實際掃描的上市股票總數。'
      };
    case 'overview.fastTrackCount':
      return {
        source: 'TWSE 行情、官方公告與規則訊號，再經事件階段判定。',
        calculation: '把 searchPool 中 eventPlan.phase 等於「快進處置」的股票數量直接計數。'
      };
    case 'overview.disposedCount':
      return {
        source: 'TWSE 行情、官方公告與規則訊號，再經事件階段判定。',
        calculation: '把 searchPool 中 eventPlan.phase 等於「已進處置」的股票數量直接計數。'
      };
    case 'overview.officialHitCount':
      return {
        source: 'TWSE notice、notetrans、punish 等官方公告端點。',
        calculation: '在首頁前段候選池中，統計 officialStatus 不等於「模型觀察」的股票數量。'
      };
    case 'overview.medianDispositionProbability':
      return {
        source: 'TWSE 行情、官方公告、重大訊息、融資融券、除權息與當沖限制等資料。',
        calculation: '把全部股票的進處置機率排序後取中位數，代表整體市場的風險中間值。'
      };
    case 'quote.close':
      return {
        source: 'TWSE STOCK_DAY_ALL 的收盤價欄位。',
        calculation: '直接使用交易所當日收盤價，不另外推估。'
      };
    case 'quote.changePct':
      return {
        source: 'TWSE STOCK_DAY_ALL 的收盤價與漲跌價差。',
        calculation: '先用 previousClose = close - change 還原前一日收盤，再用 (change / previousClose) * 100 算出漲跌幅。'
      };
    case 'quote.tradeValue':
      return {
        source: 'TWSE STOCK_DAY_ALL 的 TradeValue。',
        calculation: '直接顯示當日成交金額，畫面上只做億 / 萬的單位縮寫。'
      };
    case 'quote.volume':
      return {
        source: 'TWSE STOCK_DAY_ALL 的 TradeVolume。',
        calculation: '直接顯示當日成交量，畫面上只做億 / 萬的單位縮寫。'
      };
    case 'quote.trend7dPct':
      return {
        source: 'Yahoo Finance 日線資料。',
        calculation: '取最近 7 個交易日收盤價，用 (最後一天收盤 - 第一天收盤) / 第一天收盤 * 100 算出 7 日變動。'
      };
    case 'quote.probabilities':
      return {
        source: 'TWSE 行情、官方公告與規則訊號，經 scoreQuote 啟發式模型整合。',
        calculation: '先算 riseSignal 與 fallSignal，再正規化成上漲機率；下跌機率則用 100 減去上漲機率。',
        note: '這是模型分數，不是未來報酬率保證。'
      };
    case 'quote.dispositionProbability':
      return {
        source: 'TWSE 行情、官方公告、重大訊息、融資融券、除權息與當沖限制。',
        calculation: '用波動、成交熱度、接近漲跌停、收盤位置、成交筆數與官方公告加權後，轉成 0 至 100 的進處置機率。',
        note: '若官方已列入注意或處置，模型會強制把分數抬到較高區間。'
      };
    case 'quote.officialAnnouncementCount':
      return {
        source: 'TWSE notice、notetrans、punish 等官方公告端點。',
        calculation: '把該股票最近命中的官方公告筆數彙整後直接顯示。'
      };
    case 'trade.riskRewardRatio':
      return {
        source: '交易計畫模型中的進場、停利、停損價位。',
        calculation: '做多用 (停利 - 進場) / (進場 - 停損)；做空用 (進場 - 回補) / (停損 - 進場)，衡量每承擔 1 單位風險可交換的報酬。'
      };
    case 'market.advancersDecliners':
      return {
        source: '全部納入市場脈動統計的上市股票當日漲跌幅。',
        calculation: '漲跌幅大於 0 算上漲家數，小於 0 算下跌家數，其餘為平盤。'
      };
    default:
      return {
        source: 'TWSE 公開資料與模型整理結果。',
        calculation: '依照頁面對應欄位直接顯示或以既有模型公式換算。'
      };
  }
}

function StatCard({ label, value, helper, help }: { label: string; value: string; helper: string; help: MetricHelpCopy }) {
  return (
    <MetricDisclosure
      className="glass-card overflow-hidden rounded-[28px] p-5"
      source={help.source}
      calculation={help.calculation}
      note={help.note}
      summary={
        <>
          <div className="mb-4 h-1.5 w-16 rounded-full bg-[linear-gradient(90deg,#12354a,#e07a2d)]" />
          <div className="flex items-center gap-2">
            <p className="text-sm uppercase tracking-[0.28em] text-tide/60">{label}</p>
            <span className="metric-help-button rounded-full px-2 py-0.5 text-[11px] font-medium">說明</span>
          </div>
          <p className="numeric mt-3 text-3xl font-semibold text-ink">{value}</p>
          <p className="mt-2 text-sm text-ink/65">{helper}</p>
        </>
      }
    />
  );
}

function freshnessTone(value: MarketSnapshot['dataFreshness'][number]['freshness']): string {
  if (value === '近即時') {
    return 'badge-live';
  }

  if (value === '公告批次') {
    return 'badge-batch';
  }

  return 'badge-neutral';
}

function ProbabilityBar({ rise, fall }: { rise: number; fall: number }) {
  return (
    <MetricDisclosure
      className="rounded-[20px] px-3 py-2"
      source={homeMetricHelp('quote.probabilities').source}
      calculation={homeMetricHelp('quote.probabilities').calculation}
      note={homeMetricHelp('quote.probabilities').note}
      summary={
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-ink/65">
            <span>上漲 {rise}%</span>
            <span>下跌 {fall}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink/10">
            <div className="flex h-full">
              <div className="bg-mint" style={{ width: `${rise}%` }} />
              <div className="bg-rose" style={{ width: `${fall}%` }} />
            </div>
          </div>
        </div>
      }
    />
  );
}

function Sparkline({ points }: { points: PriceHistoryPoint[] }) {
  if (points.length < 2) {
    return <div className="h-14 rounded-2xl bg-foam" />;
  }

  const values = points.map((point) => point.close);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(max - min, 0.01);
  const coordinates = points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 100 - ((point.close - min) / span) * 100;
      return `${x},${y}`;
    })
    .join(' ');
  const rising = values[values.length - 1] >= values[0];

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-14 w-full overflow-visible rounded-2xl bg-foam p-2">
      <polyline
        fill="none"
        stroke={rising ? '#0f9f7c' : '#d04c3f'}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={coordinates}
      />
    </svg>
  );
}

function statusBadge(status: StockRiskItem['officialStatus']): string {
  if (status === '處置') {
    return 'badge-danger';
  }

  if (status === '注意') {
    return 'badge-warning';
  }

  return 'badge-neutral';
}

function stanceBadge(stance: StockRiskItem['tradePlan']['stance']): string {
  if (stance === '可進場') {
    return 'badge-positive';
  }

  if (stance === '等待突破') {
    return 'badge-warning';
  }

  if (stance === '避免進場') {
    return 'badge-danger';
  }

  return 'badge-neutral';
}

function eventPhaseBadge(phase: StockRiskItem['eventPlan']['phase']): string {
  if (phase === '快進處置') {
    return 'badge-warning';
  }

  if (phase === '已進處置') {
    return 'badge-danger';
  }

  return 'badge-neutral';
}

function eventBiasBadge(bias: StockRiskItem['eventPlan']['bias']): string {
  if (bias === '偏空事件段') {
    return 'badge-danger';
  }

  if (bias === '偏多事件段') {
    return 'badge-positive';
  }

  return 'badge-neutral';
}

function PriceHint({ label, level }: { label: string; level: TradeLevel | null }) {
  if (!level) {
    return (
      <div className="rounded-2xl bg-foam px-3 py-3 text-sm text-ink/50">
        <p>{label}</p>
        <p className="mt-1">暫不提供</p>
      </div>
    );
  }

  return (
    <details className="hint-card rounded-2xl bg-foam px-3 py-3 text-sm text-ink/70">
      <summary className="hint-summary flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <p>{label}</p>
          <p className="numeric mt-1 text-lg font-semibold text-ink">{level.price.toFixed(2)}</p>
        </div>
        <span className="rounded-full bg-white/70 px-3 py-1 text-[11px] font-medium text-ink/70">點開看理由</span>
      </summary>
      <div className="mt-3 space-y-2 border-t border-ink/8 pt-3 text-xs leading-6 text-ink/72">
        {level.reasons.map((reason) => (
          <p key={`${label}-${reason}`} className="soft-chip rounded-2xl px-3 py-2">
            {reason}
          </p>
        ))}
        <p>
          <span className="font-medium text-ink">資料來源: </span>
          Yahoo Finance 日線歷史、TWSE 當日行情與模型交易計畫。
        </p>
        <p>
          <span className="font-medium text-ink">計算方式: </span>
          價位來自 buildTradePlan，會根據近期支撐/壓力、事件階段與主劇本方向推導建議進場、停利或停損位置。
        </p>
      </div>
    </details>
  );
}

function CandidateCard({
  item,
  starred,
  onToggleStar
}: {
  item: StockRiskItem;
  starred: boolean;
  onToggleStar: (code: string) => void;
}) {
  const changeClass = item.change >= 0 ? 'text-rose' : 'text-emerald-700';

  return (
    <div className="glass-card grid gap-5 rounded-[28px] p-5 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(11,23,32,0.12)] lg:grid-cols-[1.2fr_0.65fr_0.9fr]">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="break-words text-lg font-semibold text-ink">{item.name}</h3>
              <span className="solid-tide rounded-full px-2 py-1 text-xs font-medium">{item.board}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${statusBadge(item.officialStatus)}`}>{item.officialStatus}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${eventPhaseBadge(item.eventPlan.phase)}`}>{item.eventPlan.phase}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${eventBiasBadge(item.eventPlan.bias)}`}>{item.eventPlan.bias}</span>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${stanceBadge(item.tradePlan.stance)}`}>{item.tradePlan.stance}</span>
              <span className="numeric text-sm text-ink/55">{item.code}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-ink/65">
              <span className="rounded-full bg-foam px-3 py-1">{item.industry}</span>
              <span className="rounded-full bg-foam px-3 py-1">{item.momentumLabel}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggleStar(item.code)}
            className={`w-full rounded-full px-3 py-2 text-sm font-medium transition sm:w-auto ${
              starred ? 'solid-ink' : 'bg-foam text-ink/70'
            }`}
          >
            {starred ? '追蹤中' : '加入追蹤'}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <MetricDisclosure
            className="rounded-[22px] px-3 py-2"
            source={homeMetricHelp('quote.close').source}
            calculation={homeMetricHelp('quote.changePct').calculation}
            note="收盤價與當日漲跌幅都直接取自當日行情，再把漲跌價差換算成百分比顯示。"
            summary={
              <div>
                <p className="numeric text-2xl font-semibold text-ink">{item.close.toFixed(2)}</p>
                <p className={`numeric mt-1 text-sm font-medium ${changeClass}`}>
                  {formatSigned(item.change)} / {formatPercentage(item.changePct)}
                </p>
              </div>
            }
          />
          <div className="grid gap-2 text-xs text-ink/70 sm:grid-cols-3">
            <MetricDisclosure
              className="metric-tile rounded-2xl px-3 py-2"
              source={homeMetricHelp('quote.tradeValue').source}
              calculation={homeMetricHelp('quote.tradeValue').calculation}
              summary={<span>成交金額 {formatLargeNumber(item.tradeValue)}</span>}
            />
            <MetricDisclosure
              className="metric-tile rounded-2xl px-3 py-2"
              source={homeMetricHelp('quote.volume').source}
              calculation={homeMetricHelp('quote.volume').calculation}
              summary={<span>成交量 {formatLargeNumber(item.volume)}</span>}
            />
            <MetricDisclosure
              className="metric-tile rounded-2xl px-3 py-2"
              source={homeMetricHelp('quote.trend7dPct').source}
              calculation={homeMetricHelp('quote.trend7dPct').calculation}
              summary={<span>7 日 {formatPercentage(item.trend7dPct)}</span>}
            />
          </div>
        </div>

        <ProbabilityBar rise={item.riseProbability} fall={item.fallProbability} />

        <div className="grid gap-3 md:grid-cols-3">
          <PriceHint label={item.tradePlan.primarySetup?.entryLabel ?? '建議進場'} level={item.tradePlan.entry} />
          <PriceHint label={item.tradePlan.primarySetup?.exitLabel ?? '建議停利'} level={item.tradePlan.takeProfit} />
          <PriceHint label={item.tradePlan.primarySetup?.stopLabel ?? '建議停損'} level={item.tradePlan.stopLoss} />
        </div>

        <MetricDisclosure
          className="rounded-2xl bg-[linear-gradient(135deg,#0b1720,#12354a)] px-4 py-3 text-sm text-white/84 shadow-lg"
          source={homeMetricHelp('trade.riskRewardRatio').source}
          calculation={homeMetricHelp('trade.riskRewardRatio').calculation}
          summary={
            <p>
              {item.tradePlan.preferredSide !== '觀望' ? `${item.tradePlan.preferredSide}主劇本: ` : ''}
              {item.tradePlan.summary}
              {item.tradePlan.riskRewardRatio !== null ? ` 風險報酬比約 ${item.tradePlan.riskRewardRatio}。` : ''}
            </p>
          }
        />

        <div className="rounded-[24px] border border-ink/8 bg-white/82 px-4 py-4 text-sm text-ink/72 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${eventPhaseBadge(item.eventPlan.phase)}`}>{item.eventPlan.phase}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-medium ${eventBiasBadge(item.eventPlan.bias)}`}>{item.eventPlan.bias}</span>
          </div>
          <p className="mt-3 leading-7">{item.eventPlan.summary}</p>
        </div>

        <div className="grid gap-2 text-sm text-ink/70 md:grid-cols-2">
          {item.reasons.map((reason) => (
            <p key={`${item.code}-${reason}`} className="soft-chip rounded-2xl px-3 py-2">
              {reason}
            </p>
          ))}
        </div>

        {item.ruleSignals.length > 0 ? (
          <div className="grid gap-2 text-sm text-ink/70 md:grid-cols-2">
            {item.ruleSignals.slice(0, 2).map((signal) => (
              <p key={`${item.code}-${signal.category}-${signal.summary}`} className="rounded-2xl border border-ink/8 bg-white/88 px-3 py-2">
                {signal.category} {signal.direction} {signal.summary}
              </p>
            ))}
          </div>
        ) : null}

        <Link href={stockDetailRoute(item.code)} scroll={false} className="solid-ink inline-flex w-full justify-center rounded-full px-4 py-2 text-sm font-medium transition sm:w-auto">
          查看個股詳情
        </Link>
      </div>

      <div className="flex flex-col justify-between gap-4 rounded-[24px] bg-[linear-gradient(180deg,#08131b,#12354a)] px-5 py-5 text-white shadow-lg">
        <MetricDisclosure
          className="rounded-[20px] px-2 py-1"
          source={homeMetricHelp('quote.dispositionProbability').source}
          calculation={homeMetricHelp('quote.dispositionProbability').calculation}
          note={homeMetricHelp('quote.dispositionProbability').note}
          summary={
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">進處置機率</p>
              <p className="numeric mt-3 text-4xl font-semibold">{item.dispositionProbability}%</p>
            </div>
          }
        />
        <div className="grid grid-cols-2 gap-3 text-sm text-white/75">
          <MetricDisclosure
            className="rounded-[18px] px-2 py-1"
            source={homeMetricHelp('quote.officialAnnouncementCount').source}
            calculation={homeMetricHelp('quote.officialAnnouncementCount').calculation}
            summary={
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-white/55">官方公告</p>
                <p className="mt-1">{item.officialAnnouncementCount || 0} 筆</p>
              </div>
            }
          />
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-white/55">產業</p>
            <p className="mt-1">{item.industry}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 rounded-[24px] border border-ink/8 bg-white/55 p-4">
        <Sparkline points={item.priceHistory} />
        <p className="text-xs text-ink/55">近 7 個交易日走勢，用來輔助判斷加速或鈍化。</p>
        {item.officialReference ? <p className="rounded-2xl bg-amber-50 px-3 py-2 text-sm text-amber-900">{item.officialReference}</p> : null}
      </div>
    </div>
  );
}

function CompactList({
  title,
  subtitle,
  items,
  tone
}: {
  title: string;
  subtitle: string;
  items: StockRiskItem[];
  tone: 'bull' | 'bear';
}) {
  const accent = tone === 'bull' ? 'badge-positive' : 'badge-danger';

  return (
    <section className="glass-card rounded-[30px] p-6">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <div className="section-title">
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-ink/60">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-3">
        {items.map((item) => (
          <Link key={`${title}-${item.code}`} href={stockDetailRoute(item.code)} scroll={false} className="block rounded-[22px] border border-ink/8 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white hover:shadow-lg">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-ink">{item.name}</p>
                  <span className="numeric text-sm text-ink/50">{item.code}</span>
                </div>
                <p className="mt-1 text-sm text-ink/60">{item.industry} / {item.momentumLabel}</p>
              </div>
              <MetricDisclosure
                className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${accent}`}
                source={homeMetricHelp('quote.probabilities').source}
                calculation={homeMetricHelp('quote.probabilities').calculation}
                note={homeMetricHelp('quote.probabilities').note}
                summary={<span>{tone === 'bull' ? `上漲 ${item.riseProbability}%` : `下跌 ${item.fallProbability}%`}</span>}
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function MarketDefinitionCard({
  label,
  value,
  description,
  detail
}: {
  label: string;
  value: string;
  description: string;
  detail: string;
}) {
  return (
    <details className="metric-help-card metric-tile rounded-[22px] px-4 py-4">
      <summary className="hint-summary flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-ink/60">{label}</p>
            <span className="metric-help-button rounded-full px-2 py-0.5 text-[11px] font-medium">說明</span>
          </div>
          <p className="numeric mt-2 text-2xl font-semibold text-ink">{value}</p>
        </div>
      </summary>
      <div className="mt-3 space-y-2 border-t border-ink/8 pt-3 text-sm leading-7 text-ink/72">
        <p>{description}</p>
        <p className="soft-chip rounded-2xl px-3 py-2">{detail}</p>
      </div>
    </details>
  );
}

export default function DashboardClient({ snapshot }: { snapshot: MarketSnapshot }) {
  const [query, setQuery] = useState('');
  const [industryFilter, setIndustryFilter] = useState('全部');
  const [statusFilter, setStatusFilter] = useState<'全部' | '官方處置' | '官方注意' | '模型觀察'>('全部');
  const [eventFilter, setEventFilter] = useState<'事件交易模式' | '快進處置' | '已進處置' | '全部'>('事件交易模式');
  const [ruleFilter, setRuleFilter] = useState<'全部' | '只看制度規則' | RuleCategory>('全部');
  const [sortBy, setSortBy] = useState<'風險' | '7日走勢' | '成交熱度' | '上漲機率' | '規則命中'>('風險');
  const [starredCodes, setStarredCodes] = useState<string[]>([]);
  const availableRuleCategories = [...new Set(snapshot.searchPool.flatMap((item) => item.ruleSignals.map((signal) => signal.category)))].sort((left, right) => left.localeCompare(right, 'zh-Hant'));

  useEffect(() => {
    const storedValue = window.localStorage.getItem(WATCHLIST_STORAGE_KEY);

    if (!storedValue) {
      return;
    }

    try {
      const parsedValue = JSON.parse(storedValue) as string[];
      setStarredCodes(parsedValue);
    } catch {
      window.localStorage.removeItem(WATCHLIST_STORAGE_KEY);
    }
  }, []);

  function toggleStar(code: string) {
    setStarredCodes((current) => {
      const next = current.includes(code) ? current.filter((item) => item !== code) : [...current, code];
      window.localStorage.setItem(WATCHLIST_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  const filteredPool = [...snapshot.searchPool]
    .filter((item) => {
      if (industryFilter !== '全部' && item.industry !== industryFilter) {
        return false;
      }

      if (statusFilter === '官方處置' && item.officialStatus !== '處置') {
        return false;
      }

      if (statusFilter === '官方注意' && item.officialStatus !== '注意') {
        return false;
      }

      if (statusFilter === '模型觀察' && item.officialStatus !== '模型觀察') {
        return false;
      }

      if (eventFilter === '事件交易模式' && item.eventPlan.phase === '事件觀察') {
        return false;
      }

      if (eventFilter === '快進處置' && item.eventPlan.phase !== '快進處置') {
        return false;
      }

      if (eventFilter === '已進處置' && item.eventPlan.phase !== '已進處置') {
        return false;
      }

      if (ruleFilter === '只看制度規則' && item.ruleSignals.length === 0) {
        return false;
      }

      if (ruleFilter !== '全部' && ruleFilter !== '只看制度規則' && !item.ruleSignals.some((signal) => signal.category === ruleFilter)) {
        return false;
      }

      if (!query.trim()) {
        return true;
      }

      const keyword = query.trim().toLowerCase();
      return item.code.includes(keyword) || item.name.toLowerCase().includes(keyword) || item.industry.toLowerCase().includes(keyword);
    })
    .sort((left, right) => {
      if (sortBy === '7日走勢') {
        return (right.trend7dPct ?? -999) - (left.trend7dPct ?? -999);
      }

      if (sortBy === '成交熱度') {
        return right.tradeValue - left.tradeValue;
      }

      if (sortBy === '上漲機率') {
        return right.riseProbability - left.riseProbability;
      }

      if (sortBy === '規則命中') {
        return ruleSignalScore(right) - ruleSignalScore(left) || right.ruleSignals.length - left.ruleSignals.length || right.dispositionProbability - left.dispositionProbability;
      }

      return right.dispositionProbability - left.dispositionProbability;
    });

  const fastTrackPool = [...snapshot.searchPool]
    .filter((item) => item.eventPlan.phase === '快進處置')
    .sort((left, right) => right.fallProbability - left.fallProbability || right.dispositionProbability - left.dispositionProbability);

  const disposedPool = [...snapshot.searchPool]
    .filter((item) => item.eventPlan.phase === '已進處置')
    .sort((left, right) => right.riseProbability - left.riseProbability || left.changePct - right.changePct);

  const fastTrackItems = fastTrackPool.slice(0, 6);
  const disposedItems = disposedPool.slice(0, 6);

  const eventModeCount = snapshot.searchPool.filter((item) => item.eventPlan.phase !== '事件觀察').length;

  const trackedItems = starredCodes
    .map((code) => snapshot.searchPool.find((item) => item.code === code) ?? snapshot.watchlist.find((item) => item.code === code))
    .filter((item): item is StockRiskItem => Boolean(item));
  const activeFilterCount = [
    industryFilter !== '全部',
    statusFilter !== '全部',
    eventFilter !== '事件交易模式',
    ruleFilter !== '全部',
    sortBy !== '風險',
    query.trim().length > 0
  ].filter(Boolean).length;

  const renderFilterControls = () => (
    <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.9fr_0.9fr_0.8fr]">
      <label className="space-y-2 text-sm text-ink/65">
        <span>搜尋候選股</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="輸入代碼、名稱或產業"
          className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none transition focus:border-tide focus:ring-4 focus:ring-tide/10"
        />
      </label>
      <label className="space-y-2 text-sm text-ink/65">
        <span>產業</span>
        <select
          value={industryFilter}
          onChange={(event) => setIndustryFilter(event.target.value)}
          className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none"
        >
          <option value="全部">全部</option>
          {snapshot.industries.map((industry) => (
            <option key={industry} value={industry}>
              {industry}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm text-ink/65">
        <span>官方狀態</span>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as '全部' | '官方處置' | '官方注意' | '模型觀察')}
          className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none"
        >
          <option value="全部">全部</option>
          <option value="官方處置">官方處置</option>
          <option value="官方注意">官方注意</option>
          <option value="模型觀察">模型觀察</option>
        </select>
      </label>
      <label className="space-y-2 text-sm text-ink/65">
        <span>事件模式</span>
        <select
          value={eventFilter}
          onChange={(event) => setEventFilter(event.target.value as '事件交易模式' | '快進處置' | '已進處置' | '全部')}
          className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none"
        >
          <option value="事件交易模式">事件交易模式</option>
          <option value="快進處置">快進處置</option>
          <option value="已進處置">已進處置</option>
          <option value="全部">全部</option>
        </select>
      </label>
      <label className="space-y-2 text-sm text-ink/65">
        <span>制度規則</span>
        <select
          value={ruleFilter}
          onChange={(event) => setRuleFilter(event.target.value as '全部' | '只看制度規則' | RuleCategory)}
          className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none"
        >
          <option value="全部">全部</option>
          <option value="只看制度規則">只看制度規則</option>
          {availableRuleCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>
      <label className="space-y-2 text-sm text-ink/65">
        <span>排序</span>
        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as '風險' | '7日走勢' | '成交熱度' | '上漲機率' | '規則命中')}
          className="w-full rounded-2xl border border-ink/10 bg-white/92 px-4 py-3 text-base text-ink outline-none"
        >
          <option value="風險">進處置機率</option>
          <option value="7日走勢">7 日走勢</option>
          <option value="成交熱度">成交熱度</option>
          <option value="上漲機率">上漲機率</option>
          <option value="規則命中">規則命中</option>
        </select>
      </label>
    </div>
  );

  return (
    <main className="bg-grid min-h-screen overflow-x-clip">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10">
        <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[linear-gradient(135deg,rgba(8,19,27,0.98),rgba(18,53,74,0.94),rgba(224,122,45,0.84))] px-6 py-8 text-white shadow-[0_30px_80px_rgba(11,23,32,0.18)] md:px-10 md:py-10">
          <div className="absolute -right-10 top-6 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-28 w-56 bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)]" />
          <div className="grid gap-8 lg:grid-cols-[1.35fr_0.9fr] lg:items-end">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-white/65">Taiwan Listed Stock Radar</p>
              <h1 className="mt-4 max-w-3xl text-3xl font-semibold leading-tight md:text-6xl">
                首頁聚焦快進處置與已進處置。
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/78 md:text-lg">
                第一段優先看快進處置的偏空劇本，第二段再看已進處置後的止跌反彈名單；每檔股票都能再展開到個股頁看事件時間軸。
              </p>
              <div className="mt-6 flex flex-wrap gap-2 text-sm text-white/78">
                {snapshot.marketPulse.hotIndustries.slice(0, 3).map((industry) => (
                  <span key={industry} className="rounded-full border border-white/15 bg-white/10 px-3 py-2 backdrop-blur">
                    熱門產業 {industry}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-white/15 bg-white/10 p-5 backdrop-blur">
              <p className="text-sm uppercase tracking-[0.25em] text-white/65">資料時間</p>
              <p className="numeric mt-3 text-3xl font-semibold">{formatUpdatedAt(snapshot.updatedAt)}</p>
              <p className="mt-3 text-sm text-white/75">資料與公司基本資料皆來自 TWSE 公開端點，歷史走勢由 server-side 補齊。</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-white/85">
                {snapshot.dataFreshness.slice(0, 3).map((entry) => (
                  <span key={entry.category} className={`rounded-full px-3 py-2 font-medium ${freshnessTone(entry.freshness)}`}>
                    {entry.category} {entry.freshness}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">事件命中</p>
                  <p className="numeric mt-2 text-2xl font-semibold">{eventModeCount}</p>
                </div>
                <div className="rounded-2xl bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">市場風向</p>
                  <p className="mt-2 text-lg font-medium">{snapshot.marketPulse.stance}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard label="上市股票" value={`${snapshot.overview.totalUniverse}`} helper="不再顯示上櫃股票" help={homeMetricHelp('overview.totalUniverse')} />
          <StatCard label="快進處置" value={`${snapshot.overview.fastTrackCount}`} helper="注意股或逼近處置段的偏空事件名單" help={homeMetricHelp('overview.fastTrackCount')} />
          <StatCard label="已進處置" value={`${snapshot.overview.disposedCount}`} helper="優先等止跌再看反彈的名單" help={homeMetricHelp('overview.disposedCount')} />
          <StatCard label="官方命中" value={`${snapshot.overview.officialHitCount}`} helper="前段候選池中已落在官方公告的股票數量" help={homeMetricHelp('overview.officialHitCount')} />
          <StatCard
            label="中位風險"
            value={`${snapshot.overview.medianDispositionProbability}%`}
            helper={`官方注意 ${snapshot.overview.officialNoticeCount} 檔 / 處置 ${snapshot.overview.officialDispositionCount} 檔`}
            help={homeMetricHelp('overview.medianDispositionProbability')}
          />
        </section>

        <section className="glass-card mt-8 rounded-[30px] p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-ink">資料新鮮度</h2>
              <p className="muted-copy mt-1 text-sm">這個頁面每次請求都會重抓，但不同來源的更新頻率不同。</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {snapshot.dataFreshness.map((entry) => (
              <div key={entry.category} className="panel-card min-w-0 rounded-[24px] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold text-ink">{entry.category}</h3>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${freshnessTone(entry.freshness)}`}>{entry.freshness}</span>
                </div>
                <p className="mt-3 text-sm text-ink/65 [overflow-wrap:anywhere]">來源: {entry.source}</p>
                <p className="mt-2 text-sm leading-7 text-ink/72 [overflow-wrap:anywhere]">{entry.note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card mt-8 rounded-[30px] p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-semibold text-ink">市況面板</h2>
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${snapshot.marketPulse.stance === '偏多順風' ? 'badge-positive' : snapshot.marketPulse.stance === '偏空保守' ? 'badge-danger' : 'badge-neutral'}`}>{snapshot.marketPulse.stance}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-ink/72">{snapshot.marketPulse.summary}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <MetricDisclosure
                  className="metric-tile rounded-[22px] px-4 py-4"
                  source={homeMetricHelp('market.advancersDecliners').source}
                  calculation={homeMetricHelp('market.advancersDecliners').calculation}
                  summary={
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm text-ink/60">上漲 / 下跌</p>
                        <span className="metric-help-button rounded-full px-2 py-0.5 text-[11px] font-medium">說明</span>
                      </div>
                      <p className="numeric mt-2 text-2xl font-semibold text-ink">{snapshot.marketPulse.advancers} / {snapshot.marketPulse.decliners}</p>
                    </div>
                  }
                />
                <MarketDefinitionCard
                  label="平均日變動"
                  value={`${snapshot.marketPulse.averageChangePct}%`}
                  description="把整個股票池每一檔的當日漲跌幅做平均，用來看今天整體平均是偏漲還是偏跌。"
                  detail="如果少數權值股很強、但大多數股票普通，這個數字可能仍偏高，所以要和市場寬度一起看。"
                />
                <MarketDefinitionCard
                  label="市場寬度"
                  value={`${snapshot.marketPulse.breadthPct}%`}
                  description="用上漲家數減下跌家數，再除以全部股票數量，反映今天是多數股票一起漲，還是只有少數股票在撐盤。"
                  detail="數值越高代表盤面越廣泛偏多；如果是負值，代表下跌家數多於上漲家數。"
                />
              </div>
            </div>
            <div className="space-y-3">
              {snapshot.marketPulse.notes.map((note) => (
                <p key={note} className="soft-chip rounded-2xl px-4 py-3 text-sm text-ink/70">
                  {note}
                </p>
              ))}
              <p className="soft-chip rounded-2xl px-4 py-3 text-sm text-ink/70">熱門產業: {snapshot.marketPulse.hotIndustries.join('、') || '暫無明顯集中'}</p>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <section className="glass-card rounded-[30px] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="section-title">
                  <h2 className="text-2xl font-semibold text-ink">快進處置名單</h2>
                </div>
                <p className="mt-1 text-sm text-ink/60">這一段先看偏空劇本，不做多方搶進。</p>
              </div>
              <MetricDisclosure
                className="badge-warning inline-block rounded-full px-3 py-2 text-sm font-medium"
                source="事件時間軸模型輸出，根據官方狀態、近端歷史支撐壓力與多空機率判定。"
                calculation="快進處置表示仍在逼近處置前的偏空事件段，這裡先看失守支撐後的空方劇本。"
                summary={<span>偏空事件段</span>}
              />
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.eventBoards.fastTrack.length > 0 ? (
                snapshot.eventBoards.fastTrack.slice(0, 6).map((item) => (
                  <Link key={`fast-${item.code}`} href={stockDetailRoute(item.code)} scroll={false} className="block rounded-[22px] border border-ink/8 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white hover:shadow-lg">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink">{item.name}</p>
                          <span className="numeric text-sm text-ink/50">{item.code}</span>
                        </div>
                        <p className="mt-1 text-sm text-ink/60">{item.eventPlan.summary}</p>
                      </div>
                      <MetricDisclosure
                        className="badge-danger inline-block rounded-full px-3 py-1 text-sm font-medium"
                        source={homeMetricHelp('quote.probabilities').source}
                        calculation={homeMetricHelp('quote.probabilities').calculation}
                        note={homeMetricHelp('quote.probabilities').note}
                        summary={<span>下跌 {item.fallProbability}%</span>}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="metric-tile rounded-[22px] px-4 py-5 text-sm text-ink/65">目前沒有符合快進處置條件的股票。</div>
              )}
            </div>
          </section>

          <section className="glass-card rounded-[30px] p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <div className="section-title">
                  <h2 className="text-2xl font-semibold text-ink">已進處置名單</h2>
                </div>
                <p className="mt-1 text-sm text-ink/60">這一段不追空，改看止跌與反彈確認。</p>
              </div>
              <MetricDisclosure
                className="badge-positive inline-block rounded-full px-3 py-2 text-sm font-medium"
                source="事件時間軸模型輸出，根據官方狀態、近端歷史支撐壓力與多空機率判定。"
                calculation="已進處置後若急跌後進入止穩反彈觀察區，首頁會把它標成偏多事件段。"
                summary={<span>偏多事件段</span>}
              />
            </div>
            <div className="mt-5 space-y-3">
              {snapshot.eventBoards.disposed.length > 0 ? (
                snapshot.eventBoards.disposed.slice(0, 6).map((item) => (
                  <Link key={`disposed-${item.code}`} href={stockDetailRoute(item.code)} scroll={false} className="block rounded-[22px] border border-ink/8 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:border-tide/30 hover:bg-white hover:shadow-lg">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-ink">{item.name}</p>
                          <span className="numeric text-sm text-ink/50">{item.code}</span>
                        </div>
                        <p className="mt-1 text-sm text-ink/60">{item.eventPlan.summary}</p>
                      </div>
                      <MetricDisclosure
                        className="badge-positive inline-block rounded-full px-3 py-1 text-sm font-medium"
                        source={homeMetricHelp('quote.probabilities').source}
                        calculation={homeMetricHelp('quote.probabilities').calculation}
                        note={homeMetricHelp('quote.probabilities').note}
                        summary={<span>上漲 {item.riseProbability}%</span>}
                      />
                    </div>
                  </Link>
                ))
              ) : (
                <div className="metric-tile rounded-[22px] px-4 py-5 text-sm text-ink/65">目前沒有已進處置但具反彈觀察價值的股票。</div>
              )}
            </div>
          </section>
        </section>

        <section className="glass-card sticky top-3 z-20 mt-8 rounded-[30px] p-4 md:p-6 lg:static">
          <div className="lg:hidden">
            <details className="panel-shell rounded-[24px] p-1">
              <summary className="hint-summary panel-shell-strong flex list-none items-center justify-between rounded-[20px] px-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">篩選與排序</p>
                  <p className="mt-1 text-xs text-ink/72">{filteredPool.length} 檔符合，已啟用 {activeFilterCount} 個條件</p>
                </div>
                <span className="solid-ink rounded-full px-3 py-1 text-xs font-medium">展開</span>
              </summary>
              <div className="mt-4">{renderFilterControls()}</div>
            </details>
          </div>
          <div className="hidden lg:block">
            {renderFilterControls()}
          </div>
        </section>

        <section className="mt-8 grid gap-8 xl:grid-cols-[1.55fr_0.95fr]">
          <div className="space-y-8">
            <section className="glass-card rounded-[30px] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="section-title">
                    <h2 className="text-2xl font-semibold text-ink">自選追蹤</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">把候選股加入追蹤後，下次開頁仍會保留在本機。</p>
                </div>
                <span className="soft-chip rounded-full px-3 py-2 text-sm text-ink/70">{trackedItems.length} 檔</span>
              </div>
              <div className="mt-5 space-y-4">
                {trackedItems.length > 0 ? (
                  trackedItems.map((item) => (
                    <CandidateCard key={`tracked-${item.code}`} item={item} starred onToggleStar={toggleStar} />
                  ))
                ) : (
                  <div className="metric-tile rounded-[24px] px-4 py-6 text-sm text-ink/65">從下方候選池加入追蹤後，這裡會固定顯示。</div>
                )}
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="section-title">
                    <h2 className="text-3xl font-semibold text-ink">候選池</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">預設只留在事件交易模式內的股票，再依產業與官方狀態交叉檢視。</p>
                </div>
                <span className="soft-chip rounded-full px-3 py-2 text-sm text-ink/70">{filteredPool.length} 檔符合</span>
              </div>
              <div className="mt-5 space-y-4">
                {filteredPool.slice(0, 18).map((item) => (
                  <CandidateCard key={item.code} item={item} starred={starredCodes.includes(item.code)} onToggleStar={toggleStar} />
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">官方注意與處置</h2>
              <p className="mt-1 text-sm text-ink/60">優先把已進官方名單的上市股票拉出來，協助校準模型輸出。</p>
              <div className="mt-5 space-y-3">
                {snapshot.officialSpotlight.length > 0 ? (
                  snapshot.officialSpotlight.map((item) => (
                    <Link key={`official-${item.code}`} href={stockDetailRoute(item.code)} scroll={false} className="block rounded-[22px] border border-ink/8 bg-white/90 p-4 transition hover:border-tide/30 hover:bg-white">
                      <div className="flex flex-col items-start gap-3 sm:flex-row sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-ink">{item.name}</p>
                            <span className="numeric text-sm text-ink/50">{item.code}</span>
                          </div>
                          <p className="mt-1 text-sm text-ink/60">{item.industry} / {item.officialReference ?? item.momentumLabel}</p>
                        </div>
                        <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusBadge(item.officialStatus)}`}>{item.officialStatus}</span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="metric-tile rounded-[22px] px-4 py-5 text-sm text-ink/65">目前前段候選池沒有命中官方名單。</div>
                )}
              </div>
            </section>

            <CompactList title="偏多清單" subtitle="收盤結構與動能較偏多的候選股" items={snapshot.bullishBoard} tone="bull" />
            <CompactList title="偏空清單" subtitle="收盤壓力與跌勢延續風險較高的股票" items={snapshot.bearishBoard} tone="bear" />

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">模型說明</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                {snapshot.notes.map((note) => (
                  <p key={note} className="soft-chip rounded-2xl px-4 py-3">
                    {note}
                  </p>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">規則覆蓋</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                {snapshot.ruleCoverage.map((rule) => (
                  <div key={`${rule.category}-${rule.status}`} className="rounded-[22px] border border-ink/8 bg-white/92 px-4 py-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-ink">{rule.category}</p>
                      <span className={`rounded-full px-2 py-1 text-xs font-medium ${rule.status === '已接入' ? 'badge-positive' : 'badge-warning'}`}>{rule.status}</span>
                    </div>
                    <p className="mt-2 text-sm text-ink/72">{rule.note}</p>
                    <p className="mt-1 text-xs text-ink/50">來源: {rule.source}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
