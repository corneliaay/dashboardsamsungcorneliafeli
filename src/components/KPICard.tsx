/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import * as Icons from "lucide-react";

interface KPICardProps {
  id: string;
  title: string;
  value: string | number;
  iconName: keyof typeof Icons;
  change: {
    value: string;
    isPositive: boolean;
  };
  accentColor: "fuchsia" | "cyan" | "yellow" | "purple";
}

export const KPICard: React.FC<KPICardProps> = ({
  id,
  title,
  value,
  iconName,
  change,
  accentColor
}) => {
  // Map accent to ShopVibe palette colors
  const accentClasses = {
    fuchsia: {
      border: "border-l-4 border-l-brand-primary",
      bg: "bg-fuchsia-500/10 text-brand-primary",
      glow: "hover:shadow-brand-primary/10"
    },
    cyan: {
      border: "border-l-4 border-l-brand-secondary",
      bg: "bg-cyan-500/10 text-brand-secondary",
      glow: "hover:shadow-brand-secondary/10"
    },
    yellow: {
      border: "border-l-4 border-l-brand-tertiary",
      bg: "bg-yellow-500/10 text-brand-tertiary",
      glow: "hover:shadow-brand-tertiary/10"
    },
    purple: {
      border: "border-l-4 border-violet-500",
      bg: "bg-violet-500/10 text-violet-400",
      glow: "hover:shadow-violet-500/10"
    }
  }[accentColor];

  const IconComponent = Icons[iconName] as React.ComponentType<{ className?: string }>;

  return (
    <motion.div
      id={id}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 shadow-sm transition-shadow duration-300 ${accentClasses.border} ${accentClasses.glow} flex justify-between items-center`}
    >
      <div className="space-y-2">
        <span className="text-xs font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase font-heading">
          {title}
        </span>
        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-850 dark:text-slate-100 font-heading tracking-tight">
          {value}
        </h3>
        
        <div className="flex items-center gap-1.5 pt-1">
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              change.isPositive
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            }`}
          >
            {change.isPositive ? "+" : ""}
            {change.value}
          </span>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            vs prev range
          </span>
        </div>
      </div>

      <div className={`p-4 rounded-xl ${accentClasses.bg}`}>
        {IconComponent && <IconComponent className="w-6 h-6 stroke-[2]" />}
      </div>
    </motion.div>
  );
};
