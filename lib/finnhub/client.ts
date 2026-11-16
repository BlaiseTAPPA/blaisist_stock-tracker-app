import 'server-only';

import { getDateRange, validateArticle, formatArticle } from '@/lib/utils';
import { POPULAR_STOCK_SYMBOLS } from '@/lib/constants';

const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Read on every call (not at module load) so a missing key fails the request
// with an explicit message instead of crashing the build.
function getFinnhubToken(): string {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    throw new Error('FINNHUB_API_KEY is not configured');
  }
  return token;
}

// Internal only: never export this, it fetches whatever URL it is given.

async function fetchJSON<T>(url: string, revalidateSeconds?: number): Promise<T> { 
  const options: RequestInit & { next?: { revalidate?: number } } = revalidateSeconds
    ? { cache: 'force-cache', next: { revalidate: revalidateSeconds } }
    : { cache: 'no-store' };

  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Fetch failed ${res.status}: ${text}`);
  }
  return (await res.json()) as T;
}

export async function getStockQuote(symbol: string): Promise<QuoteData> {
  const token = getFinnhubToken();
  const url = `${FINNHUB_BASE_URL}/quote?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  return fetchJSON<QuoteData>(url, 60);
}

export async function getStockProfile(symbol: string): Promise<ProfileData> {
  const token = getFinnhubToken();
  const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${token}`;
  return fetchJSON<ProfileData>(url, 3600);
}

export async function getStockFinancials(symbol: string): Promise<FinancialsData> {
  const token = getFinnhubToken();
  const url = `${FINNHUB_BASE_URL}/stock/metric?symbol=${encodeURIComponent(symbol)}&metric=all&token=${token}`;
  return fetchJSON<FinancialsData>(url, 3600);
}

export async function getTopStocksData(symbols: string[]): Promise<StockWithData[]> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const [quote, profile, financials] = await Promise.all([
          getStockQuote(symbol),
          getStockProfile(symbol),
          getStockFinancials(symbol),
        ]);

        const price = quote.c ?? 0;
        const change = quote.dp ?? 0;
        const cap = profile.marketCapitalization ?? 0;
        const pe = financials.metric?.['peBasicExclExtraTTM'] ?? 0;

        const formatCap = (v: number) => {
          if (v >= 1_000_000) return `$${(v / 1_000_000).toFixed(2)}T`;
          if (v >= 1_000) return `$${(v / 1_000).toFixed(2)}B`;
          return `$${v.toFixed(0)}M`;
        };

        return {
          userId: '',
          symbol,
          company: profile.name ?? symbol,
          addedAt: new Date(),
          currentPrice: price,
          changePercent: change,
          priceFormatted: `$${price.toFixed(2)}`,
          changeFormatted: `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`,
          marketCap: cap ? formatCap(cap) : '—',
          peRatio: pe ? pe.toFixed(1) : '—',
        } satisfies StockWithData;
      } catch {
        return {
          userId: '',
          symbol,
          company: symbol,
          addedAt: new Date(),
          priceFormatted: '—',
          changeFormatted: '—',
          marketCap: '—',
          peRatio: '—',
        } satisfies StockWithData;
      }
    })
  );
  return results;
}

export async function getNews(symbols?: string[]): Promise<MarketNewsArticle[]> {
  try {
    const range = getDateRange(5);
    const token = getFinnhubToken();
    const cleanSymbols = (symbols || [])
      .map((s) => s?.trim().toUpperCase())
      .filter((s): s is string => Boolean(s));

    const maxArticles = 6;

    // If we have symbols, try to fetch company news per symbol and round-robin select
    if (cleanSymbols.length > 0) {
      const perSymbolArticles: Record<string, RawNewsArticle[]> = {};

      await Promise.all(
        cleanSymbols.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/company-news?symbol=${encodeURIComponent(sym)}&from=${range.from}&to=${range.to}&token=${token}`;
            const articles = await fetchJSON<RawNewsArticle[]>(url, 300);
            perSymbolArticles[sym] = (articles || []).filter(validateArticle);
          } catch (e) {
            console.error('Error fetching company news for', sym, e);
            perSymbolArticles[sym] = [];
          }
        })
      );

      const collected: MarketNewsArticle[] = [];
      // Round-robin up to 6 picks
      for (let round = 0; round < maxArticles; round++) {
        for (let i = 0; i < cleanSymbols.length; i++) {
          const sym = cleanSymbols[i];
          const list = perSymbolArticles[sym] || [];
          if (list.length === 0) continue;
          const article = list.shift();
          if (!article || !validateArticle(article)) continue;
          collected.push(formatArticle(article, true, sym, round));
          if (collected.length >= maxArticles) break;
        }
        if (collected.length >= maxArticles) break;
      }

      if (collected.length > 0) {
        // Sort by datetime desc
        collected.sort((a, b) => (b.datetime || 0) - (a.datetime || 0));
        return collected.slice(0, maxArticles);
      }
      // If none collected, fall through to general news
    }

    // General market news fallback or when no symbols provided
    const generalUrl = `${FINNHUB_BASE_URL}/news?category=general&token=${token}`;
    const general = await fetchJSON<RawNewsArticle[]>(generalUrl, 300);

    const seen = new Set<string>();
    const unique: RawNewsArticle[] = [];
    for (const art of general || []) {
      if (!validateArticle(art)) continue;
      const key = `${art.id}-${art.url}-${art.headline}`;
      if (seen.has(key)) continue;
      seen.add(key);
      unique.push(art);
      if (unique.length >= 20) break; // cap early before final slicing
    }

    const formatted = unique.slice(0, maxArticles).map((a, idx) => formatArticle(a, false, undefined, idx));
    return formatted;
  } catch (err) {
    console.error('getNews error:', err);
    throw new Error('Failed to fetch news');
  }
}

// Subset of Finnhub /stock/profile2 fields read by searchStocks.
type Profile2Data = ProfileData & { ticker?: string; exchange?: string };
// Search result carrying the exchange read from profile2 (internal only).
type SearchResultWithExchange = FinnhubSearchResult & { __exchange?: string };

export async function searchStocks(query?: string): Promise<StockWithWatchlistStatus[]> {
  try {
    const token = getFinnhubToken();

    const trimmed = typeof query === 'string' ? query.trim() : '';

    let results: SearchResultWithExchange[] = [];

    if (!trimmed) {
      // Fetch top 10 popular symbols' profiles
      const top = POPULAR_STOCK_SYMBOLS.slice(0, 10);
      const profiles = await Promise.all(
        top.map(async (sym) => {
          try {
            const url = `${FINNHUB_BASE_URL}/stock/profile2?symbol=${encodeURIComponent(sym)}&token=${token}`;
            // Revalidate every hour
            const profile = await fetchJSON<Profile2Data>(url, 3600);
            return { sym, profile } as { sym: string; profile: Profile2Data | null };
          } catch (e) {
            console.error('Error fetching profile2 for', sym, e);
            return { sym, profile: null } as { sym: string; profile: Profile2Data | null };
          }
        })
      );

      results = profiles
        .map(({ sym, profile }) => {
          const symbol = sym.toUpperCase();
          const name: string | undefined = profile?.name || profile?.ticker || undefined;
          const exchange: string | undefined = profile?.exchange || undefined;
          if (!name) return undefined;
          const r: SearchResultWithExchange = {
            symbol,
            description: name,
            displaySymbol: symbol,
            type: 'Common Stock',
          };
          // We don't include exchange in FinnhubSearchResult type, so carry via mapping later using profile
          // To keep pipeline simple, attach exchange via closure map stage
          // We'll reconstruct exchange when mapping to final type
          r.__exchange = exchange; // internal only
          return r;
        })
        .filter((x): x is SearchResultWithExchange => Boolean(x));
    } else {
      const url = `${FINNHUB_BASE_URL}/search?q=${encodeURIComponent(trimmed)}&token=${token}`;
      const data = await fetchJSON<FinnhubSearchResponse>(url, 1800);
      results = Array.isArray(data?.result) ? data.result : [];
    }

    const mapped: StockWithWatchlistStatus[] = results
      .map((r) => {
        const upper = (r.symbol || '').toUpperCase();
        const name = r.description || upper;
        const exchangeFromDisplay = (r.displaySymbol as string | undefined) || undefined;
        const exchangeFromProfile = r.__exchange;
        const exchange = exchangeFromDisplay || exchangeFromProfile || 'US';
        const type = r.type || 'Stock';
        const item: StockWithWatchlistStatus = {
          symbol: upper,
          name,
          exchange,
          type,
          isInWatchlist: false,
        };
        return item;
      })
      .slice(0, 15);

    return mapped;
  } catch (err) {
    console.error('Error in stock search:', err);
    return [];
  }
}
