/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SalesRecord {
  id: string;
  date: string; // YYYY-MM-DD
  category: "Smartphone" | "Tablet" | "Laptop" | "TV" | "Accessories" | string;
  product: string;
  region: "North America" | "Europe" | "Asia Pacific" | "Latin America" | "Middle East & Africa" | string;
  customerType: "Retail" | "Corporate" | "Education" | "Developer" | string;
  units: number;
  revenue: number;
  profit: number;
}

// Full array of regions, customer types, and categories
export const REGIONS = [
  "North America",
  "Europe",
  "Asia Pacific",
  "Latin America",
  "Middle East & Africa"
];

export const CUSTOMER_TYPES = [
  "Retail",
  "Corporate",
  "Education",
  "Developer"
];

export const CATEGORIES = [
  "Smartphone",
  "Tablet",
  "Laptop",
  "TV",
  "Accessories"
] as const;

export const CATEGORY_PRODUCTS: Record<string, string[]> = {
  Smartphone: [
    "Galaxy S24 Ultra",
    "Galaxy S24+",
    "Galaxy Z Fold6",
    "Galaxy Z Flip6",
    "Galaxy A55 5G"
  ],
  Tablet: [
    "Galaxy Tab S9 Ultra",
    "Galaxy Tab S9 FE",
    "Galaxy Tab A9+"
  ],
  Laptop: [
    "Galaxy Book4 Pro",
    "Galaxy Book4 Ultra",
    "Galaxy Book Go"
  ],
  TV: [
    "Neo QLED 8K TV",
    "OLED S95D TV",
    "The Frame TV",
    "Crystal UHD 4K TV"
  ],
  Accessories: [
    "Galaxy Watch Ultra",
    "Galaxy Buds3 Pro",
    "SmartTag2 Pack",
    "Super Fast Charger 45W"
  ]
};

// Base cost of production to estimate profits
export const PRODUCT_BASE_VALUES: Record<string, { price: number; margin: number }> = {
  "Galaxy S24 Ultra": { price: 1299, margin: 0.38 },
  "Galaxy S24+": { price: 999, margin: 0.35 },
  "Galaxy Z Fold6": { price: 1899, margin: 0.42 },
  "Galaxy Z Flip6": { price: 1099, margin: 0.39 },
  "Galaxy A55 5G": { price: 449, margin: 0.28 },
  "Galaxy Tab S9 Ultra": { price: 1199, margin: 0.36 },
  "Galaxy Tab S9 FE": { price: 449, margin: 0.25 },
  "Galaxy Tab A9+": { price: 219, margin: 0.22 },
  "Galaxy Book4 Pro": { price: 1449, margin: 0.34 },
  "Galaxy Book4 Ultra": { price: 2399, margin: 0.40 },
  "Galaxy Book Go": { price: 349, margin: 0.18 },
  "Neo QLED 8K TV": { price: 3499, margin: 0.45 },
  "OLED S95D TV": { price: 2599, margin: 0.42 },
  "The Frame TV": { price: 1499, margin: 0.35 },
  "Crystal UHD 4K TV": { price: 649, margin: 0.24 },
  "Galaxy Watch Ultra": { price: 649, margin: 0.40 },
  "Galaxy Buds3 Pro": { price: 249, margin: 0.38 },
  "SmartTag2 Pack": { price: 99, margin: 0.50 },
  "Super Fast Charger 45W": { price: 49, margin: 0.55 }
};

/**
 * Programmatically generates a rich, seasonal mock dataset for Samsung CRM
 * representing high quality sales operations from Jan 2025 to May 2026.
 */
export function generateMockSalesData(): SalesRecord[] {
  const records: SalesRecord[] = [];
  let idCounter = 1;

  // Let's create sales records over roughly 480 days
  const startDate = new Date("2025-01-01");
  const endDate = new Date("2026-05-25");

  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // Category and brand distributions
  const categoryWeights: Record<string, number> = {
    Smartphone: 0.42,
    Tablet: 0.15,
    Laptop: 0.18,
    TV: 0.15,
    Accessories: 0.10
  };

  const regionWeights: Record<string, number> = {
    "North America": 0.35,
    "Europe": 0.28,
    "Asia Pacific": 0.22,
    "Latin America": 0.09,
    "Middle East & Africa": 0.06
  };

  const customerWeights: Record<string, number> = {
    Retail: 0.55,
    Corporate: 0.25,
    Education: 0.15,
    Developer: 0.05
  };

  // Helper to pick randomly based on weights
  function pickWeighted<T extends string>(weights: Record<T, number>): T {
    const rand = Math.random();
    let sum = 0;
    for (const key in weights) {
      sum += weights[key];
      if (rand <= sum) {
        return key as T;
      }
    }
    return Object.keys(weights)[0] as T;
  }

  // Iterate over some dense sample points
  // We'll generate about 8-12 records per day on average, but add seasonality
  for (let d = 0; d < diffDays; d += 3) {
    const currentDay = new Date(startDate);
    currentDay.setDate(startDate.getDate() + d);

    const month = currentDay.getMonth(); // 0-11
    const isQ4 = month >= 9 && month <= 11; // Oct-Dec (holiday surge)
    const isLaunchMonth = month === 0 || month === 7; // Jan/Aug (Galaxy Unpacked)
    const isBackToSchool = month === 7 || month === 8; // Aug/Sep

    // Number of orders to generate for this block
    let dailyRecordsCount = 4 + Math.floor(Math.random() * 6);
    if (isQ4) dailyRecordsCount += 5; // Holiday boost
    if (isLaunchMonth) dailyRecordsCount += 4; // Smartphone spike
    if (isBackToSchool) dailyRecordsCount += 2; // Laptop / Tablet spike

    for (let i = 0; i < dailyRecordsCount; i++) {
      // Pick dynamic specs
      const category = pickWeighted(categoryWeights);
      const products = CATEGORY_PRODUCTS[category];
      const product = products[Math.floor(Math.random() * products.length)];
      const region = pickWeighted(regionWeights);
      const customerType = pickWeighted(customerWeights);

      // Sizing of transactions based on customer types
      let baseUnits = 1 + Math.floor(Math.random() * 3);
      if (customerType === "Corporate") {
        baseUnits = 10 + Math.floor(Math.random() * 40); // bulk orders
      } else if (customerType === "Education") {
        baseUnits = 5 + Math.floor(Math.random() * 20);
      }

      // Base product details
      const details = PRODUCT_BASE_VALUES[product] || { price: 100, margin: 0.3 };
      
      // Calculate revenue and seasonal adjustments
      let itemPrice = details.price;
      
      // Bulk discounts
      if (baseUnits > 10) {
        itemPrice *= 0.90; // 10% off
      } else if (baseUnits > 25) {
        itemPrice *= 0.85; // 15% off
      }

      // Seasonal promotional adjustments
      if (isQ4) {
        itemPrice *= 0.95; // 5% Black Friday/Holiday discount
      }

      const revenue = Math.round(baseUnits * itemPrice * 100) / 100;
      // Profit calculated using the baseline profit margins of specific products
      const costRate = 1 - details.margin;
      const profit = Math.round(revenue * (details.margin + (Math.random() * 0.06 - 0.03)) * 100) / 100;

      const dateString = currentDay.toISOString().split("T")[0];

      records.push({
        id: `TX-${String(idCounter++).padStart(5, "0")}`,
        date: dateString,
        category,
        product,
        region,
        customerType,
        units: baseUnits,
        revenue,
        profit
      });
    }
  }

  // Ensure high quality sorted records by date
  return records.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}
