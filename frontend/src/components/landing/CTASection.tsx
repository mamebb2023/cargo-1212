import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTASection = () => {
  return (
    <div className="flex-center flex-col h-[50vh] min-h-[400px] p-4 md:p-8 text-white">
      <motion.div
        className="relative flex-1 flex flex-col md:flex-row items-center justify-center md:justify-between p-6 md:p-8 lg:px-20 rounded-2xl md:rounded-4xl overflow-hidden w-full max-w-7xl"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        transition={{ staggerChildren: 0.3 }}
        style={{
          background: `url('/img/img-2.jpg') no-repeat center center/cover`,
        }}
      >
        <div className="absolute inset-0 bg-black/40"></div>

        <div className="flex-1 relative flex flex-col justify-center gap-4 md:gap-6 text-center md:text-left">
          {/* Text Content */}
          <motion.div
            className="max-w-2xl mx-auto md:mx-0"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
              Transform your logistics with CargoBid
            </h2>
            <p className="text-base sm:text-lg md:text-xl leading-relaxed opacity-90">
              Join our platform to streamline freight transport bidding, connect
              with reliable carriers, and ensure transparent contract awards.
            </p>
          </motion.div>

          {/* Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row gap-4 mt-6 md:mt-8 w-full sm:w-auto"
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0 },
            }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
          >
            <Button
              variant="secondary"
              className="rounded-xl px-6 py-3 text-base font-semibold w-full sm:w-auto"
              onClick={() => (window.location.href = "/register")}
            >
              Register Now
            </Button>
            <Button
              variant="outline"
              className="rounded-xl px-6 py-3 bg-white/10 border-white/30 text-white hover:bg-white/20 w-full sm:w-auto text-base font-semibold"
              onClick={() => (window.location.href = "/dashboard/bids")}
            >
              View Active Bids
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default CTASection;
