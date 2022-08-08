import React from 'react';
import DeckGL from '@deck.gl/react/typed';
import { StaticMap } from 'react-map-gl';
import { mapStyle } from "../utils/mapStyle";
import { ArcLayer } from '@deck.gl/layers';
import { ScreenGridLayer } from '@deck.gl/aggregation-layers';
import Validators from '../validators/Validators.json';
import * as d3 from 'd3';

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoieWFzaG4iLCJhIjoiY2tybjZrYjViMWg3ejMxbGltc25vNTB1NyJ9.jmSJX_oaS7BY8GDizT37EA';

const addData = [];

Validators.forEach(function () {
  for (var i = 0; i < ((Validators.length) / 2); i += 2) {
    // @ts-ignore
    addData.push(`source_latitude,source_longitude,destination_latitude,destination_longitude \n${Validators[i].latitude}, ${Validators[i].longitude}, ${Validators[i + 1].latitude}, ${Validators[i + 1].longitude}`)
  }
})

const csvData = `source_latitude,source_longitude,destination_latitude,destination_longitude
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
      getSourcePosition: d => ([parseFloat(d.source_longitude), parseFloat(d.source_latitude)]),
      getTargetPosition: d => ([parseFloat(d.destination_longitude), parseFloat(d.destination_latitude)]),
      getSourceColor: [191, 64, 191],
      getTargetColor: [191, 64, 191],
    }),
    new ScreenGridLayer({
      id: 'grid',
      data,
      opacity: 1,
      getPosition: d => [[parseFloat(d.source_longitude), parseFloat(d.source_latitude), parseFloat(d.destination_longitude), parseFloat(d.destination_latitude)]],
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
