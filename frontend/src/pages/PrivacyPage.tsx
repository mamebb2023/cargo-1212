import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white relative">
      <Header />

      <div className="mt-20 relative">
        <div className="max-w-5xl mx-auto px-6 py-16">
          {/* Hero */}
          <div className="mb-8 flex flex-col items-start">
            <h1 className="text-5xl font-bold text-slate-900 mb-4 gradient-underline">
              Privacy Policy
            </h1>
            <p className="text-xl text-slate-600">
              Your privacy is important to us. This policy explains how we collect, use, and protect your information.
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
                1. Introduction
              </h2>
              <p>
                CargoBid ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform and services.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                2. Information We Collect
              </h2>
              <h3 className="text-2xl font-semibold text-slate-800 mb-3 mt-6">
                2.1 Personal Information
              </h3>
              <p>
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Name, email address, and contact information</li>
                <li>Business information (company name, registration details)</li>
                <li>Payment information (processed through secure third-party providers)</li>
                <li>Account credentials and profile information</li>
                <li>Communication records with other users</li>
              </ul>

              <h3 className="text-2xl font-semibold text-slate-800 mb-3 mt-6">
                2.2 Usage Information
              </h3>
              <p>
                We automatically collect certain information when you use our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Device information (IP address, browser type, operating system)</li>
                <li>Usage data (pages visited, features used, time spent)</li>
                <li>Log files and analytics data</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                3. How We Use Your Information
              </h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and manage your account</li>
                <li>Facilitate communication between users</li>
                <li>Send you service-related notifications and updates</li>
                <li>Respond to your inquiries and provide customer support</li>
                <li>Detect, prevent, and address technical issues and fraud</li>
                <li>Comply with legal obligations and enforce our terms</li>
                <li>Analyze usage patterns to improve user experience</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>
              <p>
                We do not sell your personal information. We may share your information in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>With Other Users:</strong> Your profile information and ratings may be visible to other users as part of the platform's functionality</li>
                <li><strong>Service Providers:</strong> We may share information with third-party service providers who perform services on our behalf (payment processing, hosting, analytics)</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required by law or to protect our rights and safety</li>
                <li><strong>Business Transfers:</strong> Information may be transferred in connection with a merger, acquisition, or sale of assets</li>
                <li><strong>With Your Consent:</strong> We may share information with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                5. Data Security
              </h2>
              <p>
                We implement appropriate technical and organizational measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Encryption of sensitive data in transit and at rest</li>
                <li>Secure authentication and access controls</li>
                <li>Regular security assessments and updates</li>
                <li>Limited access to personal information on a need-to-know basis</li>
              </ul>
              <p className="mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                6. Cookies and Tracking Technologies
              </h2>
              <p>
                We use cookies and similar tracking technologies to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Remember your preferences and settings</li>
                <li>Analyze how you use our platform</li>
                <li>Provide personalized content and advertisements</li>
                <li>Improve security and prevent fraud</li>
              </ul>
              <p className="mt-4">
                You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                7. Your Rights and Choices
              </h2>
              <p>
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access and receive a copy of your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your personal information</li>
                <li>Object to or restrict certain processing of your information</li>
                <li>Withdraw consent where processing is based on consent</li>
                <li>Export your data in a portable format</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at contact@cargobid.com. We will respond to your request within a reasonable timeframe.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                8. Data Retention
              </h2>
              <p>
                We retain your personal information for as long as necessary to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide our services to you</li>
                <li>Comply with legal obligations</li>
                <li>Resolve disputes and enforce our agreements</li>
                <li>Maintain business records as required by law</li>
              </ul>
              <p className="mt-4">
                When you delete your account, we will delete or anonymize your personal information, except where we are required to retain it for legal or legitimate business purposes.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                9. Children's Privacy
              </h2>
              <p>
                CargoBid is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                10. International Data Transfers
              </h2>
              <p>
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We take appropriate measures to ensure your information is protected in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material changes by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Posting the updated policy on our platform</li>
                <li>Sending you an email notification</li>
                <li>Displaying a prominent notice on our platform</li>
              </ul>
              <p className="mt-4">
                Your continued use of the platform after changes become effective constitutes acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                12. Contact Us
              </h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at:
              </p>
              <p className="mt-2">
                <strong>Email:</strong> contact@cargobid.com
              </p>
              <p className="mt-2">
                We will respond to your inquiry as soon as possible.
              </p>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

