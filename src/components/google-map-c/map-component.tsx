"use client";

import { useJsApiLoader } from "@react-google-maps/api";
import { useState, useCallback, useMemo } from "react";
import {
  getAddressFromCoordinates,
  getAndCopyAddress,
} from "@/lib/address-copy";
import { useToast } from "@/lib/hooks/use-toast";
import MapToolbar from "./map-toolbar";
import PipelineMap from "./PipelineMap";
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

interface MapComponentProps {
  /**
   * Array of pipelines for deployed (non-empty) pipelines.
   * Each pipeline is represented as an array of Coordinates.
   */
  deployedPipelines: Coordinate[][];

  /**
   * Array of pipelines for empty pipelines.
   * Each pipeline is represented as an array of Coordinates.
   */
  emptyPipelines: Coordinate[][];
}

export default function MapComponent({
  deployedPipelines: initialDeployedPipelines,
  emptyPipelines: initialEmptyPipelines,
}: MapComponentProps) {
  /**
   * We store the passed-in pipelines in state, but if they don't need
   * to be dynamically modified, you can leave them as is. For clarity,
   * here we set them in local state.
   */
  const [deployedPipelines] = useState<Coordinate[][]>(
    initialDeployedPipelines
  );
  const [emptyPipelines] = useState<Coordinate[][]>(initialEmptyPipelines);

  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { toast } = useToast();
  const libraries = useMemo(() => ["geometry"] as "geometry"[], []);
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_API_KEY,
    libraries,
  });

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<{
    coord: Coordinate;
    type: "deployed" | "empty";
    pipelineIndex: number;
  } | null>(null);

  // Default center for the map
  const center = useMemo(() => ({ lat: 41.3851, lng: 2.1734 }), []);

  // Stroke colors and styles for each pipeline type
  const pipelineStyles = {
    deployed: { strokeColor: "#00FF00", strokeOpacity: 1.0, strokeWeight: 4 },
    empty: { strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 4 },
    connection: { strokeColor: "#0000FF", strokeOpacity: 0.8, strokeWeight: 3 },
  };

  /**
   * Calculates the total length of a pipeline (in meters)
   * by summing up segment distances between consecutive points.
   */
  const calculatePipelineLength = useCallback(
    (pipeline: Coordinate[]): number => {
      return pipeline.reduce((total, point, index) => {
        if (index === 0) return total;
        const prevPoint = pipeline[index - 1];
        // Use Google Maps geometry utility to measure distance
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

  /**
   * This memoized object calculates:
   * - connectedDeployed: The total length of all deployed pipelines
   *   in the connected component(s) that contain at least one deployed pipeline.
   * - connectedEmpty: The total length of all empty pipelines
   *   in the connected component(s) that contain at least one deployed pipeline.
   * - connectionDistance: The sum of lengths of all "connection" lines
   *   that the user has drawn between points.
   * - connectedCoordinates: All unique coordinates in the connected component(s).
   */
  const {
    connectedDeployed,
    connectedEmpty,
    connectionDistance,
    connectedCoordinates,
  } = useMemo(() => {
    // Adjacency list: key is "type-index" (e.g. "deployed-0"), values are neighbors
    const adjacency = new Map<string, string[]>();
    const allNodes = new Set<string>();
    let cDeployed = 0;
    let cEmpty = 0;
    const coords: Coordinate[] = [];

    // Build adjacency list from user-made connections
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

    // BFS or DFS to find connected components
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

    // For each connected component, if it includes a deployed pipeline,
    // we count the lengths of all pipelines (deployed and empty) in that component.
    components.forEach((component) => {
      const hasDeployed = Array.from(component).some((k) =>
        k.startsWith("deployed-")
      );
      if (hasDeployed) {
        component.forEach((key) => {
          const [type, idxStr] = key.split("-");
          const idx = parseInt(idxStr, 10);
          const pipeline =
            type === "deployed" ? deployedPipelines[idx] : emptyPipelines[idx];

          // Add all the pipeline's coordinates if they're not already included
          pipeline.forEach((coord) => {
            if (
              !coords.some((c) => c.lat === coord.lat && c.lng === coord.lng)
            ) {
              coords.push(coord);
            }
          });

          // Add to total length counters
          if (type === "deployed") {
            cDeployed += calculatePipelineLength(pipeline);
          } else {
            cEmpty += calculatePipelineLength(pipeline);
          }
        });
      }
    });

    // Sum up the distances of all drawn "connection" lines
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

  /**
   * Called when the user clicks on a pipeline node (either deployed or empty).
   * If there's no selected point, we set the newly clicked point as the selected.
   * If there is a selected point, we create a connection line between the two.
   */
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

  /**
   * Called when the user clicks on an empty space in the map.
   * Resets the selected point and tries to copy the clicked location address.
   */
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

  /**
   * Called when the user clicks the "Generate Prompt" button.
   * Creates a text summary of the connected pipeline information and
   * copies it to the clipboard.
   */
  const handleGeneratePrompt = useCallback(async () => {
    try {
      let address = "[location]";

      // If we have connected coordinates, get the approximate "center" address
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
      <MapToolbar
        connectedDeployed={connectedDeployed}
        connectedEmpty={connectedEmpty}
        connectionDistance={connectionDistance}
        onGeneratePrompt={handleGeneratePrompt}
      />
      <div className="h-[calc(100%-8rem)]">
        <PipelineMap
          center={center}
          deployedPipelines={deployedPipelines}
          emptyPipelines={emptyPipelines}
          connections={connections}
          selectedPoint={selectedPoint}
          onPointClick={handlePointClick}
          onMapClick={handleMapClick}
          pipelineStyles={pipelineStyles}
        />
      </div>
      <Toaster />
    </div>
  );
}
