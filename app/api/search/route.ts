import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return Response.json({ results: [] });
  }

  const apiKey = process.env.RAWG_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'RAWG_API_KEY não configurada' }, { status: 500 });
  }

  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(query)}&page_size=12`;
  const res = await fetch(url);
  const data = await res.json();

  const results = (data.results || []).map(
    (game: { id: number; name: string; background_image: string | null }) => ({
      id: game.id,
      name: game.name,
      background_image: game.background_image,
    })
  );

  return Response.json({ results });
}
