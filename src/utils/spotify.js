const ACCOUNTS_URL = 'https://accounts.spotify.com/api/token'
const API_BASE = 'https://api.spotify.com/v1'

let _cache = null

async function getToken() {
  if (_cache?.expiresAt > Date.now()) return _cache.token
  const id = import.meta.env.VITE_SPOTIFY_CLIENT_ID
  const secret = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
  if (!id || !secret) return null
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
  _cache = { token: access_token, expiresAt: Date.now() + (expires_in - 60) * 1000 }
  return _cache.token
}

// Spotify pitch class (0=C … 11=B) + mode (0=minor, 1=major) → Camelot notation
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

// Same key, relative major/minor, and ±1 on the wheel — all blend cleanly
export function compatibleKeys(camelot) {
  if (!camelot) return null
  const num = parseInt(camelot, 10)
  const letter = camelot.slice(-1)
  const opp = letter === 'A' ? 'B' : 'A'
  const prev = ((num - 2 + 12) % 12) + 1
  const next = (num % 12) + 1
  return new Set([camelot, `${num}${opp}`, `${prev}${letter}`, `${next}${letter}`])
}

export function spotifyConfigured() {
  return !!(import.meta.env.VITE_SPOTIFY_CLIENT_ID && import.meta.env.VITE_SPOTIFY_CLIENT_SECRET)
}

async function apiFetch(path, token) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.ok ? res.json() : null
}

export async function getMixReadyTracks(mainArtistName, mainTopTrackName, similarArtists) {
  const token = await getToken()
  if (!token) return { mainCamelot: null, tracks: [] }

  try {
    // Get the key of the main artist's top track
    let mainCamelot = null
    const mainSearch = await apiFetch(
      `/search?q=${encodeURIComponent(`track:${mainTopTrackName} artist:${mainArtistName}`)}&type=track&limit=1`,
      token
    )
    const mainTrackId = mainSearch?.tracks?.items?.[0]?.id
    if (mainTrackId) {
      const feat = await apiFetch(`/audio-features/${mainTrackId}`, token)
      mainCamelot = toCamelot(feat?.key, feat?.mode)
    }

    const compatible = compatibleKeys(mainCamelot)

    // Search Spotify for tracks from each similar artist
    const searches = await Promise.all(
      similarArtists.slice(0, 5).map(a =>
        apiFetch(`/search?q=${encodeURIComponent(`artist:"${a.name}"`)}&type=track&limit=5`, token)
      )
    )

    const allTracks = searches.flatMap((data, i) =>
      (data?.tracks?.items ?? []).map(t => ({ ...t, _artistName: similarArtists[i].name }))
    )

    if (!allTracks.length) return { mainCamelot, tracks: [] }

    // Batch audio-features request for all tracks at once
    const ids = allTracks.map(t => t.id).join(',')
    const featData = await apiFetch(`/audio-features?ids=${ids}`, token)
    const features = featData?.audio_features ?? []

    const results = allTracks
      .map((t, i) => {
        const feat = features[i]
        const camelot = toCamelot(feat?.key, feat?.mode)
        return {
          trackName: t.name,
          artistName: t._artistName,
          camelot,
          albumArt: t.album?.images?.[2]?.url ?? t.album?.images?.[0]?.url ?? null,
          popularity: t.popularity ?? 0,
        }
      })
      .filter(t => !compatible || compatible.has(t.camelot))
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 8)

    return { mainCamelot, tracks: results }
  } catch {
    return { mainCamelot: null, tracks: [] }
  }
}
