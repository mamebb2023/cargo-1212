// PricingSection.tsx
"use client";

import { motion } from "framer-motion";
import { Users, Truck } from "lucide-react";

export default function PricingSection() {
  const pricingPlans = [
    {
      title: "For Shippers",
      description: "Pay ETB 200 to place your bid on available cargo posts",
      price: "ETB 200",
      icon: Users,
      features: [
        "Place bids on cargo posts",
        "Access to all available listings",
        "Transparent bidding process",
      ],
    },
    {
      title: "For Carriers",
      description: "Pay ETB 200 to post your bidding post and find bidders",
      price: "ETB 200",
      icon: Truck,
      features: [
        "Post your cargo listings",
        "Receive multiple bids",
        "Choose the best bidder",
      ],
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section id="pricing" className="w-full flex-center flex-col min-h-[70vh]">
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl md:text-5xl font-semibold text-slate-900">
            Simple & <span className="text-primary">Transparent</span> Pricing
          </h2>
          <p className="text-slate-600 mt-4 text-lg">
            Choose the plan that fits your needs
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ staggerChildren: 0.2 }}
        >
          {pricingPlans.map((plan, i) => {
            const Icon = plan.icon;

            return (
              <motion.div
                key={i}
                className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl border border-slate-200 transition-all hover:scale-105 p-8"
                variants={cardVariants}
                transition={{ duration: 0.6, ease: "linear" }}
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Header */}
                  <div className="flex flex-col mb-4">
                    <h3 className="self-start text-xs py-1 px-3 rounded-full text-white bg-linear-to-r from-primary to-blue-900 uppercase tracking-wider font-semibold">
                      {plan.title}
                    </h3>
                    <p className="mt-2 text-sm">{plan.description}</p>
                  </div>
                  <div className="shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-linear-to-br from-primary to-blue-900">
                    <Icon className="text-white" size={28} strokeWidth={2} />
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline text-slate-600 gap-2">
                    <span className="">{plan.price.split(" ")[0]}</span>
                    <span className="text-4xl font-extrabold text-slate-900">
                      {plan.price.split(" ").slice(1).join(" ")}
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className="flex items-center gap-3 text-slate-700"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
