'use client';

import { GameStatus, UserGame } from '@/lib/types';
import GameCard from './GameCard';

const COLUMN_CONFIG: Record<GameStatus, { title: string; color: string }> = {
  playing: { title: 'Jogando no Momento', color: 'bg-accent' },
  to_play: { title: 'Na Fila', color: 'bg-warning' },
  completed: { title: 'Concluídos', color: 'bg-success' },
};

interface KanbanColumnProps {
  status: GameStatus;
  games: UserGame[];
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: GameStatus) => void;
}

export default function KanbanColumn({
  status,
  games,
  onDelete,
  onStatusChange,
}: KanbanColumnProps) {
  const config = COLUMN_CONFIG[status];

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${config.color}`} />
        <h2 className="font-semibold text-sm">{config.title}</h2>
        <span className="text-xs text-muted bg-border rounded-full px-2 py-0.5">
          {games.length}
        </span>
      </div>
      <div className="grid gap-3">
        {games.length === 0 ? (
          <p className="text-muted text-sm text-center py-8 border border-dashed border-border rounded-lg">
            Nenhum jogo aqui
          </p>
        ) : (
          games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}
