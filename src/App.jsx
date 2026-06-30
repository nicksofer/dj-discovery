import { useState } from 'react'
import SearchBar from './components/SearchBar'
import ArtistCard from './components/ArtistCard'
import TrackList from './components/TrackList'
import RecommendedTracks from './components/RecommendedTracks'
import MixReadyTracks from './components/MixReadyTracks'
import SimilarArtists from './components/SimilarArtists'
import SetBuilder from './components/SetBuilder'
import { getBpmInfo, sharesBpmCategory } from './utils/bpm'
import { getMixReadyTracks } from './utils/spotify'
import './App.css'

const API_KEY = import.meta.env.VITE_LASTFM_API_KEY
const BASE = 'https://ws.audioscrobbler.com/2.0'

const EQ_HEIGHTS = [55, 90, 40, 75, 60, 85, 45, 70, 50, 80]

const LASERS = [
  { angle: -72, color: '#a855f7', duration: 4.5, delay: 0 },
  { angle: -52, color: '#06b6d4', duration: 3.8, delay: 0.6 },
  { angle: -30, color: '#a855f7', duration: 5.2, delay: 1.1 },
  { angle: -8,  color: '#4ade80', duration: 4.0, delay: 0.3 },
  { angle: 15,  color: '#06b6d4', duration: 4.8, delay: 0.9 },
  { angle: 38,  color: '#a855f7', duration: 3.6, delay: 0.2 },
  { angle: 58,  color: '#f472b6', duration: 4.3, delay: 1.4 },
  { angle: 76,  color: '#06b6d4', duration: 5.0, delay: 0.7 },
]

function ClubBackground() {
  return (
    <div className="club-bg">
      {/* Ceiling/back wall gradient */}
      <div className="club-ceiling" />

      {/* Stage spotlights from above */}
      <div className="spotlight spot-1" />
      <div className="spotlight spot-2" />
      <div className="spotlight spot-3" />
      <div className="spotlight spot-4" />

      {/* Laser beams from DJ booth */}
      <div className="laser-origin">
        {LASERS.map((l, i) => (
          <div
            key={i}
            className="laser-beam"
            style={{
              '--angle': `${l.angle}deg`,
              '--color': l.color,
              '--duration': `${l.duration}s`,
              '--delay': `${l.delay}s`,
            }}
          />
        ))}
      </div>

      {/* DJ booth platform */}
      <div className="dj-booth">
        <div className="booth-light booth-light-l" />
        <div className="booth-light booth-light-r" />
        <div className="booth-desk" />
      </div>

      {/* Crowd silhouette */}
      <svg className="crowd-svg" viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">
        <path
          className="crowd-path"
          d="M0,220 L0,175 Q15,170 25,160 Q30,140 35,118 Q40,140 45,160 Q55,172 68,165 Q80,158 90,165 Q102,172 115,168 Q128,162 135,150 Q140,130 145,108 Q150,130 155,150 Q163,165 178,170 Q193,172 208,165 Q222,158 232,165 Q244,172 258,168 Q270,162 278,152 Q284,135 288,112 Q293,135 298,152 Q308,165 322,170 Q338,172 352,165 Q366,158 378,165 Q390,172 404,170 Q418,165 425,155 Q430,138 435,115 Q440,138 445,155 Q454,168 468,172 Q482,175 495,168 Q508,161 518,168 Q530,175 544,172 Q556,168 562,158 Q568,142 572,120 Q577,142 582,158 Q592,170 606,174 Q618,176 628,168 Q638,160 646,168 Q655,175 666,172 Q678,168 685,158 Q692,142 697,118 Q702,142 707,158 Q716,170 730,174 Q744,176 758,168 Q770,160 780,168 Q792,175 806,172 Q818,165 825,155 Q830,138 835,114 Q840,138 845,155 Q855,168 869,172 Q882,175 895,168 Q908,161 918,168 Q930,175 942,170 Q954,165 960,155 Q966,138 970,114 Q975,138 980,155 Q990,168 1004,172 Q1018,175 1030,168 Q1042,161 1052,168 Q1064,175 1076,170 Q1088,165 1094,155 Q1100,138 1105,115 Q1110,138 1115,155 Q1124,168 1138,172 Q1152,174 1165,168 Q1178,162 1188,170 L1200,172 L1200,220 Z"
        />
      </svg>

      {/* Fog layer at crowd level */}
      <div className="fog-layer" />

      {/* Dark overlay to keep content readable */}
      <div className="club-overlay" />
    </div>
  )
}

function EqBars() {
  return (
    <div className="eq-bars">
      {EQ_HEIGHTS.map((h, i) => (
        <div key={i} className="eq-bar" style={{ '--h': `${h}%`, '--delay': `${i * 0.11}s` }} />
      ))}
    </div>
  )
}

function HeaderWave() {
  return (
    <svg className="header-wave" viewBox="0 0 1200 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,20 Q60,5 120,20 Q180,35 240,20 Q300,5 360,20 Q420,35 480,18 Q540,5 600,22 Q660,38 720,20 Q780,5 840,20 Q900,35 960,18 Q1020,5 1080,20 Q1140,35 1200,20" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" />
      <path d="M0,28 Q80,10 160,28 Q240,42 320,26 Q400,10 480,28 Q560,42 640,24 Q720,10 800,28 Q880,42 960,26 Q1040,10 1120,28 Q1160,36 1200,28" fill="none" stroke="rgba(6,182,212,0.2)" strokeWidth="1" />
    </svg>
  )
}

function FooterWave() {
  return (
    <svg className="footer-wave" viewBox="0 0 1200 40" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0,20 Q60,35 120,20 Q180,5 240,20 Q300,35 360,20 Q420,5 480,22 Q540,35 600,18 Q660,5 720,20 Q780,35 840,20 Q900,5 960,22 Q1020,35 1080,20 Q1140,5 1200,20" fill="none" stroke="rgba(168,85,247,0.3)" strokeWidth="1.5" />
    </svg>
  )
}

async function fetchLastFm(method, params) {
  const url = `${BASE}/?method=${method}&api_key=${API_KEY}&format=json&${params}`
  const res = await fetch(url)
  return res.json()
}

export default function App() {
  const [artist, setArtist] = useState(null)
  const [tracks, setTracks] = useState([])
  const [similar, setSimilar] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [mixReady, setMixReady] = useState({ mainCamelot: null, tracks: [], loading: false })
  const [foundAs, setFoundAs] = useState(null)
  const [setList, setSetList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function addToSet(track) {
    setSetList(prev => {
      const exists = prev.some(t => t.trackName === track.trackName && t.artistName === track.artistName)
      if (exists) return prev
      const bpmInfo = track.bpmRange ? getBpmInfo([track.bpmRange]) : null
      return [...prev, { ...track, bpmMid: bpmInfo?.mid ?? null }]
    })
  }

  function removeFromSet(index) {
    setSetList(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSearch(name) {
    setLoading(true)
    setError(null)
    setArtist(null)
    setTracks([])
    setSimilar([])
    setRecommendations([])
    setMixReady({ mainCamelot: null, tracks: [], loading: false })
    setFoundAs(null)

    try {
      // Step 1: search for the exact artist name to avoid fuzzy-match redirects
      const searchData = await fetchLastFm('artist.search', `artist=${encodeURIComponent(name)}&limit=1`)
      const topMatch = searchData.results?.artistmatches?.artist?.[0]
      if (!topMatch) throw new Error('Artist not found')

      const exactName = topMatch.name
      if (exactName.toLowerCase() !== name.toLowerCase()) setFoundAs(exactName)

      // Step 2: fetch info, tracks, similar artists, and Wikipedia thumbnail in parallel
      const [infoData, tracksData, similarData, wikiData] = await Promise.all([
        fetchLastFm('artist.getinfo', `artist=${encodeURIComponent(exactName)}`),
        fetchLastFm('artist.gettoptracks', `artist=${encodeURIComponent(exactName)}&limit=8`),
        fetchLastFm('artist.getsimilar', `artist=${encodeURIComponent(exactName)}&limit=10`),
        fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(exactName)}`).then(r => r.json()).catch(() => null),
      ])

      if (infoData.error) throw new Error('Artist not found')

      const wikiImage = wikiData?.thumbnail?.source ?? null
      const artistData = { ...infoData.artist, wikiImage }
      const allTags = artistData.tags?.tag?.map(t => t.name) ?? []
      const bpmInfo = getBpmInfo(allTags)

      const allSimilar = similarData.similarartists?.artist ?? []

      // Step 3: fetch each similar artist's tags so we can filter by genre compatibility
      const similarInfoResults = await Promise.all(
        allSimilar.slice(0, 10).map(a =>
          fetchLastFm('artist.getinfo', `artist=${encodeURIComponent(a.name)}`)
        )
      )

      // Keep only similar artists that share a BPM/genre category with the main artist.
      // If the main artist has no known genre, include all (we can't filter without a reference).
      const compatibleSimilar = allSimilar.filter((_, i) => {
        if (!bpmInfo) return true
        const simTags = similarInfoResults[i]?.artist?.tags?.tag?.map(t => t.name) ?? []
        return sharesBpmCategory(allTags, simTags)
      }).slice(0, 6)

      // Step 4: fetch top 3 tracks from each compatible similar artist.
      // We use this single fetch for both sections:
      //   - "Recommended Tracks" = the #1 track from each artist (curated picks)
      //   - "Popular in [genre]" = all tracks pooled and sorted by play count,
      //     so every result is genuinely from the same scene — not a generic genre chart.
      const similarTracksResults = await Promise.all(
        compatibleSimilar.slice(0, 6).map(a =>
          fetchLastFm('artist.gettoptracks', `artist=${encodeURIComponent(a.name)}&limit=1`)
        )
      )

      const recs = compatibleSimilar.slice(0, 5).map((a, i) => {
        const track = similarTracksResults[i]?.toptracks?.track?.[0]
        const albumArt = track?.image?.find(img => img.size === 'medium')?.['#text'] || null
        return track
          ? { artist: a.name, track: track.name, bpmRange: bpmInfo?.range ?? null, albumArt }
          : null
      }).filter(Boolean)

      setArtist(artistData)
      setTracks(tracksData.toptracks?.track ?? [])
      setSimilar(compatibleSimilar)
      setRecommendations(recs)

      // Fire Spotify key-matching asynchronously so main content renders immediately
      const topTrackName = tracksData.toptracks?.track?.[0]?.name
      if (topTrackName) {
        setMixReady({ mainCamelot: null, tracks: [], loading: true })
        getMixReadyTracks(exactName, topTrackName, compatibleSimilar)
          .then(data => setMixReady({ ...data, loading: false }))
          .catch(() => setMixReady({ mainCamelot: null, tracks: [], loading: false }))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const bpmInfo = artist ? getBpmInfo(artist.tags?.tag?.map(t => t.name) ?? []) : null

  return (
    <div className="page">
      <ClubBackground />

      <header className="site-header">
        <div className="header-inner">
          <EqBars />
          <div className="header-text">
            <h1>DJ Discovery</h1>
            <p>Find artists, explore their music, discover new sounds</p>
          </div>
          <EqBars />
        </div>
        <HeaderWave />
      </header>

      <main className="app">
        <SearchBar onSearch={handleSearch} loading={loading} />

        {error && <p className="error">{error}</p>}

        {foundAs && (
          <p className="found-as">No exact match found — showing results for <strong>{foundAs}</strong></p>
        )}

        {artist && (
          <>
            <ArtistCard artist={artist} />
            <TrackList
              tracks={tracks}
              artistName={artist.name}
              bpmRange={bpmInfo?.range}
              onAddToSet={addToSet}
            />
            <RecommendedTracks
              recommendations={recommendations}
              onSearch={handleSearch}
              onAddToSet={addToSet}
            />
            <MixReadyTracks
              mainCamelot={mixReady.mainCamelot}
              tracks={mixReady.tracks}
              loading={mixReady.loading}
              onAddToSet={addToSet}
            />
            <SimilarArtists artists={similar} onSearch={handleSearch} />
          </>
        )}

        <SetBuilder
          setList={setList}
          onRemove={removeFromSet}
          onClear={() => setSetList([])}
        />
      </main>

      <footer className="site-footer">
        <FooterWave />
        <div className="footer-inner">
          <EqBars />
          <p className="footer-text">DJ Discovery — Built for the booth</p>
          <EqBars />
        </div>
      </footer>
    </div>
  )
}
