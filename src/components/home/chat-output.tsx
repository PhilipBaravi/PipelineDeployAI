import { ScrollArea } from "@/components/ui/scroll-area";
import { CostComparisonTable } from "../chat/cost-comparison-table";

export default function ChatOutput() {
  const mockAnalysis = [
    {
      title: "Total Pipelines Analyzed",
      value: "152",
      description: "AI scanned 152 pipelines in the selected area.",
    },
    {
      title: "Empty Pipelines Available",
      value: "47",
      description: "47 empty pipelines detected, suitable for deployment.",
    },
    {
      title: "Occupied Pipelines",
      value: "105",
      description: "105 pipelines are already in use for various utilities.",
    },
    {
      title: "Potential Cost Savings",
      value: "Up to 65%",
      description:
        "Using existing empty pipelines can reduce deployment costs by up to 65%.",
    },
    {
      title: "Deployment Time Reduction",
      value: "Estimated 70% faster",
      description:
        "Pre-existing canalizations allow much faster network installation.",
    },
    {
      title: "Risk Assessment",
      value: "Low to Moderate",
      description:
        "AI analysis indicates minimal disruption risk in 80% of empty pipelines.",
    },
  ];

  return (
    <ScrollArea className="h-full">
      <CostComparisonTable />
    </ScrollArea>
  );
}
