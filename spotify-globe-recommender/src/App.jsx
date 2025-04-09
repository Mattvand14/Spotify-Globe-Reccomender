import { useState, useEffect } from 'react'
import GlobeView from './components/GlobeView'
import PlaylistPanel from './components/PlaylistPanel'
import { iso3to2 } from './utils/countryCodeMap'
import './App.css'

function App() {
  const [token, setToken] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedISO2, setSelectedISO2] = useState(null)
  const [playlist, setPlaylist] = useState(null)

  const CLIENT_ID = 'de6c91bc55bb4564ae8275f4ed535e8d'
  const REDIRECT_URI = 'http://localhost:5173'
  const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
  const RESPONSE_TYPE = 'token'

  const login = () => {
    const url = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&show_dialog=true`;
    window.location.href = url
  }

  const logout = () => {
    setToken(null)
    window.localStorage.removeItem('token')
    window.localStorage.removeItem('token_timestamp')
  }

  useEffect(() => {
    const hash = window.location.hash
    const storedToken = window.localStorage.getItem('token')
    const timestamp = window.localStorage.getItem('token_timestamp')

    if (storedToken && timestamp) {
      const tokenAge = Date.now() - parseInt(timestamp, 10)
      if (tokenAge < 3600 * 1000) {
        setToken(storedToken)
        return
      } else {
        logout()
      }
    }

    if (hash) {
      const tokenFromUrl = new URLSearchParams(hash.substring(1)).get('access_token')
      if (tokenFromUrl) {
        window.location.hash = ''
        window.localStorage.setItem('token', tokenFromUrl)
        window.localStorage.setItem('token_timestamp', Date.now().toString())
        setToken(tokenFromUrl)
      }
    }
  }, [])

  const handleCountryClick = async ({ name, code }) => {
    const iso3 = code.split(':')[0]
    const iso2 = iso3to2[iso3]

    setSelectedCountry(name)
    setSelectedISO2(iso2)

    console.log('Country clicked:', code)


    if (!token) return

    console.log('iso3:', iso3)
    console.log('iso2:', iso2)


    try {
      const res = await fetch(
        `https://api.spotify.com/v1/browse/featured-playlists?country=${iso2}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const data = await res.json()
      const featured = data.playlists?.items?.[0]
      if (!featured) return

      const detailsRes = await fetch(
        `https://api.spotify.com/v1/playlists/${featured.id}?market=${iso2}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      const playlistDetails = await detailsRes.json()
      setPlaylist(playlistDetails)
    } catch (err) {
      console.error('Error fetching playlist:', err)
      setPlaylist(null)
    }
  }

  return (
    <div className="app-container relative min-h-screen bg-[#242424] text-white font-sans px-4">
      <h1 className="text-4xl font-bold text-center pt-8">🌍 Spotify Globe Recommender 🎵</h1>

      {!token ? (
        <div className="flex justify-center items-center h-[80vh]">
          <button
            onClick={login}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg shadow-md transition duration-200"
          >
            Login with Spotify
          </button>
        </div>
      ) : (
        <div className="w-full h-full">
          <button
            onClick={logout}
            className="absolute top-4 right-4 z-10 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded shadow transition"
          >
            Logout
          </button>

          <p className="text-center mt-4">Click a country to see its featured Spotify playlist 🌐🎶</p>

          <div className="flex flex-col sm:flex-row h-[calc(100vh-150px)]">
          {selectedCountry && selectedISO2 && (
            <PlaylistPanel country={selectedCountry} countryCode={selectedISO2} playlist={playlist} />
          )}
            <div className="flex-1">
              <GlobeView onCountrySelect={handleCountryClick} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
