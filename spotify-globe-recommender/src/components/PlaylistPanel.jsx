const PlaylistPanel = ({ country, countryCode, playlist }) => {
    return (
      <div className="w-full sm:w-[300px] p-4 bg-[#1e1e1e] text-white overflow-y-auto h-full shadow-xl">
        {/* Always show country name and flag */}
        <div className="flex items-center mb-4">
          {countryCode && (
            <img
              src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
              alt={`${country} flag`}
              className="w-8 h-5 mr-2 rounded-sm"
            />
          )}
          <h2 className="text-xl font-bold">{country}</h2>
        </div>
  
        {/* Conditional Playlist Display */}
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
                className="rounded-lg w-full mb-2"
              />
              <p className="text-lg font-semibold">{playlist.name}</p>
              <p className="text-sm text-gray-300">{playlist.description}</p>
            </a>
  
            <h3 className="mt-4 font-semibold">Tracks:</h3>
            <ul className="text-sm mt-2 space-y-2">
              {playlist.tracks.items.slice(0, 10).map((item, idx) => (
                <li key={idx}>
                  🎵 {item.track.name} — {item.track.artists[0]?.name}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-sm text-gray-400">No playlist found for this country.</p>
        )}
      </div>
    )
  }
  
  export default PlaylistPanel
  