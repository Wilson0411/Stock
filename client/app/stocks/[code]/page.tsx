import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getStockDetail } from '@/lib/market';

export const dynamic = 'force-dynamic';
export const preferredRegion = 'hnd1';

function freshnessTone(value: '近即時' | '公告批次' | '定期更新' | '月更' | '日線更新'): string {
  if (value === '近即時') {
    return 'bg-mint/20 text-emerald-900';
  }

  if (value === '公告批次') {
    return 'bg-[#f0d78c]/35 text-amber-950';
  }

  return 'bg-tide/10 text-tide';
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
      <div className="rounded-[22px] bg-foam px-4 py-4 text-sm text-ink/60">
        <p>{label}</p>
        <p className="mt-2">暫不提供</p>
      </div>
    );
  }

  return (
    <details className="hint-card rounded-[22px] border border-ink/8 bg-white/82 px-4 py-4 text-sm text-ink/60 shadow-sm">
      <summary className="hint-summary flex cursor-pointer list-none items-start justify-between gap-3">
        <div>
          <p>{label}</p>
          <p className="numeric mt-2 text-2xl font-semibold text-ink">{value.toFixed(2)}</p>
        </div>
        <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink/70">點開看理由</span>
      </summary>
      <div className="mt-3 space-y-2 border-t border-ink/8 pt-3 text-xs leading-6 text-ink/72">
        {reasons.map((reason) => (
          <p key={`${label}-${reason}`} className="soft-chip rounded-2xl px-3 py-2">
            {reason}
          </p>
        ))}
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
    <div className="rounded-[28px] border border-ink/8 bg-white/90 p-4">
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
    return 'bg-rose/15 text-rose-800';
  }

  if (status === '注意') {
    return 'bg-amber-200/70 text-amber-900';
  }

  return 'bg-tide/10 text-tide';
}

function eventPhaseBadge(phase: '快進處置' | '已進處置' | '事件觀察'): string {
  if (phase === '快進處置') {
    return 'bg-amber-200/70 text-amber-900';
  }

  if (phase === '已進處置') {
    return 'bg-rose/15 text-rose-800';
  }

  return 'bg-white/15 text-white';
}

function eventBiasBadge(bias: '偏空事件段' | '偏多事件段' | '中性等待'): string {
  if (bias === '偏空事件段') {
    return 'bg-[#d04c3f]/25 text-white';
  }

  if (bias === '偏多事件段') {
    return 'bg-[#73c8a9]/30 text-white';
  }

  return 'bg-white/15 text-white';
}

export default async function StockDetailPage({ params }: { params: { code: string } }) {
  const detail = await getStockDetail(params.code);

  if (!detail) {
    notFound();
  }

  const { item, profile, history30d, insightGroups } = detail;
  const displayedHistory = history30d.slice(-30);
  const changeClass = item.change >= 0 ? 'text-rose' : 'text-emerald-700';

  return (
    <main className="bg-grid min-h-screen overflow-hidden">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-8 md:py-10">
        <div className="sticky top-3 z-20 mb-6 md:static">
          <Link href="/" className="inline-flex rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-ink shadow-sm transition hover:bg-white">
            返回總覽
          </Link>
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
                <span className={`rounded-full px-3 py-1 ${item.tradePlan.stance === '可進場' ? 'bg-[#73c8a9]/30 text-white' : item.tradePlan.stance === '等待突破' ? 'bg-[#f0d78c]/30 text-white' : item.tradePlan.stance === '避免進場' ? 'bg-[#d04c3f]/25 text-white' : 'bg-white/15 text-white'}`}>{item.tradePlan.stance}</span>
              </div>
              <h1 className="mt-4 text-3xl font-semibold md:text-5xl">{item.name}</h1>
              <p className="numeric mt-2 text-lg text-white/75">{item.code}</p>
              <div className="mt-6 flex flex-wrap items-end gap-4">
                <p className="numeric text-4xl font-semibold md:text-5xl">{item.close.toFixed(2)}</p>
                <p className={`numeric text-lg font-medium ${changeClass}`}>{formatSigned(item.change)} / {formatPercent(item.changePct)}</p>
              </div>
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
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">進處置機率</p>
                <p className="numeric mt-3 text-4xl font-semibold">{item.dispositionProbability}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">多空機率</p>
                <p className="mt-3 text-base text-white/85">上漲 {item.riseProbability}% / 下跌 {item.fallProbability}%</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">交易判斷</p>
                <p className="mt-3 text-base text-white/85">{item.tradePlan.preferredSide !== '觀望' ? `${item.tradePlan.preferredSide}主劇本: ` : ''}{item.tradePlan.summary}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">成交金額</p>
                <p className="mt-3 text-base text-white/85">{formatLargeNumber(item.tradeValue)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/55">成交量</p>
                <p className="mt-3 text-base text-white/85">{formatLargeNumber(item.volume)}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">交易計畫</h2>
              <p className="mt-1 text-sm text-ink/60">滑鼠移到價格卡上可以看到為什麼這裡是建議進出場位置。</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <PriceHint label={item.tradePlan.primarySetup?.entryLabel ?? '建議進場'} value={item.tradePlan.entry?.price ?? null} reasons={item.tradePlan.entry?.reasons ?? []} />
                <PriceHint label={item.tradePlan.primarySetup?.exitLabel ?? '建議停利'} value={item.tradePlan.takeProfit?.price ?? null} reasons={item.tradePlan.takeProfit?.reasons ?? []} />
                <PriceHint label={item.tradePlan.primarySetup?.stopLabel ?? '建議停損'} value={item.tradePlan.stopLoss?.price ?? null} reasons={item.tradePlan.stopLoss?.reasons ?? []} />
              </div>
              <div className="mt-4 rounded-[22px] bg-[linear-gradient(135deg,#0b1720,#12354a)] px-4 py-4 text-sm text-white/82 shadow-lg">
                {item.tradePlan.riskRewardRatio !== null ? `${item.tradePlan.primarySetup?.side ?? '主劇本'}估算風險報酬比 ${item.tradePlan.riskRewardRatio}。` : '目前暫無可用的風險報酬比。'}
              </div>
              {item.tradePlan.alternateSetup ? (
                <div className="mt-4 rounded-[22px] border border-ink/8 bg-white/88 px-4 py-4 text-sm leading-7 text-ink/72 shadow-sm">
                  <p className="font-medium text-ink">備用{item.tradePlan.alternateSetup.side}劇本</p>
                  <p className="mt-2">{item.tradePlan.alternateSetup.summary}</p>
                  <p className="mt-2">
                    {item.tradePlan.alternateSetup.entry ? `${item.tradePlan.alternateSetup.entryLabel} ${item.tradePlan.alternateSetup.entry.price.toFixed(2)}，` : ''}
                    {item.tradePlan.alternateSetup.exit ? `${item.tradePlan.alternateSetup.exitLabel} ${item.tradePlan.alternateSetup.exit.price.toFixed(2)}，` : ''}
                    {item.tradePlan.alternateSetup.stopLoss ? `${item.tradePlan.alternateSetup.stopLabel} ${item.tradePlan.alternateSetup.stopLoss.price.toFixed(2)}。` : ''}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="section-title">
                    <h2 className="text-2xl font-semibold text-ink">事件時間軸</h2>
                  </div>
                  <p className="mt-1 text-sm text-ink/60">把這檔股票目前處在的事件段與下一步觀察重點攤開。</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={`rounded-full px-3 py-1 font-medium ${item.eventPlan.phase === '快進處置' ? 'bg-amber-200/70 text-amber-900' : item.eventPlan.phase === '已進處置' ? 'bg-rose/15 text-rose-800' : 'bg-tide/10 text-tide'}`}>{item.eventPlan.phase}</span>
                  <span className={`rounded-full px-3 py-1 font-medium ${item.eventPlan.bias === '偏空事件段' ? 'bg-rose/20 text-rose-800' : item.eventPlan.bias === '偏多事件段' ? 'bg-mint/20 text-emerald-800' : 'bg-tide/10 text-tide'}`}>{item.eventPlan.bias}</span>
                </div>
              </div>
              <p className="mt-5 rounded-[22px] bg-[linear-gradient(135deg,#12354a,#0b1720)] px-4 py-4 text-sm leading-7 text-white/82 shadow-lg">{item.eventPlan.summary}</p>
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-ink">操作節點</h3>
                  {item.eventPlan.tactics.map((entry) => (
                    <p key={`tactic-${entry}`} className="soft-chip rounded-2xl px-4 py-3 text-sm leading-7 text-ink/72">{entry}</p>
                  ))}
                </div>
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-ink">事件節奏</h3>
                  {item.eventPlan.timeline.map((entry, index) => (
                    <div key={`timeline-${entry}`} className="relative rounded-[22px] border border-ink/8 bg-white/92 px-4 py-4 shadow-sm">
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
                <span className="soft-chip rounded-full px-3 py-2 text-sm text-ink/70">{displayedHistory.length} 筆</span>
              </div>
              <PriceTrend points={displayedHistory} />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="metric-tile rounded-[22px] px-4 py-4">
                  <p className="text-sm text-ink/60">近 7 日</p>
                  <p className="numeric mt-2 text-2xl font-semibold text-ink">{formatPercent(item.trend7dPct)}</p>
                </div>
                <div className="metric-tile rounded-[22px] px-4 py-4">
                  <p className="text-sm text-ink/60">單日變動</p>
                  <p className="numeric mt-2 text-2xl font-semibold text-ink">{formatPercent(item.changePct)}</p>
                </div>
                <div className="metric-tile rounded-[22px] px-4 py-4">
                  <p className="text-sm text-ink/60">成交筆數</p>
                  <p className="numeric mt-2 text-2xl font-semibold text-ink">{item.transactionCount.toLocaleString('zh-TW')}</p>
                </div>
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">原因拆解</h2>
              <div className="mt-5 space-y-5">
                {insightGroups.map((group) => (
                  <div key={group.title} className="rounded-[24px] border border-ink/8 bg-white/92 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-ink">{group.title}</h3>
                    <div className="mt-3 space-y-2 text-sm leading-7 text-ink/70">
                      {group.items.map((entry) => (
                        <p key={`${group.title}-${entry}`} className="soft-chip rounded-2xl px-4 py-3">
                          {entry}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">資料新鮮度</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                {detail.dataFreshness.map((entry) => (
                  <div key={entry.category} className="rounded-[22px] border border-ink/8 bg-white/92 px-4 py-4 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-ink">{entry.category}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${freshnessTone(entry.freshness)}`}>{entry.freshness}</span>
                    </div>
                    <p className="mt-2 text-ink/60">來源: {entry.source}</p>
                    <p className="mt-2">{entry.note}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">公司基本資料</h2>
              <div className="mt-5 grid gap-3 text-sm text-ink/70">
                <div className="metric-tile rounded-[22px] px-4 py-4">產業: {item.industry}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">上市日期: {profile?.listedDate ?? '暫無'}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">董事長: {profile?.chairman ?? '暫無'}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">總經理: {profile?.generalManager ?? '暫無'}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">發言人: {profile?.spokesperson ?? '暫無'}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">總機電話: {profile?.phone ?? '暫無'}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">地址: {profile?.address ?? '暫無'}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">實收資本額: {profile ? formatLargeNumber(profile.paidInCapital ?? 0) : '暫無'}</div>
                <div className="metric-tile rounded-[22px] px-4 py-4">網站: {profile?.website ?? '暫無'}</div>
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">官方訊號</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                <p className="soft-chip rounded-2xl px-4 py-3">目前狀態: {item.officialStatus}</p>
                <p className="soft-chip rounded-2xl px-4 py-3">公告筆數: {item.officialAnnouncementCount}</p>
                <p className="soft-chip rounded-2xl px-4 py-3">補充說明: {item.officialReference ?? '目前沒有額外官方補充內容。'}</p>
              </div>
            </section>

            <section className="glass-card rounded-[30px] p-6">
              <h2 className="text-2xl font-semibold text-ink">制度規則快照</h2>
              <div className="mt-4 space-y-3 text-sm leading-7 text-ink/70">
                <p className="soft-chip rounded-2xl px-4 py-3">除權息: {item.ruleFacts.exDividend.exDate ? `${item.ruleFacts.exDividend.exDate} ${item.ruleFacts.exDividend.kind ?? ''}` : '近期無事件窗'}</p>
                <p className="soft-chip rounded-2xl px-4 py-3">融資使用率: {item.ruleFacts.marginShort.marginUsagePct !== null ? `${item.ruleFacts.marginShort.marginUsagePct}%` : '暫無'} / 融券使用率: {item.ruleFacts.marginShort.shortUsagePct !== null ? `${item.ruleFacts.marginShort.shortUsagePct}%` : '暫無'}</p>
                <p className="soft-chip rounded-2xl px-4 py-3">重大訊息: {item.ruleFacts.materialInfo.count > 0 ? `${item.ruleFacts.materialInfo.count} 筆，最新為 ${item.ruleFacts.materialInfo.latestTitle ?? '未提供'}` : '近期無重大訊息事件窗'}</p>
                <p className="soft-chip rounded-2xl px-4 py-3">當沖限制: {item.ruleFacts.dayTradeRestriction.active ? `${item.ruleFacts.dayTradeRestriction.kinds.join('、')}，至 ${item.ruleFacts.dayTradeRestriction.endDate ?? '未提供'}` : '目前無限制'}</p>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}