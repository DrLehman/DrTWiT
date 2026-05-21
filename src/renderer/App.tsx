import { useEffect, useMemo, useRef, useState } from 'react'
import { EpisodeList } from './components/EpisodeList'
import { PlayerBar } from './components/PlayerBar'
import { ShowHeader } from './components/ShowHeader'
import { Sidebar } from './components/Sidebar'
import { TopBar } from './components/TopBar'
import { loadCustomFeeds, saveCustomFeeds } from './feedStorage'
import { getTwitApi } from './twitApi'
import type { CustomFeedSource, Episode, FeedResult, FeedSource } from './types'

function App() {
  const [builtInSources, setBuiltInSources] = useState<FeedSource[]>([])
  const [customFeeds, setCustomFeeds] = useState<CustomFeedSource[]>(() => loadCustomFeeds())
  const [selectedSource, setSelectedSource] = useState<FeedSource | null>(null)
  const [feed, setFeed] = useState<FeedResult | null>(null)
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null)
  const [query, setQuery] = useState('')
  const [activeMode, setActiveMode] = useState<'audio' | 'video'>('audio')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.8)
  const [lastUpdatedLabel, setLastUpdatedLabel] = useState('Not checked yet')

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const twitApi = useMemo(() => getTwitApi(), [])

  // Episode filtering stays local to the currently loaded feed. It is scoped to
  // title and description because those are the fields users can scan in the
  // redesigned table, and it avoids accidentally searching private feed URLs.
  const filteredEpisodes = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!feed || !normalizedQuery) {
      return feed?.episodes ?? []
    }

    return feed.episodes.filter(episode => {
      return `${episode.title} ${episode.description}`.toLowerCase().includes(normalizedQuery)
    })
  }, [feed, query])

  const currentMediaUrl = selectedEpisode
    ? activeMode === 'video'
      ? selectedEpisode.videoUrl
      : selectedEpisode.audioUrl
    : null

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

  // A source selection is the single trigger for RSS loading. This keeps refresh
  // and first-load behavior consistent for built-in and user-entered feeds.
  useEffect(() => {
    if (selectedSource) {
      loadFeed(selectedSource)
    }
  }, [selectedSource])

  // Volume has to be applied after media element swaps because switching from
  // audio to video creates a different DOM element with its own volume state.
  useEffect(() => {
    const activeMediaElement = activeMode === 'video' ? videoRef.current : audioRef.current
    if (activeMediaElement) {
      activeMediaElement.volume = volume
    }
  }, [activeMode, currentMediaUrl, volume])

  // Feed loading resets playback state before fetching so stale episodes or
  // progress from the previous feed cannot remain visible during a slow network
  // request.
  async function loadFeed(source: FeedSource) {
    setIsLoading(true)
    setError(null)
    setFeed(null)
    setSelectedEpisode(null)
    setProgress(0)
    setDuration(0)

    try {
      const feedResult = await twitApi.getFeed({
        kind: source.kind,
        id: source.id,
        feedUrl: source.kind === 'custom' ? source.feedUrl : undefined,
      })
      setFeed(feedResult)
      setSelectedEpisode(feedResult.episodes[0] ?? null)
      setLastUpdatedLabel(new Date(feedResult.updatedAt).toLocaleString())
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'The feed could not be loaded.')
    } finally {
      setIsLoading(false)
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

  // Episode selection also reconciles the requested media mode. If a user has
  // video selected but chooses an audio-only episode, the player falls back to
  // audio instead of presenting a dead transport.
  function handleSelectEpisode(episode: Episode) {
    setSelectedEpisode(episode)
    if (activeMode === 'video' && !episode.videoUrl && episode.audioUrl) {
      setActiveMode('audio')
    }
    if (activeMode === 'audio' && !episode.audioUrl && episode.videoUrl) {
      setActiveMode('video')
    }
    setProgress(0)
    setDuration(0)
    setIsPlaying(true)
  }

  function handlePlayLatest() {
    const latestEpisode = feed?.episodes[0]
    if (latestEpisode) {
      handleSelectEpisode(latestEpisode)
    }
  }

  function handleModeChange(mode: 'audio' | 'video') {
    if (!selectedEpisode) {
      setActiveMode(mode)
      return
    }

    if (mode === 'video' && !selectedEpisode.videoUrl) {
      return
    }
    if (mode === 'audio' && !selectedEpisode.audioUrl) {
      return
    }
    setActiveMode(mode)
    setProgress(0)
    setDuration(0)
  }

  function activeMediaElement(): HTMLAudioElement | HTMLVideoElement | null {
    return activeMode === 'video' ? videoRef.current : audioRef.current
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

  function handleTimeUpdate() {
    const media = activeMediaElement()
    if (media) {
      setProgress(media.currentTime)
      setDuration(Number.isFinite(media.duration) ? media.duration : 0)
    }
  }

  return (
    <div className="app-shell">
      <Sidebar
        sources={builtInSources}
        customFeeds={customFeeds}
        selectedSourceId={selectedSource?.id ?? null}
        lastUpdatedLabel={lastUpdatedLabel}
        onSelectSource={setSelectedSource}
        onAddFeed={handleAddFeed}
        onRemoveFeed={handleRemoveFeed}
      />

      <main className="workspace">
        <TopBar
          query={query}
          isLoading={isLoading}
          statusLabel={error ? 'Needs Attention' : 'All Up to Date'}
          onQueryChange={setQuery}
          onRefresh={() => selectedSource && loadFeed(selectedSource)}
        />

        <div className="content-region">
          <ShowHeader
            feed={feed}
            selectedSource={selectedSource}
            selectedEpisode={selectedEpisode}
            activeMode={activeMode}
            onPlayLatest={handlePlayLatest}
            onModeChange={handleModeChange}
          />
          {selectedEpisode?.videoUrl && activeMode === 'video' && currentMediaUrl && (
            <section className="video-stage">
              <video
                ref={videoRef}
                src={currentMediaUrl}
                autoPlay
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => setIsPlaying(false)}
              />
            </section>
          )}
          <EpisodeList
            episodes={filteredEpisodes}
            selectedEpisode={selectedEpisode}
            isLoading={isLoading}
            error={error}
            onSelectEpisode={handleSelectEpisode}
          />
        </div>
      </main>

      {selectedEpisode?.audioUrl && activeMode === 'audio' && currentMediaUrl && (
        <audio
          ref={audioRef}
          src={currentMediaUrl}
          autoPlay
          onTimeUpdate={handleTimeUpdate}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
      )}

      <PlayerBar
        episode={selectedEpisode}
        feed={feed}
        activeMode={activeMode}
        isPlaying={isPlaying}
        progress={progress}
        duration={duration}
        volume={volume}
        onTogglePlayback={handleTogglePlayback}
        onSkip={handleSkip}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
      />
    </div>
  )
}

export default App
