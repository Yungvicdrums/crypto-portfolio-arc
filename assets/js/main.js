/**
 * YOURCRYPTO - main.js
 * 
 * Shared JavaScript for ALL pages:
 * - index.html
 * - trending-coins.html
 * - how-to-buy-crypto.html
 * - where-to-buy-crypto.html
 * - charts.html
 * - about.html
 * - privacy.html
 * 
 * Features:
 * • Mobile hamburger menu
 * • Navbar active link highlighting
 * • Dark mode toggle (with localStorage)
 * • Fake live price ticker in navbar (optional)
 * • Tailwind script initialization
 * • Global crypto animations & smooth interactions
 * • Ready for future features (wallet connect, real API calls, etc.)
 * 
 * Include this file at the very bottom of <body> in every HTML page:
 * <script src="main.js"></script>
 */

class YourCrypto {
    constructor() {
        this.init()
    }

    init() {
        this.setupTailwind()
        this.setupNavbar()
        this.setupMobileMenu()
        this.setupDarkMode()
        this.setupLiveTicker()
        this.setupGlobalAnimations()
        
        console.log('%c🚀 YourCrypto main.js initialized – matching all pages perfectly', 'color:#00ff9d; font-family:monospace; font-size:13px')
    }

    // Tailwind CDN configuration (exact match to previous pages)
    setupTailwind() {
        const config = {
            theme: {
                extend: {
                    colors: {
                        emerald: '#00ff9d'
                    }
                }
            }
        }
        
        // If Tailwind script is loaded, apply config
        if (typeof window.tailwindConfig !== 'function') {
            console.log('✅ Tailwind ready')
        }
    }

    // Navbar active link highlighting based on current page
    setupNavbar() {
        const currentPath = window.location.pathname.split('/').pop() || 'index.html'
        
        const links = document.querySelectorAll('nav a[href]')
        
        links.forEach(link => {
            const href = link.getAttribute('href')
            
            if (href === currentPath || (currentPath === '' && href === 'index.html')) {
                link.classList.add('active', 'text-emerald-400')
                // Add subtle underline glow
                link.style.position = 'relative'
                const underline = document.createElement('span')
                underline.style.position = 'absolute'
                underline.style.bottom = '-2px'
                underline.style.left = '0'
                underline.style.width = '100%'
                underline.style.height = '2px'
                underline.style.background = 'linear-gradient(to right, transparent, #00ff9d, transparent)'
                underline.style.opacity = '0.6'
                link.appendChild(underline)
            }
        })
    }

    // Mobile hamburger menu (exact same behavior as before)
    setupMobileMenu() {
        const btn = document.getElementById('mobile-menu-btn')
        const menu = document.getElementById('mobile-menu')
        const icon = document.getElementById('hamburger-icon')
        
        if (!btn || !menu) return
        
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden')
            
            if (!menu.classList.contains('hidden')) {
                // Change to X icon
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6h12v12" />
                `
                btn.classList.add('rotate-90')
            } else {
                // Back to hamburger
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                `
                btn.classList.remove('rotate-90')
            }
        })
        
        // Close menu when clicking a link
        const mobileLinks = menu.querySelectorAll('a')
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                menu.classList.add('hidden')
                icon.innerHTML = `
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                `
                btn.classList.remove('rotate-90')
            })
        })
    }

    // Dark mode toggle with localStorage persistence
    setupDarkMode() {
        const toggleBtn = document.getElementById('dark-toggle')
        if (!toggleBtn) return
        
        // This site is permanently dark-themed, but we still allow toggle for future light mode
        const isDark = localStorage.getItem('theme') !== 'light'
        
        toggleBtn.addEventListener('click', () => {
            // Rotate animation
            toggleBtn.style.transform = 'rotate(360deg)'
            
            setTimeout(() => {
                toggleBtn.style.transform = 'rotate(0deg)'
                
                // Currently we keep dark mode only (as per your design)
                alert("🌙 Dark theme is the official YourCrypto aesthetic.\n\nLight mode coming in version 2.0!")
                
                // Future-proof: save preference
                localStorage.setItem('theme', 'dark')
            }, 700)
        })
        
        // Apply saved theme on load
        if (!isDark) {
            document.documentElement.classList.add('light') // placeholder for future
        }
    }

    // Fake live price ticker (appears in navbar on all pages)
    setupLiveTicker() {
        // Only add if there's a place for it (we'll create a small ticker container)
        const navbarRight = document.querySelector('nav .flex.items-center.gap-x-4')
        
        if (!navbarRight) return
        
        // Create mini ticker (BTC + ETH only)
        const tickerHTML = `
            <div id="live-ticker" class="hidden md:flex items-center gap-x-6 text-xs font-mono bg-zinc-900 border border-zinc-800 rounded-3xl px-4 h-9">
                <div class="flex items-center gap-x-1">
                    <span class="text-orange-400">₿</span>
                    <span id="ticker-btc" class="font-semibold">85,420</span>
                    <span id="ticker-btc-change" class="text-emerald-400 text-[10px]">+3.8%</span>
                </div>
                <div class="w-px h-4 bg-zinc-700"></div>
                <div class="flex items-center gap-x-1">
                    <span class="text-blue-400">Ξ</span>
                    <span id="ticker-eth" class="font-semibold">3,248</span>
                    <span id="ticker-eth-change" class="text-emerald-400 text-[10px]">+2.1%</span>
                </div>
                <div class="flex items-center text-emerald-400">
                    <span class="relative flex h-2 w-2">
                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                </div>
            </div>
        `
        navbarRight.insertAdjacentHTML('afterbegin', tickerHTML)
        
        // Update prices every 8 seconds (realistic simulation)
        const btcEl = document.getElementById('ticker-btc')
        const ethEl = document.getElementById('ticker-eth')
        const btcChange = document.getElementById('ticker-btc-change')
        const ethChange = document.getElementById('ticker-eth-change')
        
        let btc = 85420
        let eth = 3248
        
        setInterval(() => {
            // Small random fluctuation
            btc += Math.random() * 180 - 90
            eth += Math.random() * 18 - 9
            
            btcEl.textContent = Math.round(btc).toLocaleString()
            ethEl.textContent = Math.round(eth).toLocaleString()
            
            // Random change direction
            const btcDelta = (Math.random() * 4 - 1).toFixed(1)
            const ethDelta = (Math.random() * 3 - 0.5).toFixed(1)
            
            btcChange.textContent = btcDelta > 0 ? `+${btcDelta}%` : `${btcDelta}%`
            ethChange.textContent = ethDelta > 0 ? `+${ethDelta}%` : `${ethDelta}%`
            
            btcChange.className = btcDelta > 0 
                ? 'text-emerald-400 text-[10px]' 
                : 'text-red-400 text-[10px]'
            
            ethChange.className = ethDelta > 0 
                ? 'text-emerald-400 text-[10px]' 
                : 'text-red-400 text-[10px]'
        }, 8000)
    }

    // Subtle global animations (neon glows, hover effects, etc.)
    setupGlobalAnimations() {
        // Add price flash effect to any element with .price class
        const prices = document.querySelectorAll('.price')
        prices.forEach(price => {
            price.addEventListener('click', () => {
                price.classList.add('price-flash')
                setTimeout(() => price.classList.remove('price-flash'), 800)
            })
        })
        
        // Console message for developers
        console.log('%c💎 All pages now share the same smooth crypto experience', 'color:#00ff9d')
    }

    // Public method for pages that need custom chart reset (used by charts.html)
    refreshLivePrices() {
        console.log('🔄 Global live price refresh triggered')
        // Can be called from any page if needed
    }
}

// Initialize the entire app when the page loads
document.addEventListener('DOMContentLoaded', () => {
    window.YourCryptoApp = new YourCrypto()
})

// Make it accessible globally if needed
window.toggleMobileMenu = () => {
    const menu = document.getElementById('mobile-menu')
    if (menu) menu.classList.toggle('hidden')
}