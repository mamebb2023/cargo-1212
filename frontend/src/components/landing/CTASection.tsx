import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <div className="flex-center flex-col h-[50vh] p-4 md:p-8 text-white">
      <motion.div
        className="relative flex-1 flex flex-col md:flex-row items-center justify-center md:justify-between p-6 rounded-4xl overflow-hidden w-full"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.3 }}
        style={{
          background: `url('/img/img-2.jpg') no-repeat center center/cover`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="flex-1 relative flex flex-col md:flex-row items-center justify-between">
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
              Transform your logistics with CargoBid
            </h2>
            <p className="">
              Join our platform to streamline freight transport bidding, connect
              with reliable carriers, and ensure transparent contract awards.
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
              Register Now
            </Button>
            <Button className="bg-blue-400 text-blue-900 hover:bg-blue-300 rounded-xl px-6 py-3">
              View Active Bids
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CTASection;
