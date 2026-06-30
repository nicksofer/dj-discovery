import StreamingButton from './StreamingButton'

export default function SimilarTracks({ tracks, similarTrackImages, onSearchArtist, onAddToSet }) {
  if (!tracks?.length) return null

  return (
    <div className="section">
      <h3>Similar Tracks</h3>
      <p className="section-subtitle">Tracks with a similar sound and style</p>
      <ul className="track-list">
        {tracks.slice(0, 8).map((track, i) => {
          const artistName = track.artist?.name ?? track.artist ?? ''
          const albumArt = similarTrackImages?.[`${artistName}|||${track.name}`.toLowerCase()] ?? null
          return (
            <li key={`${artistName}-${track.name}-${i}`} className="track-item">
              {albumArt
                ? <img src={albumArt} alt="" className="track-thumb" />
                : <div className="track-thumb-placeholder" />}
              <div className="rec-track-info">
                <span className="track-name">{track.name}</span>
                <span className="rec-artist-name" onClick={() => onSearchArtist(artistName)}>
                  {artistName}
                </span>
              </div>
              <StreamingButton trackName={track.name} artistName={artistName} />
              <button
                className="add-to-set-btn"
                onClick={() => onAddToSet({ trackName: track.name, artistName })}
                title="Add to set"
              >+</button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
