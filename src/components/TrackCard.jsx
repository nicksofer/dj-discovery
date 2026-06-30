import { getBpmInfo } from '../utils/bpm'
import StreamingButton from './StreamingButton'

function getGenreDna(tags) {
  if (!tags.length) return []
  const total = tags.reduce((sum, _, i) => sum + (tags.length - i), 0)
  return tags.slice(0, 4).map((tag, i) => ({
    name: tag,
    pct: Math.round(((tags.length - i) / total) * 100),
  }))
}

export default function TrackCard({ track, camelot, trackImageUrl, onSearchArtist, onAddToSet }) {
  const allTags    = track.toptags?.tag?.map(t => t.name) ?? []
  const bpm        = getBpmInfo(allTags)
  const dna        = getGenreDna(allTags)
  const artistName = track.artist?.name ?? track.artist ?? ''
  const playcount  = Number(track.playcount ?? 0)

  return (
    <div className="artist-card">
      {trackImageUrl
        ? <img src={trackImageUrl} alt={track.name} />
        : <div className="artist-img-placeholder" />}

      <div className="artist-info">
        <h2>{track.name}</h2>
        <p className="listeners">
          by{' '}
          <span className="rec-artist-name" onClick={() => onSearchArtist(artistName)}>
            {artistName}
          </span>
          {playcount > 0 && <> · {playcount.toLocaleString()} plays</>}
        </p>

        <div className="track-card-meta">
          {camelot && (
            <span className={`camelot-badge ${camelot.endsWith('A') ? 'minor' : 'major'}`}>
              {camelot}
            </span>
          )}
          {bpm && (
            <p className="bpm-range">
              <span className="bpm-label">Typical BPM</span>
              <span className="bpm-value">{bpm.range}</span>
            </p>
          )}
        </div>

        {dna.length > 0 && (
          <div className="genre-dna">
            {dna.map(({ name, pct }) => (
              <div key={name} className="dna-row">
                <span className="dna-label">{name}</span>
                <div className="dna-bar-track">
                  <div className="dna-bar-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="dna-pct">{pct}%</span>
              </div>
            ))}
          </div>
        )}

        <div className="track-card-actions">
          <StreamingButton trackName={track.name} artistName={artistName} />
          <button
            className="add-to-set-btn"
            onClick={() => onAddToSet({ trackName: track.name, artistName })}
            title="Add to set"
          >+</button>
        </div>
      </div>
    </div>
  )
}
