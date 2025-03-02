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

  try {
    const response = await fetch(
      "https://1d30-82-211-142-122.ngrok-free.app/api/v1/pipeline/non-empty",
      {
        headers: { "ngrok-skip-browser-warning": "true" },
      }
    );
    console.log(response);

    if (!response.ok) {
      console.error(`HTTP error! status: ${response.status}`);
    } else {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = (await response.json()) as PipelineResponse;
        console.log(data);

        // Even if data.success is false, we still want to process 'data'
        if (data.data && data.data.length > 0) {
          const limitedPipelines = data.data.slice(0, 2);
          deployedPipelines = limitedPipelines.map((pipeline: Pipeline) =>
            pipeline.nodes.map((node: PipelineNode) => ({
              lat: node.latitude,
              lng: node.longitude,
            }))
          );
        }
      } else {
        const text = await response.text();
        console.error(
          `Invalid content type: ${contentType} - Response: ${text}`
        );
      }
    }
  } catch (error) {
    console.error("Error fetching pipelines:", error);
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
            {/* Pass the pipelines to your client component */}
            <MapComponent deployedPipelines={deployedPipelines} />
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
