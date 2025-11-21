
export interface NewsArticle {
  id: string;
  category: string;
  title: string;
  summary: string;
  imageUrl?: string; // Optional now
  content?: string; // Optional field for the full detailed article
  source?: string; // News Source name
  time?: string;   // Publication time label (e.g., "2 hours ago")
}

export interface NewsSource {
  title: string;
  uri: string;
}

export interface CategoryData {
  name: string;
  count: number;
}

export interface NewsResponse {
  articles: NewsArticle[];
  sources: NewsSource[];
  categories: CategoryData[];
  rawText: string;
}
