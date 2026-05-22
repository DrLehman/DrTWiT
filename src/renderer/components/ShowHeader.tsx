import { useEffect, useRef, useState } from 'react'
import type { Episode, FeedResult, FeedSource } from '../types'

interface ShowHeaderProps {
  feed: FeedResult | null
  selectedSource: FeedSource | null
  selectedEpisode: Episode | null
  activeMode: 'audio' | 'video'
  isQueued: boolean
  onPlayLatest: () => void
  onToggleQueue: () => void
  onModeChange: (mode: 'audio' | 'video') => void
  onRefresh: () => void
}

export function ShowHeader({
  feed,
  selectedSource,
  selectedEpisode,
  activeMode,
  isQueued,
  onPlayLatest,
  onToggleQueue,
  onModeChange,
  onRefresh,
}: ShowHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [copiedLabel, setCopiedLabel] = useState('Copy episode link')
  const menuRef = useRef<HTMLDivElement>(null)
  const image = feed?.image ?? selectedSource?.artworkUrl
  const title = feed?.title ?? selectedSource?.name ?? 'DrTWiT'
  const description = feed?.description || selectedSource?.description || 'Select a show or add a private RSS feed.'
  const primaryEpisode = selectedEpisode ?? feed?.episodes[0] ?? null
  const hasEpisodeLink = Boolean(primaryEpisode?.link)

  // The menu is intentionally local to the header because it only exposes
  // source/episode actions for the currently visible show. Closing on outside
  // click prevents the ellipsis from feeling like a dead decorative control.
  useEffect(() => {
    function handleOutsidePointer(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsidePointer)
    return () => document.removeEventListener('mousedown', handleOutsidePointer)
  }, [])

  // Episode links are public show-page URLs in built-in feeds and may be
  // member/private links for custom feeds. Copying is only triggered by a user
  // click and never exposes the underlying feed URL or tokenized RSS URL.
  async function handleCopyEpisodeLink() {
    if (!primaryEpisode?.link) {
      return
    }

    await navigator.clipboard.writeText(primaryEpisode.link)
    setCopiedLabel('Copied')
    window.setTimeout(() => setCopiedLabel('Copy episode link'), 1600)
  }

  // Opening the episode page goes through the browser/window open path instead
  // of navigating the app itself, preserving the single-screen player state.
  function handleOpenEpisodePage() {
    if (primaryEpisode?.link) {
      window.open(primaryEpisode.link, '_blank', 'noopener,noreferrer')
      setIsMenuOpen(false)
    }
  }

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
            Play latest
          </button>
          <button className="secondary-button" type="button" onClick={onToggleQueue} disabled={!primaryEpisode}>
            {isQueued ? 'Queued' : 'In queue'}
          </button>
          <div className="action-menu-wrap" ref={menuRef}>
            <button
              className="icon-button"
              type="button"
              aria-label="More actions"
              aria-expanded={isMenuOpen}
              onClick={() => setIsMenuOpen(current => !current)}
            >
              ⋯
            </button>
            {isMenuOpen && (
              <div className="action-menu" role="menu">
                <button type="button" role="menuitem" onClick={onRefresh}>
                  Refresh feed
                </button>
                <button type="button" role="menuitem" onClick={handleCopyEpisodeLink} disabled={!hasEpisodeLink}>
                  {copiedLabel}
                </button>
                <button type="button" role="menuitem" onClick={handleOpenEpisodePage} disabled={!hasEpisodeLink}>
                  Open episode page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mode-toggle" aria-label="Playback mode">
        <button
          className={activeMode === 'video' ? 'selected' : ''}
          type="button"
          onClick={() => onModeChange('video')}
        >
          Video
        </button>
        <button
          className={activeMode === 'audio' ? 'selected' : ''}
          type="button"
          onClick={() => onModeChange('audio')}
        >
          Audio
        </button>
      </div>
    </section>
  )
}
