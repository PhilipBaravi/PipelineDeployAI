"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CostData {
  component: string;
  newDeployment: number;
  existingCanalization: number;
  costReduction: number;
  costReductionPercent: number;
  timeReduction: number;
}

const costData: CostData[] = [
  {
    component: "Materials",
    newDeployment: 50000,
    existingCanalization: 30000,
    costReduction: 20000,
    costReductionPercent: 40,
    timeReduction: 30,
  },
  {
    component: "Labor",
    newDeployment: 70000,
    existingCanalization: 40000,
    costReduction: 30000,
    costReductionPercent: 42.86,
    timeReduction: 30,
  },
  {
    component: "Permitting",
    newDeployment: 10000,
    existingCanalization: 7000,
    costReduction: 3000,
    costReductionPercent: 30,
    timeReduction: 0,
  },
  {
    component: "Excavation and Restoration",
    newDeployment: 100000,
    existingCanalization: 20000,
    costReduction: 80000,
    costReductionPercent: 80,
    timeReduction: 50,
  },
];

// Calculate totals
const totals = costData.reduce(
  (acc, curr) => ({
    newDeployment: acc.newDeployment + curr.newDeployment,
    existingCanalization: acc.existingCanalization + curr.existingCanalization,
    costReduction: acc.costReduction + curr.costReduction,
    costReductionPercent: Number.parseFloat(
      (
        ((acc.newDeployment +
          curr.newDeployment -
          (acc.existingCanalization + curr.existingCanalization)) /
          (acc.newDeployment + curr.newDeployment)) *
        100
      ).toFixed(2)
    ),
    timeReduction: 40, // This is a fixed value as per the image
  }),
  {
    newDeployment: 0,
    existingCanalization: 0,
    costReduction: 0,
    costReductionPercent: 0,
    timeReduction: 0,
  }
);

export function CostComparisonTable() {
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
