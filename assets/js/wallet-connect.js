/**
 * Ethereum wallet (MetaMask / injected EIP-1193) — native ETH + common ERC-20 on mainnet.
 * Requires ethers v6 UMD build loaded before this script.
 */
(function (global) {
  const ETH_MAINNET_CHAIN_ID = 1n;
  const USDT_MAINNET = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
  const USDC_MAINNET = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

  const ERC20_ABI = [
    'function balanceOf(address owner) view returns (uint256)',
    'function decimals() view returns (uint8)',
  ];

  function hasEthereum() {
    return typeof global.ethereum !== 'undefined';
  }

  function shortAddress(addr) {
    if (!addr || addr.length < 10) return addr || '';
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }

  async function connectWallet() {
    if (!hasEthereum()) {
      throw new Error('No wallet found. Install MetaMask or another Ethereum wallet.');
    }
    const provider = new ethers.BrowserProvider(global.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const network = await provider.getNetwork();
    return { provider, signer, address, chainId: network.chainId };
  }

  async function fetchWalletBalances(provider, address) {
    const network = await provider.getNetwork();
    if (network.chainId !== ETH_MAINNET_CHAIN_ID) {
      return {
        chainId: network.chainId.toString(),
        onMainnet: false,
        address,
        ethFormatted: '0',
        ethWei: 0n,
        usdtFormatted: '0',
        usdcFormatted: '0',
      };
    }

    const ethWei = await provider.getBalance(address);
    const ethFormatted = ethers.formatEther(ethWei);

    const usdt = new ethers.Contract(USDT_MAINNET, ERC20_ABI, provider);
    const usdc = new ethers.Contract(USDC_MAINNET, ERC20_ABI, provider);

    const [usdtBal, usdcBal] = await Promise.all([
      usdt.balanceOf(address),
      usdc.balanceOf(address),
    ]);

    const usdtDecimals = await usdt.decimals();
    const usdcDecimals = await usdc.decimals();

    return {
      chainId: network.chainId.toString(),
      onMainnet: true,
      address,
      ethWei,
      ethFormatted,
      usdtFormatted: ethers.formatUnits(usdtBal, usdtDecimals),
      usdcFormatted: ethers.formatUnits(usdcBal, usdcDecimals),
    };
  }

  async function switchToEthereumMainnet() {
    if (!hasEthereum()) return;
    try {
      await global.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x1' }],
      });
    } catch (e) {
      if (e && e.code === 4902) {
        await global.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: '0x1',
              chainName: 'Ethereum Mainnet',
              nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://cloudflare-eth.com'],
              blockExplorerUrls: ['https://etherscan.io'],
            },
          ],
        });
      } else {
        throw e;
      }
    }
  }

  global.WalletConnect = {
    hasEthereum,
    shortAddress,
    connectWallet,
    fetchWalletBalances,
    switchToEthereumMainnet,
  };
})(typeof window !== 'undefined' ? window : globalThis);
