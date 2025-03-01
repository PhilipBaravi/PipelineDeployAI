"use client";

import {
  useJsApiLoader,
  GoogleMap,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { useState, useEffect, useCallback } from "react";
import { getAndCopyAddress } from "@/lib/address-copy";
import { useToast } from "@/lib/hooks/use-toast";
import { Toaster } from "../ui/toaster";

// Define TypeScript types for coordinates
interface Coordinate {
  lat: number;
  lng: number;
}

export default function MapComponent() {
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { toast } = useToast();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_API_KEY,
  });

  const [networkPipeline, setNetworkPipeline] = useState<Coordinate[]>([
    { lat: 51.505, lng: -0.09 },
    { lat: 51.51, lng: -0.1 },
    { lat: 51.515, lng: -0.095 },
    { lat: 51.52, lng: -0.085 },
    { lat: 51.525, lng: -0.075 },
  ]);

  const [emptyNetworkPipeline, setEmptyNetworkPipeline] = useState<
    Coordinate[]
  >([
    { lat: 51.6, lng: -0.078 },
    { lat: 51.53, lng: -0.07 },
    { lat: 51.535, lng: -0.065 },
  ]);

  const [mapKey, setMapKey] = useState<number>(0);

  useEffect(() => {
    setMapKey((prevKey) => prevKey + 1);
  }, []); //Fixed unnecessary dependencies

  const mapCenter: Coordinate =
    networkPipeline.length > 0 ? networkPipeline[0] : { lat: 0, lng: 0 };

  const pipelineStyles = {
    network: { strokeColor: "#00FF00", strokeOpacity: 1.0, strokeWeight: 4 },
    empty: { strokeColor: "#FF0000", strokeOpacity: 1.0, strokeWeight: 4 },
    connection: { strokeColor: "#0000FF", strokeOpacity: 0.8, strokeWeight: 3 },
  };

  // Haversine formula to calculate distance between two lat/lng points in meters
  const haversineDistance = (
    coord1: Coordinate,
    coord2: Coordinate
  ): number => {
    const R = 6371000; // Radius of Earth in meters
    const toRad = (angle: number) => (angle * Math.PI) / 180;
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLng = toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(coord1.lat)) *
        Math.cos(toRad(coord2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Function to calculate total pipeline length
  const calculateTotalDistance = (pipeline: Coordinate[]): number => {
    if (pipeline.length < 2) return 0;

    return pipeline.reduce((total, point, index) => {
      if (index === 0) return total;
      return total + haversineDistance(pipeline[index - 1], point);
    }, 0);
  };

  // Find the nearest empty pipeline point
  const findNearestPoint = (
    target: Coordinate,
    points: Coordinate[]
  ): Coordinate | null => {
    if (!target || points.length === 0) return null;

    return points.reduce((nearest: Coordinate, point: Coordinate) => {
      const distance = haversineDistance(target, point);
      const nearestDistance = haversineDistance(target, nearest);
      return distance < nearestDistance ? point : nearest;
    }, points[0]);
  };

  // Last point of deployed pipeline
  const lastNetworkPoint: Coordinate | null =
    networkPipeline.length > 0
      ? networkPipeline[networkPipeline.length - 1]
      : null;

  const nearestEmptyPoint: Coordinate | null = lastNetworkPoint
    ? findNearestPoint(lastNetworkPoint, emptyNetworkPipeline)
    : null;

  // Calculate total lengths
  const totalDeployedLength = calculateTotalDistance(networkPipeline);
  const totalEmptyLength = calculateTotalDistance(emptyNetworkPipeline);
  const connectionDistance =
    lastNetworkPoint && nearestEmptyPoint
      ? haversineDistance(lastNetworkPoint, nearestEmptyPoint)
      : 0;

  // Handle map click to copy address
  const handleMapClick = useCallback(
    async (e: google.maps.MapMouseEvent) => {
      if (!e.latLng) return;

      const lat = e.latLng.lat();
      const lng = e.latLng.lng();

      try {
        const address = await getAndCopyAddress(lat, lng);

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

      {/* Display pipeline distances */}
      <div className="mb-4 space-y-1 text-sm">
        <p>Deployed Pipeline Length: {totalDeployedLength.toFixed(2)}m</p>
        <p>Empty Pipeline Length: {totalEmptyLength.toFixed(2)}m</p>
        <p>Connection Distance: {connectionDistance.toFixed(2)}m</p>
      </div>

      <div className="h-[calc(100%-8rem)]">
        <GoogleMap
          key={mapKey} // Force re-render when data changes
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={13}
          onClick={handleMapClick}
        >
          {/* Main Network Pipeline (Green) */}
          {networkPipeline.map((position, index) => (
            <Marker key={`network-${index}`} position={position} />
          ))}
          <Polyline path={networkPipeline} options={pipelineStyles.network} />

          {/* Empty Pipeline (Red) */}
          {emptyNetworkPipeline.map((position, index) => (
            <Marker key={`empty-${index}`} position={position} />
          ))}
          <Polyline
            path={emptyNetworkPipeline}
            options={pipelineStyles.empty}
          />

          {/* Inter-Pipeline Connection (Blue, Now Connecting to the Nearest Point) */}
          {lastNetworkPoint && nearestEmptyPoint && (
            <Polyline
              path={[lastNetworkPoint, nearestEmptyPoint]}
              options={pipelineStyles.connection}
            />
          )}
        </GoogleMap>
      </div>

      {/* Toast component for notifications */}
      <Toaster />
    </div>
  );
}
