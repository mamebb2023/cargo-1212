"use client";

import { Button } from "../ui/button";
import { motion } from "framer-motion";

export default function ServiceSection() {
  const fadeUp = {
    initial: { opacity: 0, y: 40 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="w-full bg-white py-20">
      <motion.div
        className="text-center max-w-2xl mx-auto px-4"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeUp}
      >
        <h2 className="text-4xl font-semibold text-slate-900">
          Latest advanced technologies to <br /> ensure everything you need
        </h2>
        <p className="text-slate-600 mt-3">
          Maximize your team’s productivity and security with our affordable,
          user-friendly management system.
        </p>
      </motion.div>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-6xl mx-auto mt-14 px-4">
        {/* LEFT — Large Dynamic Dashboard */}
        <motion.div
          className="relative bg-blue-50 border border-blue-100 rounded-2xl p-6 flex flex-col justify-between overflow-hidden"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <div className="inset-0 z-2  absolute bg-linear-to-b from-transparent to-primary/30"></div>
          <div>
            <h3 className="text-xl font-semibold text-slate-900">
              Dynamic dashboard
            </h3>
            <p className="text-slate-600 mt-2">
              Helps teams work faster, smarter and more efficiently with
              visibility and data-driven insights.
            </p>
          </div>

          <div className="flex-center mt-6 w-full h-40">
            <img
              src="/img/img-1.jpg"
              alt="img"
              className="h-80 absolute bottom-0 rounded-t-xl object-cover object-center"
            />
          </div>

          <Button className="mt-6 px-5 py-2 z-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">
            Explore
          </Button>
        </motion.div>

        {/* RIGHT COLUMN */}
        <div className="flex flex-col gap-6 ">
          {/* Box 1 */}
          <motion.div
            className="relative bg-blue-50 border border-blue-100 rounded-2xl  overflow-hidden"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="py-4 px-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Smart notifications
              </h3>
              <p className="text-slate-600 mt-2">
                Easily accessible from notifications center, calendar or email.
              </p>
            </div>

            <div className="mt-6 w-full h-40">
              <img
                src="/img/img-1.jpg"
                alt="img"
                className="h-80 absolute top-1/3 rounded-tl-xl right-0 object-cover object-center"
              />
            </div>
          </motion.div>

          {/* Box 2 */}
          <motion.div
            className="relative bg-blue-50 border border-blue-100 rounded-2xl  overflow-hidden"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <div className="py-4 px-6">
              <h3 className="text-xl font-semibold text-slate-900">
                Smart notifications
              </h3>
              <p className="text-slate-600 mt-2">
                Easily accessible from notifications center, calendar or email.
              </p>
            </div>

            <div className="mt-6 w-full h-40">
              <img
                src="/img/img-1.jpg"
                alt="img"
                className="h-80 absolute top-1/3 rounded-tr-xl left-0 object-cover object-center"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
