export default function TrendingTracks({ tracks, genre, onAddToSet }) {
  if (!tracks?.length || !genre) return null

  return (
    <div className="section">
      <h3>Popular in {genre}</h3>
      <p className="section-subtitle">
        Most-played tracks from artists in the same scene — sorted by popularity
      </p>
      <ul className="track-list">
        {tracks.map((track, i) => (
          <li key={`${track.artistName}-${track.trackName}`} className="track-item">
            <span className="track-number">{i + 1}</span>
            <div className="rec-track-info">
              <span className="track-name">{track.trackName}</span>
              <span className="rec-artist-name">{track.artistName}</span>
            </div>
            <span className="track-plays">
              {track.playcount?.toLocaleString()} plays
            </span>
            <button
              className="add-to-set-btn"
              onClick={() => onAddToSet({ trackName: track.trackName, artistName: track.artistName, bpmRange: track.bpmRange })}
              title="Add to set"
            >+</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
