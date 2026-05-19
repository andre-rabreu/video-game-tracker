'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Gamepad2, Clock, Trophy } from 'lucide-react';
import { GameStatus, GroupedGames } from '@/lib/types';
import GameCard from '@/components/GameCard';

const TABS: { key: GameStatus; label: string; icon: typeof Gamepad2 }[] = [
  { key: 'playing', label: 'Jogando', icon: Gamepad2 },
  { key: 'to_play', label: 'Na Fila', icon: Clock },
  { key: 'completed', label: 'Concluídos', icon: Trophy },
];

export default function DashboardPage() {
  const router = useRouter();
  const [games, setGames] = useState<GroupedGames | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<GameStatus>('playing');

  const fetchGames = useCallback(async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/');
      return;
    }

    const res = await fetch(`/api/games?userId=${userId}`);
    const data = await res.json();
    setGames(data);
    setLoading(false);
  }, [router]);

  useEffect(() => {
    fetchGames();
  }, [fetchGames]);

  async function handleDelete(id: string) {
    await fetch(`/api/games/${id}`, { method: 'DELETE' });
    fetchGames();
  }

  async function handleStatusChange(id: string, status: GameStatus) {
    await fetch(`/api/games/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    fetchGames();
  }

  function handleLogout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    router.push('/');
  }

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-muted">Carregando...</p>
      </main>
    );
  }

  const currentGames = games ? games[activeTab] : [];

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold">Minha Coleção</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push('/search')}
            className="flex items-center gap-1.5 bg-accent hover:bg-accent-hover text-white rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Adicionar Jogo</span>
          </button>
          <button
            onClick={handleLogout}
            className="text-muted hover:text-foreground p-1.5 transition-colors"
            aria-label="Sair"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="border-b border-border">
        <nav className="flex px-4 gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const count = games ? games[tab.key].length : 0;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? 'border-accent text-accent'
                    : 'border-transparent text-muted hover:text-foreground'
                }`}
              >
                <Icon size={14} />
                {tab.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                  isActive ? 'bg-accent/20 text-accent' : 'bg-border text-muted'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {currentGames.length === 0 ? (
          <p className="text-muted text-sm text-center py-12">
            Nenhum jogo nesta categoria
          </p>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {currentGames.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
