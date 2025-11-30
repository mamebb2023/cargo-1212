"use client";

import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import {
  Truck,
  Package,
  FileText,
  Coins,
  RefreshCw,
  MapPin,
  BarChart3,
  Settings,
} from "lucide-react";

const stats = [
  {
    number: "10K+",
    label: "Active truck owners and carriers registered on the platform.",
  },
  {
    number: "500+",
    label: "Successful bids completed with transparent contract awards.",
  },
  {
    number: "100%",
    label: "Transparent bidding process ensuring fair competition.",
  },
];

const floatingIcons = [
  Truck,
  Package,
  FileText,
  Coins,
  RefreshCw,
  MapPin,
  BarChart3,
  Settings,
];

export default function HeroSection() {
  const iconPositions = [
    { top: "10%", left: "15%" },
    { top: "25%", left: "75%" },
    { top: "55%", left: "20%" },
    { top: "70%", left: "60%" },
    { top: "15%", left: "55%" },
    { top: "45%", left: "40%" },
    { top: "80%", left: "30%" },
    { top: "60%", left: "85%" },
  ];

  return (
    <section className="relative h-screen rounded-3xl overflow-hidden flex-center flex-col gap-7">
      {/* Background scattered icons */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
        {floatingIcons.map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-primary"
            style={{
              top: iconPositions[index].top,
              left: iconPositions[index].left,
            }}
            animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
            transition={{
              duration: 3 + index * 0.3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <Icon size={32} />
          </motion.div>
        ))}
      </div>

      {/* Hero content */}
      <div className="relative z-10 max-w-5xl mx-auto flex-center flex-col text-center px-6">
        <motion.span
          className="backdrop-blur-[3px] font-bold text-primary py-2 px-4 bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary rounded-full text-sm mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          #1 Cargo Transport Bidding Platform
        </motion.span>

        <motion.h1
          className="text-slate-900 font-bold text-4xl md:text-7xl leading-tight max-w-3xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <span className="text-primary">Streamline</span> Your
          <br /> Logistics{" "}
          <span className="rounded-3xl px-3 md:px-6 pb-1 text-white bg-linear-to-r from-primary to-blue-800">
            Transport
          </span>
        </motion.h1>

        <motion.p
          className="text-slate-600 max-w-2xl mt-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Connect carriers and shippers through transparent bidding — save time,
          reduce costs, and grow your logistics network.
        </motion.p>

        <motion.div
          className="flex gap-6 mt-6"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <Button variant="secondary">
            <Link to="/register" className="min-w-40">
              Get Started
            </Link>
          </Button>

          <Button variant="outline" className="min-w-40">
            <Link to="/bids">View Bids</Link>
          </Button>
        </motion.div>
      </div>

      {/* Stats */}
      <div className="flex-center px-6">
        <div className=" md:max-w-4xl p-4 flex flex-wrap gap-4 relative z-10">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              className="backdrop-blur-[3px] flex-1 text-center p-4 border border-gray-500/20 rounded-3xl hover:shadow-lg transition-all hover:scale-105"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
            >
              <div className="text-3xl md:text-4xl text-primary font-semibold">
                {item.number}
              </div>
              <div className="text-xs text-slate-500 mt-1">{item.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
