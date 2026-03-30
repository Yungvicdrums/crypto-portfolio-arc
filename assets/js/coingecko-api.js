/**
 * CoinGecko API v3 helpers (public, no API key).
 * https://docs.coingecko.com/reference/introduction
 */
(function (global) {
  const BASE = 'https://api.coingecko.com/api/v3';

  async function getJson(url) {
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }
    return res.json();
  }

  /**
   * @param {string[]} ids - CoinGecko coin ids e.g. ['bitcoin','ethereum']
   * @param {string} vs - e.g. 'ngn', 'usd'
   */
  async function fetchSimplePrices(ids, vs = 'usd') {
    if (!ids.length) return {};
    const url = `${BASE}/simple/price?ids=${encodeURIComponent(ids.join(','))}&vs_currencies=${vs}&include_24hr_change=true`;
    return getJson(url);
  }

  async function fetchGlobal() {
    return getJson(`${BASE}/global`);
  }

  async function fetchTrendingSearch() {
    return getJson(`${BASE}/search/trending`);
  }

  /**
   * Top coins by market cap (or volume) with 24h/7d changes.
   */
  async function fetchMarkets(options = {}) {
    const {
      vs = 'usd',
      order = 'market_cap_desc',
      perPage = 50,
      page = 1,
    } = options;
    const params = new URLSearchParams({
      vs_currency: vs,
      order,
      per_page: String(perPage),
      page: String(page),
      sparkline: 'false',
      price_change_percentage: '24h,7d',
    });
    return getJson(`${BASE}/coins/markets?${params}`);
  }

  global.CoinGeckoAPI = {
    fetchSimplePrices,
    fetchGlobal,
    fetchTrendingSearch,
    fetchMarkets,
  };
})(typeof window !== 'undefined' ? window : globalThis);
