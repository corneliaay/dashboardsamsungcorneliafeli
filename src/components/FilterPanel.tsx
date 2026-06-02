/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Filter, Calendar, MapPin, Tag, Users, RotateCcw } from "lucide-react";
import { REGIONS, CUSTOMER_TYPES, CATEGORIES } from "../data";

interface FilterState {
  startDate: string;
  endDate: string;
  category: string;
  region: string;
  customerType: string;
}

interface FilterPanelProps {
  id: string;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  minDate: string;
  maxDate: string;
  onClearFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  id,
  filters,
  setFilters,
  minDate,
  maxDate,
  onClearFilters
}) => {
  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  // Pre-configured ranges helpers
  const handleRangeSelect = (months: number) => {
    if (months === -1) {
      setFilters((prev) => ({
        ...prev,
        startDate: minDate,
        endDate: maxDate
      }));
      return;
    }

    const end = new Date(maxDate);
    const start = new Date(end);
    start.setMonth(start.getMonth() - months);
    
    const startStr = start.toISOString().split("T")[0];
    setFilters((prev) => ({
      ...prev,
      startDate: startStr < minDate ? minDate : startStr,
      endDate: maxDate
    }));
  };

  return (
    <div id={id} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-brand-primary" />
          <h2 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wider font-heading">
            Filter Controls
          </h2>
        </div>
        <button
          onClick={onClearFilters}
          className="text-xs text-slate-400 hover:text-brand-primary dark:hover:text-brand-primary font-bold flex items-center gap-1 cursor-pointer transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date Filters column */}
        <div className="space-y-1.5 md:col-span-2">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1 font-heading">
            <Calendar className="w-3.5 h-3.5 text-brand-secondary" />
            <span>Timeline</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={filters.startDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl focus:border-brand-secondary focus:outline-none"
            />
            <span className="text-slate-400 font-bold text-xs">to</span>
            <input
              type="date"
              value={filters.endDate}
              min={minDate}
              max={maxDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl focus:border-brand-secondary focus:outline-none"
            />
          </div>
          
          {/* Quick preset chips */}
          <div className="flex flex-wrap gap-1.5 pt-1.5">
            <button
              onClick={() => handleRangeSelect(3)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-105 dark:bg-slate-800 dark:text-slate-400 hover:bg-brand-secondary/20 hover:text-brand-secondary cursor-pointer transition-all"
            >
              Last 3M
            </button>
            <button
              onClick={() => handleRangeSelect(6)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-105 dark:bg-slate-800 dark:text-slate-400 hover:bg-brand-secondary/20 hover:text-brand-secondary cursor-pointer transition-all"
            >
              Last 6M
            </button>
            <button
              onClick={() => handleRangeSelect(12)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-105 dark:bg-slate-800 dark:text-slate-400 hover:bg-brand-secondary/20 hover:text-brand-secondary cursor-pointer transition-all"
            >
              YTD Range
            </button>
            <button
              onClick={() => handleRangeSelect(-1)}
              className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-105 dark:bg-slate-800 dark:text-slate-400 hover:bg-brand-secondary/20 hover:text-brand-secondary cursor-pointer transition-all"
            >
              All Time
            </button>
          </div>
        </div>

        {/* Product Category dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1 font-heading">
            <Tag className="w-3.5 h-3.5 text-brand-primary" />
            <span>Product Category</span>
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full text-xs font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl focus:border-brand-primary focus:outline-none"
          >
            <option value="All">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Regional Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1 font-heading">
            <MapPin className="w-3.5 h-3.5 text-brand-tertiary" />
            <span>Region</span>
          </label>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="w-full text-xs font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl focus:border-brand-tertiary focus:outline-none"
          >
            <option value="All">All Regions</option>
            {REGIONS.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        {/* Customer Type Segment Filter */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1 font-heading">
            <Users className="w-3.5 h-3.5 text-violet-505" />
            <span>Customer Type</span>
          </label>
          <select
            value={filters.customerType}
            onChange={(e) => handleFilterChange("customerType", e.target.value)}
            className="w-full text-xs font-bold px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 rounded-xl focus:border-indigo-500 focus:outline-none"
          >
            <option value="All">All Segments</option>
            {CUSTOMER_TYPES.map((cust) => (
              <option key={cust} value={cust}>
                {cust}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};
