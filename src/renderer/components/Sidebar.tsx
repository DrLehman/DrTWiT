import { AddFeedForm } from './AddFeedForm'
import type { CustomFeedSource, FeedSource } from '../types'

interface SidebarProps {
  sources: FeedSource[]
  customFeeds: CustomFeedSource[]
  selectedSourceId: string | null
  lastUpdatedLabel: string
  onSelectSource: (source: FeedSource) => void
  onAddFeed: (feed: CustomFeedSource) => void
  onRemoveFeed: (feedId: string) => void
}

export function Sidebar({
  sources,
  customFeeds,
  selectedSourceId,
  lastUpdatedLabel,
  onSelectSource,
  onAddFeed,
  onRemoveFeed,
}: SidebarProps) {
  // The sidebar separates built-in shows from local/private feeds because the
  // privacy model is different: public shows are safe static catalog entries,
  // while custom feeds may contain tokenized URLs and need remove controls.
  return (
    <aside className="sidebar">
      <div className="window-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <div className="brand-lockup">
        <div className="brand-word">
          <span>Dr</span>TWiT
        </div>
        <div className="brand-signal" aria-hidden="true">mic</div>
      </div>

      <nav className="primary-nav" aria-label="Primary">
        <button className="nav-item active" type="button">
          <span className="nav-icon">▦</span>
          Shows
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">☰</span>
          Queue
          <span className="nav-count">0</span>
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">↓</span>
          Downloads
          <span className="nav-count">0</span>
        </button>
        <button className="nav-item" type="button">
          <span className="nav-icon">⚙</span>
          Settings
        </button>
      </nav>

      <div className="source-section">
        <div className="section-label">Shows</div>
        <div className="source-list">
          {sources.map(source => (
            <button
              className={`source-row ${selectedSourceId === source.id ? 'selected' : ''}`}
              key={source.id}
              type="button"
              onClick={() => onSelectSource(source)}
            >
              <span className="source-art">{source.name.slice(0, 2).toUpperCase()}</span>
              <span className="source-name">{source.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="source-section custom-section">
        <div className="section-label">Local feeds</div>
        {customFeeds.length === 0 ? (
          <p className="sidebar-note">Add member RSS URLs here. They stay in local app storage.</p>
        ) : (
          <div className="source-list">
            {customFeeds.map(feed => (
              <div className="custom-feed-row" key={feed.id}>
                <button
                  className={`source-row custom ${selectedSourceId === feed.id ? 'selected' : ''}`}
                  type="button"
                  onClick={() => onSelectSource(feed)}
                >
                  <span className="source-art private">RSS</span>
                  <span className="source-name">{feed.name}</span>
                </button>
                <button
                  className="remove-feed-button"
                  type="button"
                  aria-label={`Remove ${feed.name}`}
                  onClick={() => onRemoveFeed(feed.id)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <AddFeedForm onAddFeed={onAddFeed} />
      </div>

      <div className="sync-card">
        <div>
          <span className="status-dot" />
          RSS updated
        </div>
        <strong>{lastUpdatedLabel}</strong>
      </div>
    </aside>
  )
}
