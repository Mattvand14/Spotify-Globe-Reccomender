import { useState, useRef } from 'react'

const PlaylistPanel = ({ country, countryCode, playlist }) => {
  const [currentTrack, setCurrentTrack] = useState(null)
  const audioRef = useRef(null)

  const handleTrackClick = (track) => {
    if (!track.preview_url) return

    // If the same track is clicked again, toggle pause
    if (currentTrack === track.id) {
      audioRef.current.pause()
      setCurrentTrack(null)
    } else {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      const audio = new Audio(track.preview_url)
      audioRef.current = audio
      audio.play()
      setCurrentTrack(track.id)
    }
  }

  return (
    <div className="bg-[#1e1e1e] p-4 rounded-lg shadow-xl overflow-y-auto h-full">
      <div className="flex justify-center items-center mb-4">
        {countryCode && (
          <img
            src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
            alt={`${country} flag`}
            className="w-8 h-5 mr-2 rounded-sm"
          />
        )}
        <h2 className="text-xl font-bold">{country}</h2>
      </div>


      {playlist ? (
        <>
          <a
            href={playlist.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="block mb-4"
          >
            <img
              src={playlist.images[0]?.url}
              alt={playlist.name}
              className="rounded-lg w-1/2 h-1/2 mb-2 mx-auto"
              />
            <p className="text-lg font-semibold">{playlist.name}</p>
            <p className="text-sm text-gray-300">{playlist.description}</p>
          </a>

          <h3 className="mt-4 font-semibold">Tracks:</h3>
          <ul className="text-sm mt-2 space-y-4">
            {playlist.tracks?.items?.length > 0 ? (
              playlist.tracks.items.slice(0, 10).map((item, idx) => {
                const track = item.track;
                if (!track) return null;
                return (
                  <li key={idx}>
                    <p className="mb-1 font-medium">{track.name}</p>
                    <iframe
                      src={`https://open.spotify.com/embed/track/${track.id}`}
                      width="100%"
                      height="80"
                      frameBorder="0"
                      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                      loading="lazy"
                      className="rounded-lg"
                    ></iframe>
                  </li>
                );
              })
            ) : (
              <p className="text-sm text-red-400">No track data available for this playlist.</p>
            )}
          </ul>
        </>
      ) : (
        <p className="text-sm text-gray-400">No playlist found for this country.</p>
      )}
    </div>
  );
};

export default PlaylistPanel
