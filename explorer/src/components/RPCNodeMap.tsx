import React from 'react';
import DeckGL from '@deck.gl/react/typed';
import { StaticMap } from 'react-map-gl';
import { mapStyle } from "../utils/mapStyle";
import { ArcLayer } from '@deck.gl/layers';
import { ScreenGridLayer } from '@deck.gl/aggregation-layers';
import Validators from '../validators/Validators.json';
import * as d3 from 'd3';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieWFzaG4iLCJhIjoiY2tybjZrYjViMWg3ejMxbGltc25vNTB1NyJ9.jmSJX_oaS7BY8GDizT37EA';


function mapdata(arr, n, fn) {
  for (var i = 0; i < arr.length; i += n)
    fn(arr.slice(i, i + n));
}

function newMapData() {
  mapdata(Validators, 2, function (msg) {
    // console.log(msg)
    var newData = `${msg[0].latitude} , ${msg[0].longitude}, ${msg[1].latitude} , ${msg[1].longitude}`
    console.log(`${newData}`)
  });
}

const addData = newMapData()

// Working code:
// const addData = `41.1696 , -111.9818, 51.2993 , 9.491
// 51.4964 , -0.1224, 51.2993 , 9.491
// 41.7572 , -88.3177, 55.9318 , 23.3289
// 41.1696 , -111.9818, 34.0544 , -118.2441
// 48.8582 , 2.3387, 44.4205 , 26.169`

const csvData = `pickup_latitude,pickup_longitude,dropoff_latitude,dropoff_longitude
${addData}
`

const INITIAL_VIEW_STATE = {
  longitude: 26.0063319,
  latitude: 32.724422,
  zoom: 1,
  pitch: 0,
  bearing: 0,
};

export function RPCNodeMap({
  cellSize = 20,
  gpuAggregation = true,
  aggregation = 'SUM',
}) {

  const data = d3.csvParse(csvData);

  const layer = [
    new ArcLayer({
      id: 'arc-layer',
      data,
      pickable: true,
      opacity: 1,
      getWidth: 2,
      wrapLongitude: true,
      getSourcePosition: d => ([parseFloat(d.pickup_longitude), parseFloat(d.pickup_latitude)]),
      getTargetPosition: d => ([parseFloat(d.dropoff_longitude), parseFloat(d.dropoff_latitude)]),
      getSourceColor: [191, 64, 191],
      getTargetColor: [191, 64, 191],
    }),
    new ScreenGridLayer({
      id: 'grid',
      data,
      opacity: 1,
      getPosition: d => [[parseFloat(d.pickup_longitude), parseFloat(d.pickup_latitude), parseFloat(d.dropoff_longitude), parseFloat(d.dropoff_latitude)]],
      getWeight: 4,
      cellSizePixels: cellSize,
      colorRange: [191, 64, 191],
      gpuAggregation,
      aggregation
    })
  ]

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
            layers={[layer]}
            controller={true}
          >
            <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle={MAP_STYLE} />
          </DeckGL>
        </div>

      </div>
    </div>
  );
}
