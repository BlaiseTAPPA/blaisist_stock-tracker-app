// `search` is not a page: it opens the search palette (SearchTrigger).
export const NAV_ITEMS: readonly (
  { href: string; label: string } | { action: "search"; label: string }
)[] = [
  { href: "/", label: "Dashboard" },
  { action: "search", label: "Search" },
  { href: "/news", label: "News" },
  { href: "/watchlist", label: "Watchlist" },
  { href: "/heatmap", label: "Heatmap" },
];

// Sign-up form select options
export const INVESTMENT_GOALS = [
  { value: "Growth", label: "Growth" },
  { value: "Income", label: "Income" },
  { value: "Balanced", label: "Balanced" },
  { value: "Conservative", label: "Conservative" },
];

export const RISK_TOLERANCE_OPTIONS = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

export const PREFERRED_INDUSTRIES = [
  { value: "Technology", label: "Technology" },
  { value: "Healthcare", label: "Healthcare" },
  { value: "Finance", label: "Finance" },
  { value: "Energy", label: "Energy" },
  { value: "Consumer Goods", label: "Consumer goods" },
];

// TradingView Charts
// Every embed script lives at `${TRADINGVIEW_SCRIPT_BASE_URL}<widget>.js`.
export const TRADINGVIEW_SCRIPT_BASE_URL =
  "https://s3.tradingview.com/external-embedding/embed-widget-";

// The app is dark-only; one constant so a future theme switch has one place to change.
const TV_THEME = "dark" as const;

export const MARKET_OVERVIEW_WIDGET_CONFIG = {
  colorTheme: TV_THEME, // dark mode
  dateRange: "12M", // last 12 months
  locale: "en", // language
  largeChartUrl: "", // link to a large chart if needed
  isTransparent: true, // makes background transparent
  showFloatingTooltip: true, // show tooltip on hover
  plotLineColorGrowing: "#0FEDBE", // line color when price goes up
  plotLineColorFalling: "#0FEDBE", // line color when price falls
  gridLineColor: "rgba(240, 243, 250, 0)", // grid line color
  scaleFontColor: "#DBDBDB", // font color for scale
  belowLineFillColorGrowing: "rgba(41, 98, 255, 0.12)", // fill under line when growing
  belowLineFillColorFalling: "rgba(41, 98, 255, 0.12)", // fill under line when falling
  belowLineFillColorGrowingBottom: "rgba(41, 98, 255, 0)",
  belowLineFillColorFallingBottom: "rgba(41, 98, 255, 0)",
  symbolActiveColor: "rgba(15, 237, 190, 0.05)", // highlight color for active symbol
  tabs: [
    {
      title: "Financial",
      symbols: [
        { s: "NYSE:JPM", d: "JPMorgan Chase" },
        { s: "NYSE:WFC", d: "Wells Fargo Co New" },
        { s: "NYSE:BAC", d: "Bank Amer Corp" },
        { s: "NYSE:HSBC", d: "Hsbc Hldgs Plc" },
        { s: "NYSE:C", d: "Citigroup Inc" },
        { s: "NYSE:MA", d: "Mastercard Incorporated" },
      ],
    },
    {
      title: "Technology",
      symbols: [
        { s: "NASDAQ:AAPL", d: "Apple" },
        { s: "NASDAQ:GOOGL", d: "Alphabet" },
        { s: "NASDAQ:MSFT", d: "Microsoft" },
        { s: "NASDAQ:FB", d: "Meta Platforms" },
        { s: "NYSE:ORCL", d: "Oracle Corp" },
        { s: "NASDAQ:INTC", d: "Intel Corp" },
      ],
    },
    {
      title: "Services",
      symbols: [
        { s: "NASDAQ:AMZN", d: "Amazon" },
        { s: "NYSE:BABA", d: "Alibaba Group Hldg Ltd" },
        { s: "NYSE:T", d: "At&t Inc" },
        { s: "NYSE:WMT", d: "Walmart" },
        { s: "NYSE:V", d: "Visa" },
      ],
    },
  ],
  support_host: "https://www.tradingview.com", // TradingView host
  backgroundColor: "#141414", // background color
  width: "100%", // full width
  height: 600, // height in px
  showSymbolLogo: true, // show logo next to symbols
  showChart: true, // display mini chart
};

export const HEATMAP_WIDGET_CONFIG = {
  dataSource: "SPX500",
  blockSize: "market_cap_basic",
  blockColor: "change",
  grouping: "sector",
  isTransparent: true,
  locale: "en",
  symbolUrl: "",
  colorTheme: TV_THEME,
  exchanges: [],
  hasTopBar: false,
  isDataSetEnabled: false,
  isZoomEnabled: true,
  hasSymbolTooltip: true,
  isMonoSize: false,
  width: "100%",
  height: "600",
};

export const NEWS_INDUSTRIES = [
  { label: "All markets", symbol: null, market: "stock" },
  { label: "Technology", symbol: "NASDAQ:AAPL" },
  { label: "Finance", symbol: "NYSE:JPM" },
  { label: "Healthcare", symbol: "NYSE:JNJ" },
  { label: "Energy", symbol: "NYSE:XOM" },
  { label: "Consumer", symbol: "NYSE:WMT" },
] as const;

export const getNewsWidgetConfig = (symbol?: string) => ({
  displayMode: "regular",
  feedMode: symbol ? "symbol" : "market",
  colorTheme: TV_THEME,
  isTransparent: true,
  locale: "en",
  market: "stock",
  ...(symbol && { symbol }),
  width: "100%",
  height: "600",
});

export const CANDLE_CHART_WIDGET_CONFIG = (symbol: string) => ({
  allow_symbol_change: false,
  calendar: false,
  details: true,
  hide_side_toolbar: true,
  hide_top_toolbar: false,
  hide_legend: false,
  hide_volume: false,
  hotlist: false,
  interval: "D",
  locale: "en",
  save_image: false,
  style: 1,
  symbol: symbol.toUpperCase(),
  theme: TV_THEME,
  timezone: "Etc/UTC",
  backgroundColor: "#141414",
  gridColor: "#141414",
  watchlist: [],
  withdateranges: false,
  compareSymbols: [],
  studies: [],
  width: "100%",
  height: 600,
});

export const BASELINE_WIDGET_CONFIG = (symbol: string) => ({
  allow_symbol_change: false,
  calendar: false,
  details: false,
  hide_side_toolbar: true,
  hide_top_toolbar: false,
  hide_legend: false,
  hide_volume: false,
  hotlist: false,
  interval: "D",
  locale: "en",
  save_image: false,
  style: 10,
  symbol: symbol.toUpperCase(),
  theme: TV_THEME,
  timezone: "Etc/UTC",
  backgroundColor: "#141414",
  gridColor: "#141414",
  watchlist: [],
  withdateranges: false,
  compareSymbols: [],
  studies: [],
  width: "100%",
  height: 600,
});

export const TECHNICAL_ANALYSIS_WIDGET_CONFIG = (symbol: string) => ({
  symbol: symbol.toUpperCase(),
  colorTheme: TV_THEME,
  isTransparent: true,
  locale: "en",
  width: "100%",
  height: 400,
  interval: "1h",
  largeChartUrl: "",
});

export const COMPANY_PROFILE_WIDGET_CONFIG = (symbol: string) => ({
  symbol: symbol.toUpperCase(),
  colorTheme: TV_THEME,
  isTransparent: true,
  locale: "en",
  width: "100%",
  height: 440,
});

export const COMPANY_FINANCIALS_WIDGET_CONFIG = (symbol: string) => ({
  symbol: symbol.toUpperCase(),
  colorTheme: TV_THEME,
  isTransparent: true,
  locale: "en",
  width: "100%",
  height: 905,
  displayMode: "regular",
  largeChartUrl: "",
});

// Static list for the dashboard "Popular stocks" table and the search dialog's
// default results. Names, exchanges and currencies rarely change, so
// hard-coding them saves 10 Finnhub /stock/profile2 calls per render (API-01).
// All are US listings, quoted in USD.
export const POPULAR_STOCKS: readonly {
  symbol: string;
  name: string;
  exchange: string;
  currency: string;
}[] = [
  { symbol: "AAPL", name: "Apple Inc", exchange: "NASDAQ", currency: "USD" },
  { symbol: "MSFT", name: "Microsoft Corp", exchange: "NASDAQ", currency: "USD" },
  { symbol: "GOOGL", name: "Alphabet Inc", exchange: "NASDAQ", currency: "USD" },
  { symbol: "AMZN", name: "Amazon.com Inc", exchange: "NASDAQ", currency: "USD" },
  { symbol: "TSLA", name: "Tesla Inc", exchange: "NASDAQ", currency: "USD" },
  { symbol: "META", name: "Meta Platforms Inc", exchange: "NASDAQ", currency: "USD" },
  { symbol: "NVDA", name: "NVIDIA Corp", exchange: "NASDAQ", currency: "USD" },
  { symbol: "NFLX", name: "Netflix Inc", exchange: "NASDAQ", currency: "USD" },
  { symbol: "ORCL", name: "Oracle Corp", exchange: "NYSE", currency: "USD" },
  { symbol: "CRM", name: "Salesforce Inc", exchange: "NYSE", currency: "USD" },
];
