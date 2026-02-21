import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, ShieldAlert, Skull, Download, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AnalysisResult, loadResults, exportToCSV, getAQIColor, getAQITextColor, SAFE_LIMITS } from "@/lib/pollution";
import { Button } from "@/components/ui/button";

const alertIcons = {
  NORMAL: CheckCircle,
  WARNING: AlertTriangle,
  ALERT: ShieldAlert,
  DANGEROUS: Skull,
};

export default function ResultPage() {
  const [results, setResults] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    setResults(loadResults());
  }, []);

  const handleExport = () => {
    const csv = exportToCSV(results);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pollution_data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  if (results.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">No analysis results yet.</p>
            <Link to="/input">
              <Button className="gap-2">Enter Data <ArrowRight className="h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-heading font-bold">Analysis Results</h1>
              <p className="text-muted-foreground text-sm">{results.length} area{results.length > 1 ? "s" : ""} analyzed</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" /> Export CSV
              </Button>
              <Link to="/dashboard"><Button className="gap-2">Dashboard <ArrowRight className="h-4 w-4" /></Button></Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {results.map((r, i) => {
              const Icon = alertIcons[r.alertLevel];
              return (
                <motion.div
                  key={`${r.area}-${i}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-xl border border-border bg-card shadow-card overflow-hidden"
                >
                  {/* Header */}
                  <div className={`${getAQIColor(r.aqiCategory)} px-5 py-3 flex items-center justify-between`}>
                    <div>
                      <h3 className="font-heading font-bold text-lg">{r.area}</h3>
                      <span className="text-sm opacity-90">AQI: {r.aqi} — {r.aqiCategory}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      <span className="font-heading font-bold text-sm">{r.alertLevel}</span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className={`text-sm font-medium ${getAQITextColor(r.aqiCategory)}`}>{r.healthRisk}</p>
                    </div>

                    {/* Pollutant bars */}
                    <div className="space-y-2">
                      {(["pm25", "pm10", "no2", "so2", "co", "o3"] as const).map((key) => {
                        const val = r.pollutants[key];
                        const limit = SAFE_LIMITS[key].limit;
                        const pct = Math.min(100, (val / limit) * 50);
                        const over = val > limit;
                        return (
                          <div key={key} className="flex items-center gap-3 text-xs">
                            <span className="w-12 font-medium text-muted-foreground">{SAFE_LIMITS[key].label}</span>
                            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${over ? "bg-destructive" : "bg-primary"}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className={`w-12 text-right font-mono ${over ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
