export interface TMDbSearchResult {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
}

export interface TMDbSearchResponse {
  results: TMDbSearchResult[];
}

export interface TMDbGenre {
  id: number;
  name: string;
}

export interface TMDbCastMember {
  id: number;
  name: string;
  character: string;
}

export interface TMDbMovieDetail {
  id: number;
  title: string;
  release_date: string;
  poster_path: string | null;
  overview: string;
  runtime: number | null;
  genres: TMDbGenre[];
  vote_average: number;
  credits?: {
    cast: TMDbCastMember[];
  };
}
