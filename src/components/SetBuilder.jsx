import { useState } from 'react'

function BpmArc({ tracks }) {
  const points = tracks
    .map(t => t.bpmMid)
    .filter(Boolean)

  if (points.length < 2) return null

  const W = 400
  const H = 60
  const min = Math.min(...points) - 15
  const max = Math.max(...points) + 15

  const coords = points.map((bpm, i) => {
    const x = (i / (points.length - 1)) * W
    const y = H - ((bpm - min) / (max - min)) * H
    return [x, y]
  })

  const polyline = coords.map(([x, y]) => `${x},${y}`).join(' ')

  return (
    <div className="bpm-arc-wrap">
      <span className="arc-label">BPM Arc</span>
      <svg viewBox={`0 0 ${W} ${H}`} className="bpm-arc-svg" preserveAspectRatio="none">
        <polyline points={polyline} fill="none" stroke="#a855f7" strokeWidth="2" strokeLinejoin="round" />
        {coords.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="4" fill="#a855f7" />
        ))}
      </svg>
      <div className="arc-bpm-labels">
        <span>{Math.round(Math.min(...points))} BPM</span>
        <span>{Math.round(Math.max(...points))} BPM</span>
      </div>
    </div>
  )
}

export default function SetBuilder({ setList, onRemove, onClear }) {
  const [open, setOpen] = useState(false)

  if (!setList.length) return null

  function handleExport() {
    const text = setList
      .map((t, i) => `${i + 1}. ${t.trackName} — ${t.artistName}${t.bpmRange ? ` (${t.bpmRange})` : ''}`)
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={`set-builder ${open ? 'open' : ''}`}>
      <div className="set-builder-header" onClick={() => setOpen(o => !o)}>
        <span>My Set</span>
        <span className="set-count">{setList.length} track{setList.length !== 1 ? 's' : ''}</span>
        <span className="set-toggle">{open ? '▼' : '▲'}</span>
      </div>

      {open && (
        <div className="set-builder-body">
          <BpmArc tracks={setList} />
          <ul className="set-track-list">
            {setList.map((t, i) => (
              <li key={`${t.trackName}-${i}`} className="set-track-item">
                <span className="track-number">{i + 1}</span>
                <div className="rec-track-info">
                  <span className="track-name">{t.trackName}</span>
                  <span className="rec-artist-name">{t.artistName}</span>
                </div>
                {t.bpmRange && <span className="set-bpm">{t.bpmRange}</span>}
                <button className="remove-btn" onClick={() => onRemove(i)}>✕</button>
              </li>
            ))}
          </ul>
          <div className="set-actions">
            <button className="set-export-btn" onClick={handleExport}>Copy Set List</button>
            <button className="set-clear-btn" onClick={onClear}>Clear Set</button>
          </div>
        </div>
      )}
    </div>
  )
}
