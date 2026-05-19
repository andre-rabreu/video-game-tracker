import { NextRequest } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const db = await getDb();
  const user = db.users.find(
    (u) => u.username === username && u.password === password
  );

  if (!user) {
    return Response.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  return Response.json({ userId: user.id, username: user.username });
}
