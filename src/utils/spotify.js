const ACCOUNTS_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com/v1'

let _cache = null

async function getToken() {
  if (_cache?.expiresAt > Date.now()) return _cache.token
  const id     = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
  if (!id || !secret) {
    console.warn('[Spotify] Missing credentials — add VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET to .env')
    return null
  }
  try {
    const res = await fetch(ACCOUNTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      },
      body: 'grant_type=client_credentials',
    })
    if (!res.ok) {
      console.warn('[Spotify] Token request failed:', res.status)
      return null
    }
    const { access_token, expires_in } = await res.json()
    _cache = { token: access_token, expiresAt: Date.now() + (expires_in - 60) * 1000 }
    return _cache.token
  } catch (e) {
    console.error('[Spotify] Token fetch error:', e)
    return null
  }
}

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
  const num  = parseInt(camelot, 10)
  const letter = camelot.slice(-1)
  const opp  = letter === 'A' ? 'B' : 'A'
  const prev = ((num - 2 + 12) % 12) + 1
  const next = (num % 12) + 1
  return new Set([camelot, `${num}${opp}`, `${prev}${letter}`, `${next}${letter}`])
}

export function spotifyConfigured() {
  return !!(import.meta.env.VITE_SPOTIFY_CLIENT_ID && import.meta.env.VITE_SPOTIFY_CLIENT_SECRET)
}

// Each call is independent — a failed search returns null and doesn't break the batch
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

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// spotifyQ: build a Spotify search query string, quoting each term
function sq(track, artist) {
  return encodeURIComponent(`track:"${track}" artist:"${artist}"`)
}

/**
 * getSpotifyData — consolidated enrichment call.
 *
 * @param {string}   mainArtistName
 * @param {string}   mainTopTrackName  — the primary track to get the Camelot key from
 * @param {Array}    similarArtists    — array of { name } (Last.fm similar artists)
 * @param {Array}    recs              — array of { artist, track } for "Tracks to Check Out"
 * @param {Array}    similarTracks     — array of { name, artist } from track.getSimilar
 * @param {Array}    mainTracks        — Last.fm top tracks for the main artist (for TrackList art)
 */
export async function getSpotifyData(
  mainArtistName,
  mainTopTrackName,
  similarArtists,
  recs,
  similarTracks = [],
  mainTracks    = [],
) {
  const token = await getToken()
  if (!token) return null

  try {
    const nSim      = Math.min(similarArtists.length, 5)
    const nRecs     = recs.length
    const nSimTrk   = Math.min(similarTracks.length, 8)
    const nMainTrk  = Math.min(mainTracks.length, 8)

    // ── Phase 1: all searches in parallel ──────────────────────────────────
    // Index map:
    //  0              → artist search (profile image)
    //  1              → main track search (album art + audio-features ID)
    //  2..2+nSim      → similar artist track searches (mix section)
    //  +nRecs         → rec track searches (art for "Tracks to Check Out")
    //  +nSimTrk       → similar track art
    //  +nMainTrk      → main artist individual track art (keys match Last.fm names)
    const results = await Promise.all([
      apiFetch(`/search?q=${encodeURIComponent(`artist:"${mainArtistName}"`)}&type=artist&limit=1`, token),
      apiFetch(`/search?q=${sq(mainTopTrackName, mainArtistName)}&type=track&limit=1`, token),
      ...similarArtists.slice(0, nSim).map(a =>
        apiFetch(`/search?q=${encodeURIComponent(`artist:"${a.name}"`)}&type=track&limit=10`, token)
      ),
      ...recs.map(r =>
        apiFetch(`/search?q=${sq(r.track, r.artist)}&type=track&limit=1`, token)
      ),
      ...similarTracks.slice(0, nSimTrk).map(t => {
        const artist = t.artist?.name ?? t.artist ?? ''
        return apiFetch(`/search?q=${sq(t.name, artist)}&type=track&limit=1`, token)
      }),
      ...mainTracks.slice(0, nMainTrk).map(t =>
        apiFetch(`/search?q=${sq(t.name, mainArtistName)}&type=track&limit=1`, token)
      ),
    ])

    let idx = 0
    const artistSearch      = results[idx++]
    const mainTrackSearch   = results[idx++]
    const simArtistSearches = results.slice(idx, (idx += nSim))
    const recSearches       = results.slice(idx, (idx += nRecs))
    const simTrkSearches    = results.slice(idx, (idx += nSimTrk))
    const mainTrkSearches   = results.slice(idx, (idx += nMainTrk))

    // Artist profile image (largest available)
    const spotifyArtist  = artistSearch?.artists?.items?.[0]
    const artistImageUrl = spotifyArtist?.images?.[0]?.url
      ?? spotifyArtist?.images?.[1]?.url
      ?? null

    // Main track album art
    const mainSpotifyTrack = mainTrackSearch?.tracks?.items?.[0]
    const trackImageUrl    = mainSpotifyTrack?.album?.images?.[0]?.url
      ?? mainSpotifyTrack?.album?.images?.[1]?.url
      ?? null

    // Similar artist tracks (pool for mix section)
    const simArtistTracks = simArtistSearches.flatMap((data, i) =>
      (data?.tracks?.items ?? []).map(t => ({
        ...t,
        _artistName: similarArtists[i]?.name,
      }))
    )

    // Rec album art keyed by "artist|||track"
    const recImages = {}
    recs.forEach((r, i) => {
      const t   = recSearches[i]?.tracks?.items?.[0]
      const art = t?.album?.images?.[1]?.url ?? t?.album?.images?.[0]?.url ?? null
      if (art) recImages[`${r.artist}|||${r.track}`.toLowerCase()] = art
    })

    // Similar track art keyed by "artist|||track"
    const similarTrackImages = {}
    similarTracks.slice(0, nSimTrk).forEach((t, i) => {
      const artist   = t.artist?.name ?? t.artist ?? ''
      const spotTrack = simTrkSearches[i]?.tracks?.items?.[0]
      const art = spotTrack?.album?.images?.[1]?.url ?? spotTrack?.album?.images?.[0]?.url ?? null
      if (art) similarTrackImages[`${artist}|||${t.name}`.toLowerCase()] = art
    })

    // Main artist track art keyed by Last.fm track name — ensures exact match
    const trackImages = {}
    mainTracks.slice(0, nMainTrk).forEach((t, i) => {
      const spotTrack = mainTrkSearches[i]?.tracks?.items?.[0]
      const art = spotTrack?.album?.images?.[1]?.url ?? spotTrack?.album?.images?.[0]?.url ?? null
      if (art) trackImages[t.name.toLowerCase()] = art
    })

    // ── Phase 2: audio-features for mix section ────────────────────────────
    const mainTrackId = mainSpotifyTrack?.id
    const allIds = [mainTrackId, ...simArtistTracks.map(t => t.id)].filter(Boolean).join(',')
    const featData = allIds
      ? await apiFetch(`/audio-features?ids=${allIds}`, token)
      : null

    const allFeatures = featData?.audio_features ?? []
    const mainFeat    = mainTrackId ? allFeatures[0] : null
    const mainCamelot = toCamelot(mainFeat?.key, mainFeat?.mode)
    const compatible  = compatibleKeys(mainCamelot)
    const simFeatures = mainTrackId ? allFeatures.slice(1) : allFeatures

    // Key-compatible tracks sorted by popularity, then shuffled within the top pool
    // so results vary every search while staying high-quality
    const qualified = simArtistTracks
      .map((t, i) => {
        const feat    = simFeatures[i]
        const camelot = toCamelot(feat?.key, feat?.mode)
        return {
          trackName:  t.name,
          artistName: t._artistName,
          camelot,
          albumArt:   t.album?.images?.[1]?.url ?? t.album?.images?.[0]?.url ?? null,
          popularity: t.popularity ?? 0,
        }
      })
      .filter(t => !compatible || compatible.has(t.camelot))
      .sort((a, b) => b.popularity - a.popularity)

    // Shuffle within the top-20 quality pool so each search surfaces different picks
    const pool      = qualified.slice(0, 20)
    const mixTracks = shuffle(pool).slice(0, 8)

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
    console.error('[Spotify] getSpotifyData error:', e)
    return null
  }
}
