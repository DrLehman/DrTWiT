import type { Episode, FeedResult, FeedSource } from '../types'

interface ShowHeaderProps {
  feed: FeedResult | null
  selectedSource: FeedSource | null
  selectedEpisode: Episode | null
  activeMode: 'audio' | 'video'
  onPlayLatest: () => void
  onModeChange: (mode: 'audio' | 'video') => void
}

export function ShowHeader({
  feed,
  selectedSource,
  selectedEpisode,
  activeMode,
  onPlayLatest,
  onModeChange,
}: ShowHeaderProps) {
  const image = feed?.image
  const title = feed?.title ?? selectedSource?.name ?? 'DrTWiT'
  const description = feed?.description || selectedSource?.description || 'Select a show or add a private RSS feed.'
  const primaryEpisode = selectedEpisode ?? feed?.episodes[0] ?? null

  return (
    <section className="show-header">
      <div className="show-art-frame">
        {image ? (
          <img src={image} alt="" />
        ) : (
          <div className="show-art-placeholder">
            <span>TECH</span>
            <strong>RSS</strong>
          </div>
        )}
      </div>

      <div className="show-copy">
        <div className="show-kicker">{feed?.sourceKind === 'custom' ? 'Local private feed' : 'TWiT network'}</div>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="header-actions">
          <button className="primary-button play-latest" type="button" onClick={onPlayLatest} disabled={!primaryEpisode}>
            ▶ Play latest
          </button>
          <button className="secondary-button" type="button">
            ✓ In queue
          </button>
          <button className="icon-button" type="button" aria-label="More actions">
            ⋯
          </button>
        </div>
      </div>

      <div className="mode-toggle" aria-label="Playback mode">
        <button
          className={activeMode === 'video' ? 'selected' : ''}
          type="button"
          onClick={() => onModeChange('video')}
        >
          ▭ Video
        </button>
        <button
          className={activeMode === 'audio' ? 'selected' : ''}
          type="button"
          onClick={() => onModeChange('audio')}
        >
          ◖ Audio
        </button>
      </div>
    </section>
  )
}
