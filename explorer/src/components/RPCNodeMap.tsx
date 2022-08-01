import React from 'react';
import DeckGL from '@deck.gl/react/typed';
import { StaticMap } from 'react-map-gl';
import { mapStyle } from "../utils/mapStyle";
import { ArcLayer } from '@deck.gl/layers';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieWFzaG4iLCJhIjoiY2tybjZrYjViMWg3ejMxbGltc25vNTB1NyJ9.jmSJX_oaS7BY8GDizT37EA';

const DATA_URL = "./data/newValidators.json";

const INITIAL_VIEW_STATE = {
  longitude: 26.0063319,
  latitude: 32.724422,
  zoom: 1,
  pitch: 0,
  bearing: 0,
  dragRotate: false
};

// const INITIAL_VIEW_STATE = ({
//   initialViewState: {
//     longitude: 26.0063319,
//     latitude: 32.724422,
//     zoom: 1,
//     pitch: 0,
//     bearing: 0
//   },
//   controller: true
// });

export function RPCNodeMap({
  data = DATA_URL,
}) {

  const layer = new ArcLayer({
    id: 'arc-layer',
    data,
    pickable: true,
    opacity: 1,
    getWidth: 2,
    wrapLongitude: true,
    getSourcePosition: (d) => [
      parseFloat(d.from.longitude),
      parseFloat(d.from.latitude)
    ],
    getTargetPosition: (d) => [
      parseFloat(d.to.longitude),
      parseFloat(d.to.latitude)
    ],
    getSourceColor: (d) => [Math.sqrt(d.fare_amount), 140, 0],
    getTargetColor: (d) => [Math.sqrt(d.fare_amount), 140, 0],
  });

  const MAP_STYLE = mapStyle;

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
            layers={[layer]}>
            <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle={MAP_STYLE} />
          </DeckGL>
        </div>

      </div>
    </div>
  );
}
