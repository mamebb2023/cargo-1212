import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  const navLinks = [
    { name: "About Us", path: "/about" },
    { name: "Features", path: "/#features" },
    { name: "Services", path: "/#services" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 w-full z-50 transition-all duration-300
        ${
          scrolled
            ? "bg-white/90 backdrop-blur-sm shadow-sm rounded-b-2xl"
            : "bg-transparent"
        }
      `}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-blue-500" />
          <span className="text-lg font-semibold">CargoBid</span>
        </Link>

        {/* Nav */}
        <nav className="hidden gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm font-medium text-gray-600 hover:text-black"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Buttons */}
        <div className="flex items-center gap-3">
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
      </div>
    </header>
  );
}
