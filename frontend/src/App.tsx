import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import BidsPage from "@/pages/dashboard/BidsPage";
import CreateBidPage from "@/pages/dashboard/CreateBidPage";
import BidDetailsPage from "@/pages/dashboard/BidDetailsPage";
import SubmitOfferPage from "@/pages/dashboard/SubmitOfferPage";
import MyBidsPage from "@/pages/dashboard/MyBidsPage";
import ProfilePage from "@/pages/dashboard/ProfilePage";
import SettingsPage from "@/pages/dashboard/SettingsPage";
import NotificationsPage from "@/pages/dashboard/NotificationsPage";
import StatsPage from "@/pages/dashboard/StatsPage";
import SubmitAgainPage from "@/pages/dashboard/SubmitAgainPage";
import DashboardLayout from "@/components/layouts/DashboardLayout";
import ToReviewPage from "@/pages/admin/ToReviewPage";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import AdminRoute from "@/components/auth/AdminRoute";
import NotFoundPage from "@/pages/NotFoundPage";
import AuthRedirect from "@/components/auth/AuthRedirect";

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
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
        <Route
          path="/login"
          element={
            <AuthRedirect>
              <LoginPage />
            </AuthRedirect>
          }
        />
        <Route
          path="/register"
          element={
            <AuthRedirect>
              <RegisterPage />
            </AuthRedirect>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="stats" replace />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="bids" element={<BidsPage />} />
          <Route path="bids/create" element={<CreateBidPage />} />
          <Route path="bids/:id" element={<BidDetailsPage />} />
          <Route path="bids/:id/submit-offer" element={<SubmitOfferPage />} />
          <Route path="my-bids" element={<MyBidsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="submit-again" element={<SubmitAgainPage />} />
          <Route
            path="to-review"
            element={
              <AdminRoute>
                <ToReviewPage />
              </AdminRoute>
            }
          />
        </Route>

        {/* 404 page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
