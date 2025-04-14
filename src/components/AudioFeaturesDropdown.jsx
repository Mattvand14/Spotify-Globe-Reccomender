// src/components/AudioFeaturesDropdown.jsx
import React, { useState } from 'react';

const AudioFeaturesDropdown = ({ onFeatureSelect }) => {
  const [selectedFeature, setSelectedFeature] = useState("");

  const handleSelectChange = (event) => {
    const value = event.target.value;
    setSelectedFeature(value);
    // Notify the parent component of the selected feature
    if (onFeatureSelect) {
      onFeatureSelect(value);
    }
  };

  return (
    <div className="p-4 bg-[#1e1e1e] rounded-lg shadow-xl">
      <label className="block text-sm font-medium text-white mb-2">
        Select Audio Feature:
      </label>
      <select
        className="w-full rounded p-2 bg-gray-800 text-white"
        value={selectedFeature}
        onChange={handleSelectChange}
      >
        <option value="">-- Choose one --</option>
        <option value="dance">Dance</option>
        <option value="chill">Chill</option>
        <option value="energetic">Energetic</option>
        <option value="happy">Happy</option>
        <option value="sad">Sad</option>
        {/* Add additional options as needed */}
      </select>
    </div>
  );
};

export default AudioFeaturesDropdown;
