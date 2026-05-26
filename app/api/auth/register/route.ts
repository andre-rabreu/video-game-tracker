import { NextRequest } from 'next/server';
import bcrypt from 'bcrypt';
import { RowDataPacket } from 'mysql2';
import { query } from '@/lib/mysql';

interface ConflictRow extends RowDataPacket {
  email: string;
  username: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    username?: string;
    email?: string;
    password?: string;
  };

  const username = body.username?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password;

  if (!username || username.length < 3 || username.length > 50) {
    return Response.json(
      { error: 'Nome de usuário deve ter entre 3 e 50 caracteres' },
      { status: 400 }
    );
  }
  if (!email || !EMAIL_RE.test(email)) {
    return Response.json({ error: 'Email inválido' }, { status: 400 });
  }
  if (!password || password.length < 6) {
    return Response.json(
      { error: 'Senha deve ter no mínimo 6 caracteres' },
      { status: 400 }
    );
  }

  const conflicts = await query<ConflictRow[]>(
    'SELECT email, username FROM usuarios WHERE email = ? OR username = ? LIMIT 1',
    [email, username]
  );

  if (conflicts[0]) {
    if (conflicts[0].email === email) {
      return Response.json({ error: 'Email já cadastrado' }, { status: 409 });
    }
    return Response.json(
      { error: 'Nome de usuário já cadastrado' },
      { status: 409 }
    );
  }

  const id = crypto.randomUUID();
  const hash = await bcrypt.hash(password, 10);

  try {
    await query(
      'INSERT INTO usuarios (id, username, email, password) VALUES (?, ?, ?, ?)',
      [id, username, email, hash]
    );
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code === 'ER_DUP_ENTRY') {
      const message = (err as { message?: string }).message ?? '';
      const conflict = message.includes('uk_usuarios_email')
        ? 'Email já cadastrado'
        : 'Nome de usuário já cadastrado';
      return Response.json({ error: conflict }, { status: 409 });
    }
    throw err;
  }

  return Response.json(
    { userId: id, username, email },
    { status: 201 }
  );
}
