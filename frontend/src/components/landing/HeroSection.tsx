// HeroSection.tsx
"use client";

import { InvertedCorder } from "@/assets";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section
      className="relative h-[85vh] rounded-3xl overflow-hidden m-4"
      style={{
        background: "url('/img/hero-bg.jpg') no-repeat center center/cover",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-center px-8">
        {/* Subtitle */}
        <motion.span
          className="text-white/80 text-sm mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          #1 Cargo and Logistics Transport Bidding Platform
        </motion.span>

        {/* Hero Heading */}
        <motion.h1
          className="text-white font-thin text-4xl md:text-7xl leading-tight max-w-2xl"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Streamline Your <br /> Logistics Transport
        </motion.h1>

        {/* CTA buttons */}
        <motion.div
          className="flex gap-10 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5, ease: "easeInOut" }}
        >
          <Link
            to="/register"
            className="text-white font-medium border-b border-white/60 pb-1 flex items-center gap-2 hover:opacity-80"
          >
            Get Started →
          </Link>

          <Link
            to="/bids"
            className="text-white font-medium border-b border-white/60 pb-1 flex items-center gap-2 hover:opacity-80"
          >
            View Bids →
          </Link>
        </motion.div>
      </div>

      {/* Stats & corner images */}
      <div className="absolute right-0 bottom-0 hidden md:flex flex-col">
        <div className="flex justify-end flex-1">
          <img
            src={InvertedCorder}
            className="size-10 rotate-90"
            draggable={false}
          />
        </div>

        <div className="flex">
          <img
            src={InvertedCorder}
            className="self-end size-10 rotate-90"
            draggable={false}
          />

          <div className="bg-white p-6 rounded-tl-3xl flex gap-7 max-w-[600px]">
            <div className="flex gap-7 max-w-[550px] mx-auto">
              {[
                {
                  number: "10K+",
                  label:
                    "Active truck owners and carriers registered on the platform.",
                },
                {
                  number: "500+",
                  label:
                    "Successful bids completed with transparent contract awards.",
                },
                {
                  number: "100%",
                  label:
                    "Transparent bidding process ensuring fair competition.",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="space-y-3  text-center bg-white p-4 rounded-2xl"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.2,
                    ease: "easeOut",
                  }}
                >
                  <h1 className="text-6xl text-primary">{item.number}</h1>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
