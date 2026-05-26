import { NextRequest } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import { query } from '@/lib/mysql';
import { GameStatus } from '@/lib/types';

const VALID_STATUS: ReadonlySet<GameStatus> = new Set([
  'playing',
  'to_play',
  'completed',
]);

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const result = await query<ResultSetHeader>(
    'DELETE FROM jogos_usuario WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    return Response.json({ error: 'Jogo não encontrado' }, { status: 404 });
  }

  return Response.json({ success: true });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = (await request.json()) as { status?: GameStatus };

  if (!status || !VALID_STATUS.has(status)) {
    return Response.json({ error: 'Status inválido' }, { status: 400 });
  }

  const result = await query<ResultSetHeader>(
    'UPDATE jogos_usuario SET status = ? WHERE id = ?',
    [status, id]
  );

  if (result.affectedRows === 0) {
    return Response.json({ error: 'Jogo não encontrado' }, { status: 404 });
  }

  return Response.json({ id, status });
}
