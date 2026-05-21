import { FormEvent, useState } from 'react'
import { createCustomFeed, safeFeedLabel } from '../feedStorage'
import type { CustomFeedSource } from '../types'

interface AddFeedFormProps {
  onAddFeed: (feed: CustomFeedSource) => void
}

export function AddFeedForm({ onAddFeed }: AddFeedFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [feedUrl, setFeedUrl] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    try {
      const customFeed = createCustomFeed(name, feedUrl)
      onAddFeed(customFeed)
      setName('')
      setFeedUrl('')
      setIsOpen(false)
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'Feed URL is not valid.')
    }
  }

  if (!isOpen) {
    return (
      <button className="add-feed-button" type="button" onClick={() => setIsOpen(true)}>
        <span className="button-icon">+</span>
        Add feed URL
      </button>
    )
  }

  return (
    <form className="add-feed-form" onSubmit={handleSubmit}>
      <div className="form-heading">Private RSS feed</div>
      <label>
        <span>Feed name</span>
        <input
          type="text"
          value={name}
          onChange={event => setName(event.target.value)}
          placeholder="Member feed"
          autoComplete="off"
        />
      </label>
      <label>
        <span>Feed URL</span>
        <input
          type="url"
          value={feedUrl}
          onChange={event => setFeedUrl(event.target.value)}
          placeholder="https://..."
          autoComplete="off"
        />
      </label>
      {feedUrl && !error && <p className="form-hint">Stored locally as {safeFeedLabel(feedUrl)}</p>}
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button className="quiet-button" type="button" onClick={() => setIsOpen(false)}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          Save feed
        </button>
      </div>
    </form>
  )
}
