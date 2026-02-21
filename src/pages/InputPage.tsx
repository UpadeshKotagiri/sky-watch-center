import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FileUp, Plus, Trash2, ArrowRight, Upload } from "lucide-react";
import Papa from "papaparse";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PollutantData, analyzePollution, saveResults } from "@/lib/pollution";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const emptyRow = (): PollutantData => ({
  area: "",
  pm25: 0,
  pm10: 0,
  no2: 0,
  so2: 0,
  co: 0,
  o3: 0,
});

export default function InputPage() {
  const [rows, setRows] = useState<PollutantData[]>([emptyRow()]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const updateRow = (index: number, field: keyof PollutantData, value: string) => {
    setRows((prev) =>
      prev.map((r, i) =>
        i === index
          ? { ...r, [field]: field === "area" ? value : Math.max(0, parseFloat(value) || 0) }
          : r
      )
    );
  };

  const addRow = () => setRows((prev) => [...prev, emptyRow()]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleCSV = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete(results) {
          const parsed: PollutantData[] = [];
          for (const row of results.data as Record<string, string>[]) {
            const area = row["area"] || row["Area"] || row["AREA"] || "";
            if (!area) continue;
            parsed.push({
              area,
              pm25: parseFloat(row["pm25"] || row["PM2.5"] || row["PM25"] || "0"),
              pm10: parseFloat(row["pm10"] || row["PM10"] || "0"),
              no2: parseFloat(row["no2"] || row["NO2"] || "0"),
              so2: parseFloat(row["so2"] || row["SO2"] || "0"),
              co: parseFloat(row["co"] || row["CO"] || "0"),
              o3: parseFloat(row["o3"] || row["O3"] || "0"),
            });
          }
          if (parsed.length === 0) {
            toast({ title: "No valid data", description: "CSV must contain columns: area, pm25, pm10, no2, so2, co, o3", variant: "destructive" });
            return;
          }
          setRows(parsed);
          toast({ title: `Loaded ${parsed.length} rows`, description: "Review and submit to analyze." });
        },
        error() {
          toast({ title: "CSV parse error", variant: "destructive" });
        },
      });
    },
    [toast]
  );

  const handleSubmit = () => {
    const valid = rows.filter((r) => r.area.trim() !== "");
    if (valid.length === 0) {
      toast({ title: "Enter at least one area", variant: "destructive" });
      return;
    }
    const results = valid.map((r) => ({
      ...analyzePollution({ ...r, timestamp: new Date().toISOString() }),
    }));
    saveResults(results);
    navigate("/result");
  };

  const fields: { key: keyof PollutantData; label: string; unit: string }[] = [
    { key: "pm25", label: "PM2.5", unit: "µg/m³" },
    { key: "pm10", label: "PM10", unit: "µg/m³" },
    { key: "no2", label: "NO₂", unit: "µg/m³" },
    { key: "so2", label: "SO₂", unit: "µg/m³" },
    { key: "co", label: "CO", unit: "mg/m³" },
    { key: "o3", label: "O₃", unit: "µg/m³" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-heading font-bold mb-2">Pollution Data Input</h1>
          <p className="text-muted-foreground mb-8">Enter pollutant values manually or upload a CSV file.</p>

          {/* CSV Upload */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-dashed border-border hover:border-primary/40 bg-card p-6 transition-colors">
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                <Upload className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <p className="font-semibold text-sm">Upload CSV File</p>
                <p className="text-xs text-muted-foreground">Columns: area, pm25, pm10, no2, so2, co, o3</p>
              </div>
              <input type="file" accept=".csv" onChange={handleCSV} className="hidden" />
            </label>
          </div>

          {/* Manual rows */}
          <div className="space-y-4">
            {rows.map((row, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-5 shadow-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-heading font-semibold text-sm text-muted-foreground">Entry #{i + 1}</span>
                  {rows.length > 1 && (
                    <button onClick={() => removeRow(i)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="col-span-2">
                    <Label className="text-xs">Area Name</Label>
                    <Input
                      placeholder="e.g. Downtown"
                      value={row.area}
                      onChange={(e) => updateRow(i, "area", e.target.value)}
                    />
                  </div>
                  {fields.map((f) => (
                    <div key={f.key}>
                      <Label className="text-xs">{f.label} <span className="text-muted-foreground">({f.unit})</span></Label>
                      <Input
                        type="number"
                        min={0}
                        step="0.1"
                        value={row[f.key] as number}
                        onChange={(e) => updateRow(i, f.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Button variant="outline" onClick={addRow} className="gap-2">
              <Plus className="h-4 w-4" /> Add Row
            </Button>
            <Button onClick={handleSubmit} className="gap-2">
              Analyze <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
