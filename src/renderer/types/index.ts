export interface Show {
  id: string
  name: string
}

export interface Episode {
  guid: string
  title: string
  description: string
  pubDate: string
  duration: string
  thumbnail: string | null
  audioUrl: string | null
  videoUrl: string | null
  link: string
}

export interface Feed {
  title: string
  description: string
  image: string | null
  author: string
  episodes: Episode[]
}

export interface TwitAPI {
  getShows: () => Promise<Show[]>
  getFeed: (showId: string) => Promise<Feed>
}

declare global {
  interface Window {
    twit: TwitAPI
  }
}
