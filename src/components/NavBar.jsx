// src/components/NavBar.jsx
import React from 'react';

const NavBar = ({ token, logout }) => {
  return (
    <nav className="w-full h-16 flex items-center justify-between px-4 bg-gray-800 fixed top-0 left-0 z-20">
      <h1 className="text-2xl font-bold text-white">🌍 Spotify Globe Recommender 🎵</h1>
      {token && (
        <button
          onClick={logout}
          className="px-4 py-2 text-white font-semibold rounded shadow transition bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          Logout
        </button>
      )}
    </nav>
  );
};

export default NavBar;
