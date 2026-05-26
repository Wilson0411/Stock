const TWSE_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL';
const TWSE_NOTICE_URL = 'https://openapi.twse.com.tw/v1/announcement/notice';
const TWSE_NOTETRANS_URL = 'https://openapi.twse.com.tw/v1/announcement/notetrans';
const TWSE_PUNISH_URL = 'https://openapi.twse.com.tw/v1/announcement/punish';
const TWSE_COMPANY_INFO_URL = 'https://openapi.twse.com.tw/v1/opendata/t187ap03_L';
const TWSE_REVENUE_URL = 'https://openapi.twse.com.tw/v1/opendata/t187ap05_L';
const TWSE_EXDIVIDEND_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/TWT48U_ALL';
const TWSE_MARGIN_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/MI_MARGN';
const TWSE_MATERIAL_INFO_URL = 'https://openapi.twse.com.tw/v1/opendata/t187ap04_L';
const TWSE_DAY_TRADE_BUY_FIRST_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/TWTBAU1';
const TWSE_DAY_TRADE_SELL_FIRST_URL = 'https://openapi.twse.com.tw/v1/exchangeReport/TWTBAU2';

type RawTwseQuote = {
  Code: string;
  Name: string;
  TradeVolume: string;
  TradeValue: string;
  OpeningPrice: string;
  HighestPrice: string;
  LowestPrice: string;
  ClosingPrice: string;
  Change: string;
  Transaction: string;
  Date: string;
};

type RawNoticeRecord = {
  Code: string;
  Name: string;
  NumberOfAnnouncement: string;
  TradingInfoForAttention: string;
  Date: string;
};

type RawNoteTransRecord = {
  Code: string;
  Name: string;
  RecentlyMetAttentionSecuritiesCriteria: string;
};

type RawPunishRecord = {
  Code: string;
  Name: string;
  NumberOfAnnouncement: string;
  ReasonsOfDisposition: string;
  DispositionPeriod: string;
  DispositionMeasures: string;
  Detail: string;
};

type RawCompanyProfile = {
  出表日期: string;
  公司代號: string;
  公司名稱: string;
  公司簡稱: string;
  產業別: string;
  住址: string;
  董事長: string;
  總經理: string;
  發言人: string;
  總機電話: string;
  上市日期: string;
  實收資本額: string;
  網址: string;
  電子郵件信箱: string;
};

type RawRevenueRecord = {
  出表日期: string;
  資料年月: string;
  公司代號: string;
  公司名稱: string;
  產業別: string;
  '營業收入-當月營收': string;
  '營業收入-上月營收': string;
  '營業收入-去年當月營收': string;
  '營業收入-上月比較增減(%)': string;
  '營業收入-去年同月增減(%)': string;
  '累計營業收入-當月累計營收': string;
  '累計營業收入-去年累計營收': string;
  '累計營業收入-前期比較增減(%)': string;
  備註: string;
};

type RawExDividendRecord = {
  Date: string;
  Code: string;
  Name: string;
  Exdividend: string;
  StockDividendRatio: string;
  SubscriptionRatio: string;
  SubscriptionPricePerShare: string;
  CashDividend: string;
  SharesOffered: string;
  SharesEmpOwner: string;
  SharesholderOwner: string;
  StockHoldingRatio: string;
};

type RawMarginRecord = {
  股票代號: string;
  股票名稱: string;
  融資買進: string;
  融資賣出: string;
  融資現金償還: string;
  融資前日餘額: string;
  融資今日餘額: string;
  融資限額: string;
  融券買進: string;
  融券賣出: string;
  融券現券償還: string;
  融券前日餘額: string;
  融券今日餘額: string;
  融券限額: string;
  資券互抵: string;
  註記: string;
};

type RawMaterialInfoRecord = {
  出表日期: string;
  發言日期: string;
  發言時間: string;
  公司代號: string;
  公司名稱: string;
  '主旨 ': string;
  符合條款: string;
  事實發生日: string;
  說明: string;
};

type RawDayTradeRestrictionRecord = {
  Code: string;
  Name: string;
  StartDate: string;
  EndDate: string;
  Reason: string;
};

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: {
        quote?: Array<{
          close?: Array<number | null>;
        }>;
      };
    }>;
  };
};

type Board = '上市';

type NormalizedQuote = {
  code: string;
  name: string;
  board: Board;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  change: number;
  previousClose: number;
  volume: number;
  tradeValue: number;
  transactionCount: number;
  nextLimitUp: number | null;
  nextLimitDown: number | null;
};

type EnrichedQuote = NormalizedQuote & {
  changePct: number;
  intradayRangePct: number;
  closeToHigh: number;
  closeToLow: number;
  tradeValuePct: number;
  volumePct: number;
  transactionPct: number;
  absMovePct: number;
  absMovePctRank: number;
  volatilityRank: number;
  crowdingRank: number;
  limitPressure: number;
};

type OfficialFlag = {
  status: '處置' | '注意' | '模型觀察';
  headline: string | null;
  detail: string | null;
  announcementCount: number;
};

export type CompanyProfile = {
  code: string;
  name: string;
  shortName: string;
  industry: string;
  address: string | null;
  chairman: string | null;
  generalManager: string | null;
  spokesperson: string | null;
  phone: string | null;
  listedDate: string | null;
  paidInCapital: number | null;
  website: string | null;
  email: string | null;
};

export type RevenueSnapshot = {
  period: string;
  monthlyRevenue: number | null;
  previousMonthRevenue: number | null;
  lastYearRevenue: number | null;
  momPct: number | null;
  yoyPct: number | null;
  ytdPct: number | null;
};

export type PriceHistoryPoint = {
  date: string;
  close: number;
};

export type TradeLevel = {
  price: number;
  reasons: string[];
};

export type TradeSetup = {
  side: '做多' | '做空';
  summary: string;
  entryLabel: string;
  exitLabel: string;
  stopLabel: string;
  entry: TradeLevel | null;
  exit: TradeLevel | null;
  stopLoss: TradeLevel | null;
  riskRewardRatio: number | null;
};

export type TradePlan = {
  stance: '可進場' | '等待突破' | '只觀察' | '避免進場';
  preferredSide: '做多' | '做空' | '觀望';
  summary: string;
  entry: TradeLevel | null;
  takeProfit: TradeLevel | null;
  stopLoss: TradeLevel | null;
  riskRewardRatio: number | null;
  primarySetup: TradeSetup | null;
  alternateSetup: TradeSetup | null;
  dimensionAnalysis: {
    fundamental: string[];
    chip: string[];
    technical: string[];
    priceVolume: string[];
  };
};

export type EventPlan = {
  phase: '快進處置' | '已進處置' | '事件觀察';
  bias: '偏空事件段' | '偏多事件段' | '中性等待';
  summary: string;
  tactics: string[];
  timeline: string[];
};

export type RuleSignal = {
  category: '除權息' | '融資融券' | '重大訊息' | '當沖限制';
  direction: '偏多' | '偏空' | '中性';
  severity: '高' | '中' | '低';
  summary: string;
  source: string;
};

export type RuleCoverage = {
  category: '除權息' | '融資融券' | '重大訊息' | '當沖限制' | 'ETF/指數換股' | '法人買賣超' | 'CB/現增' | '警示交割';
  status: '已接入' | '待補資料';
  source: string;
  note: string;
};

export type RuleFacts = {
  exDividend: {
    exDate: string | null;
    daysUntil: number | null;
    kind: string | null;
    cashDividend: number | null;
    stockDividendRatio: number | null;
  };
  marginShort: {
    marginBalance: number | null;
    marginUsagePct: number | null;
    marginChangePct: number | null;
    shortBalance: number | null;
    shortUsagePct: number | null;
    shortChangePct: number | null;
    offsetAmount: number | null;
  };
  materialInfo: {
    count: number;
    latestTitle: string | null;
    latestDate: string | null;
  };
  dayTradeRestriction: {
    active: boolean;
    kinds: string[];
    reason: string | null;
    startDate: string | null;
    endDate: string | null;
  };
};

export type DataFreshness = {
  category: '盤中行情' | '官方公告/制度規則' | '公司基本資料' | '月營收' | '歷史走勢';
  freshness: '近即時' | '公告批次' | '定期更新' | '月更' | '日線更新';
  source: string;
  note: string;
};

type SignalDiagnostics = {
  crowdingRank: number;
  volatilityRank: number;
  closeToHigh: number;
  closeToLow: number;
  limitPressure: number;
  tradeValuePct: number;
  transactionPct: number;
};

type OptionalMarketData = {
  officialFlags: Map<string, OfficialFlag>;
  profiles: Map<string, CompanyProfile>;
  revenues: Map<string, RevenueSnapshot>;
  exDividendPlans: Map<string, RuleFacts['exDividend']>;
  marginShortSignals: Map<string, RuleFacts['marginShort']>;
  materialInfoSignals: Map<string, RuleFacts['materialInfo']>;
  dayTradeRestrictions: Map<string, RuleFacts['dayTradeRestriction']>;
};

type MarketBaseData = {
  twseQuotes: NormalizedQuote[];
  optionalData: OptionalMarketData;
  enrichedQuotes: EnrichedQuote[];
  scoredUniverse: StockRiskItem[];
  marketPulse: MarketPulse;
};

type CacheEntry = {
  expiresAt: number;
  value?: unknown;
  promise?: Promise<unknown>;
};

const SHORT_LIVED_TTL_MS = 20_000;
const OPTIONAL_DATA_TTL_MS = 60_000;
const HISTORY_TTL_MS = 5 * 60_000;
const marketRuntimeCache = getRuntimeCache();

function getRuntimeCache(): Map<string, CacheEntry> {
  const runtime = globalThis as typeof globalThis & { __stockMarketCache?: Map<string, CacheEntry> };
  runtime.__stockMarketCache ??= new Map<string, CacheEntry>();
  return runtime.__stockMarketCache;
}

async function withRuntimeCache<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const existing = marketRuntimeCache.get(key);

  if (existing?.value !== undefined && existing.expiresAt > now) {
    return existing.value as T;
  }

  if (existing?.promise) {
    return existing.promise as Promise<T>;
  }

  const promise = loader()
    .then((value) => {
      marketRuntimeCache.set(key, {
        expiresAt: Date.now() + ttlMs,
        value
      });
      return value;
    })
    .catch((error) => {
      marketRuntimeCache.delete(key);
      throw error;
    });

  marketRuntimeCache.set(key, {
    expiresAt: now + ttlMs,
    promise
  });

  return promise;
}

export type StockRiskItem = {
  code: string;
  name: string;
  board: Board;
  industry: string;
  close: number;
  change: number;
  changePct: number;
  tradeValue: number;
  volume: number;
  transactionCount: number;
  dispositionProbability: number;
  riseProbability: number;
  fallProbability: number;
  momentumLabel: string;
  officialStatus: '處置' | '注意' | '模型觀察';
  officialReference: string | null;
  officialAnnouncementCount: number;
  trend7dPct: number | null;
  priceHistory: PriceHistoryPoint[];
  revenue: RevenueSnapshot | null;
  eventPlan: EventPlan;
  ruleFacts: RuleFacts;
  ruleSignals: RuleSignal[];
  tradePlan: TradePlan;
  diagnostics: SignalDiagnostics;
  reasons: string[];
};

export type MarketPulse = {
  stance: '偏多順風' | '中性震盪' | '偏空保守';
  summary: string;
  advancers: number;
  decliners: number;
  flatCount: number;
  averageChangePct: number;
  breadthPct: number;
  hotIndustries: string[];
  notes: string[];
};

export type MarketSnapshot = {
  updatedAt: string;
  dataFreshness: DataFreshness[];
  industries: string[];
  marketPulse: MarketPulse;
  overview: {
    totalUniverse: number;
    highRiskCount: number;
    bullishBiasCount: number;
    bearishBiasCount: number;
    medianDispositionProbability: number;
    officialNoticeCount: number;
    officialDispositionCount: number;
    officialHitCount: number;
    fastTrackCount: number;
    disposedCount: number;
    observationCount: number;
  };
  eventBoards: {
    fastTrack: StockRiskItem[];
    disposed: StockRiskItem[];
  };
  ruleCoverage: RuleCoverage[];
  watchlist: StockRiskItem[];
  bullishBoard: StockRiskItem[];
  bearishBoard: StockRiskItem[];
  officialSpotlight: StockRiskItem[];
  searchPool: StockRiskItem[];
  notes: string[];
};

export type StockDetail = {
  updatedAt: string;
  dataFreshness: DataFreshness[];
  item: StockRiskItem;
  profile: CompanyProfile | null;
  history30d: PriceHistoryPoint[];
  insightGroups: Array<{
    title: string;
    items: string[];
  }>;
};

function parseNumber(value: string): number {
  const cleaned = value.replace(/,/g, '').trim();

  if (!cleaned || cleaned === '---' || cleaned === '----' || cleaned === '不適用') {
    return Number.NaN;
  }

  const normalized = cleaned.replace('+', '').replace(/\s+/g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : Number.NaN;
}

function normalizeText(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim();
  return normalized && normalized !== '－' ? normalized : null;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function percentileRank(values: number[], value: number): number {
  const sorted = [...values].sort((left, right) => left - right);

  if (sorted.length <= 1) {
    return 0.5;
  }

  const index = sorted.findIndex((item) => item >= value);
  const normalizedIndex = index === -1 ? sorted.length - 1 : index;

  return normalizedIndex / (sorted.length - 1);
}

function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `${round(value / 100000000, 1)} 億`;
  }

  if (value >= 10000) {
    return `${round(value / 10000, 1)} 萬`;
  }

  return `${Math.round(value).toLocaleString('zh-TW')}`;
}

function formatCapital(value: number | null): string {
  if (value === null || !Number.isFinite(value)) {
    return '暫無';
  }

  return `${(value / 100000000).toFixed(2)} 億元`;
}

function formatIsoDate(timestamp: number): string {
  return new Date(timestamp * 1000).toISOString().slice(0, 10);
}

function formatRocCompactDate(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/\D/g, '');

  if (cleaned.length !== 7) {
    return null;
  }

  const rocYear = Number(cleaned.slice(0, 3));
  const month = Number(cleaned.slice(3, 5));
  const day = Number(cleaned.slice(5, 7));

  if (!Number.isFinite(rocYear) || !Number.isFinite(month) || !Number.isFinite(day)) {
    return null;
  }

  return `${rocYear + 1911}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function daysUntil(targetDate: string | null): number | null {
  if (!targetDate) {
    return null;
  }

  const today = new Date();
  const current = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const target = Date.parse(`${targetDate}T00:00:00Z`);

  if (!Number.isFinite(target)) {
    return null;
  }

  return Math.round((target - current) / 86400000);
}

function buildRuleCoverage(): RuleCoverage[] {
  return [
    { category: '除權息', status: '已接入', source: 'TWSE TWT48U_ALL', note: '用未來 14 日除權息事件窗評估理論價格調整壓力。' },
    { category: '融資融券', status: '已接入', source: 'TWSE MI_MARGN', note: '追蹤融資餘額變化、融券餘額變化與使用率。' },
    { category: '重大訊息', status: '已接入', source: 'TWSE t187ap04_L', note: '把重大訊息視為波動事件窗，而非單向利多或利空保證。' },
    { category: '當沖限制', status: '已接入', source: 'TWSE TWTBAU1/TWTBAU2', note: '納入停止先買後賣或先賣後買的限制期。' },
    { category: 'ETF/指數換股', status: '待補資料', source: '指數公告 / ETF 換股公告', note: '目前未接統一公開 API，後續可補公告抓取。' },
    { category: '法人買賣超', status: '待補資料', source: 'TWSE 三大法人頁面', note: '目前未接穩定公開 API，待補 web data 或外部源。' },
    { category: 'CB/現增', status: '待補資料', source: 'MOPS / 重大訊息', note: '目前缺少結構化即時欄位，需補公告解析。' },
    { category: '警示交割', status: '待補資料', source: '市場公告 / 警示頁面', note: '全額交割與管理股標記尚未接到可穩定消化的端點。' }
  ];
}

function buildDataFreshness(): DataFreshness[] {
  return [
    {
      category: '盤中行情',
      freshness: '近即時',
      source: 'TWSE STOCK_DAY_ALL',
      note: 'server 端會保留短秒數快取以降低延遲；即使如此仍受 TWSE 公開端點更新節奏限制，非逐筆報價。'
    },
    {
      category: '官方公告/制度規則',
      freshness: '公告批次',
      source: 'TWSE notice/notetrans/punish/t187ap04_L/TWT48U_ALL/MI_MARGN/TWTBAU1/TWTBAU2',
      note: '注意股、處置股、重大訊息、除權息、資券與當沖限制以公告或批次資料為主，server 端會做短暫快取，不保證秒級同步。'
    },
    {
      category: '公司基本資料',
      freshness: '定期更新',
      source: 'TWSE t187ap03_L',
      note: '董事長、地址、上市日期等屬公司基本資料，適合做背景判讀，不適合盤中時效決策。'
    },
    {
      category: '月營收',
      freshness: '月更',
      source: 'TWSE t187ap05_L',
      note: '營收屬月頻率資料，適合基本面趨勢判讀，不代表當日盤中資訊。'
    },
    {
      category: '歷史走勢',
      freshness: '日線更新',
      source: 'Yahoo Finance chart 1d',
      note: '歷史走勢使用日線區間補齊，適合看波段節奏，不是盤中即時線圖。'
    }
  ];
}

function resolveSettled<T>(result: PromiseSettledResult<T>, fallback: T, label: string): T {
  if (result.status === 'fulfilled') {
    return result.value;
  }

  console.warn(`[market] ${label} unavailable:`, result.reason);
  return fallback;
}

async function loadOptionalMarketData(): Promise<OptionalMarketData> {
  return withRuntimeCache('optional-market-data', OPTIONAL_DATA_TTL_MS, async () => {
    const [officialFlagsResult, profilesResult, revenuesResult, exDividendPlansResult, marginShortSignalsResult, materialInfoSignalsResult, dayTradeRestrictionsResult] =
      await Promise.allSettled([
        fetchOfficialFlags(),
        fetchCompanyProfiles(),
        fetchRevenueSnapshots(),
        fetchExDividendPlans(),
        fetchMarginShortSignals(),
        fetchMaterialInfoSignals(),
        fetchDayTradeRestrictions()
      ]);

    return {
      officialFlags: resolveSettled(officialFlagsResult, new Map<string, OfficialFlag>(), 'official flags'),
      profiles: resolveSettled(profilesResult, new Map<string, CompanyProfile>(), 'company profiles'),
      revenues: resolveSettled(revenuesResult, new Map<string, RevenueSnapshot>(), 'revenue snapshots'),
      exDividendPlans: resolveSettled(
        exDividendPlansResult,
        new Map<string, { exDate: string | null; daysUntil: number | null; kind: string | null; cashDividend: number | null; stockDividendRatio: number | null }>(),
        'ex-dividend plans'
      ),
      marginShortSignals: resolveSettled(
        marginShortSignalsResult,
        new Map<
          string,
          {
            marginBalance: number | null;
            marginUsagePct: number | null;
            marginChangePct: number | null;
            shortBalance: number | null;
            shortUsagePct: number | null;
            shortChangePct: number | null;
            offsetAmount: number | null;
          }
        >(),
        'margin and short signals'
      ),
      materialInfoSignals: resolveSettled(
        materialInfoSignalsResult,
        new Map<string, { count: number; latestTitle: string | null; latestDate: string | null }>(),
        'material info signals'
      ),
      dayTradeRestrictions: resolveSettled(
        dayTradeRestrictionsResult,
        new Map<string, { active: boolean; kinds: string[]; reason: string | null; startDate: string | null; endDate: string | null }>(),
        'day-trade restrictions'
      )
    };
  });
}

async function loadMarketBaseData(): Promise<MarketBaseData> {
  return withRuntimeCache('market-base-data', SHORT_LIVED_TTL_MS, async () => {
    const [twseQuotes, optionalData] = await Promise.all([fetchTwseQuotes(), loadOptionalMarketData()]);
    const { officialFlags, profiles, revenues, exDividendPlans, marginShortSignals, materialInfoSignals, dayTradeRestrictions } = optionalData;
    const enrichedQuotes = enrichQuotes(twseQuotes);
    const scoredUniverse = enrichedQuotes.map((quote) =>
      scoreQuote(
        quote,
        officialFlags.get(quote.code),
        profiles.get(quote.code),
        revenues.get(quote.code),
        exDividendPlans,
        marginShortSignals,
        materialInfoSignals,
        dayTradeRestrictions
      )
    );

    return {
      twseQuotes,
      optionalData,
      enrichedQuotes,
      scoredUniverse,
      marketPulse: buildMarketPulse(scoredUniverse)
    };
  });
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function averageClose(points: PriceHistoryPoint[], length: number): number | null {
  const slice = points.slice(-length);

  if (slice.length === 0) {
    return null;
  }

  return average(slice.map((point) => point.close));
}

function classifyMomentum(changePct: number, riseProbability: number, fallProbability: number): string {
  if (Math.abs(changePct) >= 7) {
    return changePct > 0 ? '過熱拉抬' : '跌勢失衡';
  }

  if (riseProbability >= 62) {
    return '偏多延續';
  }

  if (fallProbability >= 62) {
    return '偏空延續';
  }

  return '多空拉鋸';
}

async function fetchTwseQuotes(): Promise<NormalizedQuote[]> {
  const response = await fetch(TWSE_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TWSE request failed with ${response.status}`);
  }

  const data = (await response.json()) as RawTwseQuote[];

  return data
    .filter((quote) => /^\d{4}$/.test(quote.Code))
    .map((quote) => {
      const close = parseNumber(quote.ClosingPrice);
      const change = parseNumber(quote.Change);
      const previousClose = close - change;

      return {
        code: quote.Code,
        name: quote.Name,
        board: '上市' as const,
        date: quote.Date,
        open: parseNumber(quote.OpeningPrice),
        high: parseNumber(quote.HighestPrice),
        low: parseNumber(quote.LowestPrice),
        close,
        change,
        previousClose,
        volume: parseNumber(quote.TradeVolume),
        tradeValue: parseNumber(quote.TradeValue),
        transactionCount: parseNumber(quote.Transaction),
        nextLimitUp: Number.isFinite(previousClose) ? previousClose * 1.1 : null,
        nextLimitDown: Number.isFinite(previousClose) ? previousClose * 0.9 : null
      };
    })
    .filter(
      (quote) =>
        Number.isFinite(quote.open) &&
        Number.isFinite(quote.high) &&
        Number.isFinite(quote.low) &&
        Number.isFinite(quote.close) &&
        Number.isFinite(quote.change) &&
        Number.isFinite(quote.volume) &&
        Number.isFinite(quote.tradeValue) &&
        Number.isFinite(quote.transactionCount) &&
        quote.close > 0 &&
        quote.open > 0
    );
}

async function fetchOfficialFlags(): Promise<Map<string, OfficialFlag>> {
  const [noticeResponse, noteTransResponse, punishResponse] = await Promise.all([
    fetch(TWSE_NOTICE_URL, { cache: 'no-store' }),
    fetch(TWSE_NOTETRANS_URL, { cache: 'no-store' }),
    fetch(TWSE_PUNISH_URL, { cache: 'no-store' })
  ]);

  if (!noticeResponse.ok || !noteTransResponse.ok || !punishResponse.ok) {
    throw new Error('Official announcement request failed');
  }

  const notices = (await noticeResponse.json()) as RawNoticeRecord[];
  const noteTrans = (await noteTransResponse.json()) as RawNoteTransRecord[];
  const punish = (await punishResponse.json()) as RawPunishRecord[];
  const flags = new Map<string, OfficialFlag>();

  for (const item of noteTrans) {
    flags.set(item.Code, {
      status: '注意',
      headline: '近期待注意異常次數累積偏高',
      detail: item.RecentlyMetAttentionSecuritiesCriteria || null,
      announcementCount: 1
    });
  }

  for (const item of notices) {
    const count = parseNumber(item.NumberOfAnnouncement);

    flags.set(item.Code, {
      status: '注意',
      headline: item.TradingInfoForAttention || '當日列入注意股票',
      detail: item.Date ? `公告日 ${item.Date}` : null,
      announcementCount: Number.isFinite(count) ? count : 1
    });
  }

  for (const item of punish) {
    const count = parseNumber(item.NumberOfAnnouncement);

    flags.set(item.Code, {
      status: '處置',
      headline: item.ReasonsOfDisposition || '已公告處置股票',
      detail: [item.DispositionPeriod, item.DispositionMeasures, item.Detail].filter(Boolean).join('；') || null,
      announcementCount: Number.isFinite(count) ? count : 1
    });
  }

  return flags;
}

async function fetchCompanyProfiles(): Promise<Map<string, CompanyProfile>> {
  const response = await fetch(TWSE_COMPANY_INFO_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TWSE company profile request failed with ${response.status}`);
  }

  const data = (await response.json()) as RawCompanyProfile[];
  const profiles = new Map<string, CompanyProfile>();

  for (const item of data) {
    const code = item['公司代號'];

    if (!/^\d{4}$/.test(code)) {
      continue;
    }

    profiles.set(code, {
      code,
      name: item['公司名稱'],
      shortName: item['公司簡稱'],
      industry: normalizeText(item['產業別']) ?? '其他',
      address: normalizeText(item['住址']),
      chairman: normalizeText(item['董事長']),
      generalManager: normalizeText(item['總經理']),
      spokesperson: normalizeText(item['發言人']),
      phone: normalizeText(item['總機電話']),
      listedDate: normalizeText(item['上市日期']),
      paidInCapital: Number.isFinite(parseNumber(item['實收資本額'])) ? parseNumber(item['實收資本額']) : null,
      website: normalizeText(item['網址']),
      email: normalizeText(item['電子郵件信箱'])
    });
  }

  return profiles;
}

async function fetchRevenueSnapshots(): Promise<Map<string, RevenueSnapshot>> {
  const response = await fetch(TWSE_REVENUE_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TWSE revenue request failed with ${response.status}`);
  }

  const data = (await response.json()) as RawRevenueRecord[];
  const revenues = new Map<string, RevenueSnapshot>();

  for (const item of data) {
    const code = item['公司代號'];

    if (!/^\d{4}$/.test(code)) {
      continue;
    }

    const monthlyRevenue = parseNumber(item['營業收入-當月營收']);
    const previousMonthRevenue = parseNumber(item['營業收入-上月營收']);
    const lastYearRevenue = parseNumber(item['營業收入-去年當月營收']);
    const momPct = parseNumber(item['營業收入-上月比較增減(%)']);
    const yoyPct = parseNumber(item['營業收入-去年同月增減(%)']);
    const ytdPct = parseNumber(item['累計營業收入-前期比較增減(%)']);

    revenues.set(code, {
      period: item['資料年月'],
      monthlyRevenue: Number.isFinite(monthlyRevenue) ? monthlyRevenue : null,
      previousMonthRevenue: Number.isFinite(previousMonthRevenue) ? previousMonthRevenue : null,
      lastYearRevenue: Number.isFinite(lastYearRevenue) ? lastYearRevenue : null,
      momPct: Number.isFinite(momPct) ? round(momPct) : null,
      yoyPct: Number.isFinite(yoyPct) ? round(yoyPct) : null,
      ytdPct: Number.isFinite(ytdPct) ? round(ytdPct) : null
    });
  }

  return revenues;
}

async function fetchExDividendPlans(): Promise<
  Map<
    string,
    {
      exDate: string | null;
      daysUntil: number | null;
      kind: string | null;
      cashDividend: number | null;
      stockDividendRatio: number | null;
    }
  >
> {
  const response = await fetch(TWSE_EXDIVIDEND_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TWSE ex-dividend request failed with ${response.status}`);
  }

  const data = (await response.json()) as RawExDividendRecord[];
  const exDividendPlans = new Map<string, { exDate: string | null; daysUntil: number | null; kind: string | null; cashDividend: number | null; stockDividendRatio: number | null }>();

  for (const item of data) {
    if (!/^\d{4}$/.test(item.Code)) {
      continue;
    }

    const exDate = formatRocCompactDate(item.Date);
    const cashDividend = parseNumber(item.CashDividend);
    const stockDividendRatio = parseNumber(item.StockDividendRatio);

    exDividendPlans.set(item.Code, {
      exDate,
      daysUntil: daysUntil(exDate),
      kind: normalizeText(item.Exdividend),
      cashDividend: Number.isFinite(cashDividend) ? round(cashDividend, 4) : null,
      stockDividendRatio: Number.isFinite(stockDividendRatio) ? round(stockDividendRatio, 4) : null
    });
  }

  return exDividendPlans;
}

async function fetchMarginShortSignals(): Promise<
  Map<
    string,
    {
      marginBalance: number | null;
      marginUsagePct: number | null;
      marginChangePct: number | null;
      shortBalance: number | null;
      shortUsagePct: number | null;
      shortChangePct: number | null;
      offsetAmount: number | null;
    }
  >
> {
  const response = await fetch(TWSE_MARGIN_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TWSE margin request failed with ${response.status}`);
  }

  const data = (await response.json()) as RawMarginRecord[];
  const marginSignals = new Map<string, { marginBalance: number | null; marginUsagePct: number | null; marginChangePct: number | null; shortBalance: number | null; shortUsagePct: number | null; shortChangePct: number | null; offsetAmount: number | null }>();

  for (const item of data) {
    const code = item['股票代號'];

    if (!/^\d{4}$/.test(code)) {
      continue;
    }

    const marginPrev = parseNumber(item['融資前日餘額']);
    const marginToday = parseNumber(item['融資今日餘額']);
    const marginLimit = parseNumber(item['融資限額']);
    const shortPrev = parseNumber(item['融券前日餘額']);
    const shortToday = parseNumber(item['融券今日餘額']);
    const shortLimit = parseNumber(item['融券限額']);
    const offsetAmount = parseNumber(item['資券互抵']);

    marginSignals.set(code, {
      marginBalance: Number.isFinite(marginToday) ? Math.round(marginToday) : null,
      marginUsagePct: Number.isFinite(marginToday) && Number.isFinite(marginLimit) && marginLimit > 0 ? round((marginToday / marginLimit) * 100, 2) : null,
      marginChangePct: Number.isFinite(marginPrev) && marginPrev > 0 && Number.isFinite(marginToday) ? round(((marginToday - marginPrev) / marginPrev) * 100, 2) : null,
      shortBalance: Number.isFinite(shortToday) ? Math.round(shortToday) : null,
      shortUsagePct: Number.isFinite(shortToday) && Number.isFinite(shortLimit) && shortLimit > 0 ? round((shortToday / shortLimit) * 100, 2) : null,
      shortChangePct: Number.isFinite(shortPrev) && shortPrev > 0 && Number.isFinite(shortToday) ? round(((shortToday - shortPrev) / shortPrev) * 100, 2) : null,
      offsetAmount: Number.isFinite(offsetAmount) ? Math.round(offsetAmount) : null
    });
  }

  return marginSignals;
}

async function fetchMaterialInfoSignals(): Promise<Map<string, { count: number; latestTitle: string | null; latestDate: string | null }>> {
  const response = await fetch(TWSE_MATERIAL_INFO_URL, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`TWSE material info request failed with ${response.status}`);
  }

  const data = (await response.json()) as RawMaterialInfoRecord[];
  const materialSignals = new Map<string, { count: number; latestTitle: string | null; latestDate: string | null }>();

  for (const item of data) {
    const code = item['公司代號'];

    if (!/^\d{4}$/.test(code)) {
      continue;
    }

    const current = materialSignals.get(code) ?? { count: 0, latestTitle: null, latestDate: null };
    materialSignals.set(code, {
      count: current.count + 1,
      latestTitle: current.latestTitle ?? normalizeText(item['主旨 ']),
      latestDate: current.latestDate ?? formatRocCompactDate(item['事實發生日']) ?? formatRocCompactDate(item['發言日期'])
    });
  }

  return materialSignals;
}

async function fetchDayTradeRestrictions(): Promise<
  Map<
    string,
    {
      active: boolean;
      kinds: string[];
      reason: string | null;
      startDate: string | null;
      endDate: string | null;
    }
  >
> {
  const [buyFirstResponse, sellFirstResponse] = await Promise.all([
    fetch(TWSE_DAY_TRADE_BUY_FIRST_URL, { cache: 'no-store' }),
    fetch(TWSE_DAY_TRADE_SELL_FIRST_URL, { cache: 'no-store' })
  ]);

  if (!buyFirstResponse.ok || !sellFirstResponse.ok) {
    throw new Error('TWSE day-trade restriction request failed');
  }

  const buyFirst = (await buyFirstResponse.json()) as RawDayTradeRestrictionRecord[];
  const sellFirst = (await sellFirstResponse.json()) as RawDayTradeRestrictionRecord[];
  const restrictions = new Map<string, { active: boolean; kinds: string[]; reason: string | null; startDate: string | null; endDate: string | null }>();

  const merge = (item: RawDayTradeRestrictionRecord, kind: string) => {
    if (!/^\d{4}$/.test(item.Code)) {
      return;
    }

    const current = restrictions.get(item.Code) ?? {
      active: true,
      kinds: [],
      reason: null,
      startDate: null,
      endDate: null
    };

    restrictions.set(item.Code, {
      active: true,
      kinds: current.kinds.includes(kind) ? current.kinds : [...current.kinds, kind],
      reason: current.reason ?? normalizeText(item.Reason),
      startDate: current.startDate ?? formatRocCompactDate(item.StartDate),
      endDate: current.endDate ?? formatRocCompactDate(item.EndDate)
    });
  };

  for (const item of buyFirst) {
    merge(item, '停止先買後賣');
  }

  for (const item of sellFirst) {
    merge(item, '停止先賣後買');
  }

  return restrictions;
}

function enrichQuotes(quotes: NormalizedQuote[]): EnrichedQuote[] {
  const tradeValues = quotes.map((quote) => quote.tradeValue);
  const volumes = quotes.map((quote) => quote.volume);
  const transactionCounts = quotes.map((quote) => quote.transactionCount);

  const enriched = quotes.map((quote) => {
    const changePct = quote.previousClose > 0 ? (quote.change / quote.previousClose) * 100 : 0;
    const intradayRangePct = quote.open > 0 ? ((quote.high - quote.low) / quote.open) * 100 : 0;
    const rangeSpan = Math.max(quote.high - quote.low, 0.01);
    const closeToHigh = clamp(1 - (quote.high - quote.close) / rangeSpan, 0, 1);
    const closeToLow = clamp(1 - (quote.close - quote.low) / rangeSpan, 0, 1);
    const limitReference = quote.previousClose > 0 ? quote.previousClose * 0.1 : 0;
    const nextLimitTarget = quote.change >= 0 ? quote.nextLimitUp : quote.nextLimitDown;
    const distanceToLimit =
      nextLimitTarget && Number.isFinite(nextLimitTarget) ? Math.abs(nextLimitTarget - quote.close) : Number.POSITIVE_INFINITY;
    const limitPressure =
      limitReference > 0 && Number.isFinite(distanceToLimit)
        ? clamp(1 - distanceToLimit / Math.max(limitReference, 0.01), 0, 1)
        : 0;

    return {
      ...quote,
      changePct,
      intradayRangePct,
      closeToHigh,
      closeToLow,
      tradeValuePct: percentileRank(tradeValues, quote.tradeValue),
      volumePct: percentileRank(volumes, quote.volume),
      transactionPct: percentileRank(transactionCounts, quote.transactionCount),
      absMovePct: Math.abs(changePct),
      absMovePctRank: 0,
      volatilityRank: 0,
      crowdingRank: 0,
      limitPressure
    };
  });

  const moveValues = enriched.map((quote) => quote.absMovePct);
  const volatilityValues = enriched.map((quote) => quote.intradayRangePct);
  const crowdingValues = enriched.map((quote) => quote.tradeValuePct * 0.5 + quote.transactionPct * 0.3 + quote.volumePct * 0.2);

  return enriched.map((quote) => ({
    ...quote,
    absMovePctRank: percentileRank(moveValues, quote.absMovePct),
    volatilityRank: percentileRank(volatilityValues, quote.intradayRangePct),
    crowdingRank: percentileRank(
      crowdingValues,
      quote.tradeValuePct * 0.5 + quote.transactionPct * 0.3 + quote.volumePct * 0.2
    )
  }));
}

function buildReasons(quote: EnrichedQuote, dispositionProbability: number, officialFlag: OfficialFlag | undefined): string[] {
  const reasons: string[] = [];

  if (officialFlag?.status === '處置') {
    reasons.push(`官方處置中: ${officialFlag.headline ?? '已公告處置股票'}`);
  }

  if (officialFlag?.status === '注意') {
    reasons.push(`官方注意股: ${officialFlag.headline ?? '當日列入注意股票'}`);
  }

  if (quote.changePct >= 6) {
    reasons.push(`當日漲幅 ${round(quote.changePct, 1)}%，已接近常見異常波動門檻`);
  }

  if (quote.changePct <= -6) {
    reasons.push(`當日跌幅 ${round(Math.abs(quote.changePct), 1)}%，空方壓力偏重`);
  }

  if (quote.intradayRangePct >= 8) {
    reasons.push(`盤中振幅 ${round(quote.intradayRangePct, 1)}%，屬高波動族群`);
  }

  if (quote.crowdingRank >= 0.9) {
    reasons.push(`成交熱度進入市場前 10%，成交金額約 ${formatCurrency(quote.tradeValue)}`);
  }

  if (quote.transactionPct >= 0.88) {
    reasons.push('成交筆數高度集中，短線追價與沖銷訊號明顯');
  }

  if (quote.limitPressure >= 0.8) {
    reasons.push('收盤貼近漲跌停區，隔日容易觸發監理關注');
  }

  if (quote.closeToHigh >= 0.85 && quote.changePct > 0) {
    reasons.push('收盤貼近日高，資金仍偏向追價延續');
  }

  if (quote.closeToLow >= 0.85 && quote.changePct < 0) {
    reasons.push('收盤貼近日低，賣壓未見明顯緩和');
  }

  if (dispositionProbability >= 75 && reasons.length < 3) {
    reasons.push('多項異常交易訊號同步升高，屬高風險觀察名單');
  }

  return reasons.slice(0, 4);
}

function buildRuleFacts(
  code: string,
  exDividendPlans: Map<string, RuleFacts['exDividend']>,
  marginShortSignals: Map<string, RuleFacts['marginShort']>,
  materialInfoSignals: Map<string, RuleFacts['materialInfo']>,
  dayTradeRestrictions: Map<string, RuleFacts['dayTradeRestriction']>
): RuleFacts {
  return {
    exDividend: exDividendPlans.get(code) ?? {
      exDate: null,
      daysUntil: null,
      kind: null,
      cashDividend: null,
      stockDividendRatio: null
    },
    marginShort: marginShortSignals.get(code) ?? {
      marginBalance: null,
      marginUsagePct: null,
      marginChangePct: null,
      shortBalance: null,
      shortUsagePct: null,
      shortChangePct: null,
      offsetAmount: null
    },
    materialInfo: materialInfoSignals.get(code) ?? {
      count: 0,
      latestTitle: null,
      latestDate: null
    },
    dayTradeRestriction: dayTradeRestrictions.get(code) ?? {
      active: false,
      kinds: [],
      reason: null,
      startDate: null,
      endDate: null
    }
  };
}

function buildRuleSignals(item: Pick<StockRiskItem, 'changePct'> & { ruleFacts: RuleFacts }): RuleSignal[] {
  const signals: RuleSignal[] = [];
  const { exDividend, marginShort, materialInfo, dayTradeRestriction } = item.ruleFacts;

  if (exDividend.daysUntil !== null && exDividend.daysUntil >= 0 && exDividend.daysUntil <= 14) {
    signals.push({
      category: '除權息',
      direction: '偏空',
      severity: exDividend.daysUntil <= 5 ? '中' : '低',
      summary: `${exDividend.exDate} 有${exDividend.kind ?? '除權息'}事件，除息日附近會有理論價格下調壓力。`,
      source: 'TWSE TWT48U_ALL'
    });
  }

  if ((marginShort.marginChangePct ?? 0) <= -3 && item.changePct < 0) {
    signals.push({
      category: '融資融券',
      direction: '偏空',
      severity: '中',
      summary: `融資餘額日減 ${marginShort.marginChangePct}% 且股價同步轉弱，需提防去槓桿賣壓。`,
      source: 'TWSE MI_MARGN'
    });
  }

  if ((marginShort.shortChangePct ?? 0) >= 5 && item.changePct < 0) {
    signals.push({
      category: '融資融券',
      direction: '偏空',
      severity: '中',
      summary: `融券餘額日增 ${marginShort.shortChangePct}% ，空方部位有擴大跡象。`,
      source: 'TWSE MI_MARGN'
    });
  }

  if ((marginShort.shortChangePct ?? 0) <= -5 && item.changePct > 3) {
    signals.push({
      category: '融資融券',
      direction: '偏多',
      severity: '中',
      summary: `融券餘額日減 ${Math.abs(marginShort.shortChangePct ?? 0)}% 且股價走強，可能有回補推升。`,
      source: 'TWSE MI_MARGN'
    });
  }

  if (materialInfo.count > 0) {
    signals.push({
      category: '重大訊息',
      direction: '中性',
      severity: materialInfo.count >= 2 ? '中' : '低',
      summary: `近期有 ${materialInfo.count} 筆重大訊息，最新主旨為「${materialInfo.latestTitle ?? '未提供'}」。`,
      source: 'TWSE t187ap04_L'
    });
  }

  if (dayTradeRestriction.active) {
    signals.push({
      category: '當沖限制',
      direction: '偏空',
      severity: '中',
      summary: `${dayTradeRestriction.kinds.join('、')} 生效中，短線流動性與沖銷力道會下降。`,
      source: 'TWSE TWTBAU1/TWTBAU2'
    });
  }

  return signals;
}

function scoreQuote(
  quote: EnrichedQuote,
  officialFlag: OfficialFlag | undefined,
  profile: CompanyProfile | undefined,
  revenue: RevenueSnapshot | undefined,
  exDividendPlans: Map<string, RuleFacts['exDividend']>,
  marginShortSignals: Map<string, RuleFacts['marginShort']>,
  materialInfoSignals: Map<string, RuleFacts['materialInfo']>,
  dayTradeRestrictions: Map<string, RuleFacts['dayTradeRestriction']>
): StockRiskItem {
  const ruleFacts = buildRuleFacts(quote.code, exDividendPlans, marginShortSignals, materialInfoSignals, dayTradeRestrictions);
  const ruleSignals = buildRuleSignals({ changePct: round(quote.changePct), ruleFacts });
  const positiveImpulse = clamp(quote.changePct / 9, 0, 1);
  const negativeImpulse = clamp(-quote.changePct / 9, 0, 1);
  const movePressure = clamp(quote.absMovePct / 9, 0, 1);
  const officialBoost = officialFlag?.status === '處置' ? 0.24 : officialFlag?.status === '注意' ? 0.14 : 0;
  const exDividendAdjustment = ruleFacts.exDividend.daysUntil !== null && ruleFacts.exDividend.daysUntil >= 0 && ruleFacts.exDividend.daysUntil <= 5 ? 0.04 : 0;
  const marginBearishAdjustment = (ruleFacts.marginShort.marginChangePct ?? 0) <= -3 && quote.changePct < 0 ? 0.04 : 0;
  const shortBearishAdjustment = (ruleFacts.marginShort.shortChangePct ?? 0) >= 5 && quote.changePct < 0 ? 0.04 : 0;
  const shortCoveringAdjustment = (ruleFacts.marginShort.shortChangePct ?? 0) <= -5 && quote.changePct > 3 ? 0.04 : 0;
  const materialInfoAdjustment = ruleFacts.materialInfo.count > 0 ? 0.03 : 0;
  const dayTradeRestrictionAdjustment = ruleFacts.dayTradeRestriction.active ? 0.04 : 0;
  const dispositionScore =
    movePressure * 0.26 +
    quote.volatilityRank * 0.2 +
    quote.crowdingRank * 0.22 +
    quote.limitPressure * 0.12 +
    Math.max(quote.closeToHigh, quote.closeToLow) * 0.08 +
    quote.transactionPct * 0.06 +
    officialBoost +
    materialInfoAdjustment +
    dayTradeRestrictionAdjustment;
  let dispositionProbability = Math.round(clamp(dispositionScore, 0.08, 0.99) * 100);

  if (officialFlag?.status === '處置') {
    dispositionProbability = Math.max(dispositionProbability, 95);
  }

  if (officialFlag?.status === '注意') {
    dispositionProbability = Math.max(dispositionProbability, 82);
  }

  const riseSignal =
    0.44 +
    positiveImpulse * 0.26 +
    quote.closeToHigh * 0.14 +
    quote.crowdingRank * 0.08 -
    negativeImpulse * 0.18 -
    (officialFlag?.status === '處置' ? 0.04 : 0) +
    shortCoveringAdjustment -
    exDividendAdjustment;
  const fallSignal =
    0.44 +
    negativeImpulse * 0.26 +
    quote.closeToLow * 0.14 +
    quote.crowdingRank * 0.08 -
    positiveImpulse * 0.18 +
    (officialFlag?.status === '處置' ? 0.04 : 0) +
    exDividendAdjustment +
    marginBearishAdjustment +
    shortBearishAdjustment +
    dayTradeRestrictionAdjustment;
  const totalSignal = Math.max(riseSignal + fallSignal, 0.01);
  const riseProbability = Math.round(clamp((riseSignal / totalSignal) * 100, 5, 95));
  const fallProbability = 100 - riseProbability;

  return {
    code: quote.code,
    name: quote.name,
    board: quote.board,
    industry: profile?.industry ?? '其他',
    close: round(quote.close),
    change: round(quote.change),
    changePct: round(quote.changePct),
    tradeValue: Math.round(quote.tradeValue),
    volume: Math.round(quote.volume),
    transactionCount: Math.round(quote.transactionCount),
    dispositionProbability,
    riseProbability,
    fallProbability,
    momentumLabel: classifyMomentum(quote.changePct, riseProbability, fallProbability),
    officialStatus: officialFlag?.status ?? '模型觀察',
    officialReference: officialFlag?.detail ?? officialFlag?.headline ?? null,
    officialAnnouncementCount: officialFlag?.announcementCount ?? 0,
    trend7dPct: null,
    priceHistory: [],
    revenue: revenue ?? null,
    eventPlan: {
      phase: '事件觀察',
      bias: '中性等待',
      summary: '等待歷史與市況資料補齊後再判斷是否進入事件交易段。',
      tactics: [],
      timeline: []
    },
    ruleFacts,
    ruleSignals,
    tradePlan: {
      stance: '只觀察',
      preferredSide: '觀望',
      summary: '等待歷史與市況資料補齊後再評估進出場。',
      entry: null,
      takeProfit: null,
      stopLoss: null,
      riskRewardRatio: null,
      primarySetup: null,
      alternateSetup: null,
      dimensionAnalysis: {
        fundamental: [],
        chip: [],
        technical: [],
        priceVolume: []
      }
    },
    diagnostics: {
      crowdingRank: round(quote.crowdingRank, 4),
      volatilityRank: round(quote.volatilityRank, 4),
      closeToHigh: round(quote.closeToHigh, 4),
      closeToLow: round(quote.closeToLow, 4),
      limitPressure: round(quote.limitPressure, 4),
      tradeValuePct: round(quote.tradeValuePct, 4),
      transactionPct: round(quote.transactionPct, 4)
    },
    reasons: buildReasons(quote, dispositionProbability, officialFlag)
  };
}

async function fetchYahooHistory(code: string, range: '1mo' | '3mo' = '1mo'): Promise<PriceHistoryPoint[]> {
  return withRuntimeCache(`yahoo-history:${code}:${range}`, HISTORY_TTL_MS, async () => {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${code}.TW?range=${range}&interval=1d`;

    try {
      const response = await fetch(url, {
        cache: 'no-store',
        headers: {
          Accept: 'application/json'
        }
      });

      if (!response.ok) {
        return [];
      }

      const payload = (await response.json()) as YahooChartResponse;
      const result = payload.chart?.result?.[0];
      const timestamps = result?.timestamp ?? [];
      const closes = result?.indicators?.quote?.[0]?.close ?? [];
      const history: PriceHistoryPoint[] = [];

      for (let index = 0; index < timestamps.length; index += 1) {
        const close = closes[index];

        if (close === null || !Number.isFinite(close)) {
          continue;
        }

        history.push({
          date: formatIsoDate(timestamps[index]),
          close: round(close)
        });
      }

      return history;
    } catch {
      return [];
    }
  });
}

function attachHistory(item: StockRiskItem, history: PriceHistoryPoint[]): StockRiskItem {
  const recentHistory = history.slice(-7);

  if (recentHistory.length < 2) {
    return {
      ...item,
      priceHistory: recentHistory,
      trend7dPct: null
    };
  }

  const firstClose = recentHistory[0].close;
  const lastClose = recentHistory[recentHistory.length - 1].close;
  const trend7dPct = firstClose > 0 ? round(((lastClose - firstClose) / firstClose) * 100) : null;

  return {
    ...item,
    priceHistory: recentHistory,
    trend7dPct
  };
}

function buildMarketPulse(items: StockRiskItem[]): MarketPulse {
  const advancers = items.filter((item) => item.changePct > 0).length;
  const decliners = items.filter((item) => item.changePct < 0).length;
  const flatCount = items.length - advancers - decliners;
  const averageChangePct = round(average(items.map((item) => item.changePct)));
  const breadthPct = items.length > 0 ? round(((advancers - decliners) / items.length) * 100) : 0;
  const industryTradeValue = new Map<string, number>();

  for (const item of items) {
    industryTradeValue.set(item.industry, (industryTradeValue.get(item.industry) ?? 0) + item.tradeValue);
  }

  const hotIndustries = [...industryTradeValue.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(([industry]) => industry);

  let stance: MarketPulse['stance'] = '中性震盪';
  let summary = '市場多空拉鋸，適合縮小部位、等待較乾淨的突破。';

  if (breadthPct >= 12 && averageChangePct >= 0.35) {
    stance = '偏多順風';
    summary = '上漲家數與平均漲幅都偏強，追價策略可放寬，但仍要避開官方處置股。';
  } else if (breadthPct <= -12 && averageChangePct <= -0.35) {
    stance = '偏空保守';
    summary = '下跌家數明顯占優，建議優先觀察支撐是否有效，避免追高。';
  }

  const notes = [
    `上漲 ${advancers} 檔、下跌 ${decliners} 檔、平盤 ${flatCount} 檔。`,
    `全體平均日變動 ${averageChangePct}% ，市場寬度 ${breadthPct}%。`,
    `成交最熱的產業目前是 ${hotIndustries.join('、') || '暫無明顯集中'}。`
  ];

  return {
    stance,
    summary,
    advancers,
    decliners,
    flatCount,
    averageChangePct,
    breadthPct,
    hotIndustries,
    notes
  };
}

function buildEventPlan(item: StockRiskItem, history: PriceHistoryPoint[]): EventPlan {
  const recentSupport = history.length > 0 ? Math.min(...history.slice(-5).map((point) => point.close)) : item.close * 0.97;
  const recentResistance = history.length > 0 ? Math.max(...history.slice(-10).map((point) => point.close)) : item.close * 1.05;

  if (item.officialStatus === '處置') {
    const reboundReady = item.changePct <= -2.5 || item.diagnostics.closeToLow >= 0.8 || (item.trend7dPct ?? 0) <= -6;

    return {
      phase: '已進處置',
      bias: reboundReady ? '偏多事件段' : '中性等待',
      summary: reboundReady
        ? '已進處置後不再追空，優先等急跌後的止穩反彈，再評估隔日或短波段多方切入。'
        : '已進處置但賣壓尚未充分宣洩，先觀察量縮止穩，不急著預判反彈。',
      tactics: [
        `先看 ${round(recentSupport).toFixed(2)} 附近能否止跌，未止穩前不搶反彈。`,
        `若重新站回 ${round(item.close).toFixed(2)} 到 ${round(recentResistance).toFixed(2)} 區間，可視為反彈確認帶。`,
        '處置期間波動大，若要參與反彈，部位與停損都要比一般個股更保守。'
      ],
      timeline: [
        '事件第 1 段: 已被交易所列入處置，短線流動性與交易節奏都會改變。',
        '事件第 2 段: 觀察急跌是否轉為量縮止穩，這是多方劇本能否成立的核心。',
        '事件第 3 段: 真正偏多的機會通常出現在處置後段或解除後，而不是第一時間硬接。'
      ]
    };
  }

  if (item.officialStatus === '注意' || item.dispositionProbability >= 78) {
    return {
      phase: '快進處置',
      bias: '偏空事件段',
      summary: '熱度、波動與監理風險同步升高，這一段以失守支撐後的空方劇本優先，避免逆勢追價。',
      tactics: [
        `先看 ${round(recentSupport).toFixed(2)} 是否失守，跌破後才算進入空方延續段。`,
        `若重新站上 ${round(recentResistance).toFixed(2)} 並且量縮，空方劇本就要降級。`,
        '這一段核心不是猜最高點，而是等市場自己證明追價資金開始鬆動。'
      ],
      timeline: [
        '事件第 1 段: 官方注意或模型風險快速升高，代表正逼近正式處置。',
        '事件第 2 段: 若量價轉弱且收盤失守支撐，通常是偏空劇本最有效率的區間。',
        '事件第 3 段: 一旦真的進入處置，空方優勢通常下降，策略會轉成等待止跌。'
      ]
    };
  }

  return {
    phase: '事件觀察',
    bias: '中性等待',
    summary: '目前還在監控階段，沒有進入明確的處置事件段，先保留在觀察池。',
    tactics: [
      '先觀察是否出現官方注意、異常爆量或連續急漲急跌。',
      '若事件沒有持續升溫，就不需要用處置題材的角度硬做。',
      '這類股票更適合回到一般趨勢與基本面判讀。'
    ],
    timeline: [
      '事件第 1 段: 模型偵測到熱度，但還不足以形成明確事件交易。',
      '事件第 2 段: 若後續出現官方注意或波動擴大，再升級為快進處置。',
      '事件第 3 段: 若熱度降溫，則回到一般觀察名單。'
    ]
  };
}

function buildTradePlan(item: StockRiskItem, history: PriceHistoryPoint[], marketPulse: MarketPulse, eventPlan: EventPlan): TradePlan {
  const closes = history.map((point) => point.close);
  const recent5 = history.slice(-5);
  const recent20 = history.slice(-20);
  const support = recent5.length > 0 ? Math.min(...recent5.map((point) => point.close)) : item.close * 0.97;
  const resistance = recent20.length > 0 ? Math.max(...recent20.map((point) => point.close)) : item.close * 1.05;
  const ma5 = averageClose(history, 5);
  const ma20 = averageClose(history, 20);
  const revenue = item.revenue;

  const fundamental: string[] = [];
  const chip: string[] = [];
  const technical: string[] = [];
  const priceVolume: string[] = [];

  if (revenue?.yoyPct != null) {
    fundamental.push(`最新月營收年增 ${revenue.yoyPct}% 。`);
  } else {
    fundamental.push('暫時沒有完整月營收變化，基本面權重降低。');
  }

  if (revenue?.momPct != null) {
    fundamental.push(`月增 ${revenue.momPct}% ，可用來觀察短期需求是否轉強。`);
  }

  if (revenue?.ytdPct != null) {
    fundamental.push(`累計營收年增 ${revenue.ytdPct}% 。`);
  }

  if (item.officialStatus === '處置') {
    chip.push('官方已列處置股，籌碼穩定度差，短打容錯很低。');
  } else if (item.officialStatus === '注意') {
    chip.push('官方注意股代表短線籌碼過熱，需降低追價意願。');
  } else {
    chip.push('未落入官方名單，籌碼壓力主要來自市場交易熱度而非監理直接限制。');
  }

  if (item.officialAnnouncementCount > 0) {
    chip.push(`近期公告 ${item.officialAnnouncementCount} 筆，籌碼波動仍偏大。`);
  }

  chip.push(`事件位置屬於 ${eventPlan.phase}，目前偏向 ${eventPlan.bias}。`);

  if (item.ruleSignals.length > 0) {
    chip.push(`額外制度規則命中 ${item.ruleSignals.length} 項，需一起納入判斷。`);
  }

  if (item.diagnostics.crowdingRank >= 0.85) {
    chip.push('成交熱度落在市場前段，代表籌碼集中且短線資金活躍。');
  } else {
    chip.push('交易熱度未過度擁擠，較不容易出現單日過熱反轉。');
  }

  if (ma5 !== null && ma20 !== null) {
    technical.push(`5 日均價約 ${round(ma5).toFixed(2)}，20 日均價約 ${round(ma20).toFixed(2)}。`);
    technical.push(ma5 >= ma20 ? '短均線仍在長均線之上，技術結構偏多。' : '短均線跌回長均線下方，技術結構偏弱。');
  } else {
    technical.push('歷史資料不足，技術結構以近 7 日斜率替代。');
  }

  if (item.trend7dPct !== null) {
    technical.push(`近 7 日變動 ${item.trend7dPct}% 。`);
  }

  technical.push(item.close >= resistance * 0.98 ? '收盤已逼近近 20 日壓力帶，突破後才有空間。' : '收盤仍在壓力帶下方，宜等確認。');

  priceVolume.push(`當日成交金額約 ${formatCurrency(item.tradeValue)}，成交量 ${Math.round(item.volume).toLocaleString('zh-TW')} 股。`);
  priceVolume.push(item.diagnostics.closeToHigh >= 0.8 ? '收盤接近日高，代表尾盤買盤仍有承接。' : '收盤未站穩日高，追價力道仍需觀察。');
  priceVolume.push(item.diagnostics.volatilityRank >= 0.85 ? '盤中振幅偏大，進場價需貼近支撐才能控制風險。' : '盤中振幅尚可，停損可設在短線支撐下方。');

  if (marketPulse.stance === '偏空保守') {
    priceVolume.push('整體市況偏空，進場需等更明確的量價確認。');
  } else if (marketPulse.stance === '偏多順風') {
    priceVolume.push('整體市況偏多，突破壓力後的延續性相對較好。');
  }

  const fundamentalScore =
    ((revenue?.yoyPct ?? -3) >= 0 ? 1 : 0) +
    ((revenue?.momPct ?? -3) >= 0 ? 1 : 0) +
    ((revenue?.ytdPct ?? -3) >= 0 ? 1 : 0);
  const chipScore = item.officialStatus === '處置' ? -2 : item.officialStatus === '注意' ? -1 : 1;
  const technicalScore =
    (ma5 !== null && ma20 !== null && ma5 >= ma20 ? 1 : 0) +
    ((item.trend7dPct ?? -1) > 0 ? 1 : 0) +
    (item.close >= support ? 1 : 0);
  const volumeScore =
    (item.diagnostics.closeToHigh >= 0.75 ? 1 : 0) +
    (item.diagnostics.crowdingRank >= 0.65 && item.diagnostics.crowdingRank <= 0.93 ? 1 : 0) -
    (item.diagnostics.volatilityRank >= 0.92 ? 1 : 0);
  const marketAdjustment = marketPulse.stance === '偏多順風' ? 1 : marketPulse.stance === '偏空保守' ? -1 : 0;
  const compositeScore = fundamentalScore + chipScore + technicalScore + volumeScore + marketAdjustment;

  let stance: TradePlan['stance'] = '只觀察';
  if (item.officialStatus === '處置') {
    stance = '避免進場';
  } else if (compositeScore >= 5 && item.riseProbability >= 56) {
    stance = '可進場';
  } else if (compositeScore >= 2) {
    stance = '等待突破';
  } else if (compositeScore <= 0) {
    stance = '避免進場';
  }

  if (eventPlan.phase === '快進處置' && stance === '可進場') {
    stance = '等待突破';
  }

  if (eventPlan.phase === '快進處置' && item.fallProbability >= 55) {
    stance = '避免進場';
  }

  const conservativeEntry = Math.max(support * 1.01, item.close * 0.985);
  const breakoutEntry = Math.max(item.close * 1.005, resistance * 1.003);
  const entryPrice = round(stance === '可進場' ? conservativeEntry : breakoutEntry);
  const stopLossPrice = round(Math.min(support * 0.985, entryPrice * 0.97));
  const targetPrice = round(Math.max(entryPrice * 1.06, resistance * 1.03));
  const longRiskRewardRatio = entryPrice > stopLossPrice ? round((targetPrice - entryPrice) / Math.max(entryPrice - stopLossPrice, 0.01), 2) : null;

  const shortEntryPrice = round(Math.min(item.close * 0.995, support * 0.997));
  const shortCoverPrice = round(Math.min(shortEntryPrice * 0.93, support * 0.95));
  const shortStopPrice = round(Math.max(resistance * 1.015, shortEntryPrice * 1.03));
  const shortRiskRewardRatio = shortStopPrice > shortEntryPrice ? round((shortEntryPrice - shortCoverPrice) / Math.max(shortStopPrice - shortEntryPrice, 0.01), 2) : null;

  const entryReasons = [
    `技術面以 ${round(support).toFixed(2)} 附近做短線支撐，進場價抓在 ${entryPrice.toFixed(2)} 比較能貼近風險界線。`,
    `籌碼面 ${chip[0] ?? '目前沒有明顯監理壓力。'}`,
    `基本面 ${fundamental[0] ?? '暫無明顯正向催化。'}`,
    `價量面 ${priceVolume[1] ?? '量價結構中性。'}`
  ];

  const takeProfitReasons = [
    `技術面先看近 20 日壓力與延伸目標，出場價抓在 ${targetPrice.toFixed(2)}。`,
    `若突破後量價延續不足，接近壓力區應優先分批落袋。`,
    `以目前設定估算，風險報酬比約 ${longRiskRewardRatio ?? '暫無'}。`
  ];

  const stopLossReasons = [
    `停損價 ${stopLossPrice.toFixed(2)} 低於近端支撐，跌破代表技術假設失效。`,
    `若跌破後仍伴隨放量，代表價量轉弱，應先退場。`,
    `市況 ${marketPulse.stance} 時，支撐失守的修復速度通常較慢。`
  ];

  const shortEntryReasons = [
    `技術面先看 ${round(support).toFixed(2)} 支撐是否失守，做空進場價抓在 ${shortEntryPrice.toFixed(2)}，代表跌破後再跟。`,
    `籌碼面 ${chip[0] ?? '短線資金有轉弱跡象。'}`,
    `價量面 ${item.diagnostics.closeToLow >= 0.8 ? '收盤貼近日低，代表空方收盤前仍占優。' : '若收盤再度跌回支撐下方，空方延續性會更完整。'}`,
    `事件面 ${eventPlan.summary}`
  ];

  const shortCoverReasons = [
    `第一回補目標抓在 ${shortCoverPrice.toFixed(2)}，優先對應支撐跌破後的延伸跌幅。`,
    '若跌到目標區但沒有再放量，可先分批回補，避免把空單抱成反彈。',
    `以目前設定估算，空方風險報酬比約 ${shortRiskRewardRatio ?? '暫無'}。`
  ];

  const shortStopReasons = [
    `空方停損價設在 ${shortStopPrice.toFixed(2)}，重新站回壓力帶代表空方劇本失效。`,
    '若跌破支撐後又快速站回，通常是空方陷阱，應先撤退。',
    `整體市況 ${marketPulse.stance} 時，偏多市況更不適合硬抱空單。`
  ];

  const summaryByStance: Record<TradePlan['stance'], string> = {
    可進場: '四面向分數偏正向，可用貼近支撐的方式嘗試小部位進場。',
    等待突破: eventPlan.phase === '快進處置' ? '事件仍在升溫，先等空方段落結束或重新站回壓力後再評估。' : '方向有機會，但仍需要站上壓力或等量價再確認。',
    只觀察: '目前訊號不夠集中，保留在觀察名單即可。',
    避免進場: eventPlan.phase === '快進處置' ? '事件偏空段仍在進行，現階段不建議做多搶進。' : '監理、技術或市況條件不利，現階段不建議進場。'
  };

  const longSetup: TradeSetup = {
    side: '做多',
    summary: summaryByStance[stance],
    entryLabel: '建議進場',
    exitLabel: '建議停利',
    stopLabel: '建議停損',
    entry: stance === '避免進場' ? null : { price: entryPrice, reasons: entryReasons },
    exit: stance === '避免進場' ? null : { price: targetPrice, reasons: takeProfitReasons },
    stopLoss: stance === '避免進場' ? null : { price: stopLossPrice, reasons: stopLossReasons },
    riskRewardRatio: longRiskRewardRatio
  };

  const shortSetup: TradeSetup | null = eventPlan.phase === '快進處置' || eventPlan.bias === '偏空事件段'
    ? {
        side: '做空',
        summary: '空方劇本以跌破支撐後跟隨為主，不預設在強勢鎖漲停時硬空。',
        entryLabel: '做空進場',
        exitLabel: '回補目標',
        stopLabel: '空方停損',
        entry: { price: shortEntryPrice, reasons: shortEntryReasons },
        exit: { price: shortCoverPrice, reasons: shortCoverReasons },
        stopLoss: { price: shortStopPrice, reasons: shortStopReasons },
        riskRewardRatio: shortRiskRewardRatio
      }
    : null;

  const preferredSide: TradePlan['preferredSide'] = shortSetup ? '做空' : stance === '避免進場' ? '觀望' : '做多';
  const primarySetup = preferredSide === '做空' ? shortSetup : stance === '避免進場' ? null : longSetup;
  const alternateSetup = preferredSide === '做空' ? (stance === '避免進場' ? null : longSetup) : shortSetup;
  const primarySummary = primarySetup?.summary ?? summaryByStance[stance];

  return {
    stance,
    preferredSide,
    summary: primarySummary,
    entry: primarySetup?.entry ?? null,
    takeProfit: primarySetup?.exit ?? null,
    stopLoss: primarySetup?.stopLoss ?? null,
    riskRewardRatio: primarySetup?.riskRewardRatio ?? null,
    primarySetup,
    alternateSetup,
    dimensionAnalysis: {
      fundamental,
      chip,
      technical,
      priceVolume
    }
  };
}

function finalizeItem(item: StockRiskItem, history: PriceHistoryPoint[], marketPulse: MarketPulse): StockRiskItem {
  const withHistory = attachHistory(item, history);
  const eventPlan = buildEventPlan(withHistory, history);

  return {
    ...withHistory,
    eventPlan,
    tradePlan: buildTradePlan(withHistory, history, marketPulse, eventPlan)
  };
}

async function enrichWithHistory(items: StockRiskItem[], marketPulse: MarketPulse): Promise<StockRiskItem[]> {
  const histories = await Promise.all(items.map((item) => fetchYahooHistory(item.code, '1mo')));
  return items.map((item, index) => finalizeItem(item, histories[index] ?? [], marketPulse));
}

function uniqueByCode(items: StockRiskItem[]): StockRiskItem[] {
  const seen = new Set<string>();
  const result: StockRiskItem[] = [];

  for (const item of items) {
    if (seen.has(item.code)) {
      continue;
    }

    seen.add(item.code);
    result.push(item);
  }

  return result;
}

function buildInsightGroups(item: StockRiskItem, profile: CompanyProfile | null, history30d: PriceHistoryPoint[]): StockDetail['insightGroups'] {
  const historyItems: string[] = [];
  const companyItems: string[] = [];
  const riskItems: string[] = [];

  if (history30d.length >= 2) {
    const firstClose = history30d[0].close;
    const lastClose = history30d[history30d.length - 1].close;
    const trend30dPct = firstClose > 0 ? round(((lastClose - firstClose) / firstClose) * 100) : null;
    historyItems.push(`近 ${history30d.length} 個交易日累計 ${trend30dPct === null ? '暫無' : `${trend30dPct}%`}。`);
  }

  if (item.trend7dPct !== null) {
    historyItems.push(`近 7 日斜率為 ${item.trend7dPct}% ，用來觀察短線是否加速。`);
  }

  historyItems.push(`最新收盤 ${item.close.toFixed(2)} 元，單日變動 ${item.changePct.toFixed(2)}%。`);

  companyItems.push(`所屬產業為 ${item.industry}。`);
  if (profile?.listedDate) {
    companyItems.push(`上市日期 ${profile.listedDate}。`);
  }
  if (profile?.chairman) {
    companyItems.push(`董事長 ${profile.chairman}。`);
  }
  if (profile?.paidInCapital != null) {
    companyItems.push(`實收資本額約 ${formatCapital(profile.paidInCapital)}。`);
  }

  riskItems.push(`進處置機率 ${item.dispositionProbability}% ，上漲 ${item.riseProbability}% / 下跌 ${item.fallProbability}%。`);
  riskItems.push(...item.reasons);
  if (item.officialReference) {
    riskItems.push(`官方補充: ${item.officialReference}`);
  }

  const eventItems = [item.eventPlan.summary, ...item.eventPlan.tactics, ...item.eventPlan.timeline];
  const ruleItems = item.ruleSignals.length > 0
    ? item.ruleSignals.map((signal) => `${signal.category} / ${signal.direction} / ${signal.severity}: ${signal.summary}`)
    : ['目前沒有命中已接入的制度規則；待補規則可參考規則覆蓋說明。'];

  const tradePlanItems = [item.tradePlan.summary, `目前主劇本為 ${item.tradePlan.preferredSide}。`];
  if (item.tradePlan.primarySetup?.entry) {
    tradePlanItems.push(`${item.tradePlan.primarySetup.entryLabel} ${item.tradePlan.primarySetup.entry.price.toFixed(2)}。`);
  }
  if (item.tradePlan.primarySetup?.exit) {
    tradePlanItems.push(`${item.tradePlan.primarySetup.exitLabel} ${item.tradePlan.primarySetup.exit.price.toFixed(2)}。`);
  }
  if (item.tradePlan.primarySetup?.stopLoss) {
    tradePlanItems.push(`${item.tradePlan.primarySetup.stopLabel} ${item.tradePlan.primarySetup.stopLoss.price.toFixed(2)}。`);
  }
  if (item.tradePlan.primarySetup?.riskRewardRatio !== null && item.tradePlan.primarySetup?.riskRewardRatio !== undefined) {
    tradePlanItems.push(`主劇本風險報酬比 ${item.tradePlan.primarySetup.riskRewardRatio}。`);
  }
  if (item.tradePlan.alternateSetup?.entry) {
    tradePlanItems.push(`備用${item.tradePlan.alternateSetup.side}劇本: ${item.tradePlan.alternateSetup.entryLabel} ${item.tradePlan.alternateSetup.entry.price.toFixed(2)}。`);
  }

  return [
    { title: '歷史節奏', items: historyItems },
    { title: '公司輪廓', items: companyItems },
    { title: '風險拆解', items: riskItems },
    { title: '事件劇本', items: eventItems },
    { title: '制度規則', items: ruleItems },
    { title: '交易計畫', items: tradePlanItems },
    { title: '基本面', items: item.tradePlan.dimensionAnalysis.fundamental },
    { title: '籌碼面', items: item.tradePlan.dimensionAnalysis.chip },
    { title: '技術面', items: item.tradePlan.dimensionAnalysis.technical },
    { title: '價量面', items: item.tradePlan.dimensionAnalysis.priceVolume }
  ];
}

export async function getMarketSnapshot(): Promise<MarketSnapshot> {
  const { scoredUniverse, marketPulse } = await loadMarketBaseData();
  const scored = scoredUniverse;

  const watchlistBase = [...scored]
    .sort((left, right) => right.dispositionProbability - left.dispositionProbability || right.tradeValue - left.tradeValue)
    .slice(0, 12);

  const bullishBoardBase = [...scored]
    .sort((left, right) => right.riseProbability - left.riseProbability || right.changePct - left.changePct)
    .slice(0, 6);

  const bearishBoardBase = [...scored]
    .sort((left, right) => right.fallProbability - left.fallProbability || left.changePct - right.changePct)
    .slice(0, 6);

  const officialSpotlightBase = [...scored]
    .filter((item) => item.officialStatus !== '模型觀察')
    .sort(
      (left, right) =>
        right.dispositionProbability - left.dispositionProbability ||
        right.officialAnnouncementCount - left.officialAnnouncementCount
    )
    .slice(0, 8);

  const searchPoolBase = [...scored].sort(
    (left, right) => right.dispositionProbability - left.dispositionProbability || right.tradeValue - left.tradeValue
  );

  const historyTargets = uniqueByCode([
    ...watchlistBase,
    ...bullishBoardBase,
    ...bearishBoardBase,
    ...officialSpotlightBase,
    ...searchPoolBase.slice(0, 40)
  ]);
  const historyItems = await enrichWithHistory(historyTargets, marketPulse);
  const historyMap = new Map(historyItems.map((item) => [item.code, item]));
  const withHistory = (items: StockRiskItem[]) => items.map((item) => historyMap.get(item.code) ?? item);
  const watchlist = withHistory(watchlistBase);
  const bullishBoard = withHistory(bullishBoardBase);
  const bearishBoard = withHistory(bearishBoardBase);
  const officialSpotlight = withHistory(officialSpotlightBase);
  const searchPool = withHistory(searchPoolBase);

  const dispositionValues = scored.map((item) => item.dispositionProbability).sort((left, right) => left - right);
  const middleIndex = Math.floor(dispositionValues.length / 2);
  const medianDispositionProbability = dispositionValues[middleIndex] ?? 0;
  const industries = [...new Set(scored.map((item) => item.industry).filter(Boolean))].sort((left, right) => left.localeCompare(right, 'zh-Hant'));

  return {
    updatedAt: new Date().toISOString(),
    dataFreshness: buildDataFreshness(),
    industries,
    marketPulse,
    overview: {
      totalUniverse: scored.length,
      highRiskCount: scored.filter((item) => item.dispositionProbability >= 70).length,
      bullishBiasCount: scored.filter((item) => item.riseProbability >= 60).length,
      bearishBiasCount: scored.filter((item) => item.fallProbability >= 60).length,
      medianDispositionProbability,
      officialNoticeCount: scored.filter((item) => item.officialStatus === '注意').length,
      officialDispositionCount: scored.filter((item) => item.officialStatus === '處置').length,
      officialHitCount: watchlistBase.filter((item) => item.officialStatus !== '模型觀察').length,
      fastTrackCount: searchPool.filter((item) => item.eventPlan.phase === '快進處置').length,
      disposedCount: searchPool.filter((item) => item.eventPlan.phase === '已進處置').length,
      observationCount: searchPool.filter((item) => item.eventPlan.phase === '事件觀察').length
    },
    eventBoards: {
      fastTrack: searchPool.filter((item) => item.eventPlan.phase === '快進處置').slice(0, 12),
      disposed: searchPool.filter((item) => item.eventPlan.phase === '已進處置').slice(0, 12)
    },
    ruleCoverage: buildRuleCoverage(),
    watchlist,
    bullishBoard,
    bearishBoard,
    officialSpotlight,
    searchPool,
    notes: [
      '目前只涵蓋上市股票，資料與官方公告皆來自 TWSE 公開端點。',
      '進處置機率結合官方注意／處置公告與公開行情的啟發式評分，並非交易所未來公告保證。',
      '目前已接入除權息、融資融券、重大訊息與當沖限制，其餘規則會在規則覆蓋說明中標註待補。'
    ]
  };
}

export async function getStockDetail(code: string): Promise<StockDetail | null> {
  if (!/^\d{4}$/.test(code)) {
    return null;
  }

  const history30dPromise = fetchYahooHistory(code, '3mo');
  const { twseQuotes, optionalData, enrichedQuotes, scoredUniverse, marketPulse } = await loadMarketBaseData();
  const { officialFlags, profiles, revenues, exDividendPlans, marginShortSignals, materialInfoSignals, dayTradeRestrictions } = optionalData;
  const targetQuote = twseQuotes.find((item) => item.code === code);

  if (!targetQuote) {
    return null;
  }

  const enrichedQuote = enrichedQuotes.find((item) => item.code === code);

  if (!enrichedQuote) {
    return null;
  }

  const profile = profiles.get(code) ?? null;
  const baseItem = scoreQuote(
    enrichedQuote,
    officialFlags.get(code),
    profile ?? undefined,
    revenues.get(code),
    exDividendPlans,
    marginShortSignals,
    materialInfoSignals,
    dayTradeRestrictions
  );
  const history30d = await history30dPromise;
  const item = finalizeItem(baseItem, history30d, marketPulse);

  return {
    updatedAt: new Date().toISOString(),
    dataFreshness: buildDataFreshness(),
    item,
    profile,
    history30d,
    insightGroups: buildInsightGroups(item, profile, history30d)
  };
}
