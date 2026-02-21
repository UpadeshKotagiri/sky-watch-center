import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wind, BarChart3, ShieldAlert, FileUp, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const features = [
  {
    icon: FileUp,
    title: "Data Input",
    desc: "Enter pollutant values manually or upload a CSV file for batch analysis.",
  },
  {
    icon: BarChart3,
    title: "AQI Calculation",
    desc: "Real-time Air Quality Index calculation using standard pollution metrics.",
  },
  {
    icon: ShieldAlert,
    title: "Health Alerts",
    desc: "Instant health risk predictions and color-coded alert notifications.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="gradient-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(172_50%_40%/0.3),transparent_60%)]" />
        <div className="container mx-auto px-4 py-24 md:py-32 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-2 mb-6">
              <Wind className="h-8 w-8 text-primary-foreground/80" />
              <span className="text-primary-foreground/70 font-heading text-sm font-medium tracking-wider uppercase">
                Air Quality Monitoring
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-primary-foreground leading-tight mb-6">
              AirSense
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Area-wise Air Pollution Analysis & Health Alert System. Monitor air quality, calculate AQI, predict health risks, and receive real-time alerts.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/input"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary-foreground text-primary font-semibold text-sm hover:bg-primary-foreground/90 transition-colors shadow-lg"
              >
                Start Analysis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-primary-foreground/30 text-primary-foreground font-semibold text-sm hover:bg-primary-foreground/10 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-heading font-bold mb-3">How It Works</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Analyze air pollution data in three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="rounded-xl border border-border bg-card p-6 shadow-card hover:shadow-card-hover transition-shadow"
            >
              <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center mb-4">
                <f.icon className="h-6 w-6 text-accent-foreground" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <div className="flex-1" />
      <Footer />
    </div>
  );
}
