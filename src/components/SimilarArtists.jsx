export default function SimilarArtists({ artists, onSearch }) {
  if (!artists?.length) return null

  return (
    <div className="section">
      <h3>Similar Artists</h3>
      <div className="similar-grid">
        {artists.slice(0, 6).map(artist => {
          const image = artist.image?.find(i => i.size === 'large')?.['#text']
          return (
            <div
              key={artist.name}
              className="similar-card"
              onClick={() => onSearch(artist.name)}
            >
              {image && <img src={image} alt={artist.name} />}
              <span>{artist.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
