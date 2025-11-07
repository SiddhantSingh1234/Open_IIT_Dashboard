"use client";

import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  Film,
  Tv,
  BarChart3,
  LineChart,
  Gauge,
  Filter,
  Users,
  Download,
  Search,
  Sparkles,
  ChevronDown,
  Globe,
  Layers,
} from "lucide-react";
import { SiNetflix } from "react-icons/si";
import { HomeCtasButtons } from "@/components/HomeButton";

/* Brand */
const NETFLIX_RED = "#E50914";

function FeatureCard({ icon: Icon, title, children, accent = NETFLIX_RED }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/60 via-black to-neutral-950 p-5"
    >
      <div
        className="absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-20"
        style={{ background: accent }}
      />
      <div className="mb-3 flex items-center gap-2">
        <Icon size={18} style={{ color: accent }} />
        <h4 className="font-semibold text-neutral-100">{title}</h4>
      </div>
      <p className="text-sm leading-6 text-neutral-400">{children}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-black via-[#0b0b0b] to-black text-white">
      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-64 w-64 rounded-full bg-[#e50914] blur-3xl opacity-20" />
        <div className="absolute right-[-10%] top-[10%] h-72 w-72 rounded-full bg-purple-600 blur-3xl opacity-20" />
        <div className="absolute left-[40%] bottom-[-10%] h-80 w-80 rounded-full bg-pink-600 blur-3xl opacity-10" />
      </div>

      {/* Header */}
      <header className="relative z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <SiNetflix size={24} className="text-[#E50914]" aria-label="Netflix" />
            <div className="leading-tight">
              <div className="text-[15px] font-extrabold tracking-wide" style={{ color: NETFLIX_RED }}>
                NETFLIX
              </div>
              <div className="text-xs text-neutral-400 -mt-0.5">Content Intelligence</div>
            </div>
          </div>

          <span className="rounded-full border border-red-900/50 bg-red-600/10 px-3 py-1 text-[15px] font-semibold text-red-400">
            Team 16
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pt-6 pb-10 md:pt-10">
          {/* <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-4xl font-extrabold leading-tight md:text-6xl"
          >
            Netflix <span style={{ color: NETFLIX_RED }}>Analytics Dashboard</span>
          </motion.h1> */}
          {/* <LampContainer> */}
            <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-24 bg-gradient-to-br from-white to-[#E50914] py-4 bg-clip-text text-center text-4xl font-extrabold tracking-tight text-transparent md:text-7xl"
            >
                Netflix <span style={{ color: NETFLIX_RED }}>Analytics Dashboard</span>
            </motion.h1>
        {/* </LampContainer> */}

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }}
            className="mx-auto mt-4 max-w-3xl text-center text-lg text-neutral-300"
          >
            Explore the catalog, compare Movies vs TV across genres, track growth trends, and simulate investment
            strategies with a live, server-powered toolkit—all in Netflix colors.
          </motion.p>
            
            <HomeCtasButtons/>
            
        </div>
      </section>

      {/* What’s inside */}
      <section className="relative z-10">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-6 pb-12 md:grid-cols-2 lg:grid-cols-3">
          <FeatureCard icon={Search} title="Server-Powered Search & Facets">
            Blazing-fast filtering by type, country, language, rating and years. Results are paginated on the server to
            keep things snappy, no matter the dataset size.
          </FeatureCard>

          <FeatureCard icon={Filter} title="Genre Explorer (Split View)" accent="#F59E0B">
            Pick a genre and instantly see matching titles while a second tab renders separate, dynamic counts for
            Movies and TV shows—perfect for editorial planning.
          </FeatureCard>

          <FeatureCard icon={LineChart} title="Trends Carousel" accent="#7C3AED">
            Swipe/arrow through four interactive line charts: yearly additions, median age shift, TV seasons trend,
            and runtime with rolling averages—each with short-term projections.
          </FeatureCard>

          <FeatureCard icon={BarChart3} title="Movies vs TV (By Genre)" accent="#22c55e">
            Clean bar visualizations (horizontal option for long labels) to compare title counts across the most
            common unified genres.
          </FeatureCard>

          <FeatureCard icon={Gauge} title="Strategy Simulator" accent="#10b981">
            Tune sliders for Family mix, TV vs Movie budget, and Movie median age. Real-time gauges and a dynamic
            typewriter insight guide the best next move.
          </FeatureCard>

          <FeatureCard icon={Download} title="One-Click Export" accent="#60a5fa">
            Export the currently filtered dataset to CSV for offline analysis and reporting.
          </FeatureCard>
        </div>
      </section>

      {/* CTA stripe */}
      <section className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-r from-neutral-900 via-neutral-900 to-neutral-900">
            <div className="relative p-6 sm:p-8">
              <div className="absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-red-600 blur-3xl opacity-20" />
              <div className="absolute -right-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-purple-600 blur-3xl opacity-20" />

              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <Film style={{ color: NETFLIX_RED }} />
                  <div>
                    <div className="text-lg font-semibold">Ready to dive in?</div>
                    <p className="text-sm text-neutral-400">
                      Start with the Content Explorer, or jump straight to the Strategy Simulator.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <footer className="mt-10 flex items-center justify-between text-xs text-neutral-500">
            <div>Made with ❤️ by <span className="font-semibold text-neutral-300">Team 16</span></div>
            <div className="text-right">
              <span className="text-neutral-500">
                Colors styled after Netflix brand palette.
              </span>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}