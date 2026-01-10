import { app, BrowserWindow, ipcMain, shell } from 'electron'
import * as path from 'path'
import Parser from 'rss-parser'

type CustomFeed = {
  'itunes:image'?: { href?: string }
  'itunes:author'?: string
}

type CustomItem = {
  mediaContent?: any[]
  mediaThumbnail?: { url?: string }
  duration?: string
  itunesImage?: { href?: string }
  summary?: string
}

const parser: Parser<CustomFeed, CustomItem> = new Parser({
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
} as any)

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV !== 'production' || !app.isPackaged

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    titleBarStyle: 'hiddenInset',
    show: false,
  })

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
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

// TWiT Shows - these are the official RSS feed URLs
const TWIT_SHOWS = [
  { id: 'twit', name: 'This Week in Tech', feed: 'https://feeds.twit.tv/twit.xml' },
  { id: 'sn', name: 'Security Now', feed: 'https://feeds.twit.tv/sn.xml' },
  { id: 'ww', name: 'Windows Weekly', feed: 'https://feeds.twit.tv/ww.xml' },
  { id: 'mbw', name: 'MacBreak Weekly', feed: 'https://feeds.twit.tv/mbw.xml' },
  { id: 'twig', name: 'This Week in Google', feed: 'https://feeds.twit.tv/twig.xml' },
  { id: 'floss', name: 'FLOSS Weekly', feed: 'https://feeds.twit.tv/floss.xml' },
  { id: 'ttg', name: 'The Tech Guy', feed: 'https://feeds.twit.tv/ttg.xml' },
  { id: 'ipad', name: 'iOS Today', feed: 'https://feeds.twit.tv/ipad.xml' },
  { id: 'aaa', name: 'All About Android', feed: 'https://feeds.twit.tv/aaa.xml' },
  { id: 'hotn', name: 'Hands-On Tech', feed: 'https://feeds.twit.tv/hotn.xml' },
  { id: 'tri', name: 'Triangulation', feed: 'https://feeds.twit.tv/tri.xml' },
]

// IPC Handlers
ipcMain.handle('get-shows', async () => {
  return TWIT_SHOWS.map(show => ({
    id: show.id,
    name: show.name,
  }))
})

ipcMain.handle('get-feed', async (_event, showId: string) => {
  const show = TWIT_SHOWS.find(s => s.id === showId)
  if (!show) {
    throw new Error(`Show not found: ${showId}`)
  }

  try {
    const feed = await parser.parseURL(show.feed)
    return {
      title: feed.title,
      description: feed.description,
      image: (feed as any)['itunes:image']?.href || feed.image?.url,
      author: (feed as any)['itunes:author'] || '',
      episodes: feed.items.slice(0, 50).map(item => ({
        guid: item.guid || item.link,
        title: item.title,
        description: item.summary || item.contentSnippet || item.content,
        pubDate: item.pubDate,
        duration: item.duration,
        thumbnail: item.mediaThumbnail?.url || item.itunesImage?.href,
        audioUrl: getMediaUrl(item, 'audio'),
        videoUrl: getMediaUrl(item, 'video'),
        link: item.link,
      })),
    }
  } catch (error) {
    console.error(`Error fetching feed for ${showId}:`, error)
    throw error
  }
})

function getMediaUrl(item: any, type: 'audio' | 'video'): string | null {
  if (item.enclosure?.url) {
    const url = item.enclosure.url
    if (type === 'video' && (url.includes('video') || url.endsWith('.mp4'))) {
      return url
    }
    if (type === 'audio' && (url.includes('audio') || url.endsWith('.mp3'))) {
      return url
    }
    // Default to enclosure if no specific type match
    if (type === 'audio') return url
  }

  if (item.mediaContent && Array.isArray(item.mediaContent)) {
    for (const media of item.mediaContent) {
      const mediaType = media.$?.type || ''
      const url = media.$?.url
      if (type === 'video' && mediaType.startsWith('video')) {
        return url
      }
      if (type === 'audio' && mediaType.startsWith('audio')) {
        return url
      }
    }
  }

  return null
}

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
