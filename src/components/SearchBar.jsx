import { useState } from 'react'

export default function SearchBar({ onSearch, loading, placeholder = 'Search an artist or DJ...' }) {
  const [input, setInput] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (input.trim()) onSearch(input.trim())
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
