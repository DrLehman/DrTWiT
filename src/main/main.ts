import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
import Parser from 'rss-parser'
import type { Episode, FeedRequest, FeedResult, FeedSource, FeedSourceKind } from '../shared/types'

type TwitFeedDefinition = FeedSource & {
  kind: 'builtin'
  feedUrl: string
}

type RssFeedExtensions = {
  'itunes:image'?: { href?: string }
  'itunes:author'?: string
}

type RssItemExtensions = {
  mediaContent?: Array<{ $?: { type?: string; url?: string } }>
  mediaThumbnail?: { url?: string }
  duration?: string
  itunesImage?: { href?: string }
  summary?: string
}

const parser: Parser<RssFeedExtensions, RssItemExtensions> = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent', { keepArray: true }],
      ['media:thumbnail', 'mediaThumbnail'],
      ['itunes:duration', 'duration'],
      ['itunes:image', 'itunesImage'],
      ['itunes:summary', 'summary'],
    ],
    feed: [
      ['itunes:image', 'itunes:image'],
      ['itunes:author', 'itunes:author'],
    ],
  },
} as unknown as ConstructorParameters<typeof Parser<RssFeedExtensions, RssItemExtensions>>[0])

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged

const BUILT_IN_SOURCES: TwitFeedDefinition[] = [
  {
    id: 'twit',
    kind: 'builtin',
    name: 'This Week in Tech',
    description: 'Leo Laporte and guests cover the week in technology.',
    feedUrl: 'https://feeds.twit.tv/twit.xml',
  },
  {
    id: 'sn',
    kind: 'builtin',
    name: 'Security Now',
    description: 'Deep security analysis and practical computing risk context.',
    feedUrl: 'https://feeds.twit.tv/sn.xml',
  },
  {
    id: 'ww',
    kind: 'builtin',
    name: 'Windows Weekly',
    description: 'Microsoft, Windows, Surface, Xbox, and developer ecosystem news.',
    feedUrl: 'https://feeds.twit.tv/ww.xml',
  },
  {
    id: 'mbw',
    kind: 'builtin',
    name: 'MacBreak Weekly',
    description: 'Apple news, hardware, software, and culture coverage.',
    feedUrl: 'https://feeds.twit.tv/mbw.xml',
  },
  {
    id: 'twig',
    kind: 'builtin',
    name: 'This Week in Google',
    description: 'Google, AI, cloud, policy, and web platform conversation.',
    feedUrl: 'https://feeds.twit.tv/twig.xml',
  },
  {
    id: 'floss',
    kind: 'builtin',
    name: 'FLOSS Weekly',
    description: 'Open source projects, maintainers, and software communities.',
    feedUrl: 'https://feeds.twit.tv/floss.xml',
  },
  {
    id: 'hot',
    kind: 'builtin',
    name: 'Hands-On Tech',
    description: 'Practical answers for devices, software, and everyday tech.',
    feedUrl: 'https://feeds.twit.tv/hot.xml',
  },
  {
    id: 'tnw',
    kind: 'builtin',
    name: 'Tech News Weekly',
    description: 'A sharper weekly look at the most important technology stories.',
    feedUrl: 'https://feeds.twit.tv/tnw.xml',
  },
]

// Electron owns all remote RSS loading instead of letting the renderer fetch
// feeds directly. That keeps CORS, tokenized private URLs, and parser-specific
// normalization in one trusted process boundary while the renderer receives a
// stable, display-oriented data contract.
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 900,
    minWidth: 1040,
    minHeight: 720,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#0b0d10',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'))
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// Private/member RSS URLs can include bearer-like tokens in the query string or
// path. Errors returned to the renderer are therefore intentionally generic: the
// UI gets an actionable message, but neither the renderer state nor screenshots
// need to contain the full secret-bearing URL.
function sanitizeRemoteError(error: unknown): Error {
  const message = error instanceof Error ? error.message : 'The feed could not be loaded.'
  if (/invalid url/i.test(message)) {
    return new Error('The feed URL is not valid.')
  }
  if (/status code 401|status code 403/i.test(message)) {
    return new Error('The feed rejected the request. Check that the member feed URL is complete.')
  }
  if (/status code 404/i.test(message)) {
    return new Error('No feed was found at that URL.')
  }
  return new Error('The feed could not be loaded. Check the URL and try again.')
}

// URL validation is duplicated in the renderer for fast feedback and repeated
// here as the security boundary. The main process never trusts renderer input,
// even though the only current caller is the local app UI.
function validateCustomFeedUrl(feedUrl: string | undefined): string {
  if (!feedUrl) {
    throw new Error('A feed URL is required.')
  }

  const parsed = new URL(feedUrl)
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('Feed URLs must begin with http:// or https://.')
  }

  return parsed.toString()
}

// Built-in feeds are resolved by id so the renderer does not need to know their
// canonical URLs. Custom feeds carry a local URL because that is user data
// entered on this machine and persisted only in renderer localStorage.
function resolveFeedRequest(request: FeedRequest): {
  sourceId: string
  sourceKind: FeedSourceKind
  feedUrl: string
} {
  if (request.kind === 'builtin') {
    const builtInSource = BUILT_IN_SOURCES.find(source => source.id === request.id)
    if (!builtInSource) {
      throw new Error('The requested built-in show was not found.')
    }
    return {
      sourceId: builtInSource.id,
      sourceKind: 'builtin',
      feedUrl: builtInSource.feedUrl,
    }
  }

  return {
    sourceId: request.id,
    sourceKind: 'custom',
    feedUrl: validateCustomFeedUrl(request.feedUrl),
  }
}

// RSS feeds are inconsistent about optional text fields. This helper keeps the
// downstream mapping readable and guarantees the renderer sees strings instead
// of undefined values for labels, descriptions, and dates.
function firstText(...values: Array<string | undefined | null>): string {
  return values.find(value => typeof value === 'string' && value.trim().length > 0)?.trim() ?? ''
}

// Episode mapping translates many RSS dialects into one renderer contract. The
// chosen fields deliberately favor visible UI stability: every episode gets an
// id, a title, a description, a thumbnail fallback, and explicit nullable media
// URLs so buttons can be shown only when playback is possible.
function mapEpisode(item: Parser.Item & RssItemExtensions, feedImage: string | null): Episode {
  const guid = firstText(item.guid, item.link, item.title, item.pubDate)
  const media = getMediaUrls(item)

  return {
    guid,
    title: firstText(item.title, 'Untitled episode'),
    description: firstText(item.summary, item.contentSnippet, item.content, 'No description was provided.'),
    pubDate: firstText(item.pubDate, item.isoDate),
    duration: firstText(item.duration),
    thumbnail: item.mediaThumbnail?.url ?? item.itunesImage?.href ?? feedImage,
    audioUrl: media.audioUrl,
    videoUrl: media.videoUrl,
    link: firstText(item.link),
  }
}

// Media selection prefers explicit MIME hints when they are available, then
// falls back to the normal podcast enclosure as audio. That matches most TWiT
// and member-feed RSS behavior without hiding audio-only shows behind a missing
// video URL.
function getMediaUrls(item: Parser.Item & RssItemExtensions): Pick<Episode, 'audioUrl' | 'videoUrl'> {
  let audioUrl: string | null = null
  let videoUrl: string | null = null

  if (item.enclosure?.url) {
    const enclosureType = item.enclosure.type ?? ''
    if (enclosureType.startsWith('video') || item.enclosure.url.endsWith('.mp4')) {
      videoUrl = item.enclosure.url
    } else {
      audioUrl = item.enclosure.url
    }
  }

  for (const media of item.mediaContent ?? []) {
    const mediaType = media.$?.type ?? ''
    const mediaUrl = media.$?.url ?? null
    if (!mediaUrl) {
      continue
    }
    if (!videoUrl && mediaType.startsWith('video')) {
      videoUrl = mediaUrl
    }
    if (!audioUrl && mediaType.startsWith('audio')) {
      audioUrl = mediaUrl
    }
  }

  return { audioUrl, videoUrl }
}

ipcMain.handle('get-built-in-sources', async (): Promise<FeedSource[]> => {
  return BUILT_IN_SOURCES.map(({ id, kind, name, description }) => ({ id, kind, name, description }))
})

ipcMain.handle('get-feed', async (_event, request: FeedRequest): Promise<FeedResult> => {
  const resolvedRequest = resolveFeedRequest(request)

  try {
    const feed = await parser.parseURL(resolvedRequest.feedUrl)
    const feedImage = feed['itunes:image']?.href ?? feed.image?.url ?? null
    return {
      sourceId: resolvedRequest.sourceId,
      sourceKind: resolvedRequest.sourceKind,
      title: firstText(feed.title, 'Untitled feed'),
      description: firstText(feed.description),
      image: feedImage,
      author: firstText(feed['itunes:author']),
      updatedAt: new Date().toISOString(),
      episodes: feed.items.slice(0, 60).map(item => mapEpisode(item, feedImage)),
    }
  } catch (error) {
    console.error('Feed load failed:', error instanceof Error ? error.message : 'Unknown feed error')
    throw sanitizeRemoteError(error)
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
