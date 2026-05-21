interface TopBarProps {
  query: string
  isLoading: boolean
  statusLabel: string
  onQueryChange: (value: string) => void
  onRefresh: () => void
}

export function TopBar({ query, isLoading, statusLabel, onQueryChange, onRefresh }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="history-controls" aria-hidden="true">
        <button type="button">‹</button>
        <button type="button">›</button>
      </div>
      <button className="refresh-button" type="button" onClick={onRefresh} disabled={isLoading}>
        ↻
      </button>
      <label className="search-box">
        <span>⌕</span>
        <input
          type="search"
          value={query}
          onChange={event => onQueryChange(event.target.value)}
          placeholder="Search shows or episodes"
        />
        <kbd>⌘K</kbd>
      </label>
      <div className="filter-control">Filter</div>
      <div className="health-status">
        <span className={isLoading ? 'pulse-dot' : 'check-dot'} />
        <div>
          <strong>{isLoading ? 'Updating' : statusLabel}</strong>
          <small>{isLoading ? 'Fetching RSS' : 'Local development mode'}</small>
        </div>
      </div>
    </header>
  )
}
