'use client';

import Image from 'next/image';
import { Trash2 } from 'lucide-react';
import { GameStatus, UserGame } from '@/lib/types';
import StatusSelect from './StatusSelect';

interface GameCardProps {
  game: UserGame;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: GameStatus) => void;
}

export default function GameCard({ game, onDelete, onStatusChange }: GameCardProps) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-colors group">
      <div className="relative aspect-[3/4] w-full">
        {game.coverUrl ? (
          <Image
            src={game.coverUrl}
            alt={game.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 180px"
            quality={90}
          />
        ) : (
          <div className="w-full h-full bg-border flex items-center justify-center text-muted text-xs">
            Sem capa
          </div>
        )}
        <button
          onClick={() => onDelete(game.id)}
          className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-danger text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Remover jogo"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="p-2 space-y-1.5">
        <h3 className="text-xs font-medium truncate" title={game.title}>
          {game.title}
        </h3>
        <StatusSelect
          value={game.status}
          onChange={(status) => onStatusChange(game.id, status)}
        />
      </div>
    </div>
  );
}
