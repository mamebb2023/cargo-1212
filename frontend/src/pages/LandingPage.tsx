import Header from "../components/Header";
import HeroSection from "@/components/landing/HeroSection";

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden">
      <Header />

      <div className="mt-20">
        <HeroSection />
      </div>
    </div>
  );
};

export default LandingPage;
