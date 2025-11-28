import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import DashboardPage from "@/pages/DashboardPage";
import BidsPage from "@/pages/dashboard/BidsPage";
import CreateBidPage from "@/pages/dashboard/CreateBidPage";
import BidDetailsPage from "@/pages/dashboard/BidDetailsPage";
import SubmitOfferPage from "@/pages/dashboard/SubmitOfferPage";
import MyBidsPage from "@/pages/dashboard/MyBidsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import AdminLoginPage from "@/pages/admin/AdminLoginPage";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import ToReviewPage from "@/pages/admin/ToReviewPage";
import AdminLayout from "@/components/layouts/AdminLayout";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: "var(--card)",
            color: "var(--foreground)",
            border: "1px solid var(--border)",
          },
          success: {
            iconTheme: {
              primary: "var(--primary)",
              secondary: "var(--primary-foreground)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--destructive)",
              secondary: "white",
            },
          },
        }}
      />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="bids" element={<BidsPage />} />
          <Route path="bids/create" element={<CreateBidPage />} />
          <Route path="bids/:id" element={<BidDetailsPage />} />
          <Route path="bids/:id/submit-offer" element={<SubmitOfferPage />} />
          <Route path="my-bids" element={<MyBidsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="to-review" element={<ToReviewPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
