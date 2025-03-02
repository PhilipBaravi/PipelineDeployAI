"use client";

import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";

interface Coordinate {
  lat: number;
  lng: number;
}

interface Connection {
  start: Coordinate;
  end: Coordinate;
  startPipeline: { type: "deployed" | "empty"; index: number };
  endPipeline: { type: "deployed" | "empty"; index: number };
}

interface PipelineMapProps {
  center: Coordinate;
  deployedPipelines: Coordinate[][];
  emptyPipelines: Coordinate[][];
  connections: Connection[];
  selectedPoint: {
    coord: Coordinate;
    type: "deployed" | "empty";
    pipelineIndex: number;
  } | null;
  onPointClick: (
    coord: Coordinate,
    type: "deployed" | "empty",
    pipelineIndex: number
  ) => (e: google.maps.MapMouseEvent) => void;
  onMapClick: (e: google.maps.MapMouseEvent) => void;
  pipelineStyles: {
    deployed: google.maps.PolylineOptions;
    empty: google.maps.PolylineOptions;
    connection: google.maps.PolylineOptions;
  };
}

export default function PipelineMap({
  center,
  deployedPipelines,
  emptyPipelines,
  connections,
  selectedPoint,
  onPointClick,
  onMapClick,
  pipelineStyles,
}: PipelineMapProps) {
  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={center}
      zoom={8}
      onClick={onMapClick}
    >
      {deployedPipelines.map((pipeline, pipelineIndex) => (
        <div key={`deployed-${pipelineIndex}`}>
          <Polyline path={pipeline} options={pipelineStyles.deployed} />
          {pipeline.map((coord, pointIndex) => (
            <Marker
              key={`deployed-${pipelineIndex}-${pointIndex}`}
              position={coord}
              onClick={onPointClick(coord, "deployed", pipelineIndex)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor:
                  selectedPoint?.pipelineIndex === pipelineIndex
                    ? "#FFFF00"
                    : "#00FF00",
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 5,
              }}
            />
          ))}
        </div>
      ))}

      {emptyPipelines.map((pipeline, pipelineIndex) => (
        <div key={`empty-${pipelineIndex}`}>
          <Polyline path={pipeline} options={pipelineStyles.empty} />
          {pipeline.map((coord, pointIndex) => (
            <Marker
              key={`empty-${pipelineIndex}-${pointIndex}`}
              position={coord}
              onClick={onPointClick(coord, "empty", pipelineIndex)}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                fillColor:
                  selectedPoint?.pipelineIndex === pipelineIndex
                    ? "#FFFF00"
                    : "#FF0000",
                fillOpacity: 1,
                strokeWeight: 0,
                scale: 5,
              }}
            />
          ))}
        </div>
      ))}

      {connections.map((connection, index) => (
        <Polyline
          key={`connection-${index}`}
          path={[connection.start, connection.end]}
          options={pipelineStyles.connection}
        />
      ))}
    </GoogleMap>
  );
}
