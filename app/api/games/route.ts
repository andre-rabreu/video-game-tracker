import { NextRequest } from 'next/server';
import { getDb, writeDb } from '@/lib/db';
import { GameStatus } from '@/lib/types';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return Response.json({ error: 'userId é obrigatório' }, { status: 400 });
  }

  const db = await getDb();
  const games = db.user_games.filter((g) => g.userId === userId);

  const grouped = {
    playing: games.filter((g) => g.status === 'playing'),
    to_play: games.filter((g) => g.status === 'to_play'),
    completed: games.filter((g) => g.status === 'completed'),
  };

  return Response.json(grouped);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, gameId, title, coverUrl, status } = body as {
    userId: string;
    gameId: string;
    title: string;
    coverUrl: string;
    status: GameStatus;
  };

  if (!userId || !gameId || !title || !status) {
    return Response.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }

  const db = await getDb();

  const newEntry = {
    id: crypto.randomUUID(),
    userId,
    gameId,
    title,
    coverUrl: coverUrl || '',
    status,
  };

  db.user_games.push(newEntry);
  await writeDb(db);

  return Response.json(newEntry, { status: 201 });
}
