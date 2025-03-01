export default function CalculationsPage() {
  return (
    <div className="w-full p-4 flex flex-col space-y-8">
      <h1 className="text-2xl font-bold mb-6">Distance Calculations</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Haversine Formula</h2>
        <p className="text-gray-600 leading-relaxed">
          We use the Haversine formula to calculate the great-circle distance
          between two points on a sphere (in our case, Earth). This formula is
          particularly accurate for geographical calculations as it accounts for
          Earth&apos;s spherical shape.
        </p>
        <div className="bg-muted/20 p-4 rounded-lg space-y-2">
          <p className="font-mono">
            R = 6371000 (Earth&apos;s radius in meters)
          </p>
          <p className="font-mono">a = sin²(Δφ/2) + cos(φ₁)cos(φ₂)sin²(Δλ/2)</p>
          <p className="font-mono">c = 2 * atan2(√a, √(1-a))</p>
          <p className="font-mono">d = R * c</p>
          <p className="mt-2 text-sm text-gray-600">
            Where: φ is latitude, λ is longitude, and R is Earth&apos;s radius
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Total Pipeline Length</h2>
        <p className="text-gray-600 leading-relaxed">
          The total length of a pipeline is calculated by summing the Haversine
          distances between consecutive points in the pipeline path. For a
          pipeline with n points, we calculate:
        </p>
        <div className="bg-muted/20 p-4 rounded-lg">
          <p className="font-mono">
            Total Length = Σ distance(point[i], point[i+1])
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Where i ranges from 0 to n-1, and distance is calculated using the
            Haversine formula
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Nearest Point Calculation</h2>
        <p className="text-gray-600 leading-relaxed">
          To find the nearest empty pipeline point to the end of a deployed
          pipeline, we:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-gray-600">
          <li>
            Take the last point of the deployed pipeline as the reference point
          </li>
          <li>
            Calculate the Haversine distance to each point in the empty pipeline
          </li>
          <li>Keep track of the point with the minimum distance</li>
        </ol>
        <div className="bg-muted/20 p-4 rounded-lg mt-2">
          <p className="font-mono">
            nearest = min(distance(reference, point)) for all points
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Connection Distance</h2>
        <p className="text-gray-600 leading-relaxed">
          The connection distance represents the shortest possible path between
          the deployed pipeline and the empty pipeline network. It is calculated
          as the Haversine distance between:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600">
          <li>The last point of the deployed pipeline</li>
          <li>The nearest point found in the empty pipeline network</li>
        </ul>
        <p className="mt-2 text-gray-600">
          This distance helps in planning the most efficient way to connect the
          two pipeline networks.
        </p>
      </section>
    </div>
  );
}
