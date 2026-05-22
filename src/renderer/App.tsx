import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { EpisodeList } from './components/EpisodeList'
import { PlayerBar } from './components/PlayerBar'
import { ShowHeader } from './components/ShowHeader'
import { Sidebar, type AppView } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { loadCustomFeeds, saveCustomFeeds } from './feedStorage'
import { getTwitApi } from './twitApi'
import type { CustomFeedSource, DownloadItem, DownloadMediaKind, DownloadSettings, Episode, FeedResult, FeedSource, SubscriptionSettings } from './types'

function App() {
  const [builtInSources, setBuiltInSources] = useState<FeedSource[]>([])
  const [customFeeds, setCustomFeeds] = useState<CustomFeedSource[]>(() => loadCustomFeeds())
  const [selectedSource, setSelectedSource] = useState<FeedSource | null>(null)
  const [feed, setFeed] = useState<FeedResult | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [playerEpisode, setPlayerEpisode] = useState<Episode | null>(null)
  const [playerFeedTitle, setPlayerFeedTitle] = useState<string | null>(null)
  const [feedArtworkBySourceId, setFeedArtworkBySourceId] = useState<Record<string, string>>({})
  const [query, setQuery] = useState('')
  const [transcriptTextByEpisodeGuid, setTranscriptTextByEpisodeGuid] = useState<Record<string, string>>({})
  const [isTranscriptSearchLoading, setIsTranscriptSearchLoading] = useState(false)
  const [activeMode, setActiveMode] = useState<'audio' | 'video'>('audio')
  const [playerMode, setPlayerMode] = useState<'audio' | 'video'>('audio')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeView, setActiveView] = useState<AppView>('shows')
  const [queuedEpisodes, setQueuedEpisodes] = useState<Episode[]>([])
  const [downloads, setDownloads] = useState<DownloadItem[]>([])
  const [downloadSettings, setDownloadSettings] = useState<DownloadSettings>({
    downloadDirectory: null,
    maxEpisodes: 25,
    maxDiskMegabytes: 2048,
    deleteAfterListen: false,
  })
  const [subscriptions, setSubscriptions] = useState<SubscriptionSettings[]>([])
  const [isFilterFocused, setIsFilterFocused] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [isMiniPlayer, setIsMiniPlayer] = useState(false)
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('Not checked yet')

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const pendingPlaybackRequestRef = useRef(0)
  const feedRequestSequenceRef = useRef(0)
  const automaticDownloadKeysRef = useRef(new Set<string>())
  const [playbackRequestId, setPlaybackRequestId] = useState(0)
  const twitApi = useMemo(() => getTwitApi(), [])

  const allSources = useMemo(() => [...builtInSources, ...customFeeds], [builtInSources, customFeeds])
  const normalizedQuery = query.trim().toLowerCase()
  const selectedSourceMatchesQuery = Boolean(normalizedQuery && (
    selectedSource?.name.toLowerCase().includes(normalizedQuery) ||
    feed?.title.toLowerCase().includes(normalizedQuery)
  ))
  const titleMatchedEpisodes = useMemo(() => {
    if (!feed || !normalizedQuery || selectedSourceMatchesQuery) {
      return []
    }
    return feed.episodes.filter(episode => episode.title.toLowerCase().includes(normalizedQuery))
  }, [feed, normalizedQuery, selectedSourceMatchesQuery])

  // Search is intentionally ordered instead of being one flat string match.
  // Source/show matches win first because the top search field is global in the
  // chrome. Episode-title matches come next because they are fast and obvious.
  // Episode-page text is last because it requires network fetches through the
  // trusted app boundary and should not hide stronger catalog/title matches.
  const filteredEpisodes = useMemo(() => {
    if (!feed || !normalizedQuery || selectedSourceMatchesQuery) {
      return feed?.episodes ?? []
    }

    if (titleMatchedEpisodes.length > 0) {
      return titleMatchedEpisodes
    }

    return feed.episodes.filter(episode => {
      return transcriptTextByEpisodeGuid[episode.guid]?.toLowerCase().includes(normalizedQuery)
    })
  }, [feed, normalizedQuery, selectedSourceMatchesQuery, titleMatchedEpisodes, transcriptTextByEpisodeGuid])

  const selectedMediaUrl = selectedEpisode
    ? activeMode === 'video'
      ? selectedEpisode.videoUrl
      : selectedEpisode.audioUrl
    : null
  const currentMediaUrl = playerEpisode
    ? playerMode === 'video'
      ? playerEpisode.videoUrl
      : playerEpisode.audioUrl
    : null
  const topBarStatusDetail = feed
    ? `${feed.episodes.length} episodes • ${activeMode}`
    : selectedSource
      ? selectedSource.name
      : 'Choose a show'
  const selectedEpisodeQueued = Boolean(selectedEpisode && queuedEpisodes.some(episode => episode.guid === selectedEpisode.guid))
  const sidebarBuiltInSources = useMemo(() => {
    return builtInSources.map(source => ({
      ...source,
      artworkUrl: feedArtworkBySourceId[source.id] ?? source.artworkUrl ?? null,
    }))
  }, [builtInSources, feedArtworkBySourceId])
  const sidebarCustomFeeds = useMemo(() => {
    return customFeeds.map(feedSource => ({
      ...feedSource,
      artworkUrl: feedArtworkBySourceId[feedSource.id] ?? feedSource.artworkUrl ?? null,
    }))
  }, [customFeeds, feedArtworkBySourceId])

  // Startup loads only the public built-in source catalog. Custom feeds are
  // loaded synchronously from localStorage above so private URLs never need to
  // leave the device unless the user selects that feed and asks the main process
  // to fetch it.
  useEffect(() => {
    let isMounted = true

    twitApi.getBuiltInSources().then(sourceList => {
      if (!isMounted) {
        return
      }
      setBuiltInSources(sourceList)
      setSelectedSource(currentSource => currentSource ?? sourceList[0] ?? null)
    }).catch(() => {
      if (isMounted) {
        setError('Built-in shows could not be loaded.')
      }
    })

    return () => {
      isMounted = false
    }
  }, [twitApi])

  // Persisting custom feeds in one effect keeps add/remove handlers simple and
  // makes the storage behavior obvious for future migrations or a safer storage
  // backend.
  useEffect(() => {
    saveCustomFeeds(customFeeds)
  }, [customFeeds])

  useEffect(() => {
    twitApi.getDownloads().then(setDownloads).catch(() => setDownloads([]))
    twitApi.getDownloadSettings().then(setDownloadSettings).catch(() => undefined)
    twitApi.getSubscriptions().then(setSubscriptions).catch(() => setSubscriptions([]))
  }, [twitApi])

  useEffect(() => {
    if (!normalizedQuery) {
      return
    }

    const sourceMatch = allSources.find(source => source.name.toLowerCase().includes(normalizedQuery))
    if (sourceMatch && sourceMatch.id !== selectedSource?.id) {
      setSelectedSource(sourceMatch)
      setActiveView('shows')
    }
  }, [allSources, normalizedQuery, selectedSource?.id])

  // Source and media-family selection are the two triggers for RSS loading. The
  // built-in TWiT catalog has separate audio and HD video RSS URLs, so switching
  // mode reloads the selected show from the correct feed instead of trying to
  // find video media inside the audio feed. Feed loading is intentionally scoped
  // to browsing state; it never tears down the currently playing episode.
  useEffect(() => {
    if (selectedSource) {
      loadFeed(selectedSource, activeMode)
    }
  }, [selectedSource, activeMode])

  useEffect(() => {
    if (!feed) {
      return
    }
    const activeSubscription = subscriptions.find(subscription => subscription.enabled && subscription.sourceId === feed.sourceId)
    if (!activeSubscription) {
      return
    }

    for (const mediaKind of activeSubscription.mediaKinds) {
      const episode = feed.episodes.find(candidate => mediaKind === 'video' ? candidate.videoUrl : candidate.audioUrl)
      if (!episode) {
        continue
      }
      const downloadKey = `${episode.guid}-${mediaKind}`
      const alreadyDownloaded = downloads.some(download => download.id === downloadKey)
      if (alreadyDownloaded || automaticDownloadKeysRef.current.has(downloadKey)) {
        continue
      }
      automaticDownloadKeysRef.current.add(downloadKey)
      handleDownloadEpisode(episode, mediaKind).catch(() => {
        automaticDownloadKeysRef.current.delete(downloadKey)
      })
    }
  }, [feed, subscriptions, downloads])

  useEffect(() => {
    if (!feed || !normalizedQuery || selectedSourceMatchesQuery || titleMatchedEpisodes.length > 0) {
      return
    }

    const episodesNeedingTranscript = feed.episodes
      .filter(episode => episode.link && !transcriptTextByEpisodeGuid[episode.guid])
      .slice(0, 12)

    if (episodesNeedingTranscript.length === 0) {
      return
    }

    let isCancelled = false
    setIsTranscriptSearchLoading(true)

    Promise.all(episodesNeedingTranscript.map(async episode => {
      try {
        const text = await twitApi.getEpisodePageText(episode.link)
        return [episode.guid, text] as const
      } catch {
        return [episode.guid, ''] as const
      }
    })).then(results => {
      if (isCancelled) {
        return
      }
      setTranscriptTextByEpisodeGuid(currentText => {
        const nextText = { ...currentText }
        for (const [guid, text] of results) {
          nextText[guid] = text
        }
        return nextText
      })
    }).finally(() => {
      if (!isCancelled) {
        setIsTranscriptSearchLoading(false)
      }
    })

    return () => {
      isCancelled = true
    }
  }, [feed, normalizedQuery, selectedSourceMatchesQuery, titleMatchedEpisodes.length, transcriptTextByEpisodeGuid, twitApi])

  // Volume has to be applied after media element swaps because switching from
  // audio to video creates a different DOM element with its own volume state.
  useEffect(() => {
    const activeMediaElement = playerMode === 'video' ? videoRef.current : audioRef.current
    if (activeMediaElement) {
      activeMediaElement.volume = volume
    }
  }, [playerMode, currentMediaUrl, volume])

  // The player has its own mode and episode, separate from the feed currently
  // being browsed. That separation is important: changing from Audio to Video in
  // the UI should not stop an already-playing audio element. Only an explicit
  // play request changes the player source, and this effect consumes that
  // request after React has mounted the matching media element.
  useLayoutEffect(() => {
    const media = activeMediaElement()
    if (media) {
      const shouldPlayRequestedEpisode = pendingPlaybackRequestRef.current === playbackRequestId && playbackRequestId > 0
      if (shouldPlayRequestedEpisode) {
        pendingPlaybackRequestRef.current = 0
        media.play().catch(() => setIsPlaying(false))
      }
    }
  }, [currentMediaUrl, playerMode, playbackRequestId])

  // Feed loading resets only the browsing selection. It deliberately does not
  // pause or replace the player, because browsing another show or switching
  // Audio/Video should not stop what is already playing.
  async function loadFeed(source: FeedSource, mediaPreference = activeMode) {
    const requestSequence = feedRequestSequenceRef.current + 1
    feedRequestSequenceRef.current = requestSequence
    setIsLoading(true)
    setError(null)
    setFeed(null)
    setSelectedEpisode(null)

    try {
      const feedResult = await twitApi.getFeed({
        kind: source.kind,
        id: source.id,
        feedUrl: source.kind === 'custom' ? source.feedUrl : undefined,
        mediaPreference,
      })
      if (feedRequestSequenceRef.current !== requestSequence) {
        return
      }
      setFeed(feedResult)
      setSelectedEpisode(feedResult.episodes[0] ?? null)
      if (feedResult.image) {
        setFeedArtworkBySourceId(currentArtwork => ({
          ...currentArtwork,
          [feedResult.sourceId]: feedResult.image ?? '',
        }))
      }
      setLastUpdatedLabel(new Date(feedResult.updatedAt).toLocaleString())
    } catch (caughtError) {
      if (feedRequestSequenceRef.current !== requestSequence) {
        return
      }
      setError(caughtError instanceof Error ? caughtError.message : 'The feed could not be loaded.')
    } finally {
      if (feedRequestSequenceRef.current === requestSequence) {
        setIsLoading(false)
      }
    }
  }

  // Adding a feed selects it immediately, matching the product workflow in the
  // concept: user adds a member URL, then sees whether it loads without hunting
  // for it in the source list.
  function handleAddFeed(feedSource: CustomFeedSource) {
    setCustomFeeds(currentFeeds => [...currentFeeds, feedSource])
    setSelectedSource(feedSource)
  }

  // Removal is local only. There is no cloud delete or remote unsubscribe step;
  // the app simply forgets the local URL and falls back to the first built-in
  // show if the removed feed was selected.
  function handleRemoveFeed(feedId: string) {
    setCustomFeeds(currentFeeds => currentFeeds.filter(feedSource => feedSource.id !== feedId))
    if (selectedSource?.id === feedId) {
      setSelectedSource(builtInSources[0] ?? null)
    }
  }

  // Episode selection updates the browsed row every time. It updates the actual
  // player only when the caller passes an explicit playback request, so ordinary
  // feed loads can select a row silently while row clicks and Play Latest start
  // the requested audio or video.
  function handleSelectEpisode(episode: Episode, shouldStartPlayback = false) {
    let requestedPlayerMode = activeMode
    setSelectedEpisode(episode)
    if (activeMode === 'video' && !episode.videoUrl && episode.audioUrl) {
      setActiveMode('audio')
      requestedPlayerMode = 'audio'
    }
    if (activeMode === 'audio' && !episode.audioUrl && episode.videoUrl) {
      setActiveMode('video')
      requestedPlayerMode = 'video'
    }
    if (shouldStartPlayback) {
      const nextPlaybackRequest = playbackRequestId + 1
      setPlayerEpisode(episode)
      setPlayerFeedTitle(feed?.title ?? selectedSource?.name ?? null)
      setPlayerMode(requestedPlayerMode)
      setProgress(0)
      setDuration(0)
      setIsPlaying(false)
      pendingPlaybackRequestRef.current = nextPlaybackRequest
      setPlaybackRequestId(nextPlaybackRequest)
    }
  }

  function handlePlayLatest() {
    const latestEpisode = feed?.episodes[0]
    if (latestEpisode) {
      handleSelectEpisode(latestEpisode, true)
    }
  }

  // The queue is intentionally local in this first redesign pass. It gives the
  // previously dead "In queue" and Queue navigation controls a concrete,
  // reversible behavior without introducing background downloads, accounts, or
  // persistent library state before those flows are designed.
  function handleToggleQueue() {
    const episodeToQueue = selectedEpisode ?? feed?.episodes[0]
    if (!episodeToQueue) {
      return
    }

    setQueuedEpisodes(currentQueue => {
      if (currentQueue.some(episode => episode.guid === episodeToQueue.guid)) {
        return currentQueue.filter(episode => episode.guid !== episodeToQueue.guid)
      }
      return [episodeToQueue, ...currentQueue]
    })
    setActiveView('queue')
  }

  async function handleDownloadEpisode(episode: Episode, mediaKind: DownloadMediaKind) {
    if (!selectedSource) {
      return
    }
    const item = await twitApi.downloadEpisode({
      sourceId: selectedSource.id,
      sourceName: feed?.title ?? selectedSource.name,
      episode,
      mediaKind,
    })
    setDownloads(currentDownloads => [
      item,
      ...currentDownloads.filter(download => download.id !== item.id),
    ])
    setActiveView('downloads')
  }

  async function handleDeleteDownload(id: string) {
    setDownloads(await twitApi.deleteDownload(id))
  }

  async function handleMarkDownloadListened(id: string) {
    setDownloads(await twitApi.markDownloadListened(id))
  }

  function handleRevealDownload(id: string) {
    twitApi.revealDownload(id).catch(() => undefined)
  }

  function handleOpenMiniPlayer() {
    twitApi.openMiniPlayer().then(() => {
      setIsMiniPlayer(true)
    }).catch(() => {
      setIsMiniPlayer(currentValue => !currentValue)
    })
  }

  async function handleSaveDownloadSettings(nextSettings: DownloadSettings) {
    setDownloadSettings(await twitApi.saveDownloadSettings(nextSettings))
  }

  async function handleSubscriptionChange(mediaKinds: DownloadMediaKind[]) {
    if (!selectedSource) {
      return
    }
    const nextSubscription: SubscriptionSettings = {
      sourceId: selectedSource.id,
      sourceName: feed?.title ?? selectedSource.name,
      mediaKinds,
      enabled: mediaKinds.length > 0,
    }
    setSubscriptions(await twitApi.saveSubscription(nextSubscription))
  }

  function renderUtilityView() {
    if (activeView === 'queue') {
      return (
        <section className="utility-view">
          <h2>Queue</h2>
          {queuedEpisodes.length === 0 ? (
            <p>No queued episodes yet. Use In queue on a selected episode to add one.</p>
          ) : (
            <div className="utility-list">
              {queuedEpisodes.map(episode => (
                <button className="utility-row" type="button" key={episode.guid} onClick={() => handleSelectEpisode(episode, true)}>
                  <strong>{episode.title}</strong>
                  <span>{episode.duration || 'Duration unavailable'}</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )
    }

    if (activeView === 'downloads') {
      return (
        <section className="utility-view">
          <h2>Downloads</h2>
          {downloads.length === 0 ? (
            <p>No offline episodes yet. Use the Audio or Video download buttons on an episode row to save media locally.</p>
          ) : (
            <div className="download-list">
              {downloads.map(download => (
                <article className="download-row" key={download.id}>
                  <div>
                    <strong>{download.title}</strong>
                    <span>{download.sourceName} • {download.mediaKind} • {download.status}</span>
                  </div>
                  <div className="download-actions">
                    <button type="button" onClick={() => handleRevealDownload(download.id)} disabled={!download.filePath}>Show file</button>
                    <button type="button" onClick={() => handleMarkDownloadListened(download.id)}>Mark listened</button>
                    <button type="button" onClick={() => handleDeleteDownload(download.id)}>Delete</button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )
    }

    return (
      <section className="utility-view">
        <h2>Settings</h2>
        <div className="settings-grid">
          <label>
            <span>Playback volume</span>
            <input type="range" min="0" max="1" step="0.05" value={volume} onChange={event => setVolume(Number(event.target.value))} />
          </label>
          <label>
            <span>Default media mode</span>
            <select value={activeMode} onChange={event => handleModeChange(event.target.value as 'audio' | 'video')}>
              <option value="audio">Audio</option>
              <option value="video">Video</option>
            </select>
          </label>
          <label>
            <span>Download folder</span>
            <input
              value={downloadSettings.downloadDirectory ?? ''}
              placeholder="Managed app data Downloads folder"
              onChange={event => handleSaveDownloadSettings({ ...downloadSettings, downloadDirectory: event.target.value || null })}
            />
          </label>
          <label>
            <span>Maximum downloaded episodes</span>
            <input
              type="number"
              min="1"
              value={downloadSettings.maxEpisodes}
              onChange={event => handleSaveDownloadSettings({ ...downloadSettings, maxEpisodes: Number(event.target.value) })}
            />
          </label>
          <label>
            <span>Maximum disk use (MB)</span>
            <input
              type="number"
              min="128"
              value={downloadSettings.maxDiskMegabytes}
              onChange={event => handleSaveDownloadSettings({ ...downloadSettings, maxDiskMegabytes: Number(event.target.value) })}
            />
          </label>
          <label className="settings-check">
            <input
              type="checkbox"
              checked={downloadSettings.deleteAfterListen}
              onChange={event => handleSaveDownloadSettings({ ...downloadSettings, deleteAfterListen: event.target.checked })}
            />
            <span>Delete after listened</span>
          </label>
        </div>
      </section>
    )
  }

  function handleModeChange(mode: 'audio' | 'video') {
    if (mode === 'video' && selectedSource?.kind === 'builtin' && selectedSource.hasVideo === false) {
      return
    }
    setActiveMode(mode)
  }

  function activeMediaElement(): HTMLAudioElement | HTMLVideoElement | null {
    if (playerMode === 'video' && playerEpisode) {
      return videoRef.current
    }
    return playerMode === 'audio' ? audioRef.current : null
  }

  function handleTogglePlayback() {
    const media = activeMediaElement()
    if (!media) {
      return
    }

    if (media.paused) {
      media.play().catch(() => setIsPlaying(false))
    } else {
      media.pause()
    }
  }

  function handleSkip(seconds: number) {
    const media = activeMediaElement()
    if (media) {
      media.currentTime = Math.max(0, media.currentTime + seconds)
    }
  }

  function handleSeek(percent: number) {
    const media = activeMediaElement()
    if (media && duration > 0) {
      media.currentTime = Math.min(duration, Math.max(0, duration * percent))
    }
  }

  // Fullscreen uses the most media-specific target available. In video mode the
  // video element should fill the display; in audio mode there is no visual
  // media element, so the application shell becomes the fullscreen target and
  // keeps the player controls available.
  function handleFullscreen() {
    const fullscreenTarget = videoRef.current?.closest('.video-stage') ?? videoRef.current ?? document.querySelector('.app-shell')
    const webkitTarget = fullscreenTarget as (Element & { webkitRequestFullscreen?: () => Promise<void> | void }) | null

    if (!fullscreenTarget) {
      return
    }

    const fullscreenRequest = fullscreenTarget.requestFullscreen?.() ?? webkitTarget?.webkitRequestFullscreen?.()
    Promise.resolve(fullscreenRequest).catch(() => {
      // Fullscreen can be rejected when the browser requires a stricter user
      // activation. The control is best-effort and should not disrupt playback.
    })
  }

  function handleTimeUpdate() {
    const media = activeMediaElement()
    if (media) {
      setProgress(media.currentTime)
      setDuration(Number.isFinite(media.duration) ? media.duration : 0)
    }
  }

  // The video stage must be tied to the active video player whenever video is
  // already playing. Without this derived target, changing from one feed mode to
  // another can swap the video element's src out from under the player and stop
  // playback as a side effect of browsing. When the player is not currently a
  // video, the stage can safely act as a browsing preview for the selected row.
  const videoStageEpisode = playerMode === 'video' && playerEpisode ? playerEpisode : selectedEpisode
  const videoStageMediaUrl = playerMode === 'video' && playerEpisode ? currentMediaUrl : selectedMediaUrl
  const videoStageIsActivePlayer = Boolean(playerMode === 'video' && playerEpisode && videoStageEpisode?.guid === playerEpisode.guid)
  const shouldRenderVideoStage = Boolean(videoStageEpisode?.videoUrl && videoStageMediaUrl && activeMode === 'video')

  return (
    <div className={`app-shell ${isMiniPlayer ? 'player-mini' : ''}`}>
      <Sidebar
        sources={sidebarBuiltInSources}
        customFeeds={sidebarCustomFeeds}
        selectedSourceId={selectedSource?.id ?? null}
        lastUpdatedLabel={lastUpdatedLabel}
        activeView={activeView}
        queueCount={queuedEpisodes.length}
        downloadCount={downloads.length}
        onSelectView={setActiveView}
        onSelectSource={setSelectedSource}
        onAddFeed={handleAddFeed}
        onRemoveFeed={handleRemoveFeed}
      />

      <main className="workspace">
        <TopBar
          query={query}
          isLoading={isLoading}
          statusLabel={error ? 'Needs Attention' : 'All Up to Date'}
          statusDetail={error ?? topBarStatusDetail}
          onQueryChange={setQuery}
          onRefresh={() => selectedSource && loadFeed(selectedSource)}
          onFocusSearch={() => setIsFilterFocused(true)}
          onFilter={() => setIsFilterFocused(current => !current)}
        />

        <div className="content-region">
          {activeView === 'shows' ? (
            <>
              {isFilterFocused && (
                <div className="filter-banner">
                  Search is filtering the current episode list.
                  {isTranscriptSearchLoading ? ' Checking episode pages.' : ''}
                  <button type="button" onClick={() => setQuery('')}>Clear search</button>
                </div>
              )}
              {shouldRenderVideoStage && videoStageEpisode && videoStageMediaUrl && (
                <section className={`video-stage player-video-stage ${activeMode === 'audio' ? 'preserved-player' : ''}`}>
                  <video
                    ref={videoRef}
                    src={videoStageMediaUrl}
                    poster={videoStageEpisode.thumbnail ?? undefined}
                    onTimeUpdate={handleTimeUpdate}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                  />
                  {(!videoStageIsActivePlayer || !isPlaying) && (
                    <button className="video-overlay-play" type="button" onClick={() => handleSelectEpisode(videoStageEpisode, true)}>
                      <span>▶</span>
                    </button>
                  )}
                  <div className="video-stage-tools" aria-label="Video window controls">
                    <button type="button" onClick={handleOpenMiniPlayer}>
                      Mini
                    </button>
                    <button type="button" aria-label="Fullscreen video" onClick={handleFullscreen}>
                      ⛶
                    </button>
                  </div>
                </section>
              )}
              <ShowHeader
                feed={feed}
                selectedSource={selectedSource}
                selectedEpisode={selectedEpisode}
                activeMode={activeMode}
                isQueued={selectedEpisodeQueued}
                onPlayLatest={handlePlayLatest}
                onToggleQueue={handleToggleQueue}
                onModeChange={handleModeChange}
                onRefresh={() => selectedSource && loadFeed(selectedSource, activeMode)}
              />
              {selectedSource && (
                <div className="subscription-panel">
                  <span>Auto-download this feed</span>
                  {(['audio', 'video'] as DownloadMediaKind[]).map(mediaKind => {
                    const currentSubscription = subscriptions.find(subscription => subscription.sourceId === selectedSource.id)
                    const checked = Boolean(currentSubscription?.mediaKinds.includes(mediaKind))
                    return (
                      <label key={mediaKind}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={event => {
                            const existingKinds = currentSubscription?.mediaKinds ?? []
                            const nextKinds = event.target.checked
                              ? [...new Set([...existingKinds, mediaKind])]
                              : existingKinds.filter(kind => kind !== mediaKind)
                            handleSubscriptionChange(nextKinds)
                          }}
                        />
                        {mediaKind}
                      </label>
                    )
                  })}
                </div>
              )}
              <EpisodeList
                episodes={filteredEpisodes}
                selectedEpisode={selectedEpisode}
                isLoading={isLoading}
                error={error}
                onSelectEpisode={episode => handleSelectEpisode(episode, true)}
                onDownloadEpisode={handleDownloadEpisode}
              />
            </>
          ) : renderUtilityView()}
        </div>
      </main>

      {playerEpisode?.audioUrl && playerMode === 'audio' && currentMediaUrl && (
        <audio
          ref={audioRef}
          src={currentMediaUrl}
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <PlayerBar
        episode={playerEpisode ?? selectedEpisode}
        feedTitle={playerEpisode ? playerFeedTitle : feed?.title ?? null}
        activeMode={playerMode}
        isPlaying={isPlaying}
        isMiniPlayer={isMiniPlayer}
        progress={progress}
        duration={duration}
        volume={volume}
        onTogglePlayback={handleTogglePlayback}
        onToggleMiniPlayer={handleOpenMiniPlayer}
        onFullscreen={handleFullscreen}
        onSkip={handleSkip}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
      />
    </div>
  )
}

export default App
