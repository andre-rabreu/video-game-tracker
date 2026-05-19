'use client';

import { GameStatus } from '@/lib/types';

const STATUS_LABELS: Record<GameStatus, string> = {
  playing: 'Jogando',
  to_play: 'Na Fila',
  completed: 'Concluído',
};

interface StatusSelectProps {
  value: GameStatus;
  onChange: (status: GameStatus) => void;
}

export default function StatusSelect({ value, onChange }: StatusSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as GameStatus)}
      className="bg-background border border-border rounded px-2 py-1 text-xs text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-accent"
    >
      {Object.entries(STATUS_LABELS).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}
