import { getBpmInfo } from '../utils/bpm'

function getUndergroundScore(listeners) {
  const l = Number(listeners) || 0
  if (l > 10000000) return 5
  if (l > 5000000) return 20
  if (l > 1000000) return 38
  if (l > 500000) return 52
  if (l > 100000) return 68
  if (l > 50000) return 82
  return 95
}

function getGenreDna(tags) {
  if (!tags.length) return []
  const total = tags.reduce((sum, _, i) => sum + (tags.length - i), 0)
  return tags.slice(0, 4).map((tag, i) => ({
    name: tag,
    pct: Math.round(((tags.length - i) / total) * 100),
  }))
}

export default function ArtistCard({ artist }) {
  const image = artist.image?.find(i => i.size === 'extralarge')?.['#text']
  const allTags = artist.tags?.tag?.map(t => t.name) ?? []
  const genres = allTags.slice(0, 4)
  const listeners = artist.stats?.listeners
  const bpm = getBpmInfo(allTags)
  const underground = getUndergroundScore(listeners)
  const dna = getGenreDna(allTags)

  return (
    <div className="artist-card">
      {image && <img src={image} alt={artist.name} />}
      <div className="artist-info">
        <h2>{artist.name}</h2>
        <p className="listeners">{Number(listeners).toLocaleString()} monthly listeners</p>

        {bpm && (
          <p className="bpm-range">
            <span className="bpm-label">Typical BPM</span>
            <span className="bpm-value">{bpm.range}</span>
          </p>
        )}

        <div className="underground-row">
          <span className="meta-label">Underground</span>
          <div className="underground-bar">
            <div className="underground-fill" style={{ width: `${underground}%` }} />
          </div>
          <span className="meta-label">Mainstream</span>
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

        {artist.bio?.summary && (
          <p className="bio"
            dangerouslySetInnerHTML={{ __html: artist.bio.summary.split('<a')[0] }}
          />
        )}
      </div>
    </div>
  )
}
