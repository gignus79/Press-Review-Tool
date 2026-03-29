/** Tipi condivisi tra categorizzazione, ranking ed export. */

export type ContentType = 'Review' | 'Interview' | 'Article' | 'News' | 'Streaming' | 'Other';

export type PressResultCore = {
  title: string;
  url: string;
  description: string;
  date: string;
  content_type: ContentType;
  source: string;
  language: string;
};

export type RankedPressResult = PressResultCore & { match_score: number };
