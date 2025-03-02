"use client";

import { Button } from "../ui/button";

interface MapToolbarProps {
  connectedDeployed: number;
  connectedEmpty: number;
  connectionDistance: number;
  onGeneratePrompt: () => void;
}

export default function MapToolbar({
  connectedDeployed,
  connectedEmpty,
  connectionDistance,
  onGeneratePrompt,
}: MapToolbarProps) {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Pipeline Network Map</h2>
        <Button onClick={onGeneratePrompt}>Generate Prompt</Button>
      </div>
      <div className="mb-4 space-y-1 text-sm">
        <p>Deployed Pipeline Length: {connectedDeployed.toFixed(2)}m</p>
        <p>
          Empty Pipeline (Canalization) Length: {connectedEmpty.toFixed(2)}m
        </p>
        <p>Connection Distance: {connectionDistance.toFixed(2)}m</p>
      </div>
    </div>
  );
}
