export type GameStatus = 'playing' | 'to_play' | 'completed';

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
}

export interface UserGame {
  id: string;
  userId: string;
  gameId: string;
  title: string;
  coverUrl: string;
  status: GameStatus;
}

export interface GroupedGames {
  playing: UserGame[];
  to_play: UserGame[];
  completed: UserGame[];
}

export interface RawgGame {
  id: number;
  name: string;
  background_image: string | null;
}
