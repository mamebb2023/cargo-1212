// CTASection.tsx
"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="w-full bg-blue-900 text-white py-24 px-6 flex-center">
      <motion.div
        className="flex-1 flex flex-col md:flex-row items-center justify-center md:justify-between"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.3 }}
      >
        {/* Text Content */}
        <motion.div
          className="max-w-xl"
          variants={{
            hidden: { opacity: 0, y: 40 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-4xl font-bold mb-4">
            Discover the full scale of{" "}
            <span className="underline decoration-blue-300">CargoBid</span>{" "}
            capabilities
          </h2>
          <p className="text-blue-200">
            Explore features designed to help you grow and manage operations
            effortlessly.
          </p>
        </motion.div>

        {/* Buttons */}
        <motion.div
          className="flex gap-4 mt-8 md:mt-0"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
        >
          <Button className="bg-white text-blue-900 hover:bg-blue-200 rounded-xl px-6 py-3">
            Get a Demo
          </Button>
          <Button className="bg-blue-400 text-blue-900 hover:bg-blue-300 rounded-xl px-6 py-3">
            Explore Bids
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
