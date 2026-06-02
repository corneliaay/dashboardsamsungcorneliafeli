/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";

interface CategoryStats {
  category: string;
  revenue: number;
  units: number;
  profit: number;
  topProduct: string;
  sharePercent: number;
}

interface ScorecardProps {
  id: string;
  stats: CategoryStats;
  themeColor: "fuchsia" | "cyan" | "yellow" | "emerald" | "violet";
}

export const Scorecard: React.FC<ScorecardProps> = ({ id, stats, themeColor }) => {
  const colorMap = {
    fuchsia: {
      accent: "text-brand-primary",
      border: "hover:border-brand-primary/40",
      pill: "bg-fuchsia-500/10 text-brand-primary",
      line: "bg-brand-primary",
      icon: "Smartphone" as keyof typeof Icons
    },
    cyan: {
      accent: "text-brand-secondary",
      border: "hover:border-brand-secondary/40",
      pill: "bg-cyan-500/10 text-brand-secondary",
      line: "bg-brand-secondary",
      icon: "Tablet" as keyof typeof Icons
    },
    yellow: {
      accent: "text-brand-tertiary",
      border: "hover:border-brand-tertiary/40",
      pill: "bg-yellow-500/10 text-yellow-600 dark:text-brand-tertiary",
      line: "bg-brand-tertiary",
      icon: "Laptop" as keyof typeof Icons
    },
    emerald: {
      accent: "text-emerald-500",
      border: "hover:border-emerald-500/40",
      pill: "bg-emerald-500/10 text-emerald-500",
      line: "bg-emerald-500",
      icon: "Tv" as keyof typeof Icons
    },
    violet: {
      accent: "text-violet-500",
      border: "hover:border-violet-500/40",
      pill: "bg-violet-500/10 text-violet-500",
      line: "bg-violet-500",
      icon: "Watch" as keyof typeof Icons
    }
  };

  const choice = colorMap[themeColor];
  const Icon = Icons[choice.icon] as React.ComponentType<{ className?: string }>;

  return (
    <motion.div
      id={id}
      whileHover={{ y: -3, scale: 1.01 }}
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-5 shadow-sm transition-all duration-300 ${choice.border} flex flex-col justify-between`}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${choice.pill}`}>
              {Icon && <Icon className="w-5 h-5 stroke-[2]" />}
            </div>
            <h4 className="font-heading font-bold text-slate-800 dark:text-slate-100 text-sm">
              {stats.category}
            </h4>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
            {stats.sharePercent.toFixed(1)}% Share
          </span>
        </div>

        <div className="space-y-4 mt-3">
          <div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Total Sales Revenue</span>
            <div className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
              ${stats.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Units Sold</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {stats.units.toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 block font-medium">Profit margin</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                ${stats.profit.toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-dashed border-slate-100 dark:border-slate-800">
        <span className="text-[10px] text-slate-450 dark:text-slate-500 uppercase font-heading font-semibold block">Top selling model</span>
        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 truncate block">
          {stats.topProduct || "N/A"}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
        <div className={`h-full ${choice.line}`} style={{ width: `${Math.min(100, Math.max(10, stats.sharePercent * 2))}1` }} />
      </div>
    </motion.div>
  );
};
