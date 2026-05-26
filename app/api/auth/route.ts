import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import { query } from '@/lib/mysql';

interface UserRow extends RowDataPacket {
  id: string;
  username: string;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  const { email, password } = (await request.json()) as {
    email?: string;
    password?: string;
  };

  if (!email || !password) {
    return Response.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const rows = await query<UserRow[]>(
    'SELECT id, username, email, password FROM usuarios WHERE email = ? LIMIT 1',
    [email]
  );

  const user = rows[0];
  if (!user) {
    return Response.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return Response.json({ error: 'Credenciais inválidas' }, { status: 401 });
  }

  return Response.json({
    userId: user.id,
    username: user.username,
    email: user.email,
  });
}
