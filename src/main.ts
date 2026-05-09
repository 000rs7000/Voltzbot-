import './index.css';
import { Game, Theme } from './types.ts';

interface App {
  id: string;
  title: string;
  url: string;
  image: string;
}

const defaultApps: App[] = [
  { id: '1', title: 'Google', url: 'https://www.google.com/webhp?igu=1', image: 'https://ui-avatars.com/api/?name=Google&background=fff&color=000&size=256' },
  { id: '2', title: 'Discord', url: 'https://discord.com/login', image: 'https://ui-avatars.com/api/?name=Discord&background=5865F2&color=fff&size=256' },
  { id: '3', title: 'YouTube', url: 'https://www.youtube.com/embed/', image: 'https://ui-avatars.com/api/?name=YouTube&background=FF0000&color=fff&size=256' },
  { id: '4', title: 'Wikipedia', url: 'https://en.wikipedia.org/', image: 'https://ui-avatars.com/api/?name=Wiki&background=fff&color=000&size=256' }
];

// State
let allGames: Game[] = [];
let allApps: App[] = defaultApps;
let theme: Theme = (localStorage.getItem('theme') as Theme) || 'dark';
let isCloaked: boolean = localStorage.getItem('isCloaked') === 'true';

// Elements
const gameGrid = document.getElementById('game-grid')!;
const gameGridContainer = document.getElementById('game-grid-container')!;
const appGrid = document.getElementById('app-grid')!;
const appGridContainer = document.getElementById('app-grid-container')!;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const noResults = document.getElementById('no-results')!;
const gameViewer = document.getElementById('game-viewer')!;
const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement;
const viewerTitle = document.getElementById('viewer-title')!;
const closeGameBtn = document.getElementById('close-game')!;
const fullscreenBtn = document.getElementById('fullscreen-btn')!;
const settingsBtn = document.getElementById('settings-btn')!;
const settingsModal = document.getElementById('settings-modal')!;
const modalOverlay = document.getElementById('modal-overlay')!;
const closeSettingsBtn = document.getElementById('close-settings')!;
const saveSettingsBtn = document.getElementById('save-settings')!;
const cloakToggle = document.getElementById('cloak-toggle')!;
const cloakDot = cloakToggle.querySelector('.dot')!;
const themeButtons = document.querySelectorAll('.theme-btn');
const mainFooter = document.getElementById('main-footer')!;
const logo = document.getElementById('logo')!;
const starsCanvas = document.getElementById('stars-canvas') as HTMLCanvasElement;
const customBg = document.getElementById('custom-bg')!;
const bgUrlInput = document.getElementById('bg-url-input') as HTMLInputElement;
const applyBgBtn = document.getElementById('apply-bg-btn')!;
const resetBgBtn = document.getElementById('reset-bg-btn')!;
const tbClock = document.getElementById('tb-clock')!;
const tbGamesBtn = document.getElementById('tb-games-btn')!;
const tbAppsBtn = document.getElementById('tb-apps-btn')!;
const tbThemesBtn = document.getElementById('tb-themes-btn')!;
const startBtn = document.getElementById('start-btn')!;

// Initialization
async function init() {
  await fetchGames();
  applyTheme(theme);
  
  // Load custom background
  const savedBg = localStorage.getItem('customBg');
  if (savedBg) {
    applyCustomBg(savedBg);
  }

  applyCloak(isCloaked);
  renderGames(allGames);
  renderApps(allApps);
  setupEventListeners();
  initBackgroundStars();
  initFunnyText();
  startClock();

  setTimeout(() => {
    const loader = document.getElementById('loading-screen');
    if (loader) {
      loader.classList.add('opacity-0');
      setTimeout(() => loader.classList.add('hidden'), 500);
    }
  }, 1000);
}

function initBackgroundStars() {
  if (!starsCanvas) return;
  const ctx = starsCanvas.getContext('2d');
  if (!ctx) return;

  // Make canvas visible if no custom bg
  if (!localStorage.getItem('customBg')) {
    starsCanvas.style.opacity = '1';
  } else {
    starsCanvas.style.opacity = '0';
  }

  let width = window.innerWidth;
  let height = window.innerHeight;
  starsCanvas.width = width;
  starsCanvas.height = height;

  const numStars = 800; // lots of stars for deep space
  const stars: { x: number, y: number, z: number }[] = [];

  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * width * 2 - width,
      y: Math.random() * height * 2 - height,
      z: Math.random() * width
    });
  }

  function render() {
    ctx!.clearRect(0, 0, width, height);

    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < numStars; i++) {
      const star = stars[i];

      star.z -= 1.0; // speed of moving forward through stars

      if (star.z <= 0) {
        star.z = width;
        star.x = Math.random() * width * 2 - width;
        star.y = Math.random() * height * 2 - height;
      }

      const x = cx + star.x / (star.z / width);
      const y = cy + star.y / (star.z / width);
      const radius = (1 - star.z / width) * 3;

      // Draw star
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        ctx!.beginPath();
        const intensity = Math.min(1, 1.5 - (star.z / width));
        ctx!.fillStyle = `rgba(255, 255, 255, ${intensity})`;
        ctx!.arc(x, y, radius, 0, Math.PI * 2);
        ctx!.fill();
      }
    }

    requestAnimationFrame(render);
  }

  // Handle Resize
  window.addEventListener('resize', () => {
    width = window.innerWidth;
    height = window.innerHeight;
    starsCanvas.width = width;
    starsCanvas.height = height;
  });

  render();
}

async function fetchGames() {
  try {
    const res = await fetch('/voltzbot.json');
    if (!res.ok) throw new Error('Failed to fetch');
    allGames = await res.json();
  } catch (err) {
    console.warn('Fetch failed, using static fallback:', err);
    allGames = [
      {
        "id": "1",
        "title": "Papa's Hot Doggeria",
        "description": "Serve the fans at the stadium!",
        "url": "https://mathv2.b-cdn.net/study/papashotdoggeria/index.html",
        "image": "https://images.crazygames.com/papas-hot-doggeria/20200830113110/papas-hot-doggeria-cover?auto=format,compress&q=75&cs=strip&ch=DPR&w=1200&h=630&fit=crop"
      },
      {
        "id": "2",
        "title": "Happy Wheels",
        "description": "Try to reach the end alive.",
        "url": "https://mathv2.b-cdn.net/study/happywheels/index.html",
        "image": "https://images.crazygames.com/happy-wheels/20210729114728/happy-wheels-cover?auto=format,compress&q=75&cs=strip&ch=DPR&w=1200&h=630&fit=crop"
      },
      {
        "id": "3",
        "title": "Tetris",
        "description": "The world's favorite puzzle game.",
        "url": "https://mathv2.b-cdn.net/study/tetris/index.html",
        "image": "https://images.crazygames.com/tetris/20200830113110/tetris-cover?auto=format,compress&q=75&cs=strip&ch=DPR&w=1200&h=630&fit=crop"
      }
    ];
  }
}

function applyCustomBg(url: string) {
  if (url) {
    customBg.style.backgroundImage = `url('${url}')`;
    customBg.classList.remove('hidden');
    customBg.style.opacity = '1';
    starsCanvas.style.opacity = '0';
    localStorage.setItem('customBg', url);
    if (bgUrlInput) bgUrlInput.value = url;
  }
}

function resetCustomBg() {
  customBg.style.opacity = '0';
  setTimeout(() => {
    customBg.classList.add('hidden');
    customBg.style.backgroundImage = '';
  }, 500);
  starsCanvas.style.opacity = '1';
  localStorage.removeItem('customBg');
  if (bgUrlInput) bgUrlInput.value = '';
}

function renderGames(games: Game[]) {
  gameGrid.innerHTML = '';
  if (games.length === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    games.forEach(game => {
      const card = document.createElement('div');
      card.className = 'card rounded-2xl overflow-hidden group cursor-pointer border border-[var(--border)] hover:border-[var(--accent)] transition-all bg-[var(--surface)] hover:shadow-[0_0_20px_var(--accent)] flex items-center p-3 gap-4';
      card.innerHTML = `
        <div class="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative border border-[var(--border)]">
          <img 
            src="${game.image}" 
            alt="${game.title}" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white" class="translate-x-[2px]"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </div>
        </div>
        <div class="flex-1 min-w-0 pr-4">
          <h3 class="text-xl font-bold font-display truncate mb-1 group-hover:accent-text transition-colors">${game.title}</h3>
          <p class="text-sm opacity-60 line-clamp-2">${game.description}</p>
        </div>
      `;
      card.onclick = () => openGame(game);
      gameGrid.appendChild(card);
    });
  }
}

function openGame(game: Game) {
  viewerTitle.textContent = game.title;
  gameIframe.src = game.url;
  gameViewer.classList.remove('hidden');
  gameViewer.classList.add('flex');
}

function openApp(app: App) {
  viewerTitle.textContent = app.title;
  gameIframe.src = app.url;
  gameViewer.classList.remove('hidden');
  gameViewer.classList.add('flex');
}

function renderApps(apps: App[]) {
  if (!appGrid) return;
  appGrid.innerHTML = '';
  apps.forEach(app => {
    const card = document.createElement('div');
    card.className = 'card rounded-2xl overflow-hidden group cursor-pointer border border-[var(--border)] hover:border-[var(--accent)] transition-all bg-[var(--surface)] hover:shadow-[0_0_20px_var(--accent)] flex items-center p-3 gap-4';
    card.innerHTML = `
      <div class="w-24 h-24 shrink-0 rounded-xl overflow-hidden relative border border-[var(--border)]">
        <img 
          src="${app.image}" 
          alt="${app.title}" 
          class="w-full h-full object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
        <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
        </div>
      </div>
      <div class="flex-1 min-w-0 pr-4">
        <h3 class="text-xl font-bold font-display truncate mb-1 group-hover:accent-text transition-colors text-[var(--text)]">${app.title}</h3>
      </div>
    `;
    card.onclick = () => openApp(app);
    appGrid.appendChild(card);
  });
}

function closeGame() {
  gameViewer.classList.remove('flex');
  gameViewer.classList.add('hidden');
  gameIframe.src = 'about:blank';
}

function applyTheme(newTheme: Theme) {
  theme = newTheme;
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  
  // Update active state of theme buttons
  themeButtons.forEach(btn => {
    if (btn.getAttribute('data-theme') === theme) {
      btn.classList.add('border-[var(--accent)]', 'bg-[var(--accent)]', 'text-white');
      btn.classList.remove('border-[var(--border)]', 'bg-[var(--surface)]', 'text-[var(--text)]');
    } else {
      btn.classList.remove('border-[var(--accent)]', 'bg-[var(--accent)]', 'text-white');
      btn.classList.add('border-[var(--border)]', 'bg-[var(--surface)]', 'text-[var(--text)]');
    }
  });
}

function applyCloak(cloaked: boolean) {
  isCloaked = cloaked;
  localStorage.setItem('isCloaked', isCloaked.toString());
  
  if (isCloaked) {
    document.title = "Google Docs";
    const link = (document.querySelector("link[rel~='icon']") as HTMLLinkElement) || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'icon';
    link.href = 'https://ssl.gstatic.com/docs/doclist/images/infinite_drive_2023q4.ico';
    if (!link.parentNode) document.getElementsByTagName('head')[0].appendChild(link);
    
    cloakToggle.classList.add('accent-bg');
    cloakToggle.classList.remove('bg-gray-400');
    cloakDot.classList.add('translate-x-6');
  } else {
    document.title = "AlphaOS";
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = "/favicon.ico";
    
    cloakToggle.classList.remove('accent-bg');
    cloakToggle.classList.add('bg-gray-400');
    cloakDot.classList.remove('translate-x-6');
  }
}

const funnyTexts = [
  "having fun tryna block me Dr. Alejandro Ruvalcaba ?",
  "And AlphaOS will never be blocked!",
  "Nice try, IT department.",
  "Unblockable since day 1.",
  "Running under the radar...",
  "Your firewall means nothing here."
];
let funnyTextIndex = 0;

function initFunnyText() {
  const funnyTextEl = document.getElementById('funny-text');
  if (!funnyTextEl) return;
  
  funnyTextEl.textContent = funnyTexts[0];
  setInterval(() => {
    funnyTextEl.style.opacity = '0';
    setTimeout(() => {
      funnyTextIndex = (funnyTextIndex + 1) % funnyTexts.length;
      funnyTextEl.textContent = funnyTexts[funnyTextIndex];
      funnyTextEl.style.opacity = '1';
    }, 500);
  }, 4000);
}

function setupEventListeners() {
  // Search
  searchInput.oninput = (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    
    if (!gameGridContainer.classList.contains('hidden')) {
      const filtered = allGames.filter(g => 
        g.title.toLowerCase().includes(query) || 
        g.description.toLowerCase().includes(query)
      );
      renderGames(filtered);
    } else if (!appGridContainer.classList.contains('hidden')) {
      const filtered = allApps.filter(a => a.title.toLowerCase().includes(query));
      renderApps(filtered);
    }
  };

  // Background Settings
  applyBgBtn.onclick = () => {
    const url = bgUrlInput.value.trim();
    if (url) {
      applyCustomBg(url);
    }
  };
  
  resetBgBtn.onclick = () => {
    resetCustomBg();
  };

  // Taskbar buttons
  tbGamesBtn.onclick = () => {
    gameGridContainer.classList.remove('hidden');
    appGridContainer.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    searchInput.value = '';
    renderGames(allGames);
  };

  tbAppsBtn.onclick = () => {
    gameGridContainer.classList.add('hidden');
    appGridContainer.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    searchInput.value = '';
    renderApps(allApps);
  };

  tbThemesBtn.onclick = () => settingsModal.classList.remove('hidden');
  startBtn.onclick = () => settingsModal.classList.remove('hidden');

  // UI Handlers
  logo.onclick = () => {
    searchInput.value = '';
    renderGames(allGames);
    closeGame();
  };

  settingsBtn.onclick = () => settingsModal.classList.remove('hidden');
  modalOverlay.onclick = () => settingsModal.classList.add('hidden');
  closeSettingsBtn.onclick = () => settingsModal.classList.add('hidden');
  saveSettingsBtn.onclick = () => settingsModal.classList.add('hidden');

  closeGameBtn.onclick = closeGame;

  fullscreenBtn.onclick = () => {
    if (gameIframe.requestFullscreen) {
      gameIframe.requestFullscreen();
    }
  };

  cloakToggle.onclick = () => applyCloak(!isCloaked);

  themeButtons.forEach(btn => {
    btn.onclick = () => applyTheme(btn.getAttribute('data-theme') as Theme);
  });
}

function startClock() {
  if (!tbClock) return;
  const updateClock = () => {
    const now = new Date();
    tbClock.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  updateClock();
  setInterval(updateClock, 1000);
}

init();
