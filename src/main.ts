import './index.css';
import { Game, Theme } from './types.ts';

// State
let allGames: Game[] = [];
let theme: Theme = (localStorage.getItem('theme') as Theme) || 'dark';
let isCloaked: boolean = localStorage.getItem('isCloaked') === 'true';

// Elements
const gameGrid = document.getElementById('game-grid')!;
const searchInput = document.getElementById('search-input') as HTMLInputElement;
const noResults = document.getElementById('no-results')!;
const gameViewer = document.getElementById('game-viewer')!;
const gameIframe = document.getElementById('game-iframe') as HTMLIFrameElement;
const viewerTitle = document.getElementById('viewer-title')!;
const closeGameBtn = document.getElementById('close-game')!;
const fullscreenBtn = document.getElementById('fullscreen-btn')!;
const externalLink = document.getElementById('external-link') as HTMLAnchorElement;
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

// Initialization
async function init() {
  await fetchGames();
  applyTheme(theme);
  applyCloak(isCloaked);
  renderGames(allGames);
  setupEventListeners();
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

function renderGames(games: Game[]) {
  gameGrid.innerHTML = '';
  if (games.length === 0) {
    noResults.classList.remove('hidden');
  } else {
    noResults.classList.add('hidden');
    games.forEach(game => {
      const card = document.createElement('div');
      card.className = 'card rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform shadow-xl hover:shadow-[var(--accent)]/10';
      card.innerHTML = `
        <div class="aspect-video relative overflow-hidden">
          <img 
            src="${game.image}" 
            alt="${game.title}" 
            class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            referrerPolicy="no-referrer"
          />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
            <p class="text-white text-sm font-medium">Click to Play</p>
          </div>
        </div>
        <div class="p-4">
          <h3 class="text-lg font-bold font-display mb-1 group-hover:accent-text transition-colors">${game.title}</h3>
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
  externalLink.href = game.url;
  gameViewer.classList.remove('hidden');
  gameViewer.classList.add('flex');
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
    document.title = "Volt Unblocked";
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (link) link.href = "/favicon.ico";
    
    cloakToggle.classList.remove('accent-bg');
    cloakToggle.classList.add('bg-gray-400');
    cloakDot.classList.remove('translate-x-6');
  }
}

function setupEventListeners() {
  // Search
  searchInput.oninput = (e) => {
    const query = (e.target as HTMLInputElement).value.toLowerCase();
    const filtered = allGames.filter(g => 
      g.title.toLowerCase().includes(query) || 
      g.description.toLowerCase().includes(query)
    );
    renderGames(filtered);
  };

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

init();
