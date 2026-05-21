export type {
  CustomFeedSource,
  Episode,
  FeedRequest,
  FeedResult,
  FeedSource,
  FeedSourceKind,
  TwitAPI,
} from '../../shared/types'

import type { TwitAPI } from '../../shared/types'

declare global {
  interface Window {
    twit: TwitAPI
  }
}
