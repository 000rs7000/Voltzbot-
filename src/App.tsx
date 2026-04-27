/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { Search, Settings, X, Maximize, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Game, Theme } from './types';

export default function App() {
  const [games, setGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<Theme>('dark');
  const [isCloaked, setIsCloaked] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Fetch games
  useEffect(() => {
    fetch('/voltzbot.json')
      .then(res => res.json())
      .then(data => setGames(data))
      .catch(err => console.error('Error fetching games:', err));
  }, []);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Tab Cloak Effect
  useEffect(() => {
    const originalTitle = "Volt Unblocked";
    const originalFavicon = "/favicon.ico";

    if (isCloaked) {
      document.title = "Google Docs";
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = 'https://ssl.gstatic.com/docs/doclist/images/infinite_drive_2023q4.ico';
      if (!link.parentNode) document.getElementsByTagName('head')[0].appendChild(link);
    } else {
      document.title = originalTitle;
      const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) link.href = originalFavicon;
    }
  }, [isCloaked]);

  const filteredGames = useMemo(() => {
    return games.filter(g => 
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [games, searchQuery]);

  const handleGameClick = (game: Game) => {
    setSelectedGame(game);
  };

  const closeGame = () => {
    setSelectedGame(null);
  };

  return (
    <div className="min-h-screen font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedGame(null)}>
            <div className="w-10 h-10 accent-bg rounded-lg flex items-center justify-center text-white font-bold text-xl">V</div>
            <h1 className="hidden sm:block text-xl font-display font-bold tracking-tighter uppercase">Volt <span className="accent-text">Unblocked</span></h1>
          </div>

          <div className="flex-1 max-w-xl relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 text-[var(--text)]" />
            <input
              type="text"
              placeholder="Search for a game..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-full py-2 pl-10 pr-4 outline-none focus:ring-2 focus:ring-[var(--accent)]/50 transition-all text-[var(--text)]"
            />
          </div>

          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-[var(--surface)] rounded-full transition-colors border border-transparent hover:border-[var(--border)]"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {selectedGame ? (
            <motion.div
              key="game-viewer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-0 z-50 bg-[var(--bg)] flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-4">
                  <button onClick={closeGame} className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                  <h2 className="text-xl font-bold font-display">{selectedGame.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors" title="Fullscreen" onClick={() => {
                   const iframe = document.querySelector('iframe');
                   if (iframe?.requestFullscreen) iframe.requestFullscreen();
                  }}>
                    <Maximize className="w-5 h-5" />
                  </button>
                  <a href={selectedGame.url} target="_blank" rel="noreferrer" className="p-2 hover:bg-[var(--surface)] rounded-lg transition-colors" title="Open in new tab">
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
              <div className="flex-1 bg-black overflow-hidden relative">
                <iframe
                  src={selectedGame.url}
                  className="absolute inset-0 w-full h-full border-none"
                  allowFullScreen
                  title={selectedGame.title}
                />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="game-list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {filteredGames.map((game, index) => (
                <motion.div
                  key={game.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleGameClick(game)}
                  className="card rounded-2xl overflow-hidden group cursor-pointer hover:scale-[1.02] transition-transform shadow-xl hover:shadow-[var(--accent)]/10"
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={game.image} 
                      alt={game.title} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                      <p className="text-white text-sm font-medium">Click to Play</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold font-display mb-1 group-hover:accent-text transition-colors">{game.title}</h3>
                    <p className="text-sm opacity-60 line-clamp-2">{game.description}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {!selectedGame && filteredGames.length === 0 && (
          <div className="text-center py-20 opacity-50">
            <Search className="w-12 h-12 mx-auto mb-4" />
            <p className="text-xl">No games found matching your search.</p>
          </div>
        )}
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md p-6"
            >
              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-3xl shadow-2xl p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-display font-bold">Settings</h2>
                  <button onClick={() => setIsSettingsOpen(false)} className="p-2 hover:bg-[var(--surface)] rounded-full">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-8">
                  {/* Theme Selector */}
                  <section>
                    <label className="block text-sm font-bold uppercase tracking-wider opacity-50 mb-4">Aesthetic Theme</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(['light', 'dark', 'retro', 'cyberpunk'] as Theme[]).map((t) => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`
                            px-4 py-3 rounded-xl border-2 transition-all capitalize font-medium
                            ${theme === t 
                              ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/30' 
                              : 'border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)]/50'
                            }
                          `}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </section>

                  {/* Tab Cloak Toggle */}
                  <section className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 accent-text" />
                        Tab Cloak
                      </h3>
                      <p className="text-xs opacity-60">Disguise this tab as Google Docs</p>
                    </div>
                    <button
                      onClick={() => setIsCloaked(!isCloaked)}
                      className={`
                        w-14 h-8 rounded-full relative transition-colors duration-300
                        ${isCloaked ? 'accent-bg' : 'bg-gray-400'}
                      `}
                    >
                      <motion.div
                        animate={{ x: isCloaked ? 26 : 4 }}
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                      />
                    </button>
                  </section>
                </div>

                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full mt-10 p-4 accent-bg text-white rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg active:scale-95"
                >
                  Save & Close
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer */}
      {!selectedGame && (
        <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-[var(--border)] opacity-50 text-sm flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; 2026 Volt Unblocked. All games are property of their respective owners.</p>
          <div className="flex gap-6">
            <button className="hover:accent-text transition-colors">Privacy Policy</button>
            <button className="hover:accent-text transition-colors">Terms of Service</button>
          </div>
        </footer>
      )}
    </div>
  );
}
