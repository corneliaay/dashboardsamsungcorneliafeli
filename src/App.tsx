/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect, useRef } from "react";
import { Chart, registerables, ChartConfiguration } from "chart.js";
import {
  Menu,
  TrendingUp,
  Coins,
  ShoppingBag,
  DollarSign,
  Briefcase,
  Layers,
  MapPin,
  Users,
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Watch,
  Download,
  Award,
  BookOpen
} from "lucide-react";
import { motion } from "motion/react";

// Register Chart.js components
Chart.register(...registerables);

// Import Custom components
import { generateMockSalesData, SalesRecord, REGIONS, CUSTOMER_TYPES, CATEGORIES, PRODUCT_BASE_VALUES } from "./data";
import { KPICard } from "./components/KPICard";
import { Scorecard } from "./components/Scorecard";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { FilterPanel } from "./components/FilterPanel";
import { CategoryTreemap } from "./components/CategoryTreemap";

export default function App() {
  // Application Data States
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"sales" | "product">("sales");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Filter States
  const [filters, setFilters] = useState({
    startDate: "2025-01-01",
    endDate: "2026-05-25",
    category: "All",
    region: "All",
    customerType: "All"
  });

  // Dark Mode Style States
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("samsung_crm_dark_theme");
    return saved ? saved === "true" : true; // Default to eye-pleasing slate-darkmode
  });

  // Chart References to prevent leaks and canvas reuse crashes
  const activeChartsRef = useRef<Record<string, Chart>>({});

  // Canvas Refs
  const lTrendRef = useRef<HTMLCanvasElement>(null);
  const dualAxisRef = useRef<HTMLCanvasElement>(null);
  const regionBarRef = useRef<HTMLCanvasElement>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);

  const topProductsRef = useRef<HTMLCanvasElement>(null);
  const customerPieRef = useRef<HTMLCanvasElement>(null);
  const growthBubbleRef = useRef<HTMLCanvasElement>(null);

  // Initialize simulated dataset on boot
  useEffect(() => {
    const simulationData = generateMockSalesData();
    setSalesRecords(simulationData);

    // Dynamic initial timeline min/max dates
    if (simulationData.length > 0) {
      const dates = simulationData.map(r => r.date);
      const minD = dates[0];
      const maxD = dates[dates.length - 1];
      setFilters(prev => ({
        ...prev,
        startDate: minD,
        endDate: maxD
      }));
    }
  }, []);

  // Sync theme with document DOM root
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("samsung_crm_dark_theme", String(darkMode));
  }, [darkMode]);

  // Limits of dates based on raw sales data
  const dateRangeLimits = useMemo(() => {
    if (salesRecords.length === 0) return { min: "2025-01-01", max: "2026-05-25" };
    const sorted = [...salesRecords].sort((a, b) => a.date.localeCompare(b.date));
    return {
      min: sorted[0].date,
      max: sorted[sorted.length - 1].date
    };
  }, [salesRecords]);

  // Clear or reset all filters to All Time boundary
  const handleClearFilters = () => {
    setFilters({
      startDate: dateRangeLimits.min,
      endDate: dateRangeLimits.max,
      category: "All",
      region: "All",
      customerType: "All"
    });
  };

  // Re-generate database mock state
  const handleResetData = () => {
    const fresh = generateMockSalesData();
    setSalesRecords(fresh);
    if (fresh.length > 0) {
      setFilters({
        startDate: fresh[0].date,
        endDate: fresh[fresh.length - 1].date,
        category: "All",
        region: "All",
        customerType: "All"
      });
    }
    alert("Re-initialized Samsung CRM mock database with fresh seasonal simulated records!");
  };

  // Callback when user parses corporate CSV via PapaParse
  const handleDataUploaded = (newRecords: SalesRecord[]) => {
    setSalesRecords(newRecords);
    if (newRecords.length > 0) {
      const dates = newRecords.map(r => r.date).sort();
      setFilters({
        startDate: dates[0],
        endDate: dates[dates.length - 1],
        category: "All",
        region: "All",
        customerType: "All"
      });
    }
  };

  // --- Dynamic Filtering Logic ---
  const filteredData = useMemo(() => {
    return salesRecords.filter((record) => {
      const matchesDate = record.date >= filters.startDate && record.date <= filters.endDate;
      const matchesCategory = filters.category === "All" || record.category === filters.category;
      const matchesRegion = filters.region === "All" || record.region === filters.region;
      const matchesCustomer = filters.customerType === "All" || record.customerType === filters.customerType;
      return matchesDate && matchesCategory && matchesRegion && matchesCustomer;
    });
  }, [salesRecords, filters]);

  // Compare performance with matched prior period (prior timeframe of identical size)
  const previousPeriodData = useMemo(() => {
    const startObj = new Date(filters.startDate);
    const endObj = new Date(filters.endDate);
    const durationDays = Math.ceil((endObj.getTime() - startObj.getTime()) / (1000 * 3600 * 24));
    
    // prior start is start - duration, prior end is start - 1 day
    const prevStart = new Date(startObj);
    prevStart.setDate(startObj.getDate() - durationDays);
    const prevEnd = new Date(startObj);
    prevEnd.setDate(startObj.getDate() - 1);

    const prevStartStr = prevStart.toISOString().split("T")[0];
    const prevEndStr = prevEnd.toISOString().split("T")[0];

    return salesRecords.filter((record) => {
      const matchesDate = record.date >= prevStartStr && record.date <= prevEndStr;
      const matchesCategory = filters.category === "All" || record.category === filters.category;
      const matchesRegion = filters.region === "All" || record.region === filters.region;
      const matchesCustomer = filters.customerType === "All" || record.customerType === filters.customerType;
      return matchesDate && matchesCategory && matchesRegion && matchesCustomer;
    });
  }, [salesRecords, filters]);

  // --- Compute Primary KPIs ---
  const currentKPIs = useMemo(() => {
    const revenue = filteredData.reduce((acc, r) => acc + r.revenue, 0);
    const orders = filteredData.length;
    const units = filteredData.reduce((acc, r) => acc + r.units, 0);
    const aov = orders > 0 ? revenue / orders : 0;
    const profit = filteredData.reduce((acc, r) => acc + r.profit, 0);
    return { revenue, orders, units, aov, profit };
  }, [filteredData]);

  const prevKPIs = useMemo(() => {
    const revenue = previousPeriodData.reduce((acc, r) => acc + r.revenue, 0);
    const orders = previousPeriodData.length;
    const units = previousPeriodData.reduce((acc, r) => acc + r.units, 0);
    const aov = orders > 0 ? revenue / orders : 0;
    const profit = previousPeriodData.reduce((acc, r) => acc + r.profit, 0);
    return { revenue, orders, units, aov, profit };
  }, [previousPeriodData]);

  // KPI Growth percentage comparisons
  const growthMetrics = useMemo(() => {
    const calcPct = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return ((curr - prev) / prev) * 100;
    };
    return {
      revenue: calcPct(currentKPIs.revenue, prevKPIs.revenue),
      orders: calcPct(currentKPIs.orders, prevKPIs.orders),
      units: calcPct(currentKPIs.units, prevKPIs.units),
      aov: calcPct(currentKPIs.aov, prevKPIs.aov)
    };
  }, [currentKPIs, prevKPIs]);

  // --- Category Scorecards aggregations ---
  const categoryScorecardsList = useMemo(() => {
    const totalRev = currentKPIs.revenue || 1;
    
    return CATEGORIES.map((cat, index) => {
      const catRecords = filteredData.filter(r => r.category === cat);
      const catRevenue = catRecords.reduce((acc, r) => acc + r.revenue, 0);
      const catUnits = catRecords.reduce((acc, r) => acc + r.units, 0);
      const catProfit = catRecords.reduce((acc, r) => acc + r.profit, 0);

      // Find top selling model
      const modelMap: Record<string, number> = {};
      catRecords.forEach(r => {
        modelMap[r.product] = (modelMap[r.product] || 0) + r.revenue;
      });
      let topProduct = "N/A";
      let topRevenue = 0;
      Object.entries(modelMap).forEach(([model, rev]) => {
        if (rev > topRevenue) {
          topProduct = model;
          topRevenue = rev;
        }
      });

      return {
        category: cat,
        revenue: catRevenue,
        units: catUnits,
        profit: catProfit,
        topProduct,
        sharePercent: (catRevenue / totalRev) * 100
      };
    });
  }, [filteredData, currentKPIs]);


  // Helper styles for charts
  const chartStyles = useMemo(() => {
    const isDark = darkMode;
    return {
      gridColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(15, 23, 42, 0.05)",
      textColor: isDark ? "#94A3B8" : "#475569",
      tooltipBg: isDark ? "#0F172A" : "#FFFFFF",
      tooltipText: isDark ? "#E2E8F0" : "#1E293B",
      tooltipBorder: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.08)"
    };
  }, [darkMode]);


  // --- Render Charts Effect ---
  useEffect(() => {
    // ------------------------------------
    // SALES PERFORMANCE DASHBOARD CHARTS
    // ------------------------------------
    if (activeTab === "sales") {
      // 1. Monthly Revenue Trend
      const renderTrendChart = () => {
        if (!lTrendRef.current) return;

        // Group records by Month YYYY-MM
        const monthlyData: Record<string, number> = {};
        filteredData.forEach(r => {
          const monthKey = r.date.substring(0, 7); // "YYYY-MM"
          monthlyData[monthKey] = (monthlyData[monthKey] || 0) + r.revenue;
        });

        // Sort months chronologically
        const sortedMonths = Object.keys(monthlyData).sort();
        const revenues = sortedMonths.map(m => monthlyData[m]);
        const prettyLabels = sortedMonths.map(m => {
          const [yr, mn] = m.split("-");
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return `${monthNames[parseInt(mn) - 1]} ${yr.substring(2)}`;
        });

        const ctx = lTrendRef.current.getContext("2d");
        if (!ctx) return;

        // Gradient build for fuchsiaglow
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, "rgba(219, 70, 239, 0.35)");
        gradient.addColorStop(1, "rgba(219, 70, 239, 0.0)");

        if (activeChartsRef.current["trend"]) {
          activeChartsRef.current["trend"].destroy();
        }

        activeChartsRef.current["trend"] = new Chart(ctx, {
          type: "line",
          data: {
            labels: prettyLabels,
            datasets: [
              {
                label: "Monthly Sales Revenue",
                data: revenues,
                borderColor: "#D946EF",
                borderWidth: 3.5,
                backgroundColor: gradient,
                fill: true,
                tension: 0.35,
                pointBackgroundColor: "#D946EF",
                pointBorderColor: "#FFFFFF",
                pointHoverRadius: 6,
                pointRadius: 4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: chartStyles.tooltipBg,
                titleColor: "#D946EF",
                bodyColor: chartStyles.tooltipText,
                borderColor: chartStyles.tooltipBorder,
                borderWidth: 1,
                cornerRadius: 8,
                padding: 11
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: chartStyles.textColor, font: { family: "Nunito" } }
              },
              y: {
                grid: { color: chartStyles.gridColor },
                ticks: {
                  color: chartStyles.textColor,
                  font: { family: "Nunito" },
                  callback: (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                }
              }
            }
          }
        });
      };

      // 2. Revenue vs Profit Analysis (Dual Axis)
      const renderDualAxisChart = () => {
        if (!dualAxisRef.current) return;

        // Group by month
        const monthlyRev: Record<string, number> = {};
        const monthlyProf: Record<string, number> = {};
        
        filteredData.forEach(r => {
          const monthKey = r.date.substring(0, 7);
          monthlyRev[monthKey] = (monthlyRev[monthKey] || 0) + r.revenue;
          monthlyProf[monthKey] = (monthlyProf[monthKey] || 0) + r.profit;
        });

        const sortedMonths = Object.keys(monthlyRev).sort();
        const revenues = sortedMonths.map(m => monthlyRev[m]);
        const profits = sortedMonths.map(m => monthlyProf[m]);
        const prettyLabels = sortedMonths.map(m => {
          const [, mn] = m.split("-");
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return monthNames[parseInt(mn) - 1];
        });

        const ctx = dualAxisRef.current.getContext("2d");
        if (!ctx) return;

        if (activeChartsRef.current["dualAxis"]) {
          activeChartsRef.current["dualAxis"].destroy();
        }

        activeChartsRef.current["dualAxis"] = new Chart(ctx, {
          type: "bar",
          data: {
            labels: prettyLabels,
            datasets: [
              {
                type: "bar",
                label: "Aggregate Sales",
                data: revenues,
                backgroundColor: "rgba(168, 85, 247, 0.75)",
                borderColor: "#A855F7",
                borderWidth: 1.5,
                borderRadius: 8,
                yAxisID: "y"
              },
              {
                type: "line",
                label: "Net Profit Margin",
                data: profits,
                borderColor: "#22D3EE",
                borderWidth: 3,
                backgroundColor: "rgba(34, 211, 238, 0.1)",
                tension: 0.3,
                fill: false,
                yAxisID: "y1",
                pointBackgroundColor: "#22D3EE",
                pointHoverRadius: 6,
                pointRadius: 3
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: chartStyles.textColor, font: { family: "Nunito", size: 11 } }
              },
              tooltip: {
                backgroundColor: chartStyles.tooltipBg,
                titleColor: "#A855F7",
                bodyColor: chartStyles.tooltipText,
                borderColor: chartStyles.tooltipBorder,
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: chartStyles.textColor, font: { family: "Nunito" } }
              },
              y: {
                type: "linear",
                position: "left",
                grid: { color: chartStyles.gridColor },
                ticks: {
                  color: chartStyles.textColor,
                  callback: (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                }
              },
              y1: {
                type: "linear",
                position: "right",
                grid: { drawOnChartArea: false }, // avoid grid double overlay
                ticks: {
                  color: "#22D3EE",
                  callback: (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                }
              }
            }
          }
        });
      };

      // 3. Sales by Region
      const renderRegionChart = () => {
        if (!regionBarRef.current) return;

        // Group by Region
        const regionalRevenue: Record<string, number> = {};
        REGIONS.forEach(reg => {
          regionalRevenue[reg] = 0;
        });
        filteredData.forEach(r => {
          if (REGIONS.includes(r.region)) {
            regionalRevenue[r.region] += r.revenue;
          }
        });

        const ctx = regionBarRef.current.getContext("2d");
        if (!ctx) return;

        if (activeChartsRef.current["region"]) {
          activeChartsRef.current["region"].destroy();
        }

        activeChartsRef.current["region"] = new Chart(ctx, {
          type: "bar",
          data: {
            labels: REGIONS,
            datasets: [
              {
                label: "Revenue",
                data: REGIONS.map(reg => regionalRevenue[reg]),
                backgroundColor: [
                  "rgba(217, 70, 239, 0.8)", // fuchsia
                  "rgba(34, 211, 238, 0.8)",  // cyan
                  "rgba(250, 204, 21, 0.8)",  // yellow
                  "rgba(16, 185, 129, 0.8)",  // emerald
                  "rgba(139, 92, 246, 0.8)"  // violet
                ],
                borderColor: [
                  "#D946EF",
                  "#22D3EE",
                  "#FACC15",
                  "#10B981",
                  "#8B5CF6"
                ],
                borderWidth: 1.5,
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "x",
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: chartStyles.tooltipBg,
                bodyColor: chartStyles.tooltipText,
                borderColor: chartStyles.tooltipBorder,
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10
              }
            },
            scales: {
              x: {
                grid: { display: false },
                ticks: { color: chartStyles.textColor, font: { family: "Nunito", size: 10 } }
              },
              y: {
                grid: { color: chartStyles.gridColor },
                ticks: {
                  color: chartStyles.textColor,
                  callback: (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                }
              }
            }
          }
        });
      };

      // 4. Revenue Contribution by Category (Donut)
      const renderDonutChart = () => {
        if (!donutRef.current) return;

        const categoryData = CATEGORIES.map(cat => {
          return filteredData
            .filter(r => r.category === cat)
            .reduce((acc, r) => acc + r.revenue, 0);
        });

        const ctx = donutRef.current.getContext("2d");
        if (!ctx) return;

        if (activeChartsRef.current["donut"]) {
          activeChartsRef.current["donut"].destroy();
        }

        activeChartsRef.current["donut"] = new Chart(ctx, {
          type: "doughnut",
          data: {
            labels: CATEGORIES.map(c => c),
            datasets: [
              {
                data: categoryData,
                backgroundColor: [
                  "#D946EF", // Smartphone fuchsia
                  "#22D3EE", // Tablet cyan
                  "#FACC15", // Laptop yellow
                  "#10B981", // TV emerald
                  "#8B5CF6"  // Accessories violet
                ],
                borderWidth: darkMode ? 2 : 1,
                borderColor: darkMode ? "#0F172A" : "#FFFFFF"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "right",
                labels: {
                  color: chartStyles.textColor,
                  font: { family: "Nunito", size: 11 },
                  padding: 12
                }
              },
              tooltip: {
                backgroundColor: chartStyles.tooltipBg,
                bodyColor: chartStyles.tooltipText,
                borderColor: chartStyles.tooltipBorder,
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10,
                callbacks: {
                  label: (context) => {
                    const val = Number(context.raw);
                    const sum = categoryData.reduce((a, b) => a + b, 0);
                    const pct = ((val / (sum || 1)) * 100).toFixed(1);
                    return `Revenue: $${val.toLocaleString()} (${pct}%)`;
                  }
                }
              }
            },
            cutout: "68%"
          }
        });
      };

      renderTrendChart();
      renderDualAxisChart();
      renderRegionChart();
      renderDonutChart();
    }

    // ------------------------------------
    // PRODUCT & CUSTOMER DASHBOARD CHARTS
    // ------------------------------------
    if (activeTab === "product") {
      // 1. Top Selling Products (Horizontal Bar Chart)
      const renderTopProducts = () => {
        if (!topProductsRef.current) return;

        // Group by product name
        const productScale: Record<string, { revenue: number; units: number }> = {};
        filteredData.forEach(r => {
          if (!productScale[r.product]) {
            productScale[r.product] = { revenue: 0, units: 0 };
          }
          productScale[r.product].revenue += r.revenue;
          productScale[r.product].units += r.units;
        });

        // Get Top 8 products descending by sales size
        const sortedProducts = Object.entries(productScale)
          .sort((a, b) => b[1].revenue - a[1].revenue)
          .slice(0, 8);

        const labels = sortedProducts.map(([name]) => name);
        const values = sortedProducts.map(([, stats]) => stats.revenue);

        const ctx = topProductsRef.current.getContext("2d");
        if (!ctx) return;

        if (activeChartsRef.current["topProducts"]) {
          activeChartsRef.current["topProducts"].destroy();
        }

        activeChartsRef.current["topProducts"] = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "Aggregate Sales ($)",
                data: values,
                backgroundColor: "rgba(34, 211, 238, 0.8)", // Neon Cyan
                borderColor: "#22D3EE",
                borderWidth: 1.5,
                borderRadius: 8
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: "y", // Horizontal
            plugins: {
              legend: { display: false },
              tooltip: {
                backgroundColor: chartStyles.tooltipBg,
                bodyColor: chartStyles.tooltipText,
                borderColor: chartStyles.tooltipBorder,
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10
              }
            },
            scales: {
              x: {
                grid: { color: chartStyles.gridColor },
                ticks: {
                  color: chartStyles.textColor,
                  callback: (value) => `$${Number(value).toLocaleString(undefined, { maximumFractionDigits: 0 })}`
                }
              },
              y: {
                grid: { display: false },
                ticks: { color: chartStyles.textColor, font: { family: "Nunito", size: 10 } }
              }
            }
          }
        });
      };

      // 2. Customer Segment Distribution (Pie Chart)
      const renderCustomerPie = () => {
        if (!customerPieRef.current) return;

        const segmentedRevenue = CUSTOMER_TYPES.map(cust => {
          return filteredData
            .filter(r => r.customerType === cust)
            .reduce((acc, r) => acc + r.revenue, 0);
        });

        const ctx = customerPieRef.current.getContext("2d");
        if (!ctx) return;

        if (activeChartsRef.current["customerPie"]) {
          activeChartsRef.current["customerPie"].destroy();
        }

        activeChartsRef.current["customerPie"] = new Chart(ctx, {
          type: "pie",
          data: {
            labels: CUSTOMER_TYPES,
            datasets: [
              {
                data: segmentedRevenue,
                backgroundColor: [
                  "#D946EF", // Retail
                  "#22D3EE", // Corporate
                  "#FACC15", // Education
                  "#8B5CF6"  // Developer
                ],
                borderWidth: darkMode ? 2 : 1,
                borderColor: darkMode ? "#0F172A" : "#FFFFFF"
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: "bottom",
                labels: { color: chartStyles.textColor, font: { family: "Nunito", size: 11 } }
              },
              tooltip: {
                backgroundColor: chartStyles.tooltipBg,
                bodyColor: chartStyles.tooltipText,
                borderColor: chartStyles.tooltipBorder,
                borderWidth: 1,
                cornerRadius: 8,
                padding: 10,
                callbacks: {
                  label: (con) => {
                    const val = Number(con.raw);
                    const sum = segmentedRevenue.reduce((a, b) => a + b, 0);
                    return `Revenue: $${val.toLocaleString()} (${((val / (sum || 1)) * 100).toFixed(1)}%)`;
                  }
                }
              }
            }
          }
        });
      };

      // 3. Product Growth Matrix (Bubble Chart)
      const renderGrowthBubble = () => {
        if (!growthBubbleRef.current) return;

        // Group fields per individual device
        const productStats: Record<string, { revenue: number; units: number; profit: number; cat: string }> = {};
        filteredData.forEach(r => {
          if (!productStats[r.product]) {
            productStats[r.product] = { revenue: 0, units: 0, profit: 0, cat: r.category };
          }
          productStats[r.product].revenue += r.revenue;
          productStats[r.product].units += r.units;
          productStats[r.product].profit += r.profit;
        });

        // Format into bubble points
        // X-axis: total units sold (volume of product interest)
        // Y-axis: profit margin % = (profit / revenue) * 100
        // Bubble size (radius): Sales revenue scaled
        const categoryColorMap: Record<string, string> = {
          Smartphone: "#D946EF",
          Tablet: "#22D3EE",
          Laptop: "#FACC15",
          TV: "#10B981",
          Accessories: "#8B5CF6"
        };

        const bubbleDatasets = Object.entries(productStats).map(([name, stat]) => {
          const marginPercent = stat.revenue > 0 ? (stat.profit / stat.revenue) * 100 : 0;
          // Scale size between 5 and 25
          const maxRev = Math.max(...Object.values(productStats).map(s => s.revenue)) || 1;
          const radius = 5 + (stat.revenue / maxRev) * 20;

          return {
            label: name,
            data: [
              {
                x: stat.units,
                y: parseFloat(marginPercent.toFixed(1)),
                r: radius
              }
            ],
            backgroundColor: categoryColorMap[stat.cat] || "#22D3EE",
            borderColor: darkMode ? "#1E293B" : "#FFFFFF",
            borderWidth: 1.5,
            hoverRadius: radius + 2
          };
        });

        const ctx = growthBubbleRef.current.getContext("2d");
        if (!ctx) return;

        if (activeChartsRef.current["growthBubble"]) {
          activeChartsRef.current["growthBubble"].destroy();
        }

        activeChartsRef.current["growthBubble"] = new Chart(ctx, {
          type: "bubble",
          data: {
            datasets: bubbleDatasets
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: "top",
                labels: {
                  boxWidth: 12,
                  color: chartStyles.textColor,
                  font: { family: "Nunito", size: 10 },
                  // Filter out label matches to group legends by colors representing Category
                  filter: (item, chartData) => {
                    // Let's only display categories instead of every raw device name inside the bubble legend
                    const index = chartData.datasets.findIndex(d => d.label === item.text);
                    const names = ["Galaxy S24 Ultra", "Galaxy Tab S9 Ultra", "Galaxy Book4 Pro", "Neo QLED 8K TV", "Galaxy Watch Ultra"];
                    return names.includes(item.text);
                  }
                }
              },
              tooltip: {
                backgroundColor: chartStyles.tooltipBg,
                borderColor: chartStyles.tooltipBorder,
                borderWidth: 1,
                cornerRadius: 8,
                padding: 11,
                callbacks: {
                  title: (context) => context[0].dataset.label || "Product Info",
                  label: (context: any) => {
                    const pt = context.raw;
                    return `Volume: ${pt.x} Units | Margin: ${pt.y}% | Radius size: ${pt.r.toFixed(0)}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: "Sales Volume (Units Sold Index)",
                  color: chartStyles.textColor,
                  font: { family: "Poppins", size: 11 }
                },
                grid: { color: chartStyles.gridColor },
                ticks: { color: chartStyles.textColor }
              },
              y: {
                title: {
                  display: true,
                  text: "Operating profit Margin (%)",
                  color: chartStyles.textColor,
                  font: { family: "Poppins", size: 11 }
                },
                grid: { color: chartStyles.gridColor },
                ticks: {
                  color: chartStyles.textColor,
                  callback: (v) => `${v}%`
                }
              }
            }
          }
        });
      };

      renderTopProducts();
      renderCustomerPie();
      renderGrowthBubble();
    }
  }, [filteredData, activeTab, chartStyles, darkMode]);


  // Clean up chart references on unmount to safeguard memory
  useEffect(() => {
    return () => {
      Object.values(activeChartsRef.current).forEach(c => {
        if (c && typeof (c as any).destroy === "function") {
          (c as any).destroy();
        }
      });
    };
  }, []);

  // --- Export Filtered Database to CSV format file ---
  const handleExportCSV = () => {
    if (filteredData.length === 0) {
      alert("No records identified with current filters. Please broaden dates or clear categories!");
      return;
    }

    // Build standard CSV string safely
    const headers = ["Order ID", "Date", "Category", "Product", "Region", "Customer Segment", "Units Sold", "Total Revenue ($)", "Net ProfitMargin ($)"];
    const rows = filteredData.map(r => [
      r.id,
      r.date,
      r.category,
      r.product,
      `"${r.region}"`,
      r.customerType,
      r.units,
      r.revenue,
      r.profit
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `samsung_sales_crm_filtered_${filters.startDate}_to_${filters.endDate}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // --- Dynamic PNG Export Capture ---
  const handleExportPNG = () => {
    // We can extract current active configurations or inform executive summary download
    // Let's capture the main active charts, convert to dataURLs, combine onto a dynamic temporary canvas, and trigger download!
    try {
      const activeCanvases = activeTab === "sales" 
        ? [
            { el: lTrendRef.current, title: "Monthly Revenue Trend" },
            { el: dualAxisRef.current, title: "Revenue vs Profit Analysis" },
            { el: regionBarRef.current, title: "Regional Share" },
            { el: donutRef.current, title: "Category Split" }
          ]
        : [
            { el: topProductsRef.current, title: "Top Selling Electronics" },
            { el: customerPieRef.current, title: "Customer Segments" },
            { el: growthBubbleRef.current, title: "Growth Bubble Matrix" }
          ];

      // Filter out any null canvas refs
      const validCanvases = activeCanvases.filter(item => item.el !== null);

      if (validCanvases.length === 0) {
        alert("Unable to locate rendered chart elements for PNG export report.");
        return;
      }

      // Create high quality combined canvas
      const compileCanvas = document.createElement("canvas");
      const ctx = compileCanvas.getContext("2d");
      if (!ctx) return;

      // Draw executive report header details
      compileCanvas.width = 1200;
      compileCanvas.height = 800;

      // Layout styling (ShopVibe and Slate palette theme matching)
      ctx.fillStyle = darkMode ? "#0F172A" : "#FFFFFF";
      ctx.fillRect(0, 0, 1200, 800);

      // Draw brand logo circle
      ctx.fillStyle = "#D946EF";
      ctx.beginPath();
      ctx.arc(60, 60, 24, 0, Math.PI * 2);
      ctx.fill();

      // Logo Letter "S"
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 26px Poppins, sans-serif";
      ctx.fillText("S", 51, 69);

      // Title header
      ctx.fillStyle = darkMode ? "#F8FAFC" : "#0F172A";
      ctx.font = "bold 24px Poppins, sans-serif";
      ctx.fillText("SAMSUNG CRM EXECUTIVE REPORT", 100, 55);

      // Date status
      ctx.fillStyle = "#22D3EE";
      ctx.font = "bold 12px Nunito, sans-serif";
      ctx.fillText(`TIMEFRAME: ${filters.startDate} TO ${filters.endDate} | EXPORTED UTC: ${new Date().toISOString()}`, 100, 75);

      // Horizontal separator line
      ctx.strokeStyle = darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(15, 23, 42, 0.08)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(30, 95);
      ctx.lineTo(1170, 95);
      ctx.stroke();

      // Draw mini textual metadata stats
      ctx.fillStyle = darkMode ? "#94A3B8" : "#475569";
      ctx.font = "bold 13px Poppins, sans-serif";
      ctx.fillText(`Active Records Count: ${filteredData.length}`, 35, 125);
      ctx.fillText(`Revenue Sum: $${currentKPIs.revenue.toLocaleString()}`, 35, 145);
      ctx.fillText(`Units Index: ${currentKPIs.units.toLocaleString()} devices`, 35, 165);
      ctx.fillText(`Avg Value (AOV): $${currentKPIs.aov.toLocaleString(undefined, { maximumFractionDigits: 1 })}`, 35, 185);

      // Grid coordinate locations for the charts
      // Quadrants layout
      const layoutCoords = [
        { x: 300, y: 150, w: 420, h: 280 },
        { x: 740, y: 150, w: 420, h: 280 },
        { x: 300, y: 470, w: 420, h: 280 },
        { x: 740, y: 470, w: 420, h: 280 }
      ];

      // Draw each active chart onto quadrants
      validCanvases.forEach((item, idx) => {
        const coord = layoutCoords[idx % layoutCoords.length];
        if (item.el) {
          // Draw a small background card layout for each canvas
          ctx.fillStyle = darkMode ? "#1E293B" : "#F8FAFC";
          ctx.beginPath();
          ctx.roundRect ? ctx.roundRect(coord.x - 10, coord.y - 30, coord.w + 20, coord.h + 45, 12) : ctx.rect(coord.x - 10, coord.y - 30, coord.w + 20, coord.h + 45);
          ctx.fill();

          ctx.strokeStyle = darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
          ctx.stroke();

          // Title of Sub Chart
          ctx.fillStyle = darkMode ? "#F1F5F9" : "#1E293B";
          ctx.font = "bold 11px Poppins, sans-serif";
          ctx.fillText(item.title.toUpperCase(), coord.x, coord.y - 12);

          // Render canvas content
          ctx.drawImage(item.el, coord.x, coord.y, coord.w, coord.h);
        }
      });

      // Signature watermark
      ctx.fillStyle = "#A855F7";
      ctx.font = "italic 11px Nunito, sans-serif";
      ctx.fillText("Executive insights compiled natively via ShopVibe CRM Client", 35, 770);

      // Trigger automatic file download
      const reportUri = compileCanvas.toDataURL("image/png");
      const trigger = document.createElement("a");
      trigger.setAttribute("href", reportUri);
      trigger.setAttribute("download", `samsung_executive_report_${activeTab}_${filters.startDate}.png`);
      document.body.appendChild(trigger);
      trigger.click();
      document.body.removeChild(trigger);
    } catch (e: any) {
      alert(`Export to high-resolution PNG failed: ${e.message}. Note: Export quality might be limited by canvas sizes. Use browser Print option as fallback.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-sans transition-colors duration-300 md:pl-64">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      {/* Sticky Premium Header */}
      <Header
        activeTab={activeTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onDataUploaded={handleDataUploaded}
        onResetData={handleResetData}
        onExportPNG={handleExportPNG}
        onExportCSV={handleExportCSV}
        totalRecords={filteredData.length}
      />

      {/* Main Container Workspace */}
      <main className="p-6 space-y-6 max-w-[1600px] mx-auto pb-16">
        
        {/* Mobile menu toggle banner */}
        <div className="flex md:hidden items-center justify-between bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-3.5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2">
            <span className="font-heading font-black tracking-tight text-brand-primary">SAMSUNG</span>
            <span className="text-[10px] font-black px-1 py-0.5 bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400 rounded">CRM</span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
        </div>

        {/* Dashboard Dynamic Filter Panel */}
        <FilterPanel
          id="crm-filter-panel"
          filters={filters}
          setFilters={setFilters}
          minDate={dateRangeLimits.min}
          maxDate={dateRangeLimits.max}
          onClearFilters={handleClearFilters}
        />

        {/* ------------------------------------
            TAB 1: SALES PERFORMANCE VIEW
            ------------------------------------ */}
        {activeTab === "sales" && (
          <div className="space-y-6">
            
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard
                id="kpi-revenue"
                title="Aggregate Revenue"
                value={`$${currentKPIs.revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`}
                iconName="DollarSign"
                change={{
                  value: `${growthMetrics.revenue.toFixed(1)}%`,
                  isPositive: growthMetrics.revenue >= 0
                }}
                accentColor="fuchsia"
              />
              <KPICard
                id="kpi-orders"
                title="Consolidated Orders"
                value={currentKPIs.orders.toLocaleString()}
                iconName="ShoppingBag"
                change={{
                  value: `${growthMetrics.orders.toFixed(1)}%`,
                  isPositive: growthMetrics.orders >= 0
                }}
                accentColor="cyan"
              />
              <KPICard
                id="kpi-units"
                title="Total Shipped Units"
                value={currentKPIs.units.toLocaleString()}
                iconName="TrendingUp"
                change={{
                  value: `${growthMetrics.units.toFixed(1)}%`,
                  isPositive: growthMetrics.units >= 0
                }}
                accentColor="yellow"
              />
              <KPICard
                id="kpi-aov"
                title="Average Order Value"
                value={`$${currentKPIs.aov.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}`}
                iconName="Coins"
                change={{
                  value: `${growthMetrics.aov.toFixed(1)}%`,
                  isPositive: growthMetrics.aov >= 0
                }}
                accentColor="purple"
              />
            </div>

            {/* Dashboard Primary Charts Grid Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Monthly Revenue Trend */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
                    Monthly Revenue Trend
                  </h3>
                  <p className="text-xs text-slate-400">
                    Gross monthly revenue timeline spanning range
                  </p>
                </div>
                <div className="relative h-[300px]">
                  <canvas ref={lTrendRef} />
                </div>
              </div>

              {/* Revenue vs Profit (Dual Axis) */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
                    Revenue vs Profit Analysis
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sustained gross profit compared alongside sales volume
                  </p>
                </div>
                <div className="relative h-[300px]">
                  <canvas ref={dualAxisRef} />
                </div>
              </div>

            </div>

            {/* Regional breakdown and product category share */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Regional shares */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
                    Sales performance by Region
                  </h3>
                  <p className="text-xs text-slate-400">
                    Continent distribution of customer transactions
                  </p>
                </div>
                <div className="relative h-[280px]">
                  <canvas ref={regionBarRef} />
                </div>
              </div>

              {/* Contribution donut */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
                    Category Revenue Contribution
                  </h3>
                  <p className="text-xs text-slate-400">
                    Strategic splits of internal product categories
                  </p>
                </div>
                <div className="relative h-[280px]">
                  <canvas ref={donutRef} />
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ------------------------------------
            TAB 2: PRODUCT & CUSTOMER VIEW
            ------------------------------------ */}
        {activeTab === "product" && (
          <div className="space-y-6">
            
            {/* Scorecard grid representing all 5 product divisions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <Scorecard
                id="scorecard-smartphone"
                stats={categoryScorecardsList[0]}
                themeColor="fuchsia"
              />
              <Scorecard
                id="scorecard-tablet"
                stats={categoryScorecardsList[1]}
                themeColor="cyan"
              />
              <Scorecard
                id="scorecard-laptop"
                stats={categoryScorecardsList[2]}
                themeColor="yellow"
              />
              <Scorecard
                id="scorecard-tv"
                stats={categoryScorecardsList[3]}
                themeColor="emerald"
              />
              <Scorecard
                id="scorecard-accessories"
                stats={categoryScorecardsList[4]}
                themeColor="violet"
              />
            </div>

            {/* Custom Interactive bento box Treemap */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <CategoryTreemap id="bento-treemap-category" data={categoryScorecardsList} />
            </div>

            {/* Secondary Products Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Top Selling Products */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
                    Top Selling Products
                  </h3>
                  <p className="text-xs text-slate-400">
                    Highest income-generating Samsung equipment over chosen timeframe
                  </p>
                </div>
                <div className="relative h-[300px]">
                  <canvas ref={topProductsRef} />
                </div>
              </div>

              {/* Customer segments distribution */}
              <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
                    Customer Segment Distribution
                  </h3>
                  <p className="text-xs text-slate-400">
                    Sales concentration by organizational audience
                  </p>
                </div>
                <div className="relative h-[300px]">
                  <canvas ref={customerPieRef} />
                </div>
              </div>

            </div>

            {/* Product Growth Matrix (Bubble matrix analysis) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-md font-extrabold text-slate-850 dark:text-slate-100 font-heading">
                    Product Growth Matrix (Sales Volume vs profit margin)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Multi-dimensional quadrant analyzing popularity (units) to financial health (%)
                  </p>
                </div>

                {/* Growth legend mapping descriptions */}
                <div className="flex flex-wrap gap-2.5">
                  <span className="text-[10px] items-center gap-1.5 px-2.5 py-1 rounded bg-fuchsia-500/10 text-fuchsia-502 font-bold border border-fuchsia-500/20">
                    ● Smartphone
                  </span>
                  <span className="text-[10px] items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-502 font-bold border border-cyan-500/20">
                    ● Tablet
                  </span>
                  <span className="text-[10px] items-center gap-1.5 px-2.5 py-1 rounded bg-yellow-500/10 text-yellow-522 font-bold border border-yellow-500/20">
                    ● Laptop
                  </span>
                  <span className="text-[10px] items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-502 font-bold border border-emerald-500/20">
                    ● TV
                  </span>
                  <span className="text-[10px] items-center gap-1.5 px-2.5 py-1 rounded bg-violet-500/10 text-violet-502 font-bold border border-violet-500/20">
                    ● Accessories
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3 relative h-[380px]">
                  <canvas ref={growthBubbleRef} />
                </div>

                {/* Analytical matrix card explaining quadrants */}
                <div className="bg-slate-50 dark:bg-slate-850 border border-slate-150 dark:border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block font-heading">
                      Interpreting Matrix
                    </span>
                    <div className="space-y-4 text-xs">
                      <div>
                        <span className="font-bold text-brand-primary block">High volume, Upper right</span>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          Stars. Devices generating enormous volumetric velocity with premium operational profit.
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-brand-secondary block">Low volume, Upper left</span>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">
                          High margin specialists. Superb yield devices on sparse, specialized transactions.
                        </p>
                      </div>
                      <div>
                        <span className="font-bold text-brand-tertiary block">Bubble Radius (r)</span>
                        <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 font-medium">
                          Indicates Total Sales revenue. Larger sizes indicate major revenue contributors.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-150 dark:border-slate-800 text-[10px] text-slate-400 leading-normal">
                    Aggregate margins calculated dynamically from core cost sheets for ultra realistic executive feedback.
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
