import StreamingButton from './StreamingButton'

export default function TrackList({ tracks, artistName, bpmRange, onAddToSet }) {
  if (!tracks?.length) return null

  return (
    <div className="section">
      <h3>Top Tracks</h3>
      <ul className="track-list">
        {tracks.slice(0, 8).map((track, i) => {
          const albumArt = track.image?.find(img => img.size === 'medium')?.['#text'] || null
          return (
            <li key={track.name} className="track-item">
              <span className="track-number">{i + 1}</span>
              {albumArt
                ? <img src={albumArt} alt="" className="track-thumb" />
                : <div className="track-thumb-placeholder" />}
              <span className="track-name">{track.name}</span>
              <span className="track-plays">{Number(track.playcount).toLocaleString()} plays</span>
              <StreamingButton trackName={track.name} artistName={artistName} />
              <button
                className="add-to-set-btn"
                onClick={() => onAddToSet({ trackName: track.name, artistName, bpmRange })}
                title="Add to set"
              >+</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
