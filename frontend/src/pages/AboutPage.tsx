import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <Header />
      <div className="mt-20">
        <div className="max-w-4xl mx-auto px-6 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              About CargoBid
            </h1>
            <p className="text-xl text-slate-600">
              Cargos and Logistics Transport Bidding Management System
            </p>
          </div>

          {/* Background Section */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">
              Background
            </h2>
            <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
              <p>
                In today's fast-paced world, the need for efficiency and
                communication in the logistics industry, especially in terms of
                how bids are handled, contracts are awarded, and how
                stakeholders can interact with each other, has become
                increasingly important. These challenges often lead to delays,
                disputes and dissatisfaction for all parties involved. To
                address these challenges, the Cargo and Logistics Transport
                Bidding Management System was conceived.
              </p>
              <p>
                The main goal of the project is to create a digital platform
                that simplifies the bidding process for freight transport
                services. It allows truck owners to register, monitor existing
                bids and connect with winning associations. On the other hand,
                users are given a platform to bid for freight transport
                opportunities, submit bids and negotiate. The system allows for
                a transparent payment process where associations deposit their
                funds within a certain time frame and the lowest bidder wins the
                contract.
              </p>
              <p>
                The platform also ensures quality of service throughout the
                process by introducing a rating system to assess the performance
                of carriers. Investors, organizations, or government entities
                can provide ratings based on on-time delivery, cargo handling,
                and communication, which are essential to maintaining high
                service standards. These ratings help prospective bidders assess
                the reliability of their partners and hold them accountable for
                their services.
              </p>
              <p>
                By incorporating these features, the Cargo and Logistics
                Transport Bidding Management System seeks to create a more
                transparent, competitive, and user-friendly environment for
                freight transportation. It eliminates traditional weaknesses,
                enhances communication, and builds trust between all parties,
                ultimately contributing to the smooth operation of the logistics
                industry.
              </p>
            </div>
          </section>

          {/* Problem Statement */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">
              The Problem
            </h2>
            <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
              <p>
                The cargos and logistics transportation industry has become
                increasingly complex due to the rapid growth of global trade,
                e-commerce, and industrial activity. Despite this growth, the
                sector still suffers from poor regulation of freight
                transportation. One of the main issues is the lack of a
                streamlined system to connect carriers and shippers.
              </p>
              <p>
                Currently, there is no centralized platform for stakeholders to
                easily connect, bid, and finalize contracts, which leads to
                delays and confusion in the process. Another key problem is the
                lack of transparency in how freight contracts are awarded.
                Bidding processes are often opaque, with no clear way to track
                how decisions are made or ensure that contracts are awarded to
                the most competitive and trustworthy bidders.
              </p>
              <p>
                The communication gap between stakeholders is also evident,
                creating misunderstandings and delays in contract finalization
                and service delivery.
              </p>
            </div>
          </section>

          {/* Solution */}
          <section className="mb-12">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">
              Our Solution
            </h2>
            <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
              <p>
                CargoBid provides a comprehensive digital platform that
                addresses all these challenges:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Transparent Bidding Process:</strong> Clear and fair
                  bidding system where associations deposit funds and the lowest
                  bidder wins the contract.
                </li>
                <li>
                  <strong>Centralized Platform:</strong> Single platform for
                  shippers, carriers, and truck owners to connect and manage
                  logistics transport bidding.
                </li>
                <li>
                  <strong>Real-time Communication:</strong> Seamless
                  communication between all stakeholders throughout the bidding
                  process.
                </li>
                <li>
                  <strong>Quality Rating System:</strong> Performance rating
                  system to assess carriers based on on-time delivery, cargo
                  handling, and communication.
                </li>
                <li>
                  <strong>Secure Payment Processing:</strong> Secure payment
                  processing with admin verification to ensure funds are
                  deposited within specified timeframes.
                </li>
                <li>
                  <strong>Role-Based Access Control:</strong> Secure
                  authentication and authorization for shippers, carriers, and
                  administrators.
                </li>
              </ul>
            </div>
          </section>

          {/* Project Info */}
          <section className="mb-12 bg-blue-50 rounded-2xl p-8">
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">
              Project Information
            </h2>
            <div className="space-y-3 text-slate-600">
              <p>
                <strong>Institution:</strong> St. Mary's University, Faculty of
                Informatics, Department of Computer Science
              </p>
              <p>
                <strong>Project Type:</strong> Senior Project for Bachelor of
                Science in Computer Science
              </p>
              <p>
                <strong>Development Team:</strong> Hermella Gebrehawaryat, Hikma
                Umer, Julia Kalegze, and Abdulhafiz Shemsu
              </p>
              <p>
                <strong>Advisor:</strong> Biniyam Abebe
              </p>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
