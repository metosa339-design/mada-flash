export interface NewsSource {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  color: string;
  url: string;
  type: 'journal' | 'tv' | 'radio' | 'web';
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  content: string;
  imageUrl: string;
  imageCredit?: string;
  category: NewsCategory;
  source: NewsSource;
  sourceUrl: string;
  publishedAt: Date;
  isBreaking: boolean;
  isLive: boolean;
  isFeatured: boolean;  // Article à la une
  readTime: number;
  views: number;
  tags: string[];
}

export type NewsCategory =
  | 'politique'
  | 'economie'
  | 'sport'
  | 'culture'
  | 'societe'
  | 'international'
  | 'environnement'
  | 'technologie';

export interface BriefMatinal {
  id: string;
  date: Date;
  articles: NewsArticle[];
  summary: string;
}

export interface FilterState {
  source: string | null;
  category: NewsCategory | null;
  searchQuery: string;
}
