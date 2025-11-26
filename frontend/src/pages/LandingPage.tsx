import FeaturesSection from "@/components/landing/FeaturesSection";
import Header from "@/components/Header";
import HeroSection from "@/components/landing/HeroSection";
import CTASection from "@/components/landing/CTASection";
import { Footer } from "@/components/Footer";
import ServiceSection from "@/components/landing/ServicesSection";
import PricingSection from "@/components/landing/PricingSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />
      <div className="mt-20">
        <HeroSection />
        <FeaturesSection />
        <ServiceSection />
        <PricingSection />
        <CTASection />
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;
