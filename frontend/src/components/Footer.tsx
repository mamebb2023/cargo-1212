// Footer.tsx
import { Twitter, Linkedin, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const navLinks = [
    { name: "About Us", path: "/about" },
    { name: "Features", path: "/#features" },
    { name: "Services", path: "/#services" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <footer className="w-full bg-blue-950 text-blue-100 py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-blue-500" />
            <span className="text-xl font-semibold">CargoBid</span>
          </div>
          <p className="text-sm text-blue-300">
            Streamlining logistics transport bidding for transparent and efficient freight transportation.
          </p>
          <Link to="/contact" className="text-sm hover:text-blue-300">
            contact@cargobid.com
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-blue-300 mb-2">Quick Links</h4>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm hover:text-blue-300"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Connect */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-blue-300 mb-2">Connect</h4>
          <div className="flex gap-4">
            <Link to="#" aria-label="Twitter">
              <Twitter className="w-5 h-5 hover:text-blue-300" />
            </Link>
            <Link to="#" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 hover:text-blue-300" />
            </Link>
            <Link to="#" aria-label="Facebook">
              <Facebook className="w-5 h-5 hover:text-blue-300" />
            </Link>
            <Link to="#" aria-label="YouTube">
              <Youtube className="w-5 h-5 hover:text-blue-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto mt-10 flex flex-col gap-3 md:flex-row items-center justify-between border-t border-blue-800 pt-6">
        <p className="text-sm text-blue-400">
          © 2024 CargoBid. All rights reserved.
        </p>
        <p className="text-sm text-blue-400">
          Cargos and Logistics Transport Bidding Management System
        </p>
      </div>
    </footer>
  );
}
