import { useEffect, useRef } from 'react'
import Globe from 'globe.gl'

const GlobeView = ({ onCountrySelect }) => {
  const globeRef = useRef()

  useEffect(() => {
    const globe = Globe()(globeRef.current)
      .globeImageUrl('//unpkg.com/three-globe/example/img/earth-dark.jpg')
      .polygonCapColor(() => 'rgba(0, 150, 255, 0.2)')
      .polygonStrokeColor(() => '#0077ff')
      .polygonAltitude(0.01)
      .pointOfView({ lat: 0, lng: 0, altitude: 2.2 }, 0)
      .onPolygonClick((polygon) => {
        const country = polygon.properties.ADMIN
        const code = polygon.properties.ISO_A2
        onCountrySelect?.({ name: country, code })
      });

      globe.scene().scale.set(0.85, 0.85, 0.85)


    // Ensure correct canvas sizing and positioning
    const resize = () => {
      globe.width(globeRef.current.offsetWidth)
      globe.height(globeRef.current.offsetHeight)
    }
    resize()
    window.addEventListener('resize', resize)

    const controls = globe.controls()
    if (controls) {
      controls.autoRotate = true
      controls.autoRotateSpeed = 0.6
    }

    fetch('/data/countries.geojson')
      .then(res => res.json())
      .then(countries => {
        globe.polygonsData(
          countries.features.filter(d => d.properties.ISO_A2 !== 'AQ')
        )
      })

    return () => {
      window.removeEventListener('resize', resize)
      if (globeRef.current) globeRef.current.innerHTML = ''
    }
  }, [onCountrySelect])

  return (
    <div className="w-full flex justify-center items-center">
      <div
        ref={globeRef}
        className="w-full max-w-4xl h-[700px] rounded-xl overflow-hidden"
      />
    </div>
  )
}

export default GlobeView
