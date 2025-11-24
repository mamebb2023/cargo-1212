import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(false);
  const [scrollDir, setScrollDir] = useState<"up" | "down">("up");
  const lastScrollY = useRef(0);

  const navLinks = [
    { name: "About Us", path: "/about" },
    { name: "Features", path: "#features" },
    { name: "Services", path: "#services" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY.current && currentScrollY > 20) {
        // scrolling down
        setScrollDir("down");
      } else {
        // scrolling up
        setScrollDir("up");
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* HEADER */}
      <motion.header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/90 backdrop-blur-sm shadow-sm rounded-b-2xl"
            : "bg-transparent"
        }`}
        animate={{ y: scrollDir === "down" ? "-100%" : 0 }}
        transition={{ type: "spring", duration: 0.3 }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-blue-500" />
            <span className="text-lg font-semibold">CargoBid</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden gap-8 md:flex">
            {navLinks.map((link) =>
              link.path.startsWith("#") ? (
                <a
                  key={link.name}
                  href={link.path}
                  className="text-sm font-medium text-gray-600 hover:text-black"
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className="text-sm font-medium text-gray-600 hover:text-black"
                >
                  {link.name}
                </Link>
              )
            )}
          </nav>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/login">
              <Button variant="outline" className="rounded-full px-5">
                Log in
              </Button>
            </Link>

            <Link to="/register">
              <Button variant="secondary" className="rounded-full">
                Create a Bid
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-700 cursor-pointer"
            onClick={() => setOpenMenu(true)}
          >
            <Menu size={24} />
          </button>
        </div>
      </motion.header>

      {/* FRAMER ANIMATION FOR MOBILE MENU */}
      <AnimatePresence>
        {openMenu && (
          <>
            {/* OVERLAY */}
            <motion.div
              className="fixed inset-0 bg-black/80 z-50 md:hidden"
              onClick={() => setOpenMenu(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* SLIDING SIDEBAR */}
            <motion.div
              className="fixed top-0 right-0 h-screen w-72 bg-white z-60 md:hidden shadow-xl"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "tween", duration: 0.35 }}
            >
              {/* Close Icon */}
              <button
                className="absolute top-4 right-4 cursor-pointer"
                onClick={() => setOpenMenu(false)}
              >
                <X size={28} className="text-gray-700" />
              </button>

              {/* Drawer Content */}
              <div className="h-full flex flex-col justify-between py-16 px-6">
                {/* Nav Links */}
                <nav className="flex flex-col gap-6">
                  {navLinks.map((link) =>
                    link.path.startsWith("#") ? (
                      <a
                        key={link.name}
                        href={link.path}
                        onClick={() => setOpenMenu(false)}
                        className="text-lg font-medium text-gray-800"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        key={link.name}
                        to={link.path}
                        onClick={() => setOpenMenu(false)}
                        className="text-lg font-medium text-gray-800"
                      >
                        {link.name}
                      </Link>
                    )
                  )}
                </nav>

                {/* Login + Register */}
                <div className="flex flex-col gap-4">
                  <Link to="/login" onClick={() => setOpenMenu(false)}>
                    <Button variant="outline" className="w-full rounded-full">
                      Log in
                    </Button>
                  </Link>

                  <Link to="/register" onClick={() => setOpenMenu(false)}>
                    <Button variant="secondary" className="w-full rounded-full">
                      Register
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
