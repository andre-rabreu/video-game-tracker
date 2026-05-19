'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Plus } from 'lucide-react';
import { GameStatus, RawgGame } from '@/lib/types';

interface SearchResultCardProps {
  game: RawgGame;
  onAdd: (game: RawgGame, status: GameStatus) => void;
}

export default function SearchResultCard({ game, onAdd }: SearchResultCardProps) {
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  const handleAdd = (status: GameStatus) => {
    onAdd(game, status);
    setShowStatusPicker(false);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:border-accent/50 transition-colors">
      <div className="relative aspect-[3/4] w-full">
        {game.background_image ? (
          <Image
            src={game.background_image}
            alt={game.name}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 200px"
            quality={90}
          />
        ) : (
          <div className="w-full h-full bg-border flex items-center justify-center text-muted text-sm">
            Sem capa
          </div>
        )}
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-medium truncate" title={game.name}>
          {game.name}
        </h3>
        {!showStatusPicker ? (
          <button
            onClick={() => setShowStatusPicker(true)}
            className="w-full flex items-center justify-center gap-1 bg-accent hover:bg-accent-hover text-white rounded px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus size={14} />
            Adicionar
          </button>
        ) : (
          <div className="flex flex-col gap-1">
            <button
              onClick={() => handleAdd('playing')}
              className="w-full bg-accent/20 hover:bg-accent/30 text-accent rounded px-2 py-1 text-xs transition-colors"
            >
              Jogando
            </button>
            <button
              onClick={() => handleAdd('to_play')}
              className="w-full bg-warning/20 hover:bg-warning/30 text-warning rounded px-2 py-1 text-xs transition-colors"
            >
              Na Fila
            </button>
            <button
              onClick={() => handleAdd('completed')}
              className="w-full bg-success/20 hover:bg-success/30 text-success rounded px-2 py-1 text-xs transition-colors"
            >
              Concluído
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
