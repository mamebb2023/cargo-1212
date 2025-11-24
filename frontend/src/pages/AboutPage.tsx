import Header from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-white relative">
      <Header />

      <div className="mt-20 relative">
        <div className="max-w-5xl mx-auto px-6 py-16 flex">
          {/* MAIN CONTENT */}
          <div className="w-full lg:w-3/4 pr-10">
            {/* Hero */}
            <div className="mb-8 flex flex-col items-start">
              <h1 className="text-5xl font-bold text-slate-900 mb-4 gradient-underline">
                About CargoBid
              </h1>
              <p className="text-xl text-slate-600">
                Cargos and Logistics Transport Bidding Management System
              </p>
            </div>

            {/* Background */}
            <section id="background" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                Background
              </h2>
              <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
                <p>
                  In today's fast-paced world, the need for efficiency and
                  communication in the logistics industry, especially in terms
                  of how bids are handled, contracts are awarded, and how
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
                  opportunities, submit bids and negotiate. The system allows
                  for a transparent payment process where associations deposit
                  their funds within a certain time frame and the lowest bidder
                  wins the contract.
                </p>
                <p>
                  The platform also ensures quality of service throughout the
                  process by introducing a rating system to assess the
                  performance of carriers. Investors, organizations, or
                  government entities can provide ratings based on on-time
                  delivery, cargo handling, and communication, which are
                  essential to maintaining high service standards. These ratings
                  help prospective bidders assess the reliability of their
                  partners and hold them accountable for their services.
                </p>
                <p>
                  By incorporating these features, the Cargo and Logistics
                  Transport Bidding Management System seeks to create a more
                  transparent, competitive, and user-friendly environment for
                  freight transportation. It eliminates traditional weaknesses,
                  enhances communication, and builds trust between all parties,
                  ultimately contributing to the smooth operation of the
                  logistics industry.
                </p>
              </div>
            </section>

            {/* Problem */}
            <section id="problem" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                The Problem
              </h2>
              <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
                <p>
                  {" "}
                  The cargos and logistics transportation industry has become
                  increasingly complex due to the rapid growth of global trade,
                  e-commerce, and industrial activity. Despite this growth, the
                  sector still suffers from poor regulation of freight
                  transportation. One of the main issues is the lack of a
                  streamlined system to connect carriers and shippers.{" "}
                </p>{" "}
                <p>
                  {" "}
                  Currently, there is no centralized platform for stakeholders
                  to easily connect, bid, and finalize contracts, which leads to
                  delays and confusion in the process. Another key problem is
                  the lack of transparency in how freight contracts are awarded.
                  Bidding processes are often opaque, with no clear way to track
                  how decisions are made or ensure that contracts are awarded to
                  the most competitive and trustworthy bidders.{" "}
                </p>{" "}
                <p>
                  {" "}
                  The communication gap between stakeholders is also evident,
                  creating misunderstandings and delays in contract finalization
                  and service delivery.{" "}
                </p>
              </div>
            </section>

            {/* Solution */}
            <section id="solution" className="mb-12 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-slate-900 mb-4">
                Our Solution
              </h2>
              <div className="prose prose-lg max-w-none text-slate-600 space-y-4">
                <p>
                  {" "}
                  CargoBid provides a comprehensive digital platform that
                  addresses all these challenges:{" "}
                </p>{" "}
                <ul className="list-disc list-inside space-y-2">
                  {" "}
                  <li>
                    {" "}
                    <strong>Transparent Bidding Process:</strong> Clear and fair
                    bidding system where associations deposit funds and the
                    lowest bidder wins the contract.{" "}
                  </li>{" "}
                  <li>
                    {" "}
                    <strong>Centralized Platform:</strong> Single platform for
                    shippers, carriers, and truck owners to connect and manage
                    logistics transport bidding.{" "}
                  </li>{" "}
                  <li>
                    {" "}
                    <strong>Real-time Communication:</strong> Seamless
                    communication between all stakeholders throughout the
                    bidding process.{" "}
                  </li>{" "}
                  <li>
                    {" "}
                    <strong>Quality Rating System:</strong> Performance rating
                    system to assess carriers based on on-time delivery, cargo
                    handling, and communication.{" "}
                  </li>{" "}
                  <li>
                    {" "}
                    <strong>Secure Payment Processing:</strong> Secure payment
                    processing with admin verification to ensure funds are
                    deposited within specified timeframes.{" "}
                  </li>{" "}
                  <li>
                    {" "}
                    <strong>Role-Based Access Control:</strong> Secure
                    authentication and authorization for shippers, carriers, and
                    administrators.{" "}
                  </li>{" "}
                </ul>
              </div>
            </section>

            {/* Advisor */}
            <section id="advisor" className="mb-16 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">
                Project Advisor
              </h2>
              <div className=" flex items-center gap-6 bg-blue-50 border border-blue-100 p-6 rounded-3xl shadow-sm">
                <img
                  src="/images/advisor.jpg" // <-- replace with actual advisor picture
                  alt="Advisor"
                  className="shrink-0 w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                />

                <div>
                  <h3 className="text-2xl font-semibold text-slate-800">
                    Biniyam Abebe
                  </h3>
                  <p className="text-slate-600 text-lg">
                    Project Advisor — St. Mary’s University
                  </p>
                  <p className="text-slate-500 mt-2">
                    Guiding the development of the CargoBid platform through
                    academic and industry expertise.
                  </p>
                </div>
              </div>
            </section>

            {/* Team */}
            <section id="team" className="mb-20 scroll-mt-20">
              <h2 className="text-3xl font-semibold text-slate-900 mb-6">
                Development Team
              </h2>

              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
                {[
                  {
                    name: "Hermella Gebrehawaryat",
                    img: "/images/team1.jpg",
                  },
                  {
                    name: "Hikma Umer",
                    img: "/images/team2.jpg",
                  },
                  {
                    name: "Julia Kalegze",
                    img: "/images/team3.jpg",
                  },
                  {
                    name: "Abdulhafiz Shemsu",
                    img: "/images/team4.jpg",
                  },
                ].map((member) => (
                  <div
                    key={member.name}
                    className="flex flex-col items-center shrink-0 w-40"
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-blue-100"
                    />
                    <p className="text-center mt-3 text-slate-700 font-medium">
                      {member.name}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT SIDEBAR NAVIGATION */}
          <aside className="hidden lg:block w-1/4 sticky top-32 h-max">
            <div className="border-l pl-6 space-y-4">
              <h3 className="text-slate-700 font-semibold mb-4">
                Page Sections
              </h3>

              <nav className="flex flex-col space-y-3 text-slate-600">
                <a href="#background" className="hover:text-blue-600">
                  Background
                </a>
                <a href="#problem" className="hover:text-blue-600">
                  The Problem
                </a>
                <a href="#solution" className="hover:text-blue-600">
                  Our Solution
                </a>
                <a href="#advisor" className="hover:text-blue-600">
                  Project Advisor
                </a>
                <a href="#project-info" className="hover:text-blue-600">
                  Project Information
                </a>
                <a href="#team" className="hover:text-blue-600">
                  Development Team
                </a>
              </nav>
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}
