import AiChat from "@/components/home/ai-chat";
import ChatOutput from "@/components/home/chat-output";
import { CostDataProvider } from "@/lib/contexts/CostDataContext";
import MapComponent from "@/components/google-map-c/map-component";

interface Coordinate {
  lat: number;
  lng: number;
}

interface PipelineNode {
  latitude: number;
  longitude: number;
}

interface Pipeline {
  id: number;
  nodes: PipelineNode[];
  length: number;
  underConstruction: boolean;
}

interface PipelineResponse {
  success: boolean;
  data: Pipeline[];
}

export default async function Home() {
  let deployedPipelines: Coordinate[][] = [];
  let emptyPipelines: Coordinate[][] = [];

  /**
   * Reduces the number of nodes to a maximum of 3 while ensuring
   * that the first and last nodes are always included.
   */
  function samplePipelineNodes(nodes: PipelineNode[]): Coordinate[] {
    // If the pipeline has 3 or fewer nodes, just convert them directly
    if (nodes.length <= 3) {
      return nodes.map((node) => ({
        lat: node.latitude,
        lng: node.longitude,
      }));
    }

    const maxPoints = 3;
    // We have 2 intervals for 3 points (start, 1 intermediate, end)
    const step = (nodes.length - 1) / (maxPoints - 1);
    const sampled: Coordinate[] = [];

    for (let i = 0; i < maxPoints; i++) {
      const index = Math.floor(i * step);
      sampled.push({
        lat: nodes[index].latitude,
        lng: nodes[index].longitude,
      });
    }

    // Ensure the last sampled point is the actual last node
    sampled[sampled.length - 1] = {
      lat: nodes[nodes.length - 1].latitude,
      lng: nodes[nodes.length - 1].longitude,
    };

    return sampled;
  }

  // Fetch non-empty (deployed) pipelines and skip every 5th one.
  try {
    const responseNonEmpty = await fetch(
      "https://cost-efficient-deployment.onrender.com/api/v1/pipeline/non-empty",
      {
        headers: { "ngrok-skip-browser-warning": "true" },
      }
    );
    console.log(responseNonEmpty);

    if (!responseNonEmpty.ok) {
      console.error(`HTTP error! status: ${responseNonEmpty.status}`);
    } else {
      const contentType = responseNonEmpty.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = (await responseNonEmpty.json()) as PipelineResponse;
        console.log(data);

        if (data.data && data.data.length > 0) {
          // Skip every 5th pipeline
          const filteredNonEmpty = data.data.filter(
            (_pipeline, index) => (index + 1) % 5 !== 0
          );
          // Sample each pipeline to a maximum of 3 nodes
          deployedPipelines = filteredNonEmpty.map((pipeline: Pipeline) =>
            samplePipelineNodes(pipeline.nodes)
          );
        }
      } else {
        const text = await responseNonEmpty.text();
        console.error(
          `Invalid content type: ${contentType} - Response: ${text}`
        );
      }
    }
  } catch (error) {
    console.error("Error fetching non-empty pipelines:", error);
  }

  // Fetch empty pipelines and skip every 5th one.
  try {
    const responseEmpty = await fetch(
      "https://cost-efficient-deployment.onrender.com/api/v1/pipeline/empty",
      {
        headers: { "ngrok-skip-browser-warning": "true" },
      }
    );
    console.log(responseEmpty);

    if (!responseEmpty.ok) {
      console.error(`HTTP error! status: ${responseEmpty.status}`);
    } else {
      const contentType = responseEmpty.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = (await responseEmpty.json()) as PipelineResponse;
        console.log(data);

        if (data.data && data.data.length > 0) {
          // Skip every 5th pipeline
          const filteredEmpty = data.data.filter(
            (_pipeline, index) => (index + 1) % 5 !== 0
          );
          // Sample each pipeline to a maximum of 3 nodes
          emptyPipelines = filteredEmpty.map((pipeline: Pipeline) =>
            samplePipelineNodes(pipeline.nodes)
          );
        }
      } else {
        const text = await responseEmpty.text();
        console.error(
          `Invalid content type: ${contentType} - Response: ${text}`
        );
      }
    }
  } catch (error) {
    console.error("Error fetching empty pipelines:", error);
  }

  return (
    <CostDataProvider>
      <div className="flex w-full h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Left side - AI Chat (40% width) */}
        <div className="w-[40%] h-full bg-muted/30 border-r overflow-hidden">
          <AiChat />
        </div>

        {/* Right side container (60% width) with padding */}
        <div className="w-[60%] h-full p-2.5 flex flex-col overflow-hidden">
          {/* Top container (50% height) */}
          <div className="h-[50%] bg-muted/20 rounded-lg mb-2.5 overflow-hidden">
            {/* Pass both deployed and empty pipelines to your client component */}
            <MapComponent
              deployedPipelines={deployedPipelines}
              emptyPipelines={emptyPipelines}
            />
          </div>

          {/* Bottom container (50% height) - Scrollable */}
          <div className="h-[50%] bg-muted/20 rounded-lg">
            <ChatOutput />
          </div>
        </div>
      </div>
    </CostDataProvider>
  );
}
