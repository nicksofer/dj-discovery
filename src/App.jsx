import { useState } from 'react'
import SearchBar from './components/SearchBar'
import ArtistCard from './components/ArtistCard'
import TrackCard from './components/TrackCard'
import TrackList from './components/TrackList'
import SimilarTracks from './components/SimilarTracks'
import RecommendedTracks from './components/RecommendedTracks'
import MixReadyTracks from './components/MixReadyTracks'
import SimilarArtists from './components/SimilarArtists'
import SetBuilder from './components/SetBuilder'
import { getBpmInfo, sharesBpmCategory } from './utils/bpm'
import { getSpotifyData } from './utils/spotify'
import { shuffle } from './utils/shuffle'
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
  const [searchMode, setSearchMode] = useState('artist')
  // Artist mode state
  const [artist, setArtist] = useState(null)
  const [tracks, setTracks] = useState([])
  const [recommendations, setRecommendations] = useState([])
  // Track mode state
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [similarTracks, setSimilarTracks] = useState([])
  const [tracksToCheckOut, setTracksToCheckOut] = useState([])
  // Shared
  const [similar, setSimilar] = useState([])
  const [spotifyData, setSpotifyData] = useState(null)
  const [spotifyLoading, setSpotifyLoading] = useState(false)
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
    setSpotifyData(null)
    setSpotifyLoading(false)
    setFoundAs(null)

    try {
      const searchData = await fetchLastFm('artist.search', `artist=${encodeURIComponent(name)}&limit=1`)
      const topMatch = searchData.results?.artistmatches?.artist?.[0]
      if (!topMatch) throw new Error('Artist not found')

      const exactName = topMatch.name
      if (exactName.toLowerCase() !== name.toLowerCase()) setFoundAs(exactName)

      // Fetch 20 similar artists so we have a real pool to filter and shuffle
      const [infoData, tracksData, similarData] = await Promise.all([
        fetchLastFm('artist.getinfo', `artist=${encodeURIComponent(exactName)}`),
        fetchLastFm('artist.gettoptracks', `artist=${encodeURIComponent(exactName)}&limit=8`),
        fetchLastFm('artist.getsimilar', `artist=${encodeURIComponent(exactName)}&limit=20`),
      ])

      if (infoData.error) throw new Error('Artist not found')

      const artistData = infoData.artist
      const allTags    = artistData.tags?.tag?.map(t => t.name) ?? []
      const bpmInfo    = getBpmInfo(allTags)
      const allSimilar = similarData.similarartists?.artist ?? []

      // Fetch tags for the full pool so we can filter accurately
      const similarInfoResults = await Promise.all(
        allSimilar.slice(0, 20).map(a =>
          fetchLastFm('artist.getinfo', `artist=${encodeURIComponent(a.name)}`)
        )
      )

      // Filter by genre compatibility, then shuffle so each search returns a different subset
      const compatiblePool = allSimilar.filter((_, i) => {
        if (!bpmInfo) return true
        const simTags = similarInfoResults[i]?.artist?.tags?.tag?.map(t => t.name) ?? []
        return sharesBpmCategory(allTags, simTags)
      })
      const compatibleSimilar = shuffle(compatiblePool).slice(0, 6)

      // Fetch 3 tracks per artist — randomly pick one so recs vary between searches
      const recTrackResults = await Promise.all(
        compatibleSimilar.slice(0, 5).map(a =>
          fetchLastFm('artist.gettoptracks', `artist=${encodeURIComponent(a.name)}&limit=3`)
        )
      )

      const recs = compatibleSimilar.slice(0, 5).map((a, i) => {
        const topTracks = recTrackResults[i]?.toptracks?.track ?? []
        if (!topTracks.length) return null
        // Randomly pick from the top 3 — biased toward #1 but not deterministic
        const pick = topTracks[Math.floor(Math.random() * Math.min(topTracks.length, 3))]
        return { artist: a.name, track: pick.name, bpmRange: bpmInfo?.range ?? null }
      }).filter(Boolean)

      const mainTracks = tracksData.toptracks?.track ?? []

      setArtist(artistData)
      setTracks(mainTracks)
      setSimilar(compatibleSimilar)
      setRecommendations(recs)

      // Spotify enrichment fires async — images and key data arrive after main content renders
      const topTrackName = mainTracks[0]?.name
      if (topTrackName) {
        setSpotifyLoading(true)
        getSpotifyData(exactName, topTrackName, compatibleSimilar, recs, [], mainTracks)
          .then(data => { setSpotifyData(data); setSpotifyLoading(false) })
          .catch(() => setSpotifyLoading(false))
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode(mode) {
    setSearchMode(mode)
    setArtist(null); setTracks([]); setRecommendations([])
    setSelectedTrack(null); setSimilarTracks([]); setTracksToCheckOut([])
    setSimilar([]); setSpotifyData(null); setSpotifyLoading(false)
    setError(null); setFoundAs(null)
  }

  async function handleTrackSearch(name) {
    setLoading(true)
    setError(null)
    setSelectedTrack(null); setSimilarTracks([]); setTracksToCheckOut([])
    setSimilar([]); setSpotifyData(null); setSpotifyLoading(false); setFoundAs(null)

    try {
      const searchData = await fetchLastFm('track.search', `track=${encodeURIComponent(name)}&limit=1`)
      const topMatch = searchData.results?.trackmatches?.track?.[0]
      if (!topMatch) throw new Error('Track not found')

      const exactTrack = topMatch.name
      const artistName = topMatch.artist
      if (exactTrack.toLowerCase() !== name.toLowerCase()) setFoundAs(`${exactTrack} — ${artistName}`)

      // Fetch 20 similar tracks and 20 similar artists for larger shuffle pools
      const [infoData, similarTracksData, similarArtistsData] = await Promise.all([
        fetchLastFm('track.getInfo', `track=${encodeURIComponent(exactTrack)}&artist=${encodeURIComponent(artistName)}&autocorrect=1`),
        fetchLastFm('track.getSimilar', `track=${encodeURIComponent(exactTrack)}&artist=${encodeURIComponent(artistName)}&limit=20`),
        fetchLastFm('artist.getSimilar', `artist=${encodeURIComponent(artistName)}&limit=20`),
      ])

      const trackData = infoData.track
      if (!trackData) throw new Error('Track not found')

      const allTags = trackData.toptags?.tag?.map(t => t.name) ?? []
      const bpmInfo = getBpmInfo(allTags)

      const allSimilarArtists = similarArtistsData.similarartists?.artist ?? []

      const similarArtistInfos = await Promise.all(
        allSimilarArtists.slice(0, 20).map(a =>
          fetchLastFm('artist.getinfo', `artist=${encodeURIComponent(a.name)}`)
        )
      )

      // Filter by genre, shuffle for variety, take 6
      const compatiblePool = allSimilarArtists.filter((_, i) => {
        if (!bpmInfo) return true
        const simTags = similarArtistInfos[i]?.artist?.tags?.tag?.map(t => t.name) ?? []
        return sharesBpmCategory(allTags, simTags)
      })
      const compatibleArtists = shuffle(compatiblePool).slice(0, 6)

      // Fetch 3 tracks per artist, randomly pick one
      const artistTrackResults = await Promise.all(
        compatibleArtists.slice(0, 5).map(a =>
          fetchLastFm('artist.gettoptracks', `artist=${encodeURIComponent(a.name)}&limit=3`)
        )
      )
      const tracksToCheck = compatibleArtists.slice(0, 5).map((a, i) => {
        const topTracks = artistTrackResults[i]?.toptracks?.track ?? []
        if (!topTracks.length) return null
        const pick = topTracks[Math.floor(Math.random() * Math.min(topTracks.length, 3))]
        return { artist: a.name, track: pick.name, bpmRange: bpmInfo?.range ?? null }
      }).filter(Boolean)

      // Shuffle similar tracks so the 8 shown vary between searches
      const rawSimilarTracks = similarTracksData.similartracks?.track ?? []
      const displayedSimilarTracks = shuffle(rawSimilarTracks.slice(0, 15)).slice(0, 8)

      setSelectedTrack(trackData)
      setSimilarTracks(displayedSimilarTracks)
      setSimilar(compatibleArtists)
      setTracksToCheckOut(tracksToCheck)

      setSpotifyLoading(true)
      getSpotifyData(artistName, exactTrack, compatibleArtists, tracksToCheck, displayedSimilarTracks)
        .then(data => { setSpotifyData(data); setSpotifyLoading(false) })
        .catch(() => setSpotifyLoading(false))

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
        <div className="mode-toggle">
          <button className={`mode-btn${searchMode === 'artist' ? ' active' : ''}`} onClick={() => switchMode('artist')}>Artist</button>
          <button className={`mode-btn${searchMode === 'track' ? ' active' : ''}`} onClick={() => switchMode('track')}>Track</button>
        </div>

        <SearchBar
          onSearch={searchMode === 'artist' ? handleSearch : handleTrackSearch}
          loading={loading}
          placeholder={searchMode === 'artist' ? 'Search for an artist or DJ...' : 'Search for a song...'}
        />

        {error && <p className="error">{error}</p>}

        {foundAs && (
          <p className="found-as">Showing results for <strong>{foundAs}</strong></p>
        )}

        {searchMode === 'artist' && artist && (
          <>
            <ArtistCard artist={artist} artistImageUrl={spotifyData?.artistImageUrl} />
            <TrackList
              tracks={tracks}
              artistName={artist.name}
              bpmRange={bpmInfo?.range}
              trackImages={spotifyData?.trackImages}
              onAddToSet={addToSet}
            />
            <RecommendedTracks
              recommendations={recommendations}
              recImages={spotifyData?.recImages}
              onSearch={handleSearch}
              onAddToSet={addToSet}
            />
            <MixReadyTracks
              mainCamelot={spotifyData?.mainCamelot ?? null}
              tracks={spotifyData?.mixTracks ?? []}
              loading={spotifyLoading}
              onAddToSet={addToSet}
            />
            <SimilarArtists artists={similar} onSearch={handleSearch} />
          </>
        )}

        {searchMode === 'track' && selectedTrack && (
          <>
            <TrackCard
              track={selectedTrack}
              camelot={spotifyData?.mainCamelot ?? null}
              trackImageUrl={spotifyData?.trackImageUrl ?? null}
              onSearchArtist={name => { switchMode('artist'); handleSearch(name) }}
              onAddToSet={addToSet}
            />
            <MixReadyTracks
              mainCamelot={spotifyData?.mainCamelot ?? null}
              tracks={spotifyData?.mixTracks ?? []}
              loading={spotifyLoading}
              onAddToSet={addToSet}
            />
            <SimilarTracks
              tracks={similarTracks}
              similarTrackImages={spotifyData?.similarTrackImages}
              onSearchArtist={name => { switchMode('artist'); handleSearch(name) }}
              onAddToSet={addToSet}
            />
            <RecommendedTracks
              recommendations={tracksToCheckOut}
              recImages={spotifyData?.recImages}
              onSearch={name => { switchMode('artist'); handleSearch(name) }}
              onAddToSet={addToSet}
              title="Tracks to Check Out"
              subtitle="Top picks from artists with a similar sound"
            />
            <SimilarArtists
              artists={similar}
              onSearch={name => { switchMode('artist'); handleSearch(name) }}
            />
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
