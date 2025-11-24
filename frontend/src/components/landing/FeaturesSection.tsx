// FeaturesSection.tsx
"use client";

import {
  ShieldCheck,
  CheckCircle,
  MessageCircle,
  FileText,
  Package,
  Cpu,
} from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      title: "Secure authentication",
      desc: "Robust user authentication with secure password hashing and role-based access control for all stakeholders.",
      icon: ShieldCheck,
    },
    {
      title: "Transparent bidding process",
      desc: "Clear and fair bidding system where associations deposit funds and the lowest bidder wins the contract.",
      icon: CheckCircle,
    },
    {
      title: "Real-time communication",
      desc: "Seamless communication between shippers, carriers, and truck owners throughout the bidding process.",
      icon: MessageCircle,
    },
    {
      title: "Contract management",
      desc: "Comprehensive system to post bids, submit offers, and finalize contracts efficiently.",
      icon: FileText,
    },
    {
      title: "Quality rating system",
      desc: "Performance rating system to assess carriers based on on-time delivery, cargo handling, and communication.",
      icon: Package,
    },
    {
      title: "Payment verification",
      desc: "Secure payment processing with admin verification to ensure funds are deposited within specified timeframes.",
      icon: Cpu,
    },
  ];

  // Motion variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="features" className="w-full bg-white py-20">
      {/* Section Header */}
      <motion.div
        className="mx-auto max-w-5xl text-center mb-16 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-3xl md:text-5xl font-semibold text-slate-900">
          We offer <span className="text-primary">transparent</span> and
          <br className="hidden md:block" />
          efficient bidding management
        </h2>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto px-4"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.2 }}
      >
        {features.map((item, i) => {
          const Icon = item.icon;

          return (
            <motion.div
              key={i}
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl shadow-black/10 hover:scale-105 border border-slate-200 transition-all flex flex-row md:flex-col gap-3"
              variants={cardVariants}
              transition={{ duration: 0.6, ease: "linear" }}
            >
              <div className="shrink-0 w-12 h-12 rounded-full bg-linear-to-br from-primary to-blue-900 flex items-center justify-center">
                <Icon className="text-white" size={22} strokeWidth={2} />
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  {item.title}
                </h3>

                <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
