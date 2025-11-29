import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white relative">
      <Header />

      <div className="mt-20 relative">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="mb-8 flex flex-col items-start">
            <h1 className="text-5xl font-bold text-slate-900 mb-4 gradient-underline">
              Terms & Conditions
            </h1>
            <p className="text-xl text-slate-600">
              Please read these terms and conditions carefully before using CargoBid
            </p>
          </div>

          {/* Last Updated */}
          <div className="mb-8 text-sm text-slate-500">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          {/* Content */}
          <div className="prose prose-lg max-w-none text-slate-600 space-y-8">
            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing and using CargoBid, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                2. Description of Service
              </h2>
              <p>
                CargoBid is a digital platform that facilitates freight transport bidding between shippers, carriers, and truck owners. The platform allows users to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Create and manage freight transport bids</li>
                <li>Submit and review offers for transport services</li>
                <li>Connect with reliable carriers and shippers</li>
                <li>Manage contracts and payments through the platform</li>
                <li>Rate and review service providers</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                3. User Accounts
              </h2>
              <p>
                To use certain features of CargoBid, you must register for an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and update your information to keep it accurate</li>
                <li>Maintain the security of your password and identification</li>
                <li>Accept all responsibility for activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                4. Bidding Process
              </h2>
              <p>
                The bidding process on CargoBid operates under the following terms:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Shippers must deposit funds within the specified timeframe before bids are accepted</li>
                <li>The lowest valid bid wins the contract, subject to admin verification</li>
                <li>All bids are binding once submitted and accepted</li>
                <li>Carriers must fulfill their obligations as specified in the bid contract</li>
                <li>CargoBid reserves the right to reject or cancel bids that violate platform policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                5. Payment Terms
              </h2>
              <p>
                Payment processing on CargoBid is subject to the following conditions:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Payments must be made through the platform's secure payment system</li>
                <li>Funds are held in escrow until contract completion and verification</li>
                <li>Refunds are subject to the terms of the specific contract and platform policies</li>
                <li>All fees and charges are clearly displayed before transaction completion</li>
                <li>CargoBid may charge service fees as disclosed in the pricing section</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                6. User Conduct
              </h2>
              <p>
                Users agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the platform for any illegal or unauthorized purpose</li>
                <li>Violate any laws in your jurisdiction</li>
                <li>Transmit any worms, viruses, or any code of a destructive nature</li>
                <li>Submit false, misleading, or fraudulent information</li>
                <li>Interfere with or disrupt the platform or servers</li>
                <li>Attempt to gain unauthorized access to any portion of the platform</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                7. Rating System
              </h2>
              <p>
                The rating system allows users to rate carriers based on:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>On-time delivery performance</li>
                <li>Cargo handling quality</li>
                <li>Communication effectiveness</li>
              </ul>
              <p className="mt-4">
                Ratings must be honest and based on actual service experience. False or malicious ratings may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                8. Limitation of Liability
              </h2>
              <p>
                CargoBid acts as an intermediary platform and is not responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The quality, safety, or legality of services provided by users</li>
                <li>The accuracy of information provided by users</li>
                <li>The ability of users to complete transactions</li>
                <li>Disputes between users regarding services or payments</li>
              </ul>
              <p className="mt-4">
                Users are solely responsible for their interactions with other users and the fulfillment of their contractual obligations.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                9. Intellectual Property
              </h2>
              <p>
                All content on CargoBid, including but not limited to text, graphics, logos, and software, is the property of CargoBid or its content suppliers and is protected by copyright and other intellectual property laws.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                10. Termination
              </h2>
              <p>
                CargoBid reserves the right to terminate or suspend your account and access to the platform immediately, without prior notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                11. Changes to Terms
              </h2>
              <p>
                We reserve the right to modify these terms at any time. We will notify users of any significant changes via email or through the platform. Continued use of the platform after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                12. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms & Conditions, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> contact@cargobid.com
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}


