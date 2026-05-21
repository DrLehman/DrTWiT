import type { FeedRequest, FeedResult, FeedSource, TwitAPI } from './types'

const PREVIEW_SOURCES: FeedSource[] = [
  {
    id: 'twit',
    kind: 'builtin',
    name: 'This Week in Tech',
    description: 'Leo Laporte and friends discuss the latest in tech.',
  },
  {
    id: 'sn',
    kind: 'builtin',
    name: 'Security Now',
    description: 'Security analysis for people who need the details.',
  },
  {
    id: 'mbw',
    kind: 'builtin',
    name: 'MacBreak Weekly',
    description: 'Apple news, products, and platform conversation.',
  },
  {
    id: 'ww',
    kind: 'builtin',
    name: 'Windows Weekly',
    description: 'Microsoft, Windows, Surface, and Xbox coverage.',
  },
  {
    id: 'twig',
    kind: 'builtin',
    name: 'This Week in Google',
    description: 'Google, web platforms, AI, and policy discussion.',
  },
  {
    id: 'floss',
    kind: 'builtin',
    name: 'FLOSS Weekly',
    description: 'Open source people, projects, and communities.',
  },
  {
    id: 'hot',
    kind: 'builtin',
    name: 'Hands-On Tech',
    description: 'Practical answers for devices, apps, and services.',
  },
  {
    id: 'tnw',
    kind: 'builtin',
    name: 'Tech News Weekly',
    description: 'A weekly look at the most important technology stories.',
  },
]

// Browser QA runs against Vite without Electron's preload bridge. This preview
// API keeps that rendered path useful by supplying deterministic data with the
// same shape as the Electron IPC contract. The production app path still uses
// window.twit, so real RSS fetching remains owned by the main process.
export const browserPreviewApi: TwitAPI = {
  getBuiltInSources: async () => PREVIEW_SOURCES,
  getFeed: async (request: FeedRequest): Promise<FeedResult> => {
    const source = PREVIEW_SOURCES.find(candidate => candidate.id === request.id)
    const isCustom = request.kind === 'custom'
    const title = isCustom ? 'Member RSS Feed' : source?.name ?? 'This Week in Tech'

    return {
      sourceId: request.id,
      sourceKind: request.kind,
      title,
      description: isCustom
        ? 'A private RSS feed saved locally for this development preview.'
        : source?.description ?? 'A curated TWiT network show.',
      image: null,
      author: isCustom ? 'Local feed' : 'TWiT',
      updatedAt: new Date().toISOString(),
      episodes: [
        {
          guid: `${request.id}-1001`,
          title: 'Episode 1001: AI Accessories',
          description: 'Meta glasses, Google I/O recap, and all the week’s tech news.',
          pubDate: '2026-05-18T14:00:00.000Z',
          duration: '2:10:36',
          thumbnail: null,
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          videoUrl: null,
          link: 'https://twit.tv/',
        },
        {
          guid: `${request.id}-1000`,
          title: 'Episode 1000: The Big 1000',
          description: 'Stories, memories, and special guests from across the network.',
          pubDate: '2026-05-11T14:00:00.000Z',
          duration: '2:05:12',
          thumbnail: null,
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          videoUrl: null,
          link: 'https://twit.tv/',
        },
        {
          guid: `${request.id}-999`,
          title: 'Episode 999: Deep Research',
          description: 'AI research tools, developer announcements, and product shifts.',
          pubDate: '2026-05-04T14:00:00.000Z',
          duration: '2:02:44',
          thumbnail: null,
          audioUrl: 'https://archive.org/download/testmp3testfile/mpthreetest.mp3',
          videoUrl: null,
          link: 'https://twit.tv/',
        },
      ],
    }
  },
}
