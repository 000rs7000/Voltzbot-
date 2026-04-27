export interface Game {
  id: string;
  title: string;
  description: string;
  url: string;
  image: string;
}

export type Theme = 'light' | 'dark' | 'retro' | 'cyberpunk';
