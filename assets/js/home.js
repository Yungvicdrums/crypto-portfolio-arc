/**
 * index.html — CoinGecko live prices, market snapshot, trending teaser, wallet portfolio.
 */
(function () {
  const HOLDINGS = [
    { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', amount: 0.42, icon: '₿' },
    { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', amount: 3.8, icon: 'Ξ' },
    { id: 'solana', name: 'Solana', symbol: 'SOL', amount: 85, icon: '◎' },
    { id: 'tether', name: 'USDT (Stable)', symbol: 'USDT', amount: 4200, icon: '₮' },
    { id: 'pepe', name: 'Pepe', symbol: 'PEPE', amount: 12_000_000, icon: '🐸' },
  ];

  const fmtNgn = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  });

  function formatCompactNgn(n) {
    if (n >= 1e9) return `₦${(n / 1e9).toFixed(1)}B`;
    if (n >= 1e6) return `₦${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `₦${(n / 1e3).toFixed(0)}K`;
    return fmtNgn.format(n);
  }

  function pctClass(p) {
    if (p == null || Number.isNaN(p)) return 'text-gray-400';
    return p >= 0 ? 'text-emerald-400' : 'text-red-400';
  }

  function pctText(p) {
    if (p == null || Number.isNaN(p)) return '—';
    const sign = p >= 0 ? '+' : '';
    return `${sign}${p.toFixed(1)}%`;
  }

  async function loadPortfolioPrices() {
    const ids = HOLDINGS.map((h) => h.id);
    const prices = await window.CoinGeckoAPI.fetchSimplePrices(ids, 'ngn');
    const container = document.getElementById('portfolioGrid');
    if (!container) return;

    let totalNgn = 0;
    const cards = [];

    HOLDINGS.forEach((h) => {
      const row = prices[h.id];
      const ngn = row && row.ngn != null ? row.ngn : 0;
      const ch24 =
        row && row.ngn_24h_change != null
          ? row.ngn_24h_change
          : row && row.usd_24h_change != null
            ? row.usd_24h_change
            : null;
      const value = h.amount * ngn;
      totalNgn += value;

      cards.push(`
        <div class="portfolio-card bg-zinc-900/70 border border-white/10 rounded-3xl p-5 sm:p-6">
          <div class="flex justify-between items-start gap-2">
            <div class="text-3xl sm:text-4xl">${h.icon}</div>
            <div class="text-right">
              <div class="${pctClass(ch24)} text-xs sm:text-sm font-bold">${pctText(ch24)}</div>
            </div>
          </div>
          <div class="mt-4 sm:mt-6">
            <p class="font-semibold text-lg sm:text-xl">${h.name}</p>
            <p class="text-xs text-gray-400">${h.symbol} • ${h.amount.toLocaleString()}</p>
            <p class="text-2xl sm:text-3xl font-medium mt-3 sm:mt-4 break-words">${fmtNgn.format(Math.round(value))}</p>
          </div>
        </div>
      `);
    });

    const totalCompact = formatCompactNgn(totalNgn);
    cards.push(`
      <div class="portfolio-card bg-gradient-to-br from-[#00ff9d] to-emerald-600 text-black rounded-3xl p-5 sm:p-6 flex flex-col justify-between min-h-[200px]">
        <div>
          <p class="font-semibold text-lg sm:text-xl">Total Portfolio</p>
          <p class="text-4xl sm:text-5xl font-medium mt-6 sm:mt-8">${totalCompact}</p>
        </div>
        <p class="text-xs sm:text-sm mt-auto opacity-90">Live from CoinGecko • NGN estimates</p>
      </div>
    `);

    container.innerHTML = cards.join('');

    const totalLine = document.getElementById('portfolioTotalLine');
    if (totalLine) {
      totalLine.textContent = fmtNgn.format(Math.round(totalNgn));
    }
  }

  async function loadMarketSnapshot() {
    const g = await window.CoinGeckoAPI.fetchGlobal();
    const d = g.data || {};
    const cap = d.total_market_cap && d.total_market_cap.usd;
    const vol = d.total_volume && d.total_volume.usd;
    const btcDom = d.market_cap_percentage && d.market_cap_percentage.btc;
    const ch24 = d.market_cap_change_percentage_24h_usd;

    const capEl = document.getElementById('snapshotMcap');
    const volEl = document.getElementById('snapshotVol');
    const domEl = document.getElementById('snapshotBtcDom');
    const chEl = document.getElementById('snapshotMcapCh24');

    if (capEl && cap != null) {
      const trillions = cap / 1e12;
      capEl.textContent = `$${trillions.toFixed(2)}T`;
    }
    if (volEl && vol != null) {
      const billions = vol / 1e9;
      volEl.textContent = `$${billions.toFixed(1)}B`;
    }
    if (domEl && btcDom != null) {
      domEl.textContent = `${Number(btcDom).toFixed(1)}%`;
    }
    if (chEl) {
      if (ch24 != null) {
        chEl.textContent = `${ch24 >= 0 ? '+' : ''}${ch24.toFixed(2)}%`;
        chEl.className =
          `text-2xl sm:text-4xl font-semibold mt-2 ${ch24 >= 0 ? 'text-emerald-400' : 'text-red-400'}`;
      } else {
        chEl.textContent = '—';
        chEl.className = 'text-2xl sm:text-4xl font-semibold mt-2 text-gray-400';
      }
    }

    const dateEl = document.getElementById('snapshotDate');
    if (dateEl) {
      dateEl.textContent = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
  }

  async function loadTrendingTeaser() {
    const container = document.getElementById('trendingTeaser');
    if (!container) return;

    const trending = await window.CoinGeckoAPI.fetchTrendingSearch();
    const items = (trending.coins || []).slice(0, 6);
    const ids = items.map((c) => c.item.id).filter(Boolean);
    const prices = ids.length ? await window.CoinGeckoAPI.fetchSimplePrices(ids, 'usd') : {};

    container.innerHTML = '';
    items.forEach((c) => {
      const item = c.item;
      const p = prices[item.id];
      const ch = p && p.usd_24h_change != null ? p.usd_24h_change : null;
      const div = document.createElement('div');
      div.className =
        'bg-zinc-900 border border-white/10 hover:border-[#00ff9d] rounded-3xl p-4 sm:p-6 text-center transition-colors';
      div.innerHTML = `
        <div class="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 rounded-2xl overflow-hidden bg-zinc-800 flex items-center justify-center">
          ${item.thumb ? `<img src="${item.thumb}" alt="" class="w-full h-full object-cover" loading="lazy">` : `<span class="text-3xl">●</span>`}
        </div>
        <div class="font-semibold text-base sm:text-xl">${item.symbol}</div>
        <div class="text-xs text-gray-400 truncate">${item.name}</div>
        <div class="${pctClass(ch)} text-xs sm:text-sm font-bold mt-1">${pctText(ch)}</div>
      `;
      container.appendChild(div);
    });
  }

  function setRefreshState(loading) {
    const btn = document.getElementById('btnRefreshPrices');
    const icon = document.getElementById('refreshIcon');
    if (btn) btn.disabled = loading;
    if (icon) icon.classList.toggle('animate-spin', loading);
  }

  function setLastUpdated() {
    const el = document.getElementById('lastUpdatedPortfolio');
    if (el) {
      el.textContent = `Updated ${new Date().toLocaleTimeString()}`;
    }
  }

  async function refreshAll() {
    setRefreshState(true);
    try {
      await Promise.all([loadPortfolioPrices(), loadMarketSnapshot(), loadTrendingTeaser()]);
      setLastUpdated();
    } catch (e) {
      console.error(e);
      alert('Could not refresh prices. Try again in a moment (CoinGecko rate limits).');
    } finally {
      setRefreshState(false);
    }
  }

  async function initWalletUi() {
    const connectBtn = document.getElementById('btnConnectWallet');
    const disconnectBtn = document.getElementById('btnDisconnectWallet');
    const switchBtn = document.getElementById('btnSwitchNetwork');
    const emptyEl = document.getElementById('walletEmpty');
    const panelEl = document.getElementById('walletPanel');
    const errEl = document.getElementById('walletError');

    if (!connectBtn || !window.WalletConnect) return;

    let lastBalances = null;

    async function renderBalances() {
      if (!lastBalances || !lastBalances.onMainnet) return;
      const ids = ['ethereum', 'tether', 'usd-coin'];
      const prices = await window.CoinGeckoAPI.fetchSimplePrices(ids, 'ngn');
      const ethNgn = prices.ethereum && prices.ethereum.ngn ? prices.ethereum.ngn : 0;
      const usdtNgn = prices.tether && prices.tether.ngn ? prices.tether.ngn : 0;
      const usdcNgn = prices['usd-coin'] && prices['usd-coin'].ngn ? prices['usd-coin'].ngn : 0;

      const ethAmt = parseFloat(lastBalances.ethFormatted) || 0;
      const usdtAmt = parseFloat(lastBalances.usdtFormatted) || 0;
      const usdcAmt = parseFloat(lastBalances.usdcFormatted) || 0;

      const ethVal = ethAmt * ethNgn;
      const usdtVal = usdtAmt * usdtNgn;
      const usdcVal = usdcAmt * usdcNgn;
      const total = ethVal + usdtVal + usdcVal;

      document.getElementById('walletEthBal').textContent = `${ethAmt.toFixed(4)} ETH`;
      document.getElementById('walletUsdtBal').textContent = `${usdtAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT`;
      document.getElementById('walletUsdcBal').textContent = `${usdcAmt.toLocaleString(undefined, { maximumFractionDigits: 2 })} USDC`;
      document.getElementById('walletTotalNgn').textContent = fmtNgn.format(Math.round(total));

      const tbody = document.getElementById('walletTokenRows');
      if (tbody) {
        tbody.innerHTML = `
          <tr class="border-b border-white/10"><td class="py-3">ETH</td><td class="py-3 text-right font-mono text-sm">${ethAmt.toFixed(6)}</td><td class="py-3 text-right">${fmtNgn.format(Math.round(ethVal))}</td></tr>
          <tr class="border-b border-white/10"><td class="py-3">USDT (ERC-20)</td><td class="py-3 text-right font-mono text-sm">${usdtAmt.toFixed(2)}</td><td class="py-3 text-right">${fmtNgn.format(Math.round(usdtVal))}</td></tr>
          <tr><td class="py-3">USDC (ERC-20)</td><td class="py-3 text-right font-mono text-sm">${usdcAmt.toFixed(2)}</td><td class="py-3 text-right">${fmtNgn.format(Math.round(usdcVal))}</td></tr>
        `;
      }
    }

    connectBtn.addEventListener('click', async () => {
      errEl.textContent = '';
      try {
        if (typeof ethers === 'undefined') {
          errEl.textContent = 'Wallet library did not load. Check your connection and refresh.';
          return;
        }
        if (!window.WalletConnect.hasEthereum()) {
          errEl.textContent = 'Install MetaMask or use a browser with an Ethereum wallet.';
          return;
        }
        const { provider, address } = await window.WalletConnect.connectWallet();
        lastBalances = await window.WalletConnect.fetchWalletBalances(provider, address);

        document.getElementById('walletAddress').textContent = window.WalletConnect.shortAddress(address);
        emptyEl.classList.add('hidden');
        panelEl.classList.remove('hidden');
        connectBtn.classList.add('hidden');
        if (disconnectBtn) disconnectBtn.classList.remove('hidden');

        if (!lastBalances.onMainnet) {
          document.getElementById('walletWrongNetwork').classList.remove('hidden');
          document.getElementById('walletMainnetContent').classList.add('hidden');
        } else {
          document.getElementById('walletWrongNetwork').classList.add('hidden');
          document.getElementById('walletMainnetContent').classList.remove('hidden');
          await renderBalances();
        }
      } catch (e) {
        errEl.textContent = e.message || 'Connection failed.';
      }
    });

    if (switchBtn) {
      switchBtn.addEventListener('click', async () => {
        try {
          await window.WalletConnect.switchToEthereumMainnet();
          const { provider } = await window.WalletConnect.connectWallet();
          const address = await provider.getSigner().then((s) => s.getAddress());
          lastBalances = await window.WalletConnect.fetchWalletBalances(provider, address);
          document.getElementById('walletWrongNetwork').classList.add('hidden');
          document.getElementById('walletMainnetContent').classList.remove('hidden');
          await renderBalances();
        } catch (e) {
          errEl.textContent = e.message || 'Could not switch network.';
        }
      });
    }

    if (disconnectBtn) {
      disconnectBtn.addEventListener('click', () => {
        lastBalances = null;
        emptyEl.classList.remove('hidden');
        panelEl.classList.add('hidden');
        connectBtn.classList.remove('hidden');
        if (disconnectBtn) disconnectBtn.classList.add('hidden');
        errEl.textContent = '';
      });
    }

    const refreshWalletBtn = document.getElementById('btnRefreshWallet');
    if (refreshWalletBtn) {
      refreshWalletBtn.addEventListener('click', async () => {
        if (!lastBalances || !lastBalances.onMainnet) return;
        try {
          const { provider } = await window.WalletConnect.connectWallet();
          const address = await provider.getSigner().then((s) => s.getAddress());
          lastBalances = await window.WalletConnect.fetchWalletBalances(provider, address);
          await renderBalances();
        } catch (e) {
          errEl.textContent = e.message || 'Refresh failed.';
        }
      });
    }
  }

  window.initHomePage = async function () {
    setRefreshState(true);
    try {
      await Promise.all([loadPortfolioPrices(), loadMarketSnapshot(), loadTrendingTeaser()]);
      setLastUpdated();
    } catch (e) {
      console.error(e);
      alert('Could not load live prices. Check your connection or try again shortly.');
    } finally {
      setRefreshState(false);
    }
    initWalletUi();

    const btn = document.getElementById('btnRefreshPrices');
    if (btn) btn.addEventListener('click', refreshAll);
  };
})();
