"use client";

import Link from "next/link";
import {
  Search,       // Content
  LineChart,    // Trends
  Globe,        // Geographic
  Layers,       // Genre
  Users,        // Talent
  Gauge,        // Strategy
  Download,     // One-Click Export
} from "lucide-react";

export function HomeCtasButtons() {
  const btnClass =
    "inline-flex items-center gap-2 rounded-xl border border-neutral-700 " +
    "bg-neutral-900/70 px-5 py-3 text-sm font-semibold text-neutral-200 " +
    "hover:border-neutral-600 hover:bg-neutral-900 transition";

  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
      <Link href="/contentexplorerv2" className={btnClass}>
        <Search size={18} />
        Content
      </Link>

      <Link href="/trends" className={btnClass}>
        <LineChart size={18} />
        Trends
      </Link>

      <Link href="/geographic" className={btnClass}>
        <Globe size={18} />
        Geographic
      </Link>

      <Link href="/genre" className={btnClass}>
        <Layers size={18} />
        Genre
      </Link>

      <Link href="/creatorandtalenthub" className={btnClass}>
        <Users size={18} />
        Talent
      </Link>

      <Link href="/strategy" className={btnClass}>
        <Gauge size={18} />
        Strategy
      </Link>
    </div>
  );
}