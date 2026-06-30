import { useState, useEffect, useRef } from 'react'

const SERVICES = [
  { id: 'spotify',    name: 'Spotify',       color: '#1db954', url: (t, a) => `https://open.spotify.com/search/${encodeURIComponent(`${t} ${a}`)}` },
  { id: 'apple',      name: 'Apple Music',   color: '#fc3c44', url: (t, a) => `https://music.apple.com/search?term=${encodeURIComponent(`${t} ${a}`)}` },
  { id: 'youtube',    name: 'YouTube Music', color: '#ff4444', url: (t, a) => `https://music.youtube.com/search?q=${encodeURIComponent(`${t} ${a}`)}` },
  { id: 'soundcloud', name: 'SoundCloud',    color: '#ff5500', url: (t, a) => `https://soundcloud.com/search?q=${encodeURIComponent(`${t} ${a}`)}` },
  { id: 'tidal',      name: 'Tidal',         color: '#00e5ff', url: (t, a) => `https://listen.tidal.com/search/${encodeURIComponent(`${t} ${a}`)}` },
  { id: 'beatport',   name: 'Beatport',      color: '#92d33d', url: (t, a) => `https://www.beatport.com/search?q=${encodeURIComponent(`${t} ${a}`)}` },
]

const PREF_KEY = 'dj-discovery-streaming'

export default function StreamingButton({ trackName, artistName }) {
  const [open, setOpen] = useState(false)
  const [preferred, setPreferred] = useState(() => localStorage.getItem(PREF_KEY))
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onOutside(e) {
      if (!ref.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  function openService(service) {
    localStorage.setItem(PREF_KEY, service.id)
    setPreferred(service.id)
    window.open(service.url(trackName, artistName), '_blank', 'noopener,noreferrer')
    setOpen(false)
  }

  const sorted = preferred
    ? [SERVICES.find(s => s.id === preferred), ...SERVICES.filter(s => s.id !== preferred)]
    : SERVICES

  return (
    <div className="streaming-wrap" ref={ref}>
      <button
        className="streaming-btn"
        onClick={() => setOpen(o => !o)}
        title="Listen on..."
      >
        ▶
      </button>
      {open && (
        <div className="streaming-picker">
          <span className="streaming-label">Listen on</span>
          {sorted.map(s => (
            <button
              key={s.id}
              className={`streaming-option${s.id === preferred ? ' active' : ''}`}
              style={{ '--svc-color': s.color }}
              onClick={() => openService(s)}
            >
              <span className="streaming-check">{s.id === preferred ? '✓' : ''}</span>
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
