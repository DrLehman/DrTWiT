export type FeedSourceKind = 'builtin' | 'custom'

export interface FeedSource {
  id: string
  kind: FeedSourceKind
  name: string
  description?: string
  feedUrl?: string
}

export interface CustomFeedSource extends FeedSource {
  kind: 'custom'
  feedUrl: string
  createdAt: string
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

export interface FeedResult {
  sourceId: string
  sourceKind: FeedSourceKind
  title: string
  description: string
  image: string | null
  author: string
  updatedAt: string
  episodes: Episode[]
}

export interface FeedRequest {
  kind: FeedSourceKind
  id: string
  feedUrl?: string
}

export interface TwitAPI {
  getBuiltInSources: () => Promise<FeedSource[]>
  getFeed: (request: FeedRequest) => Promise<FeedResult>
}
