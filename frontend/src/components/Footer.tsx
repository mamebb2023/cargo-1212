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

  const termsLinks = [
    { name: "Terms & Conditions", path: "/terms" },
    { name: "Privacy Policy", path: "/privacy" },
  ];

  return (
    <footer className="relative w-full py-16 px-6 border-t border-gray-300 text-gray-700 overflow-hidden">
      <div className="relative max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-7">
        {/* Brand */}
        <div className="self-grid flex flex-col space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-blue-500" />
            <span className="text-xl font-semibold text-gray-900">
              CargoBid
            </span>
          </div>
          <p className="text-sm text-gray-600">
            Streamlining logistics transport bidding for transparent and
            efficient freight transportation.
          </p>
          <Link
            to="/contact"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            contact@cargobid.com
          </Link>
        </div>

        {/* Quick Links */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-blue-800 mb-2">Quick Links</h4>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Terms */}
        <div className=" flex flex-col gap-3">
          <h4 className="font-semibold text-blue-800 mb-2">Terms</h4>
          {termsLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Connect */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-blue-800 mb-2">Connect</h4>
          <div className="flex gap-4">
            <Link to="#" aria-label="Twitter">
              <Twitter className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </Link>
            <Link to="#" aria-label="LinkedIn">
              <Linkedin className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </Link>
            <Link to="#" aria-label="Facebook">
              <Facebook className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </Link>
            <Link to="#" aria-label="YouTube">
              <Youtube className="w-5 h-5 text-gray-600 hover:text-gray-900" />
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="relative max-w-6xl mx-auto mt-10 flex flex-col gap-3 md:flex-row items-center justify-between border-t border-gray-300 pt-6">
        <p className="text-sm text-gray-500">
          © 2025 CargoBid. All rights reserved.
        </p>
        <p className="text-sm text-gray-500">
          Cargos and Logistics Transport Bidding Management System
        </p>
      </div>
    </footer>
  );
}
