// AQI Calculation and Pollution Analysis Utilities

export interface PollutantData {
  area: string;
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  timestamp?: string;
}

export interface AnalysisResult {
  area: string;
  aqi: number;
  aqiCategory: AQICategory;
  healthRisk: string;
  alertLevel: AlertLevel;
  pollutants: PollutantData;
  exceedances: PollutantExceedance[];
}

export interface PollutantExceedance {
  name: string;
  value: number;
  safeLimit: number;
  ratio: number;
}

export type AQICategory = "Good" | "Moderate" | "Poor" | "Dangerous";
export type AlertLevel = "NORMAL" | "WARNING" | "ALERT" | "DANGEROUS";

// Safe limits (µg/m³ for most, mg/m³ for CO)
export const SAFE_LIMITS: Record<string, { limit: number; label: string; unit: string }> = {
  pm25: { limit: 60, label: "PM2.5", unit: "µg/m³" },
  pm10: { limit: 100, label: "PM10", unit: "µg/m³" },
  no2: { limit: 80, label: "NO₂", unit: "µg/m³" },
  so2: { limit: 80, label: "SO₂", unit: "µg/m³" },
  co: { limit: 4, label: "CO", unit: "mg/m³" },
  o3: { limit: 180, label: "O₃", unit: "µg/m³" },
};

export function calculateAQI(data: PollutantData): number {
  // Simplified AQI: weighted average based on how much each pollutant exceeds safe limits
  const ratios = [
    data.pm25 / SAFE_LIMITS.pm25.limit,
    data.pm10 / SAFE_LIMITS.pm10.limit,
    data.no2 / SAFE_LIMITS.no2.limit,
    data.so2 / SAFE_LIMITS.so2.limit,
    data.co / SAFE_LIMITS.co.limit,
    data.o3 / SAFE_LIMITS.o3.limit,
  ];
  const maxRatio = Math.max(...ratios);
  const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
  // AQI formula: blend of max and average, scaled to 0-500
  const aqi = Math.round((maxRatio * 0.6 + avgRatio * 0.4) * 100);
  return Math.min(500, Math.max(0, aqi));
}

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 200) return "Poor";
  return "Dangerous";
}

export function getHealthRisk(category: AQICategory): string {
  switch (category) {
    case "Good": return "Air quality is safe. Enjoy outdoor activities!";
    case "Moderate": return "Breathing discomfort possible for sensitive individuals.";
    case "Poor": return "Avoid prolonged outdoor activities. Use masks if necessary.";
    case "Dangerous": return "Serious health risk! Stay indoors and use air purifiers.";
  }
}

export function getAlertLevel(category: AQICategory): AlertLevel {
  switch (category) {
    case "Good": return "NORMAL";
    case "Moderate": return "WARNING";
    case "Poor": return "ALERT";
    case "Dangerous": return "DANGEROUS";
  }
}

export function getAQIColor(category: AQICategory): string {
  switch (category) {
    case "Good": return "aqi-good";
    case "Moderate": return "aqi-moderate";
    case "Poor": return "aqi-poor";
    case "Dangerous": return "aqi-dangerous";
  }
}

export function getAQITextColor(category: AQICategory): string {
  switch (category) {
    case "Good": return "text-aqi-good";
    case "Moderate": return "text-aqi-moderate";
    case "Poor": return "text-aqi-poor";
    case "Dangerous": return "text-aqi-dangerous";
  }
}

export function getExceedances(data: PollutantData): PollutantExceedance[] {
  const pollutantKeys = ["pm25", "pm10", "no2", "so2", "co", "o3"] as const;
  return pollutantKeys
    .map((key) => ({
      name: SAFE_LIMITS[key].label,
      value: data[key],
      safeLimit: SAFE_LIMITS[key].limit,
      ratio: data[key] / SAFE_LIMITS[key].limit,
    }))
    .filter((p) => p.ratio > 1)
    .sort((a, b) => b.ratio - a.ratio);
}

export function analyzePollution(data: PollutantData): AnalysisResult {
  const aqi = calculateAQI(data);
  const aqiCategory = getAQICategory(aqi);
  return {
    area: data.area,
    aqi,
    aqiCategory,
    healthRisk: getHealthRisk(aqiCategory),
    alertLevel: getAlertLevel(aqiCategory),
    pollutants: data,
    exceedances: getExceedances(data),
  };
}

// LocalStorage helpers
const STORAGE_KEY = "airsense_pollution_data";

export function saveResults(results: AnalysisResult[]): void {
  const existing = loadResults();
  const merged = [...existing, ...results];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
}

export function loadResults(): AnalysisResult[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function clearResults(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function exportToCSV(results: AnalysisResult[]): string {
  const header = "Area,PM2.5,PM10,NO2,SO2,CO,O3,AQI,Category,Health Risk,Alert Level,Timestamp\n";
  const rows = results.map((r) =>
    `"${r.area}",${r.pollutants.pm25},${r.pollutants.pm10},${r.pollutants.no2},${r.pollutants.so2},${r.pollutants.co},${r.pollutants.o3},${r.aqi},"${r.aqiCategory}","${r.healthRisk}","${r.alertLevel}","${r.pollutants.timestamp || new Date().toISOString()}"`
  ).join("\n");
  return header + rows;
}
