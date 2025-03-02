"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface CostData {
  component: string;
  newDeployment: number;
  existingCanalization: number;
  costReduction: number;
  costReductionPercent: number;
  timeReduction: number;
}

interface Totals {
  newDeployment: number;
  existingCanalization: number;
  costReduction: number;
  costReductionPercent: number;
  timeReduction: number;
}

interface CostComparisonTableProps {
  costData: CostData[];
  totals: Totals;
}

export function CostComparisonTable({
  costData,
  totals,
}: CostComparisonTableProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Cost Comparison Table</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Cost Component</TableHead>
              <TableHead className="text-right">New Deployment (£)</TableHead>
              <TableHead className="text-right">
                Using Existing Canalization (£)
              </TableHead>
              <TableHead className="text-right">Cost Reduction (£)</TableHead>
              <TableHead className="text-right">Cost Reduction (%)</TableHead>
              <TableHead className="text-right">Time Reduction (%)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costData.map((row) => (
              <TableRow key={row.component}>
                <TableCell className="font-medium">{row.component}</TableCell>
                <TableCell className="text-right">
                  {row.newDeployment.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {row.existingCanalization.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {row.costReduction.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {row.costReductionPercent.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  {row.timeReduction}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-semibold">
              <TableCell>Total</TableCell>
              <TableCell className="text-right">
                {totals.newDeployment.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {totals.existingCanalization.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {totals.costReduction.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                {totals.costReductionPercent.toFixed(2)}
              </TableCell>
              <TableCell className="text-right">
                {totals.timeReduction}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
      <p className="text-sm text-muted-foreground italic">
        Note: The above figures are estimated and may vary based on specific
        project conditions.
      </p>
    </div>
  );
}
