import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';

import BackToDashboardButton from '@/components/back-to-dashboard-button';
import MetricDisclosure from '@/components/metric-disclosure';
import StockTradePlanPanel from '@/components/stock-trade-plan-panel';
import { isAuthenticated } from '@/lib/auth';
import { getStockDetail } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'hnd1';

type MetricHelpCopy = {
  source: string;
  calculation: string;
  note?: string;
};

function stockMetricHelp(key: string): MetricHelpCopy {
  switch (key) {
    case 'quote.close':
      return {
        source: 'TWSE STOCK_DAY_ALL 的收盤價欄位。',
        calculation: '直接顯示當日收盤價，不另外推估。'
      };
    case 'quote.changePct':
      return {
        source: 'TWSE STOCK_DAY_ALL 的漲跌價差與收盤價。',
        calculation: '以 previousClose = close - change 還原前收，再用 (change / previousClose) * 100 算出單日漲跌幅。'
      };
    case 'quote.dispositionProbability':
      return {
        source: 'TWSE 行情、官方公告、重大訊息、融資融券、除權息與當沖限制。',
        calculation: '以波動、熱度、漲跌停壓力、成交筆數與公告訊號加權後，轉成 0 到 100 的進處置機率。',
        note: '官方已列入注意或處置時，模型會把分數抬高到對應區間。'
      };
    case 'quote.probabilities':
      return {
        source: 'TWSE 行情與官方/制度訊號，經 scoreQuote 模型整合。',
        calculation: '先計算 riseSignal 與 fallSignal，再正規化成上漲機率，下跌機率用 100 減去上漲機率。'
      };
    case 'quote.tradeValue':
      return {
        source: 'TWSE STOCK_DAY_ALL 的 TradeValue。',
        calculation: '直接顯示當日成交金額，畫面只做億 / 萬單位縮寫。'
      };
    case 'quote.volume':
      return {
        source: 'TWSE STOCK_DAY_ALL 的 TradeVolume。',
        calculation: '直接顯示當日成交量，畫面只做億 / 萬單位縮寫。'
      };
    case 'history.points':
      return {
        source: 'Yahoo Finance 日線歷史資料。',
        calculation: '個股頁先抓近 3 個月日線，再只顯示最後 30 筆交易日。'
      };
    case 'quote.trend7dPct':
      return {
        source: 'Yahoo Finance 日線資料。',
        calculation: '取最近 7 個交易日收盤價，用 (最後一天 - 第一天) / 第一天 * 100 算出近 7 日變動。'
      };
    case 'quote.transactionCount':
      return {
        source: 'TWSE STOCK_DAY_ALL 的 Transaction。',
        calculation: '直接顯示當日成交筆數，不做推估。'
      };
    case 'trade.priceLevel':
      return {
        source: 'TWSE 當日行情、Yahoo 歷史走勢與 buildTradePlan 交易計畫模型。',
        calculation: '依支撐/壓力、事件階段、主劇本方向與市況，推導建議進場、停利、停損價位。'
      };
    case 'trade.riskRewardRatio':
      return {
        source: '交易計畫模型中的 entry / target / stop 價位。',
        calculation: '做多用 (停利 - 進場) / (進場 - 停損)；做空用 (進場 - 回補) / (停損 - 進場)。'
      };
    case 'company.paidInCapital':
      return {
        source: 'TWSE t187ap03_L 公司基本資料。',
        calculation: '直接顯示實收資本額，畫面只做億 / 萬單位縮寫。'
      };
    case 'official.announcementCount':
      return {
        source: 'TWSE notice、notetrans、punish 等官方公告端點。',
        calculation: '把該股票最近命中的官方公告筆數彙整後直接顯示。'
      };
    case 'rules.marginUsage':
      return {
        source: 'TWSE MI_MARGN。',
        calculation: '直接顯示模型整理後的融資使用率與融券使用率百分比。'
      };
    case 'rules.materialInfoCount':
      return {
        source: 'TWSE t187ap04_L。',
        calculation: '統計近期重大訊息筆數，並顯示最新一筆主旨。'
      };
    default:
      return {
        source: 'TWSE、Yahoo Finance 與模型整理結果。',
        calculation: '依欄位對應資料直接顯示，或由既有模型公式換算。'
      };
  }
}

function freshnessTone(value: '近即時' | '公告批次' | '定期更新' | '月更' | '日線更新'): string {
  if (value === '近即時') {
    return 'badge-live';
  }

  if (value === '公告批次') {
    return 'badge-batch';
  }

  return 'badge-neutral';
}

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat('zh-TW', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Taipei'
  }).format(new Date(value));
}

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
          {stockMetricHelp('trade.priceLevel').source}
        </p>
        <p>
          <span className="font-medium text-ink">計算方式: </span>
          {stockMetricHelp('trade.priceLevel').calculation}
        </p>
      </div>
    </details>
  );
}

function formatSigned(value: number): string {
  if (value > 0) {
    return `+${value.toFixed(2)}`;
  }

  return value.toFixed(2);
}

function formatPercent(value: number | null): string {
  if (value === null) {
    return '暫無';
  }

  return `${value.toFixed(2)}%`;
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

function PriceTrend({ points }: { points: Array<{ date: string; close: number }> }) {
  if (points.length < 2) {
    return <div className="h-56 rounded-[28px] bg-foam" />;
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
    <div className="content-wrap rounded-[28px] border border-ink/8 bg-white/90 p-4">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-56 w-full overflow-visible rounded-[20px] bg-foam p-3">
        <polyline
          fill="none"
          stroke={rising ? '#0f9f7c' : '#d04c3f'}
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={coordinates}
        />
      </svg>
      <div className="mt-3 flex items-center justify-between text-xs text-ink/55">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}

function statusBadge(status: '處置' | '注意' | '模型觀察'): string {
  if (status === '處置') {
    return 'badge-danger';
  }

  if (status === '注意') {
    return 'badge-warning';
  }

  return 'badge-neutral';
}

function eventPhaseBadge(phase: '快進處置' | '已進處置' | '事件觀察'): string {
  if (phase === '快進處置') {
    return 'badge-warning';
  }

  if (phase === '已進處置') {
    return 'badge-danger';
  }

  return 'badge-neutral';
}

function eventBiasBadge(bias: '偏空事件段' | '偏多事件段' | '中性等待'): string {
  if (bias === '偏空事件段') {
    return 'badge-danger';
  }

  if (bias === '偏多事件段') {
    return 'badge-positive';
  }

  return 'badge-neutral';
}

export default async function StockDetailPage({ params }: { params: { code: string } }) {
  if (!isAuthenticated(cookies())) {
    redirect(`/login?next=/stocks/${params.code}`);
  }

  const detail = await getStockDetail(params.code);

  if (!detail) {
    notFound();
  }

  const { item, profile, history30d, insightGroups } = detail;
  const displayedHistory = history30d.slice(-30);
  const changeClass = item.change >= 0 ? 'text-rose' : 'text-emerald-700';

  return (
    <main className="bg-grid min-h-screen overflow-x-clip">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="mb-6">
          <BackToDashboardButton />
        </div>

        <section className="relative overflow-hidden rounded-[40px] border border-white/60 bg-[linear-gradient(135deg,rgba(8,19,27,0.98),rgba(18,53,74,0.94),rgba(224,122,45,0.84))] px-6 py-8 text-white shadow-[0_30px_80px_rgba(11,23,32,0.18)] md:px-10 md:py-10">
          <div className="absolute -right-6 top-4 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="grid gap-8 lg:grid-cols-[1.3fr_0.9fr] lg:items-end">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-white/75">
                <span className="rounded-full bg-white/15 px-3 py-1">上市</span>
                <span className={`rounded-full px-3 py-1 ${statusBadge(item.officialStatus)}`}>{item.officialStatus}</span>
                <span className={`rounded-full px-3 py-1 ${eventPhaseBadge(item.eventPlan.phase)}`}>{item.eventPlan.phase}</span>
                <span className={`rounded-full px-3 py-1 ${eventBiasBadge(item.eventPlan.bias)}`}>{item.eventPlan.bias}</span>
                <span className="rounded-full bg-white/15 px-3 py-1">{item.industry}</span>
                <span className={`rounded-full px-3 py-1 ${item.tradePlan.stance === '可進場' ? 'badge-positive' : item.tradePlan.stance === '等待突破' ? 'badge-warning' : item.tradePlan.stance === '避免進場' ? 'badge-danger' : 'badge-neutral'}`}>{item.tradePlan.stance}</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{item.name}</h1>
              <p className="numeric mt-2 text-lg text-white/75">{item.code}</p>
              <MetricDisclosure
                className="mt-6 inline-block rounded-[24px] px-2 py-1"
                source={stockMetricHelp('quote.close').source}
                calculation={stockMetricHelp('quote.changePct').calculation}
                summary={
                  <div className="flex flex-wrap items-end gap-4">
                    <p className="numeric text-4xl font-semibold md:text-5xl">{item.close.toFixed(2)}</p>
                    <p className={`numeric text-lg font-medium ${changeClass}`}>{formatSigned(item.change)} / {formatPercent(item.changePct)}</p>
                  </div>
                }
              />
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/78">
                這裡把個股的進處置風險、事件時間軸、近 30 筆歷史節奏、官方訊號與公司輪廓集中顯示，方便快速做二次判讀。
              </p>
              <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/85">
                {detail.dataFreshness.slice(0, 3).map((entry) => (
                  <span key={entry.category} className={`rounded-full px-3 py-2 font-medium ${freshnessTone(entry.freshness)}`}>
                    {entry.category} {entry.freshness}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid gap-4 rounded-[30px] border border-white/15 bg-white/10 p-5 backdrop-blur sm:grid-cols-2">
              <div className="sm:col-span-2">
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">資料時間</p>
                <p className="mt-3 text-base text-white/85">{formatUpdatedAt(detail.updatedAt)}</p>
              </div>
              <MetricDisclosure
                className="rounded-[18px] px-2 py-1"
                source={stockMetricHelp('quote.dispositionProbability').source}
                calculation={stockMetricHelp('quote.dispositionProbability').calculation}
                note={stockMetricHelp('quote.dispositionProbability').note}
                summary={
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">進處置機率</p>
                    <p className="numeric mt-3 text-4xl font-semibold">{item.dispositionProbability}%</p>
                  </div>
                }
              />
              <MetricDisclosure
                className="rounded-[18px] px-2 py-1"
                source={stockMetricHelp('quote.probabilities').source}
                calculation={stockMetricHelp('quote.probabilities').calculation}
                summary={
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">多空機率</p>
                    <p className="mt-3 text-base text-white/85">上漲 {item.riseProbability}% / 下跌 {item.fallProbability}%</p>
                  </div>
                }
              />
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">交易判斷</p>
                <p className="mt-3 text-base text-white/85">{item.tradePlan.preferredSide !== '觀望' ? `${item.tradePlan.preferredSide}主劇本: ` : ''}{item.tradePlan.summary}</p>
              </div>
              <MetricDisclosure
                className="rounded-[18px] px-2 py-1"
                source={stockMetricHelp('quote.tradeValue').source}
                calculation={stockMetricHelp('quote.tradeValue').calculation}
                summary={
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">成交金額</p>
                    <p className="mt-3 text-base text-white/85">{formatLargeNumber(item.tradeValue)}</p>
                  </div>
                }
              />
              <MetricDisclosure
                className="rounded-[18px] px-2 py-1"
                source={stockMetricHelp('quote.volume').source}
                calculation={stockMetricHelp('quote.volume').calculation}
                summary={
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-white/55">成交量</p>
                    <p className="mt-3 text-base text-white/85">{formatLargeNumber(item.volume)}</p>
                  </div>
                }
              />
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="min-w-0 space-y-8">
            <StockTradePlanPanel tradePlan={item.tradePlan} />

            <section className="glass-card rounded-[30px] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="section-title">
                    <h2 className="text-2xl font-semibold text-ink">事件時間軸</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">把這檔股票目前處在的事件段與下一步觀察重點攤開。</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 font-medium ${item.eventPlan.phase === '快進處置' ? 'badge-warning' : item.eventPlan.phase === '已進處置' ? 'badge-danger' : 'badge-neutral'}`}>{item.eventPlan.phase}</span>
                  <span className={`rounded-full px-3 py-1 font-medium ${item.eventPlan.bias === '偏空事件段' ? 'badge-danger' : item.eventPlan.bias === '偏多事件段' ? 'badge-positive' : 'badge-neutral'}`}>{item.eventPlan.bias}</span>
                </div>
              </div>
              <p className="content-wrap mt-5 rounded-[22px] bg-[linear-gradient(135deg,#12354a,#0b1720)] px-4 py-4 text-sm leading-7 text-white/82 shadow-lg">{item.eventPlan.summary}</p>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-ink">操作節點</h3>
                  {item.eventPlan.tactics.map((entry) => (
                    <p key={`tactic-${entry}`} className="soft-chip content-wrap rounded-2xl px-4 py-3 text-sm leading-7 text-ink/72">{entry}</p>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-ink">事件節奏</h3>
                  {item.eventPlan.timeline.map((entry, index) => (
                    <div key={`timeline-${entry}`} className="content-wrap relative rounded-[22px] border border-ink/8 bg-white/92 px-4 py-4 shadow-sm">
                      <span className="absolute left-4 top-4 numeric text-xs text-ink/35">0{index + 1}</span>
                      <p className="pl-8 text-sm leading-7 text-ink/72">{entry}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <div className="section-title">
                    <h2 className="text-2xl font-semibold text-ink">近 30 筆歷史</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">用較長的時間窗看波動是否持續升溫。</p>
                </div>
                <MetricDisclosure
                  className="soft-chip content-wrap inline-block rounded-full px-3 py-2 text-sm text-ink/70"
                  source={stockMetricHelp('history.points').source}
                  calculation={stockMetricHelp('history.points').calculation}
                  summary={<span>{displayedHistory.length} 筆</span>}
                />
              </div>
              <PriceTrend points={displayedHistory} />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MetricDisclosure
                  className="metric-tile rounded-[22px] px-4 py-4"
                  source={stockMetricHelp('quote.trend7dPct').source}
                  calculation={stockMetricHelp('quote.trend7dPct').calculation}
                  summary={<div><p className="text-sm text-ink/60">近 7 日</p><p className="numeric mt-2 text-2xl font-semibold text-ink">{formatPercent(item.trend7dPct)}</p></div>}
                />
                <MetricDisclosure
                  className="metric-tile rounded-[22px] px-4 py-4"
                  source={stockMetricHelp('quote.changePct').source}
                  calculation={stockMetricHelp('quote.changePct').calculation}
                  summary={<div><p className="text-sm text-ink/60">單日變動</p><p className="numeric mt-2 text-2xl font-semibold text-ink">{formatPercent(item.changePct)}</p></div>}
                />
                <MetricDisclosure
                  className="metric-tile rounded-[22px] px-4 py-4"
                  source={stockMetricHelp('quote.transactionCount').source}
                  calculation={stockMetricHelp('quote.transactionCount').calculation}
                  summary={<div><p className="text-sm text-ink/60">成交筆數</p><p className="numeric mt-2 text-2xl font-semibold text-ink">{item.transactionCount.toLocaleString('zh-TW')}</p></div>}
                />
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">原因拆解</h2>
              <div className="mt-5 space-y-5">
                {insightGroups.map((group) => (
                  <div key={group.title} className="content-wrap rounded-[24px] border border-ink/8 bg-white/92 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-ink/70">
                      {group.items.map((entry) => (
                        <p key={`${group.title}-${entry}`} className="soft-chip content-wrap rounded-2xl px-4 py-3">
                          {entry}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="min-w-0 space-y-8">
            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">資料新鮮度</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                {detail.dataFreshness.map((entry) => (
                  <div key={entry.category} className="content-wrap rounded-[22px] border border-ink/8 bg-white/92 px-4 py-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-ink">{entry.category}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${freshnessTone(entry.freshness)}`}>{entry.freshness}</span>
                    </div>
                    <p className="content-wrap mt-2 text-ink/60">來源: {entry.source}</p>
                    <p className="content-wrap mt-2">{entry.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">公司基本資料</h2>
              <div className="mt-5 grid gap-3 text-sm text-ink/70">
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">產業: {item.industry}</div>
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">上市日期: {profile?.listedDate ?? '暫無'}</div>
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">董事長: {profile?.chairman ?? '暫無'}</div>
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">總經理: {profile?.generalManager ?? '暫無'}</div>
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">發言人: {profile?.spokesperson ?? '暫無'}</div>
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">總機電話: {profile?.phone ?? '暫無'}</div>
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">地址: {profile?.address ?? '暫無'}</div>
                <MetricDisclosure
                  className="metric-tile content-wrap rounded-[22px] px-4 py-4"
                  source={stockMetricHelp('company.paidInCapital').source}
                  calculation={stockMetricHelp('company.paidInCapital').calculation}
                  summary={<span>實收資本額: {profile ? formatLargeNumber(profile.paidInCapital ?? 0) : '暫無'}</span>}
                />
                <div className="metric-tile content-wrap rounded-[22px] px-4 py-4">網站: {profile?.website ?? '暫無'}</div>
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">官方訊號</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                <p className="soft-chip content-wrap rounded-2xl px-4 py-3">目前狀態: {item.officialStatus}</p>
                <MetricDisclosure
                  className="soft-chip content-wrap rounded-2xl px-4 py-3"
                  source={stockMetricHelp('official.announcementCount').source}
                  calculation={stockMetricHelp('official.announcementCount').calculation}
                  summary={<span>公告筆數: {item.officialAnnouncementCount}</span>}
                />
                <p className="soft-chip content-wrap rounded-2xl px-4 py-3">補充說明: {item.officialReference ?? '目前沒有額外官方補充內容。'}</p>
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">制度規則快照</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                <p className="soft-chip content-wrap rounded-2xl px-4 py-3">除權息: {item.ruleFacts.exDividend.exDate ? `${item.ruleFacts.exDividend.exDate} ${item.ruleFacts.exDividend.kind ?? ''}` : '近期無事件窗'}</p>
                <MetricDisclosure
                  className="soft-chip content-wrap rounded-2xl px-4 py-3"
                  source={stockMetricHelp('rules.marginUsage').source}
                  calculation={stockMetricHelp('rules.marginUsage').calculation}
                  summary={<span>融資使用率: {item.ruleFacts.marginShort.marginUsagePct !== null ? `${item.ruleFacts.marginShort.marginUsagePct}%` : '暫無'} / 融券使用率: {item.ruleFacts.marginShort.shortUsagePct !== null ? `${item.ruleFacts.marginShort.shortUsagePct}%` : '暫無'}</span>}
                />
                <MetricDisclosure
                  className="soft-chip content-wrap rounded-2xl px-4 py-3"
                  source={stockMetricHelp('rules.materialInfoCount').source}
                  calculation={stockMetricHelp('rules.materialInfoCount').calculation}
                  summary={<span>重大訊息: {item.ruleFacts.materialInfo.count > 0 ? `${item.ruleFacts.materialInfo.count} 筆，最新為 ${item.ruleFacts.materialInfo.latestTitle ?? '未提供'}` : '近期無重大訊息事件窗'}</span>}
                />
                <p className="soft-chip content-wrap rounded-2xl px-4 py-3">當沖限制: {item.ruleFacts.dayTradeRestriction.active ? `${item.ruleFacts.dayTradeRestriction.kinds.join('、')}，至 ${item.ruleFacts.dayTradeRestriction.endDate ?? '未提供'}` : '目前無限制'}</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}