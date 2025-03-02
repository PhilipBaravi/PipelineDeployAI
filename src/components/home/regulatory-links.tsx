"use client";

import { useCostData } from "@/lib/contexts/CostDataContext";

const RegulatoryLinks = () => {
  const { tableData } = useCostData();
  const regulatoryLinks = tableData?.regulatoryLinks || [];

  return (
    <div className="flex flex-col gap-y-2 pt-4">
      <h1 className="text-md font-bold">Regulatory Links</h1>
      {regulatoryLinks.length >= 3 ? (
        regulatoryLinks.map((el) => (
          <div key={el.id} className="flex gap-x-2 text-sm">
            <p className="text-sm">{el.title}:</p>
            <a href={el.link} className="text-sm underline text-blue-700">
              {el.link}
            </a>
          </div>
        ))
      ) : (
        <div className="p-2 text-sm">
          Insufficient regulatory links available.
        </div>
      )}
    </div>
  );
};

export default RegulatoryLinks;
