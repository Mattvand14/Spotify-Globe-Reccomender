import { useState, useEffect } from 'react'
import GlobeView from './components/GlobeView'
import PlaylistPanel from './components/PlaylistPanel'
import { iso3to2 } from './utils/countryCodeMap'
import CityGlobeView from './components/CityGlobeView'
import AudioFeaturesDropdown from './components/AudioFeaturesDropdown'
import './App.css'
import NavBar from './components/NavBar';

function App() {
  const [token, setToken] = useState(null)
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedISO2, setSelectedISO2] = useState(null)
  const [playlist, setPlaylist] = useState(null)

  const CLIENT_ID = import.meta.env.SPOTIFY_API_KEY
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
    const iso3 = code.length === 3 ? code : code.split(':')[0];
    const iso2 = iso3to2[iso3];
  
    setSelectedCountry(name);
    setSelectedISO2(iso2);
  
    if (!token || !name) return;
  
    // For Chad, immediately clear the playlist
    if (name.toLowerCase() === 'chad') {
      console.warn(`No playlist found for ${name}`);
      setPlaylist(null);
      return;
    }
  
    // For Georgia, modify the search query to "georgian"
    let searchQuery = name;
    if (name.toLowerCase() === 'georgia') {
      searchQuery = 'georgian';
    }
  
    try {
      // Step 1: Search for playlists using the (possibly modified) query
      const searchRes = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=playlist&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      const data = await searchRes.json();
      const playlists = data.playlists?.items ?? [];
  
      if (playlists.length === 0) {
        console.warn(`No playlists found for: ${searchQuery}`);
        setPlaylist(null);
        return;
      }
  
      // Define unwanted keywords (case-insensitive) for generic filtering
      const unwantedKeywords = /tour|setlist|live|concert/i;
  
      // Step 2: Filter out unwanted playlists:
      // - Spotify-owned playlists
      // - Playlists with unwanted keywords in the name or description
      const userPlaylists = playlists.filter(
        pl =>
          pl &&
          pl.owner &&
          pl.owner.id !== 'spotify' &&
          !unwantedKeywords.test(pl.name) &&
          !(pl.description && unwantedKeywords.test(pl.description))
      );
  
      if (userPlaylists.length === 0) {
        console.warn(`No user-created playlists found for: ${searchQuery} after filtering unwanted playlists`);
        setPlaylist(null);
        return;
      }
  
      // Step 3: Fetch full details for each filtered playlist
      const detailedPlaylists = await Promise.all(
        userPlaylists.map(pl =>
          fetch(`https://api.spotify.com/v1/playlists/${pl.id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }).then(res => res.json())
        )
      );
  
      // Step 4: Sort playlists by follower count (descending)
      const sortedByFollowers = detailedPlaylists.sort(
        (a, b) => (b.followers?.total || 0) - (a.followers?.total || 0)
      );
  
      // Step 5: Select one playlist at random from the top 10 for variety
      const topPlaylists = sortedByFollowers.slice(0, 5);
      const randomIndex = Math.floor(Math.random() * topPlaylists.length);
      setPlaylist(topPlaylists[randomIndex]);
    } catch (err) {
      console.error(`Error fetching user playlists for "${name}":`, err);
      setPlaylist(null);
    }
  };
  
  const handleCityClick = async ({ name, country }) => {
    console.log(`City selected: ${name}, ${country}`)
  
    if (!token) return
  
    try {
      const res = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(name)}&type=playlist&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
  
      const data = await res.json()
      const playlists = data.playlists?.items ?? []
  
      if (playlists.length === 0) {
        setPlaylist(null)
        return
      }
  
      // Optional: filter out Spotify-owned playlists
      const userPlaylists = playlists.filter(pl => pl.owner && pl.owner.id !== 'spotify')
  
      const detailedPlaylists = await Promise.all(
        userPlaylists.map(pl =>
          fetch(`https://api.spotify.com/v1/playlists/${pl.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then(res => res.json())
        )
      )
  
      const sortedByFollowers = detailedPlaylists.sort(
        (a, b) => (b.followers?.total || 0) - (a.followers?.total || 0)
      )
  
      setSelectedCountry(`${name}, ${country}`)
      setSelectedISO2(null) // Optional: reset country code since this is city-level
      setPlaylist(sortedByFollowers[0])
    } catch (err) {
      console.error(`Error fetching playlists for ${name}:`, err)
      setPlaylist(null)
    }
  }


  const handleFeatureSelect = (feature) => {
    setAudioFeature(feature);
    // Here you might call a function to update or create a playlist
    // based on both selectedCountry and the selected feature.
    // e.g., fetchPlaylist(selectedCountry, feature);
  };

  return (
    <div className="app-container min-h-screen bg-[#242424] text-white font-sans">
      {/* NavBar is fixed at the top */}
      <NavBar token={token} logout={logout} />

      {/* Main content container overriding global centering */}
      <main className="w-full pt-20" style={{ display: 'block' }}>
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
          // Use a grid layout for independent positioning:
          <div className="pr-2">
            <div className="grid grid-cols-4 gap-4">
              {/* Left column: PlaylistPanel (25% width) */}
              <div className="col-span-1.5">
                {/* Replace the PlaylistPanel container in your App.jsx with: */}
                {selectedCountry && selectedISO2 && (
                <div
                  className="fixed left-0 p-4 z-50 overflow-y-auto"
                  style={{
                    top: '80px',              // positions it just below the NavBar
                    height: 'calc(100vh - 80px)', // sets the container height to full viewport minus navbar height
                    width: '25%'              // adjust as needed
                  }}
                >
                  <PlaylistPanel
                    country={selectedCountry}
                    countryCode={selectedISO2}
                    playlist={playlist}
                  />
                </div>
              )}
              </div>
              {/* Right column: GlobeView (75% width) */}
              <div className="col-span-4">
                <p className="text-center mt-1">
                  Click a country to find Spotify playlists related to it 🌐🎶
                </p>
                <div className="flex justify-center items-center h-[calc(100vh-150px)]">
                  <div className="w-full max-w-3xl">
                    <GlobeView onCountrySelect={handleCountryClick} />
                  </div>
                </div>
              </div>

              <div className='col-span-2 float-right'>
                <AudioFeaturesDropdown onFeatureSelect={handleFeatureSelect}/>
              </div>


            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App


