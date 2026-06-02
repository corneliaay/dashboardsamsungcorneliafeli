/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from "react";
import { Sun, Moon, Upload, Download, RefreshCw, Layers, FileSpreadsheet } from "lucide-react";
import Papa from "papaparse";
import { SalesRecord } from "../data";

interface HeaderProps {
  activeTab: "sales" | "product";
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  onDataUploaded: (data: SalesRecord[]) => void;
  onResetData: () => void;
  onExportPNG: () => void;
  onExportCSV: () => void;
  totalRecords: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  darkMode,
  setDarkMode,
  onDataUploaded,
  onResetData,
  onExportPNG,
  onExportCSV,
  totalRecords
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pageTitle = activeTab === "sales" ? "Sales Performance Hub" : "Product & Customer Insights";
  const pageSub = activeTab === "sales"
    ? "Interactive dashboard outlining strategic performance targets, regional revenue, and sales vectors"
    : "Granular breakdown of Samsung product categories, top performers, and customer demographics";

  // Parse custom uploaded CSV via PapaParse
  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = results.data as any[];
        // Map and validate fields to fit our CRM database scheme
        const validated: SalesRecord[] = parsed
          .map((row, idx) => {
            const dateVal = row.Date || row.date || new Date().toISOString().split("T")[0];
            const catVal = row.Category || row.category || "Smartphone";
            const prodVal = row.Product || row.product || row["Product Name"] || "Unknown Product";
            const regionVal = row.Region || row.region || "North America";
            const custVal = row.CustomerType || row.customerType || row["Customer Type"] || "Retail";
            const unitsVal = Number(row.Units || row.units || row["Units Sold"] || 1);
            const revVal = Number(row.Revenue || row.revenue || row["Sales"] || 100);
            const profitVal = Number(row.Profit || row.profit || (revVal * 0.35));

            return {
              id: `TX-UP-${idx}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
              date: String(dateVal),
              category: String(catVal),
              product: String(prodVal),
              region: String(regionVal),
              customerType: String(custVal),
              units: isNaN(unitsVal) ? 1 : unitsVal,
              revenue: isNaN(revVal) ? 0 : revVal,
              profit: isNaN(profitVal) ? 0 : profitVal
            };
          })
          .filter((row) => row.revenue > 0);

        if (validated.length > 0) {
          onDataUploaded(validated);
          alert(`Successfully uploaded and parsed ${validated.length} sales entries!`);
        } else {
          alert("Error: No valid sales records could be identified. Ensure your CSV files contain 'Date', 'Category', 'Product', 'Region', 'Units', and 'Revenue' columns.");
        }
      },
      error: (err) => {
        alert(`CSV parse error: ${err.message}`);
      }
    });

    // Reset input value so same file can be uploaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Helper trigger to download standard sample template
  const handleDownloadTemplate = () => {
    const csvContent = "Date,Category,Product,Region,CustomerType,Units,Revenue,Profit\n" +
      "2026-05-15,Smartphone,Galaxy S24 Ultra,North America,Retail,5,6495,2468\n" +
      "2026-05-16,Tablet,Galaxy Tab S9 FE,Europe,Education,12,5388,1347\n" +
      "2026-05-17,Laptop,Galaxy Book4 Ultra,Asia Pacific,Corporate,2,4798,1919\n" +
      "2026-05-18,TV,The Frame TV,Latin America,Retail,1,1499,524\n" +
      "2026-05-19,Accessories,Galaxy Watch Ultra,Middle East & Africa,Developer,20,12980,5192";

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "samsung_crm_sales_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <header className="sticky top-0 z-10 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Page Title details */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-brand-primary" />
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-850 dark:text-slate-50 font-heading tracking-tight">
            {pageTitle}
          </h1>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {totalRecords.toLocaleString()} Records Active
          </span>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-2xl leading-normal">
          {pageSub}
        </p>
      </div>

      {/* Button controls row */}
      <div className="flex flex-wrap items-center gap-2.5">
        
        {/* Reset / Sample action */}
        <button
          onClick={onResetData}
          title="Reset to default simulated dataset"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-brand-primary hover:border-brand-primary/20 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all duration-200"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* Custom file uploader */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleCSVUpload}
          accept=".csv"
          className="hidden"
          id="csv-file-upload-input"
        />
        
        <label
          htmlFor="csv-file-upload-input"
          title="Upload customized CRM sales CSV"
          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-200 hover:text-brand-secondary hover:border-brand-secondary/40 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer transition-all duration-200"
        >
          <Upload className="w-4 h-4 text-brand-secondary" />
          <span>Upload CSV</span>
        </label>

        {/* Download csv template helper */}
        <button
          onClick={handleDownloadTemplate}
          title="Download Samsung Sales CSV Template file"
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-300 hover:text-brand-tertiary hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all"
        >
          <FileSpreadsheet className="w-4 h-4 text-brand-tertiary" />
        </button>

        {/* Export Data to CSV */}
        <button
          onClick={onExportCSV}
          title="Export filtered records to clean CSV file"
          className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-750 flex items-center gap-2 cursor-pointer transition-all"
        >
          <Download className="w-4 h-4 text-emerald-500" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Export Dashboard to PNG */}
        <button
          onClick={onExportPNG}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-primary to-violet-600 hover:from-brand-primary hover:to-violet-700 text-white shadow-md shadow-brand-primary/15 transition-all duration-200 flex items-center gap-2 cursor-pointer"
        >
          <Layers className="w-4 h-4" />
          <span>Capture Dashboard PNG</span>
        </button>

        {/* Dark / Light Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-yellow-500 dark:text-violet-400 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-all"
        >
          {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5 text-slate-500" />}
        </button>
      </div>
    </header>
  );
};
