import { Link } from "react-router-dom";

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
        <span className="text-white/80 text-sm mb-3">
          #1 Energy provider in the world
        </span>

        <h1 className="text-white font-thin text-6xl leading-tight max-w-2xl">
          New Energy <br /> for the Future
        </h1>

        {/* CTA buttons */}
        <div className="flex gap-10 mt-8">
          <Link
            to="/contact"
            className="text-white font-medium border-b border-white/60 pb-1 flex items-center gap-2 hover:opacity-80"
          >
            Get in touch →
          </Link>

          <Link
            to="/services"
            className="text-white font-medium border-b border-white/60 pb-1 flex items-center gap-2 hover:opacity-80"
          >
            Our services →
          </Link>
        </div>
      </div>
    </section>
  );
}
