import { ArrowLeft } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative flex-center flex-col min-h-screen bg-linear-to-br from-transparent via-transparent to-primary/50 p-4">
      <div className="flex-center px-4">{children}</div>
      <Link to="/" className="flex-center gap-2 text-xs text-primary p-2">
        <ArrowLeft size={18} /> Go to Home
      </Link>
    </div>
  );
}
