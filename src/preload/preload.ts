import { contextBridge, ipcRenderer } from 'electron'
import type { FeedRequest, FeedResult, FeedSource, TwitAPI } from '../shared/types'

// The preload bridge is intentionally tiny: it exposes typed request methods
// but does not leak ipcRenderer to React. That keeps the renderer constrained to
// the app's feed contract while the main process remains responsible for remote
// network access and RSS parsing.
const api: TwitAPI = {
  getBuiltInSources: () => ipcRenderer.invoke('get-built-in-sources') as Promise<FeedSource[]>,
  getFeed: (request: FeedRequest) => ipcRenderer.invoke('get-feed', request) as Promise<FeedResult>,
}

contextBridge.exposeInMainWorld('twit', api)
