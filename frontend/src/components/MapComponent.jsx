import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, Popup, ImageOverlay, useMapEvents } from 'react-leaflet';
// import { EditControl } from "react-leaflet-draw"; // REMOVED DUE TO VITE BUILD CRASH
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default Leaflet icon not showing
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const fixBounds = (bounds) => {
    if (!bounds) return null;
    // Check if it's a flat array [minLon, minLat, maxLon, maxLat]
    if (Array.isArray(bounds) && bounds.length === 4 && typeof bounds[0] === 'number') {
        const [minLon, minLat, maxLon, maxLat] = bounds;
        // Convert to Leaflet [[lat, lon], [lat, lon]]
        return [[minLat, minLon], [maxLat, maxLon]];
    }
    return bounds;
};

let globalCenter = [36.7783, -119.4179];
let globalZoom = 13;

const MapStatePreserver = () => {
    useMapEvents({
        moveend: (e) => {
            const map = e.target;
            const center = map.getCenter();
            globalCenter = [center.lat, center.lng];
            globalZoom = map.getZoom();
        }
    });
    return null;
};

const MapComponent = ({ onPolygonCreated, overlayImage, overlayBounds, activePolygon }) => {
    const [mapLayers, setMapLayers] = useState([]);
    const safeBounds = fixBounds(overlayBounds);
    const featureGroupRef = useRef(null);

    // Force style updates on all layers within the FeatureGroup when overlayImage changes
    useEffect(() => {
        if (featureGroupRef.current) {
            const layers = featureGroupRef.current.getLayers();
            layers.forEach(layer => {
                if (layer.setStyle) {
                    if (overlayImage) {
                        // MODE: SATELLITE VIEW
                        // Force transparent fill + White border
                        layer.setStyle({
                            fillOpacity: 0,
                            color: 'white',
                            weight: 3,
                            fillColor: 'transparent'
                        });
                    } else {
                        // MODE: DRAWING
                        // Reset to default Green
                        layer.setStyle({
                            fillOpacity: 0.2,
                            color: '#059669',
                            weight: 3,
                            fillColor: '#059669'
                        });
                    }
                }
            });
        }
    }, [overlayImage]);

    // Handle initial polygon load (restore state)
    useEffect(() => {
        if (activePolygon) {
            // Need to ensure format matches Leaflet: [[lat, lng], [lat, lng], ...]
            // If it comes from GeoJSON (Saved Field/Backend), it's likely [[[lng, lat], [lng, lat]...]] (Ring)
            let latlngs = [];

            if (Array.isArray(activePolygon)) {
                // Check depth to guess format
                if (activePolygon.length > 0) {
                    // Case 1: [[[lng, lat], ...]] (GeoJSON Polygon Coordinates Ring 0)
                    if (Array.isArray(activePolygon[0]) && Array.isArray(activePolygon[0][0])) {
                        latlngs = activePolygon[0].map(p => ([p[1], p[0]])); // Swap lng, lat to lat, lng
                    }
                    // Case 2: [[lng, lat], ...] (Flat LatLngs or Flat GeoJSON ring)
                    else if (Array.isArray(activePolygon[0]) && typeof activePolygon[0][0] === 'number') {
                        // Inherently unknown if [lat, lng] or [lng, lat]. 
                        // Saved fields payload used [lng, lat]. Leaflet uses [lat, lng].
                        // If it came from selectedField.polygon.coordinates (GeoJSON), it is [lng, lat].
                        // Let's assume GeoJSON standard [lng, lat] and swap.
                        latlngs = activePolygon.map(p => ([p[1], p[0]]));
                    }
                    // Case 3: [{lat, lng}, ...] (Leaflet objects - unlikely from persistence)
                    else if (activePolygon[0].lat !== undefined) {
                        latlngs = activePolygon.map(p => ([p.lat, p.lng]));
                    }
                }
            }

            if (latlngs.length > 0) {
                // Determine if we should clear existing drawn items? 
                // Maybe not, just show it.
                // But we don't want to duplicate.
            }
        }
    }, [activePolygon]);




    // Use global center/zoom for initial state on mount
    const center = globalCenter;

    // Use FeatureGroup ref to manage layers directly if needed
    // But react-leaflet-draw handles internal state often. 
    // The issue is likely that setMapLayers triggers a re-render which might reset the EditControl if not handled carefully,
    // OR the FeatureGroup is re-mounting.

    // However, the best way to persist "drawn" items is to let Leaflet Draw handle the editable layer,
    // and we just visualize 'saved' layers or analysis layers separately.
    // Start by ensuring we don't blow away the drawing by re-rendering too aggressively or missing keys.

    const _onCreate = (e) => {
        const { layerType, layer } = e;
        if (layerType === 'polygon') {
            const dbId = Math.random().toString(36).substring(7);
            const latlngs = layer.getLatLngs()[0];

            // We do NOT add it to mapLayers state immediately if we want the "Draw" control to keep it.
            // "EditControl" keeps its own layers in the FeatureGroup it wraps.
            // If we add it to `mapLayers` (which renders <Polygon>), we might get duplicates:
            // 1. The editable one from EditControl
            // 2. The read-only one from mapLayers.map(...)

            // Strategy: Let EditControl manage the CURRENT drawing. 
            // Only add to mapLayers if we want to "freeze" it or if we are loading from DB.
            // For analysis workflow, we usually want to see what we just drew.
            // If the user says "polygon disappears", it sounds like the component unmounts or state clears.

            // To be safe, let's keep it in the FeatureGroup (controlled by EditControl)
            // and just notify the parent.
            // We WON'T setMapLayers here to avoid duplicate rendering or re-render flicker
            // unless we explicitly want to save it as a "layer". 

            console.log("Polygon Created:", latlngs);

            if (onPolygonCreated) {
                onPolygonCreated(latlngs);
            }
        }
    };

    const _onDeleted = (e) => {
        // Handle deletion logic
        setMapLayers([]);
    };

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={center}
                zoom={globalZoom}
                scrollWheelZoom={true}
                className="h-full w-full outline-none"
                style={{ height: "100%", width: "100%" }}
            >
                <MapStatePreserver />
                {/* CartoDB Voyager Tiles (No labels variant often cleaner, but standard voyager is good) */}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />
                <FeatureGroup ref={featureGroupRef}>
                    {/* <EditControl
                        position="topleft"
                        onCreated={_onCreate}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                            polygon: {
                                allowIntersection: false,
                                drawError: {
                                    color: '#ef4444', // Red 500
                                    message: '<strong>Error:</strong> Polygon edges cannot cross!'
                                },
                                shapeOptions: {
                                    color: '#059669', // Brand Primary
                                    fillOpacity: 0.2,
                                    weight: 3
                                }
                            }
                        }}
                    /> */}
                    {mapLayers.map((layer) => (
                        <Polygon
                            key={layer.id}
                            positions={layer.latlngs}
                            pathOptions={overlayImage ? {
                                color: "white",
                                fillColor: "transparent",
                                fillOpacity: 0,
                                weight: 3
                            } : {
                                color: "#059669",
                                fillColor: "#059669",
                                fillOpacity: 0.4,
                                weight: 2
                            }}
                        />
                    ))}
                    {overlayImage && safeBounds && (
                        <ImageOverlay
                            url={overlayImage}
                            bounds={safeBounds}
                            opacity={0.9}
                            zIndex={10}
                        />
                    )}

                    {/* RESTORED POLYGON: If a field exists in memory, draw it! */}
                    {activePolygon && (
                        <Polygon
                            positions={
                                // Inline conversion similar to effect above, or rely on effect to set state?
                                // Better to transform once. 
                                // Let's simplify and assume the component handles transformation in render.
                                (() => {
                                    if (!activePolygon) return [];
                                    // Handle GeoJSON format [[[lng, lat], ...]]
                                    let ring = activePolygon;
                                    if (activePolygon.length > 0 && Array.isArray(activePolygon[0]) && Array.isArray(activePolygon[0][0])) {
                                        ring = activePolygon[0];
                                    }
                                    // Convert [lng, lat] to [lat, lng]
                                    return ring.map(p => (Array.isArray(p) ? [p[1], p[0]] : p));
                                })()
                            }
                            pathOptions={{ color: '#059669', fillColor: '#059669', opacity: 0.5 }}
                        />
                    )}
                </FeatureGroup>
            </MapContainer>
        </div>
    );
};

export default MapComponent;
