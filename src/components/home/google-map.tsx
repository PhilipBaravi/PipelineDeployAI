"use client";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { useState, useCallback, useMemo, useEffect } from "react";
import {
  getAddressFromCoordinates,
  getAndCopyAddress,
} from "@/lib/address-copy";
import { useToast } from "@/lib/hooks/use-toast";
import { Toaster } from "../ui/toaster";
import { Button } from "../ui/button";

interface Coordinate {
  lat: number;
  lng: number;
}

interface PipelineNode {
  latitude: number;
  longitude: number;
}

interface Pipeline {
  nodes: PipelineNode[];
}

interface PipelineResponse {
  success: boolean;
  data: Pipeline[];
}

interface Connection {
  start: Coordinate;
  end: Coordinate;
  startPipeline: { type: "deployed" | "empty"; index: number };
  endPipeline: { type: "deployed" | "empty"; index: number };
}

export default function MapComponent() {
  const [deployedPipelines, setDeployedPipelines] = useState<Coordinate[][]>(
    []
  );
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { toast } = useToast();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries: ["geometry"],
  });

  useEffect(() => {
    const fetchDeployedPipelines = async (): Promise<void> => {
      try {
        const response = await fetch(
          "https://dbb0-82-211-142-122.ngrok-free.app/api/v1/pipeline"
        );

        // First check if response is OK (status 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const text = await response.text();
          throw new Error(
            `Invalid content type: ${contentType} - Response: ${text}`
          );
        }

        // Explicitly cast the response to our PipelineResponse type
        const data = (await response.json()) as PipelineResponse;

        if (data.success) {
          // Map the response data to an array of arrays of Coordinates
          const pipelines: Coordinate[][] = data.data.map(
            (pipeline: Pipeline) =>
              pipeline.nodes.map(
                (node: PipelineNode): Coordinate => ({
                  lat: node.latitude,
                  lng: node.longitude,
                })
              )
          );
          setDeployedPipelines(pipelines);
        }
      } catch (error) {
        console.error("Error fetching pipelines:", error);
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load pipeline data",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    fetchDeployedPipelines();
  }, []);

  const emptyPipelines = useMemo(
    () => [
      [
        { lat: 41.3857, lng: 2.1764 },
        { lat: 41.3859, lng: 2.1774 },
      ],
      [
        { lat: 41.3865, lng: 2.1744 },
        { lat: 41.3867, lng: 2.1754 },
      ],
    ],
    []
  );

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{
    coord: Coordinate;
    type: "deployed" | "empty";
    pipelineIndex: number;
  } | null>(null);

  const center = useMemo(() => ({ lat: 41.3851, lng: 2.1734 }), []);

  const pipelineStyles = {
    deployed: { strokeColor: "#00FF00", strokeOpacity: 1.0, strokeWeight: 4 },
    empty: { strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 4 },
    connection: { strokeColor: "#0000FF", strokeOpacity: 0.8, strokeWeight: 3 },
  };

  const calculatePipelineLength = useCallback(
    (pipeline: Coordinate[]): number => {
      return pipeline.reduce((total, point, index) => {
        if (index === 0) return total;
        const prevPoint = pipeline[index - 1];
        return (
          total +
          google.maps.geometry.spherical.computeDistanceBetween(
            prevPoint,
            point
          )
        );
      }, 0);
    },
    []
  );

  const {
    connectedDeployed,
    connectedEmpty,
    connectionDistance,
    connectedCoordinates,
  } = useMemo(() => {
    const adjacency = new Map<string, string[]>();
    const allNodes = new Set<string>();
    let cDeployed = 0;
    let cEmpty = 0;
    const coords: Coordinate[] = [];

    connections.forEach((conn) => {
      const startKey = `${conn.startPipeline.type}-${conn.startPipeline.index}`;
      const endKey = `${conn.endPipeline.type}-${conn.endPipeline.index}`;
      allNodes.add(startKey);
      allNodes.add(endKey);

      if (!adjacency.has(startKey)) adjacency.set(startKey, []);
      if (!adjacency.has(endKey)) adjacency.set(endKey, []);
      adjacency.get(startKey)?.push(endKey);
      adjacency.get(endKey)?.push(startKey);
    });

    const visited = new Set<string>();
    const components: Set<string>[] = [];

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

    components.forEach((component) => {
      const hasDeployed = Array.from(component).some((k) =>
        k.startsWith("deployed-")
      );
      if (hasDeployed) {
        component.forEach((key) => {
          const [type, index] = key.split("-");
          const idx = parseInt(index);
          const pipeline =
            type === "deployed" ? deployedPipelines[idx] : emptyPipelines[idx];

          pipeline.forEach((coord) => {
            if (
              !coords.some((c) => c.lat === coord.lat && c.lng === coord.lng)
            ) {
              coords.push(coord);
            }
          });

          if (type === "deployed") {
            cDeployed += calculatePipelineLength(pipeline);
          } else {
            cEmpty += calculatePipelineLength(pipeline);
          }
        });
      }
    });

    const cDistance = connections.reduce(
      (sum, conn) =>
        sum +
        google.maps.geometry.spherical.computeDistanceBetween(
          conn.start,
          conn.end
        ),
      0
    );

    return {
      connectedDeployed: cDeployed,
      connectedEmpty: cEmpty,
      connectionDistance: cDistance,
      connectedCoordinates: coords,
    };
  }, [connections, deployedPipelines, emptyPipelines, calculatePipelineLength]);

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
        console.error(error);
      }
    },
    [toast]
  );

  const handleGeneratePrompt = useCallback(async () => {
    try {
      let address = "[location]";

      if (connectedCoordinates.length > 0) {
        const total = connectedCoordinates.reduce(
          (acc, coord) => ({
            lat: acc.lat + coord.lat,
            lng: acc.lng + coord.lng,
          }),
          { lat: 0, lng: 0 }
        );

        const avgLat = total.lat / connectedCoordinates.length;
        const avgLng = total.lng / connectedCoordinates.length;

        try {
          address = await getAddressFromCoordinates(avgLat, avgLng);
        } catch (error) {
          console.error("Geocoding failed:", error);
          address = "[nearest available location]";
        }
      }

      const promptText = `I need a structured feasibility analysis for a networking pipeline deployment project in ${address}.\n\nThere is an existing pipeline that is ${connectedDeployed.toFixed(
        2
      )} meters in length and an unused pipeline (canalization) ${connectionDistance.toFixed(
        2
      )} meters away, with a length of ${connectedEmpty.toFixed(2)} meters.`;

      await navigator.clipboard.writeText(promptText);
      toast({
        title: "Prompt Copied!",
        description: (
          <div className="grid gap-1">
            {promptText.split("\n\n").map((line, i) => (
              <p key={i} className="text-sm">
                {line}
              </p>
            ))}
          </div>
        ),
        duration: 5000,
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy prompt to clipboard",
        variant: "destructive",
        duration: 3000,
      });
      console.error(error);
    }
  }, [
    connectedCoordinates,
    connectedDeployed,
    connectedEmpty,
    connectionDistance,
    toast,
  ]);

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <div className="p-4 h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pipeline Network Map</h2>
        <Button onClick={handleGeneratePrompt}>Generate Prompt</Button>
      </div>

      <div className="mb-4 space-y-1 text-sm">
        <p>Deployed Pipeline Length: {connectedDeployed.toFixed(2)}m</p>
        <p>
          Empty Pipeline (Canalization) Length: {connectedEmpty.toFixed(2)}m
        </p>
        <p>Connection Distance: {connectionDistance.toFixed(2)}m</p>
      </div>

      <div className="h-[calc(100%-8rem)]">
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={center}
          zoom={8}
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
