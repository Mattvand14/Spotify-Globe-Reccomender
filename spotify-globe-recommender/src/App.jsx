// src/App.jsx
import { useState } from 'react'
import './App.css'

function App() {
  const [token, setToken] = useState(null)

  const CLIENT_ID = 'de6c91bc55bb4564ae8275f4ed535e8d'
  const REDIRECT_URI = "https://spotify-globe-reccomender.vercel.app";
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'
  const SCOPES = [
    'user-top-read',
    'playlist-modify-public'
  ]

  const login = () => {
    const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=${SCOPES.join(
      '%20'
    )}&response_type=${RESPONSE_TYPE}&show_dialog=true`

    window.location.href = url
  }

  const logout = () => {
    setToken(null)
    window.localStorage.removeItem('token')
  }

  // Check token from URL after redirect
  useState(() => {
    const hash = window.location.hash
    if (hash) {
      const tokenFromUrl = new URLSearchParams(hash.substring(1)).get('access_token')
      window.location.hash = ''
      setToken(tokenFromUrl)
      window.localStorage.setItem('token', tokenFromUrl)
    }
  }, [])

  return (
    <div className="app-container">
      <h1>🌍 Spotify Globe Recommender 🎵</h1>
      {!token ? (
        <button onClick={login}>Login with Spotify</button>
      ) : (
        <div>
          <button onClick={logout}>Logout</button>
          <p>Logged in! Ready to explore music by country + vibe 🌐🎶</p>
          {/* Place sliders and globe component here later */}
        </div>
      )}
    </div>
  )
}

export default App
