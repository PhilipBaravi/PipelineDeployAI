"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface CostData {
  component: string;
  newDeployment: number;
  existingCanalization: number;
  costReduction: number;
  costReductionPercent: number;
  timeReduction: number;
}

export interface Totals {
  newDeployment: number;
  existingCanalization: number;
  costReduction: number;
  costReductionPercent: number;
  timeReduction: number;
}

export interface RegulatoryLink {
  id: number;
  title: string;
  link: string;
}

export interface TableData {
  costData: CostData[];
  totals: Totals;
  regulatoryLinks: RegulatoryLink[];
}

interface CostDataContextType {
  tableData: TableData | null;
  setTableData: (data: TableData) => void;
}

const CostDataContext = createContext<CostDataContextType | undefined>(
  undefined
);

export function useCostData() {
  const context = useContext(CostDataContext);
  if (!context) {
    throw new Error("useCostData must be used within a CostDataProvider");
  }
  return context;
}

export function CostDataProvider({ children }: { children: ReactNode }) {
  const [tableData, setTableData] = useState<TableData | null>(null);
  return (
    <CostDataContext.Provider value={{ tableData, setTableData }}>
      {children}
    </CostDataContext.Provider>
  );
}
