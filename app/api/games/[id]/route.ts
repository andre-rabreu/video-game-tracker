import { NextRequest } from 'next/server';
import { getDb, writeDb } from '@/lib/db';
import { GameStatus } from '@/lib/types';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const db = await getDb();
  const index = db.user_games.findIndex((g) => g.id === id);

  if (index === -1) {
    return Response.json({ error: 'Jogo não encontrado' }, { status: 404 });
  }

  db.user_games.splice(index, 1);
  await writeDb(db);

  return Response.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = (await request.json()) as { status: GameStatus };
  const db = await getDb();
  const game = db.user_games.find((g) => g.id === id);

  if (!game) {
    return Response.json({ error: 'Jogo não encontrado' }, { status: 404 });
  }

  game.status = status;
  await writeDb(db);

  return Response.json(game);
}
