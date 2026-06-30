export default function TrackList({ tracks, artistName, bpmRange, onAddToSet }) {
  if (!tracks?.length) return null

  return (
    <div className="section">
      <h3>Top Tracks</h3>
      <ul className="track-list">
        {tracks.slice(0, 8).map((track, i) => (
          <li key={track.name} className="track-item">
            <span className="track-number">{i + 1}</span>
            <span className="track-name">{track.name}</span>
            <span className="track-plays">{Number(track.playcount).toLocaleString()} plays</span>
            <button
              className="add-to-set-btn"
              onClick={() => onAddToSet({ trackName: track.name, artistName, bpmRange })}
              title="Add to set"
            >+</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
