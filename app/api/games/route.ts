import { NextRequest } from 'next/server';
import { RowDataPacket } from 'mysql2';
import { query } from '@/lib/mysql';
import { GameStatus, GroupedGames, UserGame } from '@/lib/types';

interface GameRow extends RowDataPacket {
  id: string;
  userId: string;
  gameId: string;
  title: string;
  coverUrl: string | null;
  status: GameStatus;
}

const VALID_STATUS: ReadonlySet<GameStatus> = new Set([
  'playing',
  'to_play',
  'completed',
]);

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  if (!userId) {
    return Response.json({ error: 'userId é obrigatório' }, { status: 400 });
  }

  const rows = await query<GameRow[]>(
    `SELECT id,
            usuario_id AS userId,
            jogo_id    AS gameId,
            titulo     AS title,
            capa_url   AS coverUrl,
            status
       FROM jogos_usuario
      WHERE usuario_id = ?`,
    [userId]
  );

  const games: UserGame[] = rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    gameId: r.gameId,
    title: r.title,
    coverUrl: r.coverUrl ?? '',
    status: r.status,
  }));

  const grouped: GroupedGames = {
    playing: games.filter((g) => g.status === 'playing'),
    to_play: games.filter((g) => g.status === 'to_play'),
    completed: games.filter((g) => g.status === 'completed'),
  };

  return Response.json(grouped);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    userId?: string;
    gameId?: string;
    title?: string;
    coverUrl?: string;
    status?: GameStatus;
  };
  const { userId, gameId, title, coverUrl, status } = body;

  if (!userId || !gameId || !title || !status) {
    return Response.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
  }
  if (!VALID_STATUS.has(status)) {
    return Response.json({ error: 'Status inválido' }, { status: 400 });
  }

  const id = crypto.randomUUID();
  const cover = coverUrl ?? '';

  await query(
    `INSERT INTO jogos_usuario (id, usuario_id, jogo_id, titulo, capa_url, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, userId, gameId, title, cover, status]
  );

  const newEntry: UserGame = {
    id,
    userId,
    gameId,
    title,
    coverUrl: cover,
    status,
  };

  return Response.json(newEntry, { status: 201 });
}
