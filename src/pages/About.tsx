import { motion } from "framer-motion";
import { Shield, BarChart3, Bell, FileText, Wind } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const modules = [
  { icon: FileText, title: "Data Input Module", desc: "Users can enter area names with pollutant values (PM2.5, PM10, NO₂, SO₂, CO, O₃) or upload a CSV file for bulk analysis." },
  { icon: BarChart3, title: "Pollution Analysis", desc: "The system compares each pollutant value against safe limits and calculates the Air Quality Index using standard AQI ranges." },
  { icon: Shield, title: "Health Risk Prediction", desc: "Based on AQI values, the system predicts health risks from safe breathing conditions to serious health hazards." },
  { icon: Bell, title: "Alert System", desc: "Color-coded alerts (NORMAL, WARNING, ALERT, DANGEROUS) provide instant visual feedback on air quality status." },
];

export default function About() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="container mx-auto px-4 py-16 flex-1">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <Wind className="h-7 w-7 text-primary" />
            <h1 className="text-3xl font-heading font-bold">About AirSense</h1>
          </div>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            AirSense is an Area-wise Air Pollution Analysis & Health Alert System designed to help communities monitor air quality, understand health risks, and take timely action. The system analyzes pollutant data, calculates AQI, and generates health-based alerts.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {modules.map((m, i) => (
              <motion.div
                key={m.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border border-border bg-card p-5 shadow-card"
              >
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center mb-3">
                  <m.icon className="h-5 w-5 text-accent-foreground" />
                </div>
                <h3 className="font-heading font-semibold mb-1">{m.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-card">
            <h2 className="font-heading font-semibold text-lg mb-3">AQI Ranges</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Good", range: "0–50", cls: "aqi-good" },
                { label: "Moderate", range: "51–100", cls: "aqi-moderate" },
                { label: "Poor", range: "101–200", cls: "aqi-poor" },
                { label: "Dangerous", range: "201–500", cls: "aqi-dangerous" },
              ].map((r) => (
                <div key={r.label} className={`${r.cls} rounded-lg px-4 py-3 text-center`}>
                  <div className="font-heading font-bold text-sm">{r.label}</div>
                  <div className="text-xs opacity-80">{r.range}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
