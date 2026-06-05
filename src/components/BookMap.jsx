import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Users, Globe, Building2, Landmark, AlertTriangle } from 'lucide-react';
import { getLanguageName } from '../services/api';
import { Spinner } from './Loader';

// Import Leaflet CSS directly in this component
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon assets missing in production builds (not strictly needed since we use custom divIcons, but good practice)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pulsing flag icon
const createCountryIcon = (flagUrl, countryName) => {
  return L.divIcon({
    className: 'custom-country-marker',
    html: `
      <div class="marker-container">
        <div class="marker-pulse"></div>
        <div class="marker-pin">
          <img src="${flagUrl}" alt="Flag of ${countryName}" class="marker-flag" />
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -36]
  });
};

// Map controller to handle auto-zooming and centering to fit countries bounds
const MapController = ({ countries }) => {
  const map = useMap();

  useEffect(() => {
    if (!countries || countries.length === 0) return;

    // Filter countries with valid latitude and longitude coordinates
    const validCountries = countries.filter(
      (c) => c.latlng && c.latlng.length === 2 && !isNaN(c.latlng[0]) && !isNaN(c.latlng[1])
    );

    if (validCountries.length === 0) return;

    // Construct bounding box containing all countries
    const bounds = L.latLngBounds(validCountries.map((c) => c.latlng));
    
    // Fit map bounds with padding
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 5,
      animate: true,
      duration: 1.2
    });
  }, [countries, map]);

  return null;
};

const BookMap = ({ countries, language, loading, error }) => {
  // Compute global stats for the overlay
  const totalCountries = countries?.length || 0;
  const totalPopulation = countries?.reduce((sum, c) => sum + (c.population || 0), 0) || 0;

  // Filter valid coordinates
  const markers = (countries || []).filter(
    (c) => c.latlng && c.latlng.length === 2 && !isNaN(c.latlng[0]) && !isNaN(c.latlng[1])
  );

  return (
    <div className="map-panel" aria-label="Interactive world map">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ width: '100%', height: '100%' }}
      >
        {/* CartoDB Dark Matter tile layer matches the premium dark mode aesthetics */}
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />

        {/* Dynamic Markers */}
        {markers.map((country) => (
          <Marker
            key={country.name}
            position={country.latlng}
            icon={createCountryIcon(country.flag, country.name)}
          >
            <Popup closeButton={false}>
              <div className="country-popup">
                <div className="country-popup-header">
                  <img src={country.flag} alt={`Flag of ${country.name}`} className="country-popup-flag" />
                  <span className="country-popup-title">{country.name}</span>
                </div>
                <div className="country-popup-body">
                  <div className="popup-row">
                    <span className="popup-label"><Building2 size={12} style={{marginRight: 4, display:'inline'}} /> Capital</span>
                    <span className="popup-value">{country.capital}</span>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label"><Users size={12} style={{marginRight: 4, display:'inline'}} /> Population</span>
                    <span className="popup-value">{country.population.toLocaleString()}</span>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label"><Landmark size={12} style={{marginRight: 4, display:'inline'}} /> Currencies</span>
                    <span className="popup-value" title={country.currencies}>{country.currencies}</span>
                  </div>
                  <div className="popup-row">
                    <span className="popup-label"><Globe size={12} style={{marginRight: 4, display:'inline'}} /> Languages</span>
                    <span className="popup-value" title={country.languages}>{country.languages}</span>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapController countries={countries} />
      </MapContainer>

      {/* Loading Overlay */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(7, 11, 22, 0.7)',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <Spinner text="Querying countries..." />
        </div>
      )}

      {/* Statistics Overlay */}
      {!loading && !error && totalCountries > 0 && language && (
        <div className="map-stats-overlay">
          <div className="stat-item">
            <span className="stat-label">Language</span>
            <span className="stat-value">{getLanguageName(language)}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Countries</span>
            <span className="stat-value">{totalCountries}</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-label">Combined Pop.</span>
            <span className="stat-value">{(totalPopulation / 1000000).toFixed(1)}M</span>
          </div>
        </div>
      )}

      {/* Map Error Overlay */}
      {error && (
        <div className="map-error-overlay">
          <AlertTriangle size={32} />
          <div className="map-error-title">Map Query Error</div>
          <div className="map-error-text">
            Failed to load countries associated with the language. Please check your network connection or try another book.
          </div>
        </div>
      )}

      {/* No Countries Associated Overlay */}
      {!loading && !error && language && totalCountries === 0 && (
        <div className="map-error-overlay" style={{ borderColor: 'var(--border-subtle)' }}>
          <Globe size={32} style={{ color: 'var(--text-muted)' }} />
          <div className="map-error-title">No Map Associations</div>
          <div className="map-error-text">
            No sovereign countries list available in the database speaking <strong>{getLanguageName(language)}</strong> ({language.toUpperCase()}).
          </div>
        </div>
      )}
    </div>
  );
};

export default BookMap;
