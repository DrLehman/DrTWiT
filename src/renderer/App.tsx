import { useState, useEffect, useRef } from 'react'
import type { Show, Feed, Episode } from './types'

function App() {
  const [shows, setShows] = useState<Show[]>([])
  const [selectedShow, setSelectedShow] = useState<string | null>(null)
  const [feed, setFeed] = useState<Feed | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isVideo, setIsVideo] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)

  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    loadShows()
  }, [])

  useEffect(() => {
    if (selectedShow) {
      loadFeed(selectedShow)
    }
  }, [selectedShow])

  const loadShows = async () => {
    try {
      const showList = await window.twit.getShows()
      setShows(showList)
      if (showList.length > 0) {
        setSelectedShow(showList[0].id)
      }
    } catch (err) {
      setError('Failed to load shows')
      console.error(err)
    }
  }

  const loadFeed = async (showId: string) => {
    setLoading(true)
    setError(null)
    try {
      const feedData = await window.twit.getFeed(showId)
      setFeed(feedData)
    } catch (err) {
      setError('Failed to load feed')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const playEpisode = (episode: Episode, preferVideo: boolean = false) => {
    const mediaUrl = preferVideo && episode.videoUrl ? episode.videoUrl : episode.audioUrl
    if (!mediaUrl) return

    setCurrentEpisode(episode)
    setIsVideo(preferVideo && !!episode.videoUrl)
    setIsPlaying(true)
    setProgress(0)
  }

  const togglePlayPause = () => {
    const media = isVideo ? videoRef.current : audioRef.current
    if (!media) return

    if (isPlaying) {
      media.pause()
    } else {
      media.play()
    }
    setIsPlaying(!isPlaying)
  }

  const handleTimeUpdate = () => {
    const media = isVideo ? videoRef.current : audioRef.current
    if (!media) return
    setProgress(media.currentTime)
    setDuration(media.duration || 0)
  }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const media = isVideo ? videoRef.current : audioRef.current
    if (!media || !duration) return

    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    media.currentTime = percent * duration
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    setVolume(value)
    const media = isVideo ? videoRef.current : audioRef.current
    if (media) {
      media.volume = value
    }
  }

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string): string => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateString
    }
  }

  const currentMediaUrl = currentEpisode
    ? isVideo
      ? currentEpisode.videoUrl
      : currentEpisode.audioUrl
    : null

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h1>DrTWiT</h1>
          <p>TWiT Network Player</p>
        </div>
        <div className="shows-list">
          {shows.map((show) => (
            <div
              key={show.id}
              className={`show-item ${selectedShow === show.id ? 'active' : ''}`}
              onClick={() => setSelectedShow(show.id)}
            >
              <span className="show-item-name">{show.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading">
            <div className="loading-spinner" />
            <p>Loading episodes...</p>
          </div>
        ) : error ? (
          <div className="empty-state">
            <div className="empty-state-icon">!</div>
            <p>{error}</p>
          </div>
        ) : feed ? (
          <>
            <header className="content-header">
              {feed.image && (
                <img src={feed.image} alt={feed.title} className="show-image" />
              )}
              <div className="show-info">
                <h2>{feed.title}</h2>
                <p>{feed.author}</p>
              </div>
            </header>

            {/* Video Player (when playing video) */}
            {currentEpisode && isVideo && currentMediaUrl && (
              <div className="video-container">
                <video
                  ref={videoRef}
                  className="video-player"
                  src={currentMediaUrl}
                  autoPlay
                  onTimeUpdate={handleTimeUpdate}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
              </div>
            )}

            <div className="episodes-container">
              {feed.episodes.map((episode) => (
                <div
                  key={episode.guid}
                  className={`episode-card ${currentEpisode?.guid === episode.guid ? 'playing' : ''}`}
                >
                  {episode.thumbnail && (
                    <img
                      src={episode.thumbnail}
                      alt=""
                      className="episode-thumbnail"
                    />
                  )}
                  <div className="episode-info">
                    <h3 className="episode-title">{episode.title}</h3>
                    <div className="episode-meta">
                      {formatDate(episode.pubDate)}
                      {episode.duration && ` • ${episode.duration}`}
                    </div>
                    <p className="episode-description">{episode.description}</p>
                  </div>
                  <div className="episode-actions">
                    {episode.audioUrl && (
                      <button
                        className="play-button secondary"
                        onClick={() => playEpisode(episode, false)}
                      >
                        Audio
                      </button>
                    )}
                    {episode.videoUrl && (
                      <button
                        className="play-button"
                        onClick={() => playEpisode(episode, true)}
                      >
                        Video
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📺</div>
            <p>Select a show to get started</p>
          </div>
        )}

        {/* Audio Player (hidden element) */}
        {currentEpisode && !isVideo && currentMediaUrl && (
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

        {/* Player Bar */}
        {currentEpisode && (
          <div className="player">
            <div className="player-info">
              <div className="player-title">{currentEpisode.title}</div>
              <div className="player-show">{feed?.title}</div>
            </div>

            <div className="player-controls">
              <button className="control-button" onClick={() => {
                const media = isVideo ? videoRef.current : audioRef.current
                if (media) media.currentTime -= 15
              }}>
                ⏪
              </button>
              <button className="control-button play-pause" onClick={togglePlayPause}>
                {isPlaying ? '⏸' : '▶'}
              </button>
              <button className="control-button" onClick={() => {
                const media = isVideo ? videoRef.current : audioRef.current
                if (media) media.currentTime += 30
              }}>
                ⏩
              </button>
            </div>

            <div className="player-progress">
              <span className="time-display">{formatTime(progress)}</span>
              <div className="progress-bar" onClick={handleSeek}>
                <div
                  className="progress-fill"
                  style={{ width: `${duration ? (progress / duration) * 100 : 0}%` }}
                />
              </div>
              <span className="time-display">{formatTime(duration)}</span>
            </div>

            <div className="volume-control">
              <span>🔊</span>
              <input
                type="range"
                className="volume-slider"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
