"use client";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { useState, useCallback, useMemo } from "react";
import { getAndCopyAddress } from "@/lib/address-copy";
import { useToast } from "@/lib/hooks/use-toast";
import { Toaster } from "../ui/toaster";

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

export default function MapComponent() {
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { toast } = useToast();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  const deployedPipelines = [
    [
      { lat: 51.505, lng: -0.09 },
      { lat: 51.5052, lng: -0.089 },
      { lat: 51.5054, lng: -0.088 },
    ],
    [
      { lat: 51.506, lng: -0.091 },
      { lat: 51.5062, lng: -0.09 },
    ],
  ];

  const emptyPipelines = [
    [
      { lat: 51.5056, lng: -0.087 },
      { lat: 51.5058, lng: -0.086 },
    ],
    [
      { lat: 51.5064, lng: -0.089 },
      { lat: 51.5066, lng: -0.088 },
    ],
  ];

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{
    coord: Coordinate;
    type: "deployed" | "empty";
    pipelineIndex: number;
  } | null>(null);

  const pipelineStyles = {
    deployed: { strokeColor: "#00FF00", strokeOpacity: 1.0, strokeWeight: 4 },
    empty: { strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 4 },
    connection: { strokeColor: "#0000FF", strokeOpacity: 0.8, strokeWeight: 3 },
  };

  const haversineDistance = (
    coord1: Coordinate,
    coord2: Coordinate
  ): number => {
    const R = 6371000;
    const toRad = (angle: number) => (angle * Math.PI) / 180;
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const calculatePipelineLength = (pipeline: Coordinate[]): number => {
    return pipeline.reduce((total, point, index) => {
      if (index === 0) return total;
      return total + haversineDistance(pipeline[index - 1], point);
    }, 0);
  };

  const { connectedDeployed, connectedEmpty, connectionDistance } =
    useMemo(() => {
      const adjacency = new Map<string, string[]>();
      const allNodes = new Set<string>();
      let cDeployed = 0;
      let cEmpty = 0;

      // Build adjacency list
      connections.forEach((conn) => {
        const startKey = `${conn.startPipeline.type}-${conn.startPipeline.index}`;
        const endKey = `${conn.endPipeline.type}-${conn.endPipeline.index}`;
        allNodes.add(startKey);
        allNodes.add(endKey);

        if (!adjacency.has(startKey)) adjacency.set(startKey, []);
        if (!adjacency.has(endKey)) adjacency.set(endKey, []);
        adjacency.get(startKey)!.push(endKey);
        adjacency.get(endKey)!.push(startKey);
      });

      const visited = new Set<string>();
      const components: Set<string>[] = [];

      // Find all connected components
      allNodes.forEach((node) => {
        if (!visited.has(node)) {
          const component = new Set<string>();
          const queue = [node];
          while (queue.length > 0) {
            const current = queue.shift()!;
            if (visited.has(current)) continue;
            visited.add(current);
            component.add(current);
            adjacency.get(current)?.forEach((neighbor) => {
              if (!visited.has(neighbor)) queue.push(neighbor);
            });
          }
          components.push(component);
        }
      });

      // Calculate lengths for components containing deployed pipelines
      components.forEach((component) => {
        const hasDeployed = Array.from(component).some((k) =>
          k.startsWith("deployed-")
        );
        if (hasDeployed) {
          component.forEach((key) => {
            const [type, index] = key.split("-");
            const idx = parseInt(index);
            if (type === "deployed") {
              cDeployed += calculatePipelineLength(deployedPipelines[idx]);
            } else {
              cEmpty += calculatePipelineLength(emptyPipelines[idx]);
            }
          });
        }
      });

      const cDistance = connections.reduce(
        (sum, conn) => sum + haversineDistance(conn.start, conn.end),
        0
      );

      return {
        connectedDeployed: cDeployed,
        connectedEmpty: cEmpty,
        connectionDistance: cDistance,
      };
    }, [connections]);

  const handlePointClick =
    (coord: Coordinate, type: "deployed" | "empty", pipelineIndex: number) =>
    (e: google.maps.MapMouseEvent) => {
      e.domEvent.stopPropagation();

      if (!selectedPoint) {
        setSelectedPoint({ coord, type, pipelineIndex });
      } else {
        const newConnection: Connection = {
          start: selectedPoint.coord,
          end: coord,
          startPipeline: {
            type: selectedPoint.type,
            index: selectedPoint.pipelineIndex,
          },
          endPipeline: { type, index: pipelineIndex },
        };
        setConnections((prev) => [...prev, newConnection]);
        setSelectedPoint(null);
      }
    };

  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;
      setSelectedPoint(null);

      try {
        const address = await getAndCopyAddress(e.latLng.lat(), e.latLng.lng());
        toast({
          title: "Address Copied!",
          description: address,
          duration: 3000,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy address",
          variant: "destructive",
          duration: 3000,
        });
      }
    },
    [toast]
  );

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-4 h-full">
      <h2 className="text-xl font-semibold mb-2">Pipeline Network Map</h2>

      <div className="mb-4 space-y-1 text-sm">
        <p>Connected Deployed Length: {connectedDeployed.toFixed(2)}m</p>
        <p>Connected Empty Length: {connectedEmpty.toFixed(2)}m</p>
        <p>Connection Distance: {connectionDistance.toFixed(2)}m</p>
      </div>

      <div className="h-[calc(100%-8rem)]">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 51.5055, lng: -0.089 }}
          zoom={16}
          onClick={handleMapClick}
        >
          {deployedPipelines.map((pipeline, pipelineIndex) => (
            <div key={`deployed-${pipelineIndex}`}>
              <Polyline path={pipeline} options={pipelineStyles.deployed} />
              {pipeline.map((coord, pointIndex) => (
                <Marker
                  key={`deployed-${pipelineIndex}-${pointIndex}`}
                  position={coord}
                  onClick={handlePointClick(coord, "deployed", pipelineIndex)}
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
                  onClick={handlePointClick(coord, "empty", pipelineIndex)}
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
      </div>
      <Toaster />
    </div>
  );
}
