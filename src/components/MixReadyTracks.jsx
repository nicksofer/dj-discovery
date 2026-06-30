import StreamingButton from './StreamingButton'
import { spotifyConfigured } from '../utils/spotify'

function CamelotBadge({ camelot }) {
  if (!camelot) return null
  return (
    <span className={`camelot-badge ${camelot.endsWith('A') ? 'minor' : 'major'}`}>
      {camelot}
    </span>
  )
}

export default function MixReadyTracks({ mainCamelot, tracks, loading, onAddToSet }) {
  if (!spotifyConfigured()) return null

  return (
    <div className="section">
      <h3>Mix-Ready Tracks</h3>
      <p className="section-subtitle">
        {mainCamelot
          ? <span>Blends with <CamelotBadge camelot={mainCamelot} /> — compatible keys from artists with a similar sound</span>
          : 'Harmonically compatible picks from artists with a similar sound'}
      </p>

      {loading && <p className="mix-status">Analysing keys...</p>}

      {!loading && !tracks.length && (
        <p className="mix-status">No key-compatible tracks found for this artist.</p>
      )}

      {!loading && tracks.length > 0 && (
        <ul className="track-list">
          {tracks.map((track, i) => (
            <li key={`${track.artistName}-${track.trackName}-${i}`} className="track-item">
              {track.albumArt
                ? <img src={track.albumArt} alt="" className="track-thumb" />
                : <div className="track-thumb-placeholder" />}
              <div className="rec-track-info">
                <span className="track-name">{track.trackName}</span>
                <span className="rec-artist-name">{track.artistName}</span>
              </div>
              <CamelotBadge camelot={track.camelot} />
              <StreamingButton trackName={track.trackName} artistName={track.artistName} />
              <button
                className="add-to-set-btn"
                onClick={() => onAddToSet({ trackName: track.trackName, artistName: track.artistName })}
                title="Add to set"
              >+</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
