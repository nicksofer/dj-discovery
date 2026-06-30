export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Sample n items randomly from a quality-sorted array.
// Items earlier in the array are more likely to be picked (weighted by rank).
export function weightedSample(arr, n) {
  if (arr.length <= n) return shuffle(arr)
  const picked = []
  const pool   = [...arr]
  for (let i = 0; i < n && pool.length > 0; i++) {
    // Weight: first item has weight pool.length, last has weight 1
    const total  = (pool.length * (pool.length + 1)) / 2
    let   rand   = Math.random() * total
    let   chosen = pool.length - 1
    for (let j = 0; j < pool.length; j++) {
      rand -= (pool.length - j)
      if (rand <= 0) { chosen = j; break }
    }
    picked.push(pool.splice(chosen, 1)[0])
  }
  return picked
}
