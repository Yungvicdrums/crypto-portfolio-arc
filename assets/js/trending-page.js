/**
 * trending-coins.html — live table from CoinGecko /coins/markets.
 */
(function () {
  let coinsData = [];
  let currentFilter = 'all';

  function fmtUsdCompact(n) {
    if (n == null || Number.isNaN(n)) return '—';
    if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
    return `$${n.toFixed(2)}`;
  }

  function fmtPrice(p) {
    if (p == null || Number.isNaN(p)) return '—';
    if (p >= 1) return `$${p.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    if (p >= 0.01) return `$${p.toFixed(4)}`;
    return `$${p.toPrecision(4)}`;
  }

  function pctClass(p) {
    if (p == null || Number.isNaN(p)) return 'text-gray-400';
    return p >= 0 ? 'price-up' : 'price-down';
  }

  function pctStr(p) {
    if (p == null || Number.isNaN(p)) return '—';
    return `${p >= 0 ? '+' : ''}${p.toFixed(2)}%`;
  }

  function applyFilter(list) {
    if (currentFilter === 'gainers') {
      return [...list].filter((c) => (c.price_change_percentage_24h || 0) > 0).sort(
        (a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0)
      );
    }
    if (currentFilter === 'losers') {
      return [...list].filter((c) => (c.price_change_percentage_24h || 0) < 0).sort(
        (a, b) => (a.price_change_percentage_24h || 0) - (b.price_change_percentage_24h || 0)
      );
    }
    if (currentFilter === 'new') {
      return [...list]
        .filter((c) => (c.market_cap_rank || 999) > 40)
        .sort((a, b) => (b.market_cap_rank || 0) - (a.market_cap_rank || 0))
        .slice(0, 30);
    }
    return list;
  }

  function renderTable(filteredData) {
    const tbody = document.getElementById('tableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    filteredData.forEach((coin, idx) => {
      const row = document.createElement('tr');
      row.className = 'coin-row';
      const ch24 = coin.price_change_percentage_24h;
      const ch7 =
        coin.price_change_percentage_7d_in_currency != null
          ? coin.price_change_percentage_7d_in_currency
          : coin.price_change_percentage_7d;
      row.innerHTML = `
        <td class="px-4 sm:px-8 py-4 sm:py-6 font-mono text-gray-400">${coin.market_cap_rank ?? idx + 1}</td>
        <td class="px-4 sm:px-8 py-4 sm:py-6">
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <img src="${coin.image || ''}" alt="" width="36" height="36" class="rounded-full shrink-0 bg-zinc-800" loading="lazy">
            <div class="min-w-0">
              <div class="font-semibold truncate">${coin.name}</div>
              <div class="text-xs text-gray-400">${(coin.symbol || '').toUpperCase()}</div>
            </div>
          </div>
        </td>
        <td class="px-4 sm:px-8 py-4 sm:py-6 text-right font-medium whitespace-nowrap">${fmtPrice(coin.current_price)}</td>
        <td class="px-4 sm:px-8 py-4 sm:py-6 text-right font-semibold ${pctClass(ch24)}">${pctStr(ch24)}</td>
        <td class="px-4 sm:px-8 py-4 sm:py-6 text-right font-medium ${pctClass(ch7)}">${pctStr(ch7)}</td>
        <td class="px-4 sm:px-8 py-4 sm:py-6 text-right whitespace-nowrap">${fmtUsdCompact(coin.market_cap)}</td>
        <td class="px-4 sm:px-8 py-4 sm:py-6 text-right whitespace-nowrap">${fmtUsdCompact(coin.total_volume)}</td>
        <td class="px-4 sm:px-8 py-4 sm:py-6 text-center">
          <a href="https://www.coingecko.com/en/coins/${coin.id}" target="_blank" rel="noopener noreferrer"
             class="inline-flex items-center justify-center bg-[#00ff9d] hover:bg-[#00cc7a] text-black text-xs font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-3xl min-h-[40px]">
            View
          </a>
        </td>
      `;
      tbody.appendChild(row);
    });

    if (filteredData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-12 text-gray-400">No coins match your filters.</td></tr>`;
    }
  }

  function renderHotCoins() {
    const container = document.getElementById('hotCoins');
    if (!container || !coinsData.length) return;
    container.innerHTML = '';
    const hot = [...coinsData]
      .sort((a, b) => (b.price_change_percentage_24h || 0) - (a.price_change_percentage_24h || 0))
      .slice(0, 6);

    hot.forEach((coin) => {
      const card = document.createElement('div');
      card.className =
        'bg-zinc-900 border border-white/10 rounded-3xl p-4 sm:p-6 hover:border-[#00ff9d] transition-colors';
      const ch = coin.price_change_percentage_24h;
      card.innerHTML = `
        <div class="flex justify-between items-start gap-2">
          <div class="flex items-center gap-2 sm:gap-3 min-w-0">
            <img src="${coin.image || ''}" alt="" width="40" height="40" class="rounded-full shrink-0 bg-zinc-800" loading="lazy">
            <div class="min-w-0">
              <div class="font-semibold truncate">${(coin.symbol || '').toUpperCase()}</div>
              <div class="text-xs text-gray-400 truncate">${coin.name}</div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="font-medium text-sm sm:text-base">${fmtPrice(coin.current_price)}</div>
            <div class="${pctClass(ch)} text-xs sm:text-sm font-bold">${pctStr(ch)}</div>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  function filterTable() {
    const input = document.getElementById('searchInput');
    const searchTerm = (input && input.value ? input.value : '').toLowerCase().trim();
    let base = applyFilter(coinsData);
    if (searchTerm) {
      base = base.filter(
        (c) =>
          (c.name && c.name.toLowerCase().includes(searchTerm)) ||
          (c.symbol && c.symbol.toLowerCase().includes(searchTerm))
      );
    }
    renderTable(base);
  }

  function setFilter(type) {
    currentFilter = type;
    document.querySelectorAll('button[id^="filter-"]').forEach((btn) => {
      btn.classList.remove('active-filter', 'border-[#00ff9d]', 'text-[#00ff9d]');
      btn.classList.add('border-white/20');
    });
    const activeBtn = document.getElementById(`filter-${type}`);
    if (activeBtn) {
      activeBtn.classList.add('active-filter', 'border-[#00ff9d]', 'text-[#00ff9d]');
      activeBtn.classList.remove('border-white/20');
    }
    filterTable();
  }

  async function loadHeroStats() {
    try {
      const g = await window.CoinGeckoAPI.fetchGlobal();
      const d = g.data || {};
      const cap = d.total_market_cap && d.total_market_cap.usd;
      const vol = d.total_volume && d.total_volume.usd;
      const btc = d.market_cap_percentage && d.market_cap_percentage.btc;
      const eth = d.market_cap_percentage && d.market_cap_percentage.eth;

      const els = [
        ['heroMcap', cap, 'T'],
        ['heroVol', vol, 'B'],
        ['heroBtcDom', btc, '%'],
        ['heroEthDom', eth, '%'],
      ];
      els.forEach(([id, val, kind]) => {
        const el = document.getElementById(id);
        if (!el || val == null) return;
        if (kind === 'T') el.textContent = `$${(val / 1e12).toFixed(2)}T`;
        else if (kind === 'B') el.textContent = `$${(val / 1e9).toFixed(1)}B`;
        else if (kind === '%') el.textContent = `${Number(val).toFixed(1)}%`;
      });
    } catch (e) {
      console.warn(e);
    }
  }

  async function loadMarkets() {
    const btn = document.getElementById('btnRefreshTrending');
    const icon = document.getElementById('trendingRefreshIcon');
    const tbody = document.getElementById('tableBody');
    if (tbody) {
      tbody.innerHTML =
        '<tr><td colspan="8" class="text-center py-12 text-gray-400">Loading live markets…</td></tr>';
    }
    if (btn) btn.disabled = true;
    if (icon) icon.classList.add('animate-spin');

    try {
      coinsData = await window.CoinGeckoAPI.fetchMarkets({
        vs: 'usd',
        order: 'market_cap_desc',
        perPage: 80,
        page: 1,
      });
      filterTable();
      renderHotCoins();
      const lu = document.getElementById('last-updated');
      if (lu) lu.textContent = `Last updated: ${new Date().toLocaleString()}`;
      await loadHeroStats();
    } catch (e) {
      console.error(e);
      alert('Could not load market data. Wait a moment and try again (rate limits).');
    } finally {
      if (btn) btn.disabled = false;
      if (icon) icon.classList.remove('animate-spin');
    }
  }

  window.filterTable = filterTable;
  window.setFilter = setFilter;
  window.toggleMobileMenu = function () {
    const menu = document.getElementById('mobileMenu');
    if (menu) menu.classList.toggle('hidden');
  };
  window.toggleDarkMode = function () {
    alert('This site uses dark mode by default.');
  };

  window.addEventListener('DOMContentLoaded', function () {
    tailwind.config = { content: ['./**/*.{html,js}'], theme: { extend: {} } };
    const refreshBtn = document.getElementById('btnRefreshTrending');
    if (refreshBtn) refreshBtn.addEventListener('click', loadMarkets);
    loadMarkets();
  });
})();
