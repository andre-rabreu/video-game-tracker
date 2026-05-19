import { readFile, writeFile } from 'fs/promises';
import path from 'path';
import { Database } from './types';

const DB_PATH = path.join(process.cwd(), 'db.json');

export async function getDb(): Promise<Database> {
  const raw = await readFile(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

export async function writeDb(data: Database): Promise<void> {
  await writeFile(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
}
