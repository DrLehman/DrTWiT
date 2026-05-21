import type { MouseEvent } from 'react'
import type { Episode, FeedResult } from '../types'

interface PlayerBarProps {
  episode: Episode | null
  feed: FeedResult | null
  activeMode: 'audio' | 'video'
  isPlaying: boolean
  progress: number
  duration: number
  volume: number
  onTogglePlayback: () => void
  onSkip: (seconds: number) => void
  onSeek: (percent: number) => void
  onVolumeChange: (volume: number) => void
}

export function PlayerBar({
  episode,
  feed,
  activeMode,
  isPlaying,
  progress,
  duration,
  volume,
  onTogglePlayback,
  onSkip,
  onSeek,
  onVolumeChange,
}: PlayerBarProps) {
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0

  // The player receives a percent instead of a raw timestamp so the shared
  // transport bar stays presentation-only. App.tsx owns the actual media element
  // and clamps the resulting time against the active duration.
  function handleSeek(event: MouseEvent<HTMLDivElement>) {
    const bounds = event.currentTarget.getBoundingClientRect()
    onSeek((event.clientX - bounds.left) / bounds.width)
  }

  return (
    <footer className="player-bar">
      <div className="now-playing">
        <div className="mini-art">
          {episode?.thumbnail ? <img src={episode.thumbnail} alt="" /> : <span>Dr</span>}
        </div>
        <div>
          <strong>{episode?.title ?? 'Select an episode'}</strong>
          <span>{feed?.title ?? 'No feed loaded'}</span>
        </div>
      </div>

      <div className="transport">
        <div className="transport-buttons">
          <button type="button" onClick={() => onSkip(-10)} disabled={!episode}>↶10</button>
          <button className="play-toggle" type="button" onClick={onTogglePlayback} disabled={!episode}>
            {isPlaying ? 'Ⅱ' : '▶'}
          </button>
          <button type="button" onClick={() => onSkip(30)} disabled={!episode}>30↷</button>
        </div>
        <div className="timeline">
          <span>{formatClock(progress)}</span>
          <div className="scrubber" onClick={handleSeek}>
            <div style={{ width: `${progressPercent}%` }} />
          </div>
          <span>{formatClock(duration)}</span>
        </div>
      </div>

      <div className="player-tools">
        <span className="mode-readout">{activeMode}</span>
        <label className="volume">
          <span>⌁</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={event => onVolumeChange(Number(event.target.value))}
          />
        </label>
      </div>
    </footer>
  )
}

function formatClock(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '0:00'
  }

  const wholeSeconds = Math.floor(seconds)
  const hours = Math.floor(wholeSeconds / 3600)
  const minutes = Math.floor((wholeSeconds % 3600) / 60)
  const remainingSeconds = wholeSeconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}
