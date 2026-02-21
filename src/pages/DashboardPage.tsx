import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { ArrowRight, Trash2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnalysisResult, loadResults, clearResults, SAFE_LIMITS } from "@/lib/pollution";
import { Button } from "@/components/ui/button";

const COLORS = {
  Good: "#22c55e",
  Moderate: "#eab308",
  Poor: "#f97316",
  Dangerous: "#ef4444",
};

export default function DashboardPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setResults(loadResults());
  }, []);

  const handleClear = () => {
    clearResults();
    setResults([]);
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No data to display. Analyze some areas first.</p>
            <Link to="/input"><Button className="gap-2">Enter Data <ArrowRight className="h-4 w-4" /></Button></Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // Prepare chart data
  const barData = results.map((r) => ({
    area: r.area,
    AQI: r.aqi,
    fill: COLORS[r.aqiCategory],
  }));

  const pollutantData = results.map((r) => ({
    area: r.area,
    "PM2.5": r.pollutants.pm25,
    PM10: r.pollutants.pm10,
    "NO₂": r.pollutants.no2,
    "SO₂": r.pollutants.so2,
    CO: r.pollutants.co,
    "O₃": r.pollutants.o3,
  }));

  const categoryCount: Record<string, number> = {};
  results.forEach((r) => {
    categoryCount[r.aqiCategory] = (categoryCount[r.aqiCategory] || 0) + 1;
  });
  const pieData = Object.entries(categoryCount).map(([name, value]) => ({ name, value }));

  // Summary stats
  const avgAQI = Math.round(results.reduce((s, r) => s + r.aqi, 0) / results.length);
  const worstArea = results.reduce((worst, r) => (r.aqi > worst.aqi ? r : worst), results[0]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Air quality overview across {results.length} areas</p>
            </div>
            <Button variant="outline" onClick={handleClear} className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" /> Clear Data
            </Button>
          </div>

          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Average AQI</p>
              <p className="text-3xl font-heading font-bold text-primary">{avgAQI}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Worst Area</p>
              <p className="text-xl font-heading font-bold">{worstArea.area}</p>
              <p className="text-sm text-destructive font-medium">AQI {worstArea.aqi}</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Areas Analyzed</p>
              <p className="text-3xl font-heading font-bold text-primary">{results.length}</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* AQI Bar Chart */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-heading font-semibold mb-4">AQI by Area</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="AQI" radius={[6, 6, 0, 0]}>
                    {barData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            <div className="rounded-xl border border-border bg-card p-5 shadow-card">
              <h3 className="font-heading font-semibold mb-4">AQI Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={100} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={COLORS[entry.name as keyof typeof COLORS] || "#888"} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pollutant Line Chart */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-card mb-8">
            <h3 className="font-heading font-semibold mb-4">Pollutant Levels by Area</h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={pollutantData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="area" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="PM2.5" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="PM10" stroke="#f97316" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="NO₂" stroke="#eab308" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="SO₂" stroke="#22c55e" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="CO" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="O₃" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Results Table */}
          <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-3 font-heading font-semibold">Area</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold">AQI</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold">Category</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold">Alert</th>
                    <th className="text-left px-4 py-3 font-heading font-semibold">Health Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-t border-border">
                      <td className="px-4 py-3 font-medium">{r.area}</td>
                      <td className="px-4 py-3 font-mono font-bold">{r.aqi}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getAQIColor(r.aqiCategory)}`}>
                          {r.aqiCategory}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs">{r.alertLevel}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{r.healthRisk}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}

function getAQIColor(cat: string) {
  switch (cat) {
    case "Good": return "aqi-good";
    case "Moderate": return "aqi-moderate";
    case "Poor": return "aqi-poor";
    case "Dangerous": return "aqi-dangerous";
    default: return "";
  }
}
