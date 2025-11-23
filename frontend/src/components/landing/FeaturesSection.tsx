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
      title: "Layered security",
      desc: "With layered security, we ensure the safety of every unit we provide.",
      icon: ShieldCheck,
    },
    {
      title: "Quality control of each part",
      desc: "Every unit you send is checked carefully for every detail.",
      icon: CheckCircle,
    },
    {
      title: "Reliable customer service",
      desc: "Our customer service is available 24 hours a week, with qualified people.",
      icon: MessageCircle,
    },
    {
      title: "Maintenance manual book",
      desc: "We provide a guidebook that can be used to ensure maximum care.",
      icon: FileText,
    },
    {
      title: "Delivered safely",
      desc: "Every unit we send arrives safely and quickly, without any obstacles or drama.",
      icon: Package,
    },
    {
      title: "Based on artificial intelligence",
      desc: "You can control and view each unit from your phone, it’s very easy to use.",
      icon: Cpu,
    },
  ];

  // Motion variants for cards
  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="w-full bg-white py-20">
      {/* Section Header */}
      <motion.div
        className="mx-auto max-w-5xl text-center mb-16 px-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-5xl font-semibold text-slate-900">
          We offer <span className="text-primary">quality</span>, with the
          <br />
          best materials and service
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
              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl shadow-black/10 hover:scale-105 border border-slate-200 transition-all"
              variants={cardVariants}
              transition={{ duration: 0.6, ease: "linear" }}
            >
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-primary to-blue-900 flex items-center justify-center mb-4">
                <Icon className="text-white" size={22} strokeWidth={2} />
              </div>

              <h3 className="text-lg font-medium text-slate-900">
                {item.title}
              </h3>

              <p className="text-slate-600 text-sm mt-1">{item.desc}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
}
