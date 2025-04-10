import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'
import * as THREE from 'three'

const CityGlobeView = ({ onCitySelect }) => {
  const globeRef = useRef()

  useEffect(() => {
    const world = Globe()(globeRef.current)
      .globeImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/earth-night.jpg')
      .backgroundImageUrl('//cdn.jsdelivr.net/npm/three-globe/example/img/night-sky.png')
      .labelLat(d => d.properties.latitude)
      .labelLng(d => d.properties.longitude)
      .labelText(d => d.properties.name)
      .labelSize(d => Math.sqrt(d.properties.pop_max) * 6e-4)
      .labelDotRadius(d => Math.sqrt(d.properties.pop_max) * 4e-4)
      .labelColor(() => 'rgba(255, 165, 0, 0.75)')
      .labelResolution(2)
      .onLabelClick((city) => {
        onCitySelect({
          name: city.properties.name,
          country: city.properties.adm0name,
        })
      })

      fetch('/data/ne_110m_populated_places_simple.geojson')
      .then(res => res.json())
      .then(data => {
        world.labelsData(data.features)
      })
  }, [onCitySelect])

  return (
    <div ref={globeRef} style={{ width: '100%', height: '100%' }} />
  )
}

export default CityGlobeView
