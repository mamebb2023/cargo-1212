// Footer.tsx
import { Twitter, Linkedin, Facebook, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full bg-blue-950 text-blue-100 py-16 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="flex flex-col space-y-4">
          <div className="text-xl font-semibold">YourApp</div>
          <Link to="/contact" className="hover:text-blue-300">
            contact@yourapp.com
          </Link>
          <Link to="/contact" className="hover:text-blue-300">
            +123 456 789
          </Link>
        </div>

        {/* Solution */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-blue-300 mb-2">Solution</h4>
          <Link to="/why-us" className="hover:text-blue-300">
            Why Us
          </Link>
          <Link to="/features" className="hover:text-blue-300">
            Features
          </Link>
          <Link to="/ai-tools" className="hover:text-blue-300">
            AI Tools
          </Link>
          <Link to="/technology" className="hover:text-blue-300">
            Technology
          </Link>
          <Link to="/security" className="hover:text-blue-300">
            Security
          </Link>
        </div>

        {/* Customers */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-blue-300 mb-2">Customers</h4>
          <Link to="/enterprise" className="hover:text-blue-300">
            Enterprise
          </Link>
          <Link to="/legal" className="hover:text-blue-300">
            Legal
          </Link>
          <Link to="/sales" className="hover:text-blue-300">
            Sales
          </Link>
          <Link to="/procurement" className="hover:text-blue-300">
            Procurement
          </Link>
          <Link to="/startups" className="hover:text-blue-300">
            Startups
          </Link>
        </div>

        {/* Resources */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-blue-300 mb-2">Resources</h4>
          <Link to="/pricing" className="hover:text-blue-300">
            Pricing
          </Link>
          <Link to="/contact" className="hover:text-blue-300">
            Contact
          </Link>
          <Link to="/changelog" className="hover:text-blue-300">
            Changelog
          </Link>
          <Link to="/blog" className="hover:text-blue-300">
            Blog
          </Link>
        </div>
      </div>

      {/* Bottom */}
      <div className="max-w-6xl mx-auto mt-10 flex flex-col gap-3 md:flex-row items-center justify-between border-t border-blue-800 pt-6">
        <p className="text-sm text-blue-400">
          © 2024 YourApp. All rights reserved.
        </p>

        <div className="flex gap-4 mt-4 md:mt-0">
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
    </footer>
  );
}
