import DeckGL from '@deck.gl/react';
import {LineLayer} from '@deck.gl/layers';
import Map  from 'react-map-gl';
import { MapView, FirstPersonView } from '@deck.gl/core';
import {mapStyle} from "../utils/mapStyle";

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieWFzaG4iLCJhIjoiY2tybjZrYjViMWg3ejMxbGltc25vNTB1NyJ9.jmSJX_oaS7BY8GDizT37EA';
// pk.eyJ1IjoieWFzaG4iLCJhIjoiY2tybjZrYjViMWg3ejMxbGltc25vNTB1NyJ9.jmSJX_oaS7BY8GDizT37EA
export function RPCNodeMap() {
  const INITIAL_VIEW_STATE = {
    longitude: 12.4,
    latitude: 38.78,
    zoom: 0.5,
  };
  const data = [
    {sourcePosition: -122.41669, targetPosition: -122.41669}
  ];
  const layers = [
    new LineLayer({id: 'line-layer', data})
  ];
  const MAP_STYLE= mapStyle;
    // 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
  return (
    <div className="card">
      <div className="card-header">
        <h4 className="card-header-title">Validators</h4>
      </div>
      <div className="card-header">
        <h4 className="card-header-title">Geo-Activity Map</h4>
      </div>
      <div className="card-body">
        <div className="map-card">
        <DeckGL
            initialViewState={INITIAL_VIEW_STATE}
            // controller={true}
            layers={layers}
       >
          <Map
            reuseMaps
            mapStyle= {MAP_STYLE}
            mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} 
            preventStyleDiffing={true}
            />
       </DeckGL>
      </div>
     
      </div>
    </div>
  )
}
