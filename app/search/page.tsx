'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Search } from 'lucide-react';
import { GameStatus, RawgGame } from '@/lib/types';
import SearchResultCard from '@/components/SearchResultCard';

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<RawgGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      router.push('/');
    }
  }, [router]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);

    const res = await fetch(`/api/search?query=${encodeURIComponent(query.trim())}`);
    const data = await res.json();
    setResults(data.results || []);
    setLoading(false);
  }

  async function handleAdd(game: RawgGame, status: GameStatus) {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    await fetch('/api/games', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        gameId: String(game.id),
        title: game.name,
        coverUrl: game.background_image || '',
        status,
      }),
    });

    alert(`"${game.name}" adicionado à sua coleção!`);
  }

  return (
    <main className="flex-1 flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.push('/dashboard')}
          className="text-muted hover:text-foreground transition-colors"
          aria-label="Voltar"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-bold">Buscar Jogos</h1>
      </header>

      <div className="p-4 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar por nome do jogo..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg px-4 py-2 text-sm font-medium transition-colors"
          >
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {loading && (
          <p className="text-muted text-sm text-center py-8">Buscando jogos...</p>
        )}

        {!loading && searched && results.length === 0 && (
          <p className="text-muted text-sm text-center py-8">
            Nenhum jogo encontrado para &quot;{query}&quot;
          </p>
        )}

        {!loading && results.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((game) => (
              <SearchResultCard key={game.id} game={game} onAdd={handleAdd} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
