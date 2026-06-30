export default function RecommendedTracks({ recommendations, onSearch, onAddToSet }) {
  if (!recommendations?.length) return null

  return (
    <div className="section">
      <h3>Recommended Tracks to Check Out</h3>
      <p className="section-subtitle">Top picks from similar artists</p>
      <ul className="track-list">
        {recommendations.map(({ artist, track, bpmRange }) => (
          <li key={`${artist}-${track}`} className="track-item">
            <div className="rec-track-info">
              <span className="track-name">{track}</span>
              <span className="rec-artist-name" onClick={() => onSearch(artist)}>{artist}</span>
            </div>
            <button
              className="add-to-set-btn"
              onClick={() => onAddToSet({ trackName: track, artistName: artist, bpmRange })}
              title="Add to set"
            >+</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
