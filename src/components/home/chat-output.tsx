"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { CostComparisonTable } from "../chat/cost-comparison-table";
import RegulatoryLinks from "./regulatory-links";
import { useCostData } from "@/lib/contexts/CostDataContext";

export default function ChatOutput() {
  const { tableData } = useCostData();

  return (
    <ScrollArea className="h-full">
      {tableData ? (
        <CostComparisonTable
          costData={tableData.costData}
          totals={tableData.totals}
        />
      ) : (
        <div className="p-4">No cost data available yet.</div>
      )}
      <RegulatoryLinks />
    </ScrollArea>
  );
}
