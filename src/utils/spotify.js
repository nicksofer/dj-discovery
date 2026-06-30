// ── iTunes image API (free, no auth, CORS-enabled) ────────────────────────
const ITUNES = 'https://itunes.apple.com/search'

async function itunesSearch(term) {
  try {
    const res = await fetch(`${ITUNES}?term=${encodeURIComponent(term)}&media=music&entity=song&limit=3`)
    if (!res.ok) return []
    const data = await res.json()
    return data.results ?? []
  } catch {
    return []
  }
}

// Scale iTunes artwork from the default 100x100 to a useful size
function art(url, size = 400) {
  return url ? url.replace(/\d+x\d+bb/, `${size}x${size}bb`) : null
}

// ── Artist photo helpers ───────────────────────────────────────────────────

// TheAudioDB: real press photos, CORS-enabled, ~60% coverage
async function audioDbPhoto(name) {
  try {
    const r = await fetch(`https://www.theaudiodb.com/api/v1/json/2/search.php?s=${encodeURIComponent(name)}`)
    if (!r.ok) return null
    const d = await r.json()
    return d.artists?.[0]?.strArtistThumb ?? null
  } catch {
    return null
  }
}

// Wikipedia: CORS-enabled via origin=*, covers artists with Wikipedia pages.
// Strict title-match prevents returning photos of the wrong person.
async function wikipediaPhoto(name) {
  try {
    const q = encodeURIComponent(`${name} musician DJ producer`)
    const r = await fetch(
      `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${q}&gsrlimit=5&prop=pageimages&pithumbsize=500&format=json&origin=*`
    )
    if (!r.ok) return null
    const d = await r.json()
    const pages = Object.values(d.query?.pages ?? {})
    const norm  = name.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim()
    // Only accept an article whose title clearly refers to this artist
    const hit = pages.find(p => {
      if (!p.thumbnail || p.pageid < 1) return false
      const title = p.title.toLowerCase().replace(/[^a-z0-9 ]/g, '')
      return title.includes(norm) || norm.includes(title)
    })
    return hit?.thumbnail?.source ?? null
  } catch {
    return null
  }
}

// ── Spotify token (cached, for Camelot key detection only) ────────────────
const ACCOUNTS_URL = 'https://accounts.spotify.com/api/token'
const API_BASE     = 'https://api.spotify.com/v1'
let _tokenCache    = null

async function getToken() {
  if (_tokenCache?.expiresAt > Date.now()) return _tokenCache.token
  const id     = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
  if (!id || !secret) return null
  try {
    const res = await fetch(ACCOUNTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) return null
    const { access_token, expires_in } = await res.json()
    _tokenCache = { token: access_token, expiresAt: Date.now() + (expires_in - 60) * 1000 }
    return _tokenCache.token
  } catch {
    return null
  }
}

async function apiFetch(path, token) {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

// ── Camelot wheel ─────────────────────────────────────────────────────────
const CAMELOT = [
  ['5A', '8B'],  // C
  ['12A', '3B'], // C#/Db
  ['7A', '10B'], // D
  ['2A', '5B'],  // D#/Eb
  ['9A', '12B'], // E
  ['4A', '7B'],  // F
  ['11A', '2B'], // F#/Gb
  ['6A', '9B'],  // G
  ['1A', '4B'],  // G#/Ab
  ['8A', '11B'], // A
  ['3A', '6B'],  // A#/Bb
  ['10A', '1B'], // B
]

export function toCamelot(key, mode) {
  if (key == null || key === -1 || mode == null || mode === -1) return null
  return CAMELOT[key]?.[mode] ?? null
}

export function compatibleKeys(camelot) {
  if (!camelot) return null
  const num    = parseInt(camelot, 10)
  const letter = camelot.slice(-1)
  const opp    = letter === 'A' ? 'B' : 'A'
  const prev   = ((num - 2 + 12) % 12) + 1
  const next   = (num % 12) + 1
  return new Set([camelot, `${num}${opp}`, `${prev}${letter}`, `${next}${letter}`])
}

export function spotifyConfigured() {
  return !!(import.meta.env.VITE_SPOTIFY_CLIENT_ID && import.meta.env.VITE_SPOTIFY_CLIENT_SECRET)
}

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/**
 * getSpotifyData
 *
 * Images come from Apple's iTunes Search API (free, no account needed).
 * Camelot key + mix-ready tracks come from Spotify (requires Premium on
 * the developer account — gracefully returns empty when unavailable).
 */
export async function getSpotifyData(
  mainArtistName,
  mainTopTrackName,
  similarArtists,
  recs,
  similarTracks = [],
  mainTracks    = [],
) {
  const nSim     = Math.min(similarArtists.length, 5)
  const nRecs    = recs.length
  const nSimTrk  = Math.min(similarTracks.length, 8)
  const nMainTrk = Math.min(mainTracks.length, 8)

  try {
    // ── Phase 1: all image fetches in parallel ───────────────────────────
    // Artist photo: TheAudioDB (~60% coverage) + Wikipedia fallback (~+25%) run
    // simultaneously so there's no extra latency when TheAudioDB misses.
    const [adbPhoto, wikiPhoto, ...itunesResults] = await Promise.all([
      audioDbPhoto(mainArtistName),
      wikipediaPhoto(mainArtistName),
      // iTunes: track image (for TrackCard in track mode)
      itunesSearch(`${mainTopTrackName} ${mainArtistName}`),
      // Each of the main artist's top tracks
      ...mainTracks.slice(0, nMainTrk).map(t =>
        itunesSearch(`${t.name} ${mainArtistName}`)
      ),
      // Rec tracks
      ...recs.map(r => itunesSearch(`${r.track} ${r.artist}`)),
      // Similar tracks
      ...similarTracks.slice(0, nSimTrk).map(t => {
        const a = t.artist?.name ?? t.artist ?? ''
        return itunesSearch(`${t.name} ${a}`)
      }),
    ])

    let idx = 0
    const trackImgRes = itunesResults[idx++]
    const mainTrkRes  = itunesResults.slice(idx, (idx += nMainTrk))
    const recRes      = itunesResults.slice(idx, (idx += nRecs))
    const simTrkRes   = itunesResults.slice(idx, (idx += nSimTrk))

    // Priority: TheAudioDB real photo → Wikipedia article photo → iTunes album art
    const artistImageUrl =
      adbPhoto                                       // press photo from TheAudioDB
      ?? wikiPhoto                                   // Wikipedia article thumbnail
      ?? art(trackImgRes?.[0]?.artworkUrl100, 400)  // album art last resort
      ?? null

    // TrackCard image
    const trackImageUrl  = art(trackImgRes?.[0]?.artworkUrl100, 300) ?? null

    // TrackList album art keyed by Last.fm track name (exact match guaranteed)
    const trackImages = {}
    mainTracks.slice(0, nMainTrk).forEach((t, i) => {
      const a = art(mainTrkRes[i]?.[0]?.artworkUrl100, 150)
      if (a) trackImages[t.name.toLowerCase()] = a
    })

    // Rec album art
    const recImages = {}
    recs.forEach((r, i) => {
      const a = art(recRes[i]?.[0]?.artworkUrl100, 150)
      if (a) recImages[`${r.artist}|||${r.track}`.toLowerCase()] = a
    })

    // Similar track album art
    const similarTrackImages = {}
    similarTracks.slice(0, nSimTrk).forEach((t, i) => {
      const artist = t.artist?.name ?? t.artist ?? ''
      const a = art(simTrkRes[i]?.[0]?.artworkUrl100, 150)
      if (a) similarTrackImages[`${artist}|||${t.name}`.toLowerCase()] = a
    })

    // ── Phase 2: Spotify Camelot + mix-ready (requires Spotify Premium) ──
    // Gracefully returns nothing if the API is unavailable (403, no token, etc.)
    let mainCamelot = null
    let mixTracks   = []

    const token = await getToken()
    if (token) {
      const spotResults = await Promise.all([
        apiFetch(`/search?q=${encodeURIComponent(`${mainTopTrackName} ${mainArtistName}`)}&type=track&limit=1`, token),
        ...similarArtists.slice(0, nSim).map(a =>
          apiFetch(`/search?q=${encodeURIComponent(a.name)}&type=track&limit=10`, token)
        ),
      ])

      const mainSpotTrack  = spotResults[0]?.tracks?.items?.[0]
      const simArtistTracks = spotResults.slice(1).flatMap((data, i) =>
        (data?.tracks?.items ?? []).map(t => ({ ...t, _artistName: similarArtists[i]?.name }))
      )

      const mainTrackId = mainSpotTrack?.id
      const allIds = [mainTrackId, ...simArtistTracks.map(t => t.id)].filter(Boolean).join(',')

      if (allIds) {
        const featData    = await apiFetch(`/audio-features?ids=${allIds}`, token)
        const allFeatures = featData?.audio_features ?? []
        const mainFeat    = mainTrackId ? allFeatures[0] : null
        mainCamelot       = toCamelot(mainFeat?.key, mainFeat?.mode)
        const compatible  = compatibleKeys(mainCamelot)
        const simFeatures = mainTrackId ? allFeatures.slice(1) : allFeatures

        const qualified = simArtistTracks
          .map((t, i) => ({
            trackName:  t.name,
            artistName: t._artistName,
            camelot:    toCamelot(simFeatures[i]?.key, simFeatures[i]?.mode),
            albumArt:   t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? null,
            popularity: t.popularity ?? 0,
          }))
          .filter(t => !compatible || compatible.has(t.camelot))
          .sort((a, b) => b.popularity - a.popularity)

        mixTracks = shuffle(qualified.slice(0, 20)).slice(0, 8)
      }
    }

    return {
      mainCamelot,
      mixTracks,
      artistImageUrl,
      trackImageUrl,
      trackImages,
      recImages,
      similarTrackImages,
    }
  } catch (e) {
    console.error('[getSpotifyData] error:', e)
    return null
  }
}
