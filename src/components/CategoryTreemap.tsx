/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";

interface CategoryStats {
  category: string;
  revenue: number;
  units: number;
  profit: number;
  topProduct: string;
  sharePercent: number;
}

interface CategoryTreemapProps {
  id: string;
  data: CategoryStats[];
}

export const CategoryTreemap: React.FC<CategoryTreemapProps> = ({ id, data }) => {
  // Sort data largest to smallest
  const sortedData = [...data].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sortedData.reduce((acc, curr) => acc + curr.revenue, 0);

  // Set colors for blocks
  const colors = [
    { bg: "bg-fuchsia-500", text: "text-white", accent: "text-fuchsia-200", border: "border-fuchsia-600" },
    { bg: "bg-cyan-500", text: "text-slate-900", accent: "text-cyan-850", border: "border-cyan-600" },
    { bg: "bg-yellow-500", text: "text-slate-900", accent: "text-amber-950", border: "border-yellow-600" },
    { bg: "bg-emerald-500", text: "text-white", accent: "text-emerald-100", border: "border-emerald-600" },
    { bg: "bg-violet-600", text: "text-white", accent: "text-violet-200", border: "border-violet-700" }
  ];

  return (
    <div id={id} className="w-full space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
            Category Contribution (Treemap)
          </h3>
          <p className="text-xs text-slate-400">
            Proportional revenue contribution by Samsung product line
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 min-h-[350px]">
        {sortedData.map((item, index) => {
          const share = item.revenue / (totalRevenue || 1);
          const percent = share * 100;
          const config = colors[index % colors.length];

          // Determine grid layout sizing based on contribution order
          let gridClass = "md:col-span-3 md:row-span-2"; // 1st Place
          if (index === 1) gridClass = "md:col-span-3 md:row-span-1"; // 2nd Place
          if (index === 2) gridClass = "md:col-span-2 md:row-span-1"; // 3rd Place
          if (index === 3) gridClass = "md:col-span-2 md:row-span-1"; // 4th Place
          if (index === 4) gridClass = "md:col-span-2 md:row-span-1"; // 5th Place

          return (
            <motion.div
              key={item.category}
              whileHover={{ scale: 1.01, zIndex: 10 }}
              transition={{ type: "spring", stiffness: 300, d: 20 }}
              className={`rounded-2xl p-5 ${config.bg} ${config.text} ${gridClass} shadow-md flex flex-col justify-between cursor-pointer transition-all hover:bg-opacity-95 relative overflow-hidden group`}
            >
              {/* Abs grid lines pattern for high fidelity */}
              <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff)] bg-[size:20px_20px] bg-[position:0_0,10px_10px] pointer-events-none" />

              <div className="relative z-10">
                <div className="flex justify-between items-start">
                  <span className="font-heading font-extrabold text-lg tracking-tight uppercase">
                    {item.category}
                  </span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-white/20 uppercase ${config.text}`}>
                    {percent.toFixed(1)}%
                  </span>
                </div>
                <p className={`text-xs font-semibold ${config.accent} mt-1`}>
                  Top Model: {item.topProduct}
                </p>
              </div>

              <div className="relative z-10 mt-8">
                <span className={`text-[10px] uppercase font-bold tracking-wider ${config.accent}`}>
                  Recorded revenue
                </span>
                <div className="text-2xl md:text-3xl font-black tracking-tight leading-none">
                  ${item.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </div>
                
                <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/20 text-xs font-bold">
                  <span>{item.units.toLocaleString()} Units</span>
                  <span>Avg: ${(item.revenue / (item.units || 1)).toFixed(0)}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
