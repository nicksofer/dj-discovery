export const BPM_MAP = [
  { keywords: ['hardstyle', 'hardcore', 'gabber'], range: '145–175 BPM', mid: 160 },
  { keywords: ['drum and bass', 'dnb', 'jungle', 'neurofunk', 'liquid funk'], range: '160–180 BPM', mid: 170 },
  { keywords: ['dubstep', 'brostep'], range: '138–142 BPM', mid: 140 },
  { keywords: ['trance', 'psytrance', 'uplifting trance', 'tech trance'], range: '128–145 BPM', mid: 136 },
  { keywords: ['techno', 'industrial techno', 'detroit techno'], range: '130–150 BPM', mid: 140 },
  { keywords: ['big room', 'electro house', 'progressive house', 'edm'], range: '128–132 BPM', mid: 130 },
  { keywords: ['house', 'tech house', 'deep house', 'afro house', 'minimal'], range: '120–130 BPM', mid: 125 },
  { keywords: ['reggaeton', 'latin'], range: '92–100 BPM', mid: 96 },
  { keywords: ['hip hop', 'trap', 'rap'], range: '65–100 BPM', mid: 82 },
  { keywords: ['disco', 'funk', 'nu-disco'], range: '110–125 BPM', mid: 117 },
  { keywords: ['ambient', 'downtempo', 'chillout'], range: '60–90 BPM', mid: 75 },
  { keywords: ['pop', 'dance pop', 'synth-pop'], range: '100–130 BPM', mid: 115 },
]

export function getBpmInfo(tags) {
  const lower = tags.map(t => t.toLowerCase())
  for (const entry of BPM_MAP) {
    if (entry.keywords.some(k => lower.some(t => t.includes(k)))) {
      return { range: entry.range, mid: entry.mid }
    }
  }
  return null
}

// Returns the specific keyword that matched (e.g. "house", "techno") — used as the
// trending genre label, since Last.fm's raw first tag can be completely wrong for niche artists.
export function getMatchedGenreKeyword(tags) {
  const lower = tags.map(t => t.toLowerCase())
  for (const entry of BPM_MAP) {
    for (const keyword of entry.keywords) {
      if (lower.some(t => t.includes(keyword))) return keyword
    }
  }
  return null
}

// Returns true if a set of tags belongs to the same BPM category as a reference entry.
// Used to filter similar artists by genre compatibility.
export function sharesBpmCategory(tagsA, tagsB) {
  const lowerA = tagsA.map(t => t.toLowerCase())
  const lowerB = tagsB.map(t => t.toLowerCase())
  for (const entry of BPM_MAP) {
    const aMatches = entry.keywords.some(k => lowerA.some(t => t.includes(k)))
    const bMatches = entry.keywords.some(k => lowerB.some(t => t.includes(k)))
    if (aMatches && bMatches) return true
  }
  return false
}
