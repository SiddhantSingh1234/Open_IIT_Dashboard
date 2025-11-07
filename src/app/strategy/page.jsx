// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   PieChart,
//   Pie,
//   Cell,
//   RadialBarChart,
//   RadialBar,
//   LabelList,
//   Legend,
// } from "recharts";
// import { motion } from "framer-motion";
// import { TypewriterEffect } from "@/components/ui/typewriter-effect";
// import { Tv, Film, Gauge, Users, Target, Sparkles } from "lucide-react";

// /* ---- Brand palette ---- */
// const TV_COLOR = "#7C3AED";      // TV / defense
// const MOVIE_COLOR = "#E50914";   // Movies / acquisition
// const FAMILY_COLOR = "#F59E0B";  // amber
// const MATURE_COLOR = "#EF4444";  // soft red
// const RAD = Math.PI / 180;

// export default function StrategicRecommendations({
//   className = "",
//   onInsightChange,
//   initialFamilyPct = 13.6,
//   initialTvBudget = 60,
//   initialMovieAge = 3.0,
// }) {
//   // avoid hydration glitches with charts
//   const [mounted, setMounted] = useState(false);
//   useEffect(() => setMounted(true), []);

//   /* -------------------- Controls -------------------- */
//   const [familyPct, setFamilyPct] = useState(initialFamilyPct);
//   const [tvBudget, setTvBudget] = useState(initialTvBudget);
//   const [movieAge, setMovieAge] = useState(initialMovieAge);
//   const movieBudget = 100 - tvBudget;

//   // Freshness ∈ [0,100], higher is better
//   const freshness = useMemo(
//     () => Math.max(0, Math.min(100, 100 - (movieAge - 0.5) * 25)),
//     [movieAge]
//   );

//   /* -------------------- Chart Data ------------------- */
//   // 1) Budget: stacked horizontal 100% bar
//   const budgetRow = useMemo(
//     () => [{ key: "Budget Split", TV: tvBudget, Movies: movieBudget }],
//     [tvBudget, movieBudget]
//   );

//   // 2) Audience donut
//   const mix = useMemo(
//     () => [
//       { name: "Family/Kids", value: Number(familyPct.toFixed(1)) },
//       { name: "Mature/Teen", value: Number((100 - familyPct).toFixed(1)) },
//     ],
//     [familyPct]
//   );

//   // 3) Freshness gauge — two segments (value + remainder) so it always shows
//   const gaugeData = useMemo(
//     () => [
//       { name: "Freshness", value: Number(freshness.toFixed(1)), fill: "#10B981" },
//       { name: "Remainder", value: 100 - Number(freshness.toFixed(1)), fill: "#262626" },
//     ],
//     [freshness]
//   );

//   /* -------------------- Insight Text ----------------- */
//   const familyOK = familyPct >= 35;
//   const movieAgeOK = movieAge <= 2.0;

//   const punchline = familyOK
//     ? "Family gap closed — household moat strengthening."
//     : "Increase Family/Kids to ≥35% to defend households.";

//   // Aceternity Typewriter words (big & dynamic)
//   const words = useMemo(
//     () => [
//       { text: "Defend", className: "text-white" },
//       { text: "TV", className: "text-purple-400" },
//       { text: "freshness", className: "text-white" },
//       { text: "0.0y", className: "text-green-400" },
//       { text: "floor.", className: "text-white" },
//       { text: "Cap", className: "text-white" },
//       { text: "Movies", className: "text-red-400" },
//       { text: "≤2y", className: movieAgeOK ? "text-green-400" : "text-amber-400" },
//       { text: "median.", className: "text-white" },
//       { text: "Raise", className: "text-white" },
//       { text: "Family/Kids", className: familyOK ? "text-amber-300" : "text-amber-500" },
//       { text: `to ${familyPct.toFixed(1)}%`, className: familyOK ? "text-green-400" : "text-amber-400" },
//       { text: "now.", className: "text-white" },
//     ],
//     [familyPct, movieAgeOK]
//   );

//   const longInsight = useMemo(
//     () =>
//       `TV is your defense vehicle — keep median age ≈ 0.0y. Movies are the acquisition engine — cap median age ≤ 2y.
// Rebalance budget toward Family/Kids (≥ 35%) to close the household gap while keeping TV share at ${tvBudget}% for retention.`,
//     [tvBudget]
//   );

//   useEffect(() => {
//     onInsightChange?.(
//       `${punchline} • Freshness ≈ ${freshness.toFixed(
//         0
//       )}% • TV ${tvBudget}% / Movies ${movieBudget}% • Family ${familyPct.toFixed(1)}%`
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [punchline, freshness, tvBudget, movieBudget, familyPct]);

//   /* -------------------- Helpers --------------------- */
//   const tooltipStyle = { background: "#111", border: "1px solid #333", color: "#fff" };

//   // Inside-slice label that stays within the donut (hide on tiny slices)
//   const insideLabel = (props) => {
//     const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
//     if (percent < 0.12) return null; // avoid clutter on small slices
//     const r = innerRadius + (outerRadius - innerRadius) * 0.55;
//     const x = cx + r * Math.cos(-midAngle * RAD);
//     const y = cy + r * Math.sin(-midAngle * RAD);
//     return (
//       <text x={x} y={y} fill="#fff" fontSize={12} textAnchor="middle" dominantBaseline="central">
//         {`${Math.round(percent * 100)}%`}
//       </text>
//     );
//   };

//   if (!mounted) {
//     return (
//       <div className={`w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-6 ${className}`}>
//         <div className="h-8 w-64 animate-pulse rounded bg-neutral-800" />
//         <div className="mt-4 grid gap-6 md:grid-cols-3">
//           <div className="h-32 animate-pulse rounded-xl bg-neutral-900" />
//           <div className="h-32 animate-pulse rounded-xl bg-neutral-900" />
//           <div className="h-32 animate-pulse rounded-xl bg-neutral-900" />
//         </div>
//       </div>
//     );
//   }

//   /* ------------------------ UI ---------------------- */
//   return (
//     <div
//       className={`w-full rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/70 via-black to-neutral-950 p-6 text-white ${className}`}
//     >
//       {/* Header */}
//       <div className="mb-6 flex items-center justify-between">
//         <div>
//           <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
//             Strategic Recommendations Simulator
//           </h3>
//           <p className="text-neutral-400">Tune the levers and watch the strategy adapt in real time.</p>
//         </div>
//         <div className="hidden sm:flex gap-2 text-neutral-300">
//           <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-1.5">
//             <Tv size={16} className="text-purple-400" /> TV (Defense)
//           </span>
//           <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-1.5">
//             <Film size={16} className="text-red-500" /> Movies (Acquisition)
//           </span>
//           <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-1.5">
//             <Users size={16} className="text-amber-400" /> Family Priority
//           </span>
//         </div>
//       </div>

//       {/* Controls */}
//       <div className="grid gap-5 md:grid-cols-3">
//         <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
//           <label className="mb-2 block text-sm font-semibold text-neutral-300">Family Content Share (%)</label>
//           <input
//             type="range"
//             min="10"
//             max="50"
//             step="0.1"
//             value={familyPct}
//             onChange={(e) => setFamilyPct(parseFloat(e.target.value))}
//             className="w-full accent-red-600"
//           />
//           <div className="mt-1 text-sm text-neutral-300">{familyPct.toFixed(1)}%</div>
//         </div>

//         <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
//           <label className="mb-2 block text-sm font-semibold text-neutral-300">TV Budget Share (%)</label>
//           <input
//             type="range"
//             min="20"
//             max="80"
//             value={tvBudget}
//             onChange={(e) => setTvBudget(parseInt(e.target.value, 10))}
//             className="w-full accent-red-600"
//           />
//           <div className="mt-1 text-sm text-neutral-300">
//             {tvBudget}% TV / {movieBudget}% Movies
//           </div>
//         </div>

//         <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
//           <label className="mb-2 block text-sm font-semibold text-neutral-300">Movie Median Age (yrs)</label>
//           <input
//             type="range"
//             min="0"
//             max="5"
//             step="0.1"
//             value={movieAge}
//             onChange={(e) => setMovieAge(parseFloat(e.target.value))}
//             className="w-full accent-red-600"
//           />
//           <div className="mt-1 text-sm text-neutral-300">{movieAge.toFixed(1)} years</div>
//         </div>
//       </div>

//       {/* Charts */}
//       <div className="mt-6 grid gap-6 xl:grid-cols-3">
//         {/* Budget: stacked horizontal */}
//         <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
//           <div className="mb-2 flex items-center gap-2 text-neutral-200">
//             <Target size={18} className="text-red-400" />
//             <h4 className="font-semibold">Budget Distribution</h4>
//           </div>
//           <ResponsiveContainer width="100%" height={220}>
//             <BarChart data={budgetRow} layout="vertical" margin={{ top: 10, right: 16, left: 8, bottom: 8 }}>
//               <defs>
//                 <linearGradient id="gradTV" x1="0" x2="1" y1="0" y2="0">
//                   <stop offset="0%" stopColor={TV_COLOR} stopOpacity={0.95} />
//                   <stop offset="100%" stopColor="#9F67FF" stopOpacity={0.95} />
//                 </linearGradient>
//                 <linearGradient id="gradMOV" x1="0" x2="1" y1="0" y2="0">
//                   <stop offset="0%" stopColor={MOVIE_COLOR} stopOpacity={0.95} />
//                   <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.95} />
//                 </linearGradient>
//               </defs>
//               <XAxis type="number" domain={[0, 100]} tick={{ fill: "#a3a3a3" }} tickFormatter={(v) => `${v}%`} />
//               <YAxis type="category" dataKey="key" tick={{ fill: "#a3a3a3" }} />
//               <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Share"]} />
//               <Bar dataKey="TV" stackId="bud" fill="url(#gradTV)" radius={[8, 0, 0, 8]}>
//                 <LabelList dataKey="TV" position="insideLeft" formatter={(v) => `${v}% TV`} fill="#fff" />
//               </Bar>
//               <Bar dataKey="Movies" stackId="bud" fill="url(#gradMOV)" radius={[0, 8, 8, 0]}>
//                 <LabelList dataKey="Movies" position="insideRight" formatter={(v) => `${v}% Movies`} fill="#fff" />
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </div>

//         {/* Audience donut (labels inside) */}
//         <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
//           <div className="mb-2 flex items-center gap-2 text-neutral-200">
//             <Users size={18} className="text-amber-400" />
//             <h4 className="font-semibold">Audience Composition</h4>
//           </div>
//           <ResponsiveContainer width="100%" height={220}>
//             <PieChart>
//               <Pie
//                 data={mix}
//                 dataKey="value"
//                 nameKey="name"
//                 innerRadius={60}
//                 outerRadius={90}
//                 startAngle={90}
//                 endAngle={-270}
//                 label={insideLabel}
//                 labelLine={false}
//               >
//                 <Cell fill={FAMILY_COLOR} stroke="transparent" />
//                 <Cell fill={MATURE_COLOR} stroke="transparent" />
//               </Pie>
//               <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${Number(v).toFixed(1)}%`, n]} />
//               <Legend verticalAlign="bottom" height={24} />
//             </PieChart>
//           </ResponsiveContainer>
//           {/* Center KPI */}
//           <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
//             <div className="text-center">
//               <div className="text-xs uppercase tracking-wide text-neutral-400">Family/Kids</div>
//               <div className="text-2xl font-bold text-amber-400">{familyPct.toFixed(1)}%</div>
//             </div>
//           </div>
//         </div>

//         {/* Freshness gauge (always visible) */}
//         <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
//           <div className="mb-2 flex items-center gap-2 text-neutral-200">
//             <Gauge size={18} className="text-emerald-400" />
//             <h4 className="font-semibold">Freshness (Higher is Better)</h4>
//           </div>
//           <ResponsiveContainer width="100%" height={220}>
//             <RadialBarChart
//               data={gaugeData}
//               innerRadius="60%"
//               outerRadius="100%"
//               startAngle={225}
//               endAngle={-45}
//             >
//               <RadialBar dataKey="value" clockWise cornerRadius={20} />
//               <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Freshness"]} />
//             </RadialBarChart>
//           </ResponsiveContainer>
//           <div className="mt-[-36px] text-center text-lg font-semibold text-emerald-400">
//             {freshness.toFixed(0)}%
//           </div>
//         </div>
//       </div>

//       {/* Dynamic Strategic Insight (Aceternity Typewriter) */}
//       <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
//         <div className="mb-3 flex items-center justify-center gap-2">
//           <Sparkles size={20} className="text-red-400" />
//           <h4 className="text-neutral-200">Dynamic Strategic Insight</h4>
//         </div>
//         <div className="text-center">
//           <TypewriterEffect
//             words={words}
//             className="!text-3xl md:!text-5xl font-extrabold"
//             cursorClassName="!bg-red-500"
//           />
//           <p className="mx-auto mt-5 max-w-3xl text-lg text-neutral-300">{longInsight}</p>
//         </div>
//       </div>

//       {/* Fixed Recommendations (restored) */}
//       <div className="mt-6 grid gap-4 md:grid-cols-2">
//         {[
//           {
//             title: "Maintain 0.0-Year Median Age for TV Shows (Defense Core)",
//             desc: "Retention depends on fresh originals; any deviation >0.5 yrs triggers budget review.",
//           },
//           {
//             title: "Cap Movie Median Age ≤ 2 Years",
//             desc: "Improves perceived freshness and competitive quality without overspending on day-one releases.",
//           },
//           {
//             title: "Raise Family/Kids Content to ≥ 35%",
//             desc: "Closes the household gap and reduces Disney+ risk by expanding multi-viewer appeal.",
//           },
//           {
//             title: "Reinforce Global Hubs (India, SK, Germany)",
//             desc: "Ensures steady supply of original content and regional diversification beyond the US market.",
//           },
//         ].map((rec, i) => (
//           <motion.div key={i} whileHover={{ scale: 1.02 }} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
//             <div className="font-semibold">✅ Recommendation {i + 1}:</div>
//             <div className="text-neutral-200">{rec.title}</div>
//             <div className="text-sm text-neutral-400">{rec.desc}</div>
//           </motion.div>
//         ))}
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  LabelList,
  Legend,
} from "recharts";
import { SquareCheckBig } from 'lucide-react';
import { motion } from "framer-motion";
import { TypewriterEffect } from "@/components/ui/typewriter-effect";
import { Tv, Film, Gauge, Users, Target, Sparkles } from "lucide-react";

/* ---- Brand palette ---- */
const TV_COLOR = "#7C3AED";      // TV / defense
const MOVIE_COLOR = "#E50914";   // Movies / acquisition
const FAMILY_COLOR = "#F59E0B";  // amber
const MATURE_COLOR = "#EF4444";  // soft red
const RAD = Math.PI / 180;

export default function StrategicRecommendations({
  className = "",
  onInsightChange,
  initialFamilyPct = 13.6,
  initialTvBudget = 60,
  initialMovieAge = 3.0,
}) {
  // avoid hydration glitches with charts on Next.js
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  /* -------------------- Controls -------------------- */
  const [familyPct, setFamilyPct] = useState(initialFamilyPct);
  const [tvBudget, setTvBudget] = useState(initialTvBudget);
  const [movieAge, setMovieAge] = useState(initialMovieAge);
  const movieBudget = 100 - tvBudget;

  // Freshness ∈ [0,100], higher is better (younger movies)
  const freshness = useMemo(
    () => Math.max(0, Math.min(100, 100 - (movieAge - 0.5) * 25)),
    [movieAge]
  );

  /* -------------------- Chart Data ------------------- */
  const budgetRow = useMemo(
    () => [{ key: "Budget Split", TV: tvBudget, Movies: movieBudget }],
    [tvBudget, movieBudget]
  );

    // const [twKey, setTwKey] = useState(0);
    // const twSignature = useMemo(
    // () => `${insightId}|${Number(familyPct).toFixed(1)}|${tvBudget}|${Number(movieAge).toFixed(1)}`,
    // [insightId, familyPct, tvBudget, movieAge]
    // );
    // useEffect(() => {
    // const id = setTimeout(() => setTwKey(k => k + 1), 150); // debounce
    // return () => clearTimeout(id);
    // }, [twSignature]);

  const mix = useMemo(
    () => [
      { name: "Family/Kids", value: Number(familyPct.toFixed(1)) },
      { name: "Mature/Teen", value: Number((100 - familyPct).toFixed(1)) },
    ],
    [familyPct]
  );

  // Freshness gauge: two segments => always renders
  const gaugeData = useMemo(
    () => [
      { name: "Freshness", value: Number(freshness.toFixed(1)), fill: "#10B981" },
      { name: "Remainder", value: 100 - Number(freshness.toFixed(1)), fill: "#262626" },
    ],
    [freshness]
  );

  /* -------------------- Dynamic Insight Rules -------------------- */
  // Policy thresholds (from your strategy doc):
  const FAMILY_FLOOR = 35;   // % of volume
  const MOVIE_AGE_CAP = 2.0; // years
  const TV_DEFENSE_MIN = 55; // % budget to keep TV as "defense"
  const TV_DEFENSE_MAX = 70; // soft upper band before movies get starved

  const needFamily = familyPct < FAMILY_FLOOR;
  const needYoungerMovies = movieAge > MOVIE_AGE_CAP;
  const tvTooLow = tvBudget < TV_DEFENSE_MIN;
  const tvTooHigh = tvBudget > TV_DEFENSE_MAX;

  const familyDelta = Math.max(0, FAMILY_FLOOR - familyPct).toFixed(1);
  const movieAgeDelta = Math.max(0, movieAge - MOVIE_AGE_CAP).toFixed(1);
  const tvRaise = Math.max(0, TV_DEFENSE_MIN - tvBudget).toFixed(0);
  const tvTrim = Math.max(0, tvBudget - TV_DEFENSE_MAX).toFixed(0);

//   // Pick the highest-priority rule combination and generate both:
//   // - a big Typewriter line (words[])
//   // - a longInsight paragraph
//   const { words, longInsight, punchline, insightId } = useMemo(() => {
//     // 1) Major red flag: family low + movies old
//     if (needFamily && needYoungerMovies) {
//       return {
//         words: [
//           { text: "Close", className: "text-white" },
//           { text: "Family", className: "text-amber-400" },
//           { text: "gap", className: "text-white" },
//           { text: `+${familyDelta}%`, className: "text-green-400" },
//           { text: "and", className: "text-white" },
//           { text: "cut", className: "text-white" },
//           { text: "Movie", className: "text-red-400" },
//           { text: "age", className: "text-white" },
//           { text: `-${movieAgeDelta}y`, className: "text-green-400" },
//           { text: "now.", className: "text-white" },
//         ],
//         longInsight:
//           `Two critical weaknesses detected: Family/Kids below ${FAMILY_FLOOR}% and Movies older than ${MOVIE_AGE_CAP}y. ` +
//           `Shift budget toward Family/Kids by ~${familyDelta}% of mix and reallocate movie spend from catalog to fresher titles ` +
//           `(reduce median by ~${movieAgeDelta}y). Keep TV defense intact to protect retention.`,
//         punchline: "Family and Movie-age risks — rebalance immediately.",
//         insightId: "FAMILY+AGE",
//       };
//     }

//     // 2) Family gap only
//     if (needFamily) {
//       return {
//         words: [
//           { text: "Raise", className: "text-white" },
//           { text: "Family/Kids", className: "text-amber-400" },
//           { text: "share", className: "text-white" },
//           { text: `+${familyDelta}%`, className: "text-green-400" },
//           { text: "to", className: "text-white" },
//           { text: `${FAMILY_FLOOR}%`, className: "text-green-400" },
//           { text: "floor.", className: "text-white" },
//         ],
//         longInsight:
//           `Household segment underweight at ${familyPct.toFixed(1)}%. Move toward a ≥ ${FAMILY_FLOOR}% floor; ` +
//           `prioritize TV-Y7/PG franchises to boost multi-viewer value while holding TV defense steady.`,
//         punchline: "Family/Kids below target — increase volume.",
//         insightId: "FAMILY",
//       };
//     }

//     // 3) Movies too old only
//     if (needYoungerMovies) {
//       return {
//         words: [
//           { text: "Cap", className: "text-white" },
//           { text: "Movies", className: "text-red-400" },
//           { text: "at", className: "text-white" },
//           { text: `${MOVIE_AGE_CAP}y`, className: "text-green-400" },
//           { text: "median.", className: "text-white" },
//         ],
//         longInsight:
//           `Movie median age is ${movieAge.toFixed(1)}y. Tighten the cap to ≤ ${MOVIE_AGE_CAP}y by shifting acquisition ` +
//           `from back-catalog to fresher releases and originals. Improves perceived library quality without day-one overspend.`,
//         punchline: "Movie library feels old — tighten age cap.",
//         insightId: "AGE",
//       };
//     }

//     // 4) TV budget too low (retention risk)
//     if (tvTooLow) {
//       return {
//         words: [
//           { text: "Lift", className: "text-white" },
//           { text: "TV", className: "text-purple-400" },
//           { text: "defense", className: "text-white" },
//           { text: `+${tvRaise}%`, className: "text-green-400" },
//           { text: "to", className: "text-white" },
//           { text: `${TV_DEFENSE_MIN}%`, className: "text-green-400" },
//           { text: "share.", className: "text-white" },
//         ],
//         longInsight:
//           `TV budget at ${tvBudget}% risks the 0.0-year freshness advantage. Increase TV to ≥ ${TV_DEFENSE_MIN}% ` +
//           `and fund exclusive originals; continue Family/Kids scaling from the movie side.`,
//         punchline: "TV defense underfunded — raise share.",
//         insightId: "TVLOW",
//       };
//     }

//     // 5) TV budget too high (movies starved)
//     if (tvTooHigh) {
//       return {
//         words: [
//           { text: "Rebalance:", className: "text-white" },
//           { text: "trim", className: "text-white" },
//           { text: "TV", className: "text-purple-400" },
//           { text: `-${tvTrim}%`, className: "text-amber-400" },
//           { text: "to", className: "text-white" },
//           { text: `${TV_DEFENSE_MAX}%`, className: "text-green-400" },
//           { text: "and", className: "text-white" },
//           { text: "fuel", className: "text-white" },
//           { text: "Movies.", className: "text-red-400" },
//         ],
//         longInsight:
//           `TV share at ${tvBudget}% looks overweight. Keep the defense strong but reallocate ~${tvTrim}% to Movies ` +
//           `to accelerate acquisition while holding the ≤ ${MOVIE_AGE_CAP}y cap.`,
//         punchline: "TV overweight — give Movies more fuel.",
//         insightId: "TVHIGH",
//       };
//     }

//     // 6) All green
//     return {
//       words: [
//         { text: "Stay", className: "text-white" },
//         { text: "the", className: "text-white" },
//         { text: "course:", className: "text-white" },
//         { text: "TV", className: "text-purple-400" },
//         { text: "0.0y", className: "text-green-400" },
//         { text: "•", className: "text-neutral-400" },
//         { text: "Movies", className: "text-red-400" },
//         { text: "≤2y", className: "text-green-400" },
//         { text: "•", className: "text-neutral-400" },
//         { text: "Family", className: "text-amber-400" },
//         { text: "≥35%", className: "text-green-400" },
//       ],
//       longInsight:
//         "Portfolio is balanced for growth and retention. Keep TV as the defense engine, enforce the movie age cap, " +
//         "and maintain the Family/Kids floor to secure households.",
//       punchline: "All green — maintain discipline.",
//       insightId: "OK",
//     };
//   }, [
//     needFamily,
//     needYoungerMovies,
//     tvTooLow,
//     tvTooHigh,
//     familyDelta,
//     movieAgeDelta,
//     tvRaise,
//     tvTrim,
//     familyPct,
//     movieAge,
//     tvBudget,
//   ]);

//   useEffect(() => {
//     onInsightChange?.(
//       `${punchline} • Freshness ≈ ${freshness.toFixed(
//         0
//       )}% • TV ${tvBudget}% / Movies ${movieBudget}% • Family ${familyPct.toFixed(1)}%`
//     );
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [punchline, freshness, tvBudget, movieBudget, familyPct]);

    /* -------------------- Dynamic Insight (simplified) -------------------- */
    // thresholds are already defined above (FAMILY_FLOOR, MOVIE_AGE_CAP, TV_DEFENSE_MIN, TV_DEFENSE_MAX)
    // and these booleans/deltas are also already defined: needFamily, needYoungerMovies, tvTooLow, tvTooHigh,
    // familyDelta, movieAgeDelta, tvRaise, tvTrim

    // 1) Choose a simple rule key (priority order)
    const ruleKey = useMemo(() => {
    if (needFamily && needYoungerMovies) return "FAMILY+AGE";
    if (needFamily) return "FAMILY";
    if (needYoungerMovies) return "AGE";
    if (tvTooLow) return "TVLOW";
    if (tvTooHigh) return "TVHIGH";
    return "OK";
    }, [needFamily, needYoungerMovies, tvTooLow, tvTooHigh]);

    // 2) Words for Aceternity Typewriter (list only)
    const words = useMemo(() => {
    switch (ruleKey) {
        case "FAMILY+AGE":
        return [
            { text: "Close", className: "text-white" },
            { text: "Family", className: "text-amber-400" },
            { text: "gap", className: "text-white" },
            { text: "by", className: "text-white" },
            { text: `+${familyDelta}%`, className: "text-green-400" },
            { text: "and", className: "text-white" },
            { text: "cut", className: "text-white" },
            { text: "Movie", className: "text-red-400" },
            { text: "Age", className: "text-white" },
            { text: "by", className: "text-white" },
            { text: `-${movieAgeDelta}y`, className: "text-green-400" },
        ];
        case "FAMILY":
        return [
            { text: "Raise ", className: "text-white" },
            { text: "Family/Kids", className: "text-amber-400" },
            { text: "share", className: "text-white" },
            { text: "by", className: "text-white" },
            { text: `+${familyDelta}%`, className: "text-green-400" },
            { text: "to", className: "text-white" },
            { text: "35%", className: "text-green-400" },
        ];
        case "AGE":
        return [
            { text: "Cap ", className: "text-white" },
            { text: "Movie", className: "text-red-400" },
            { text: "Median", className: "text-white" },
            { text: "Age", className: "text-white" },
            { text: "at", className: "text-white" },
            { text: "2y", className: "text-green-400" },
        ];
        case "TVLOW":
        return [
            { text: "Lift", className: "text-white" },
            { text: "TV", className: "text-purple-400" },
            { text: "defense", className: "text-white" },
            { text: "by", className: "text-white" },
            { text: `+${tvRaise}%`, className: "text-green-400" },
            { text: "to", className: "text-white" },
            { text: "55%", className: "text-green-400" },
            { text: "share.", className: "text-white" },
        ];
        case "TVHIGH":
        return [
            { text: "Rebalance:", className: "text-white" },
            { text: "trim", className: "text-white" },
            { text: "TV", className: "text-purple-400" },
            { text: "by", className: "text-white" },
            { text: `-${tvTrim}%`, className: "text-amber-400" },
            { text: "to", className: "text-white" },
            { text: "70%", className: "text-green-400" },
            { text: "and", className: "text-white" },
            { text: "fuel", className: "text-white" },
            { text: "Movies.", className: "text-red-400" },
        ];
        default: // "OK"
        return [
            { text: "Stay", className: "text-white" },
            { text: "the", className: "text-white" },
            { text: "course:", className: "text-white" },
            { text: "TV", className: "text-purple-400" },
            { text: "0.0y", className: "text-green-400" },
            { text: "•", className: "text-neutral-400" },
            { text: "Movies", className: "text-red-400" },
            { text: "≤2y", className: "text-green-400" },
            { text: "•", className: "text-neutral-400" },
            { text: "Family", className: "text-amber-400" },
            { text: "≥35%", className: "text-green-400" },
        ];
    }
    }, [ruleKey, familyDelta, movieAgeDelta, tvRaise, tvTrim]);

    // 3) Long paragraph + punchline as plain strings
    const longInsight = useMemo(() => {
    switch (ruleKey) {
        case "FAMILY+AGE":
        return `Two critical weaknesses detected: Family/Kids below ${FAMILY_FLOOR}% and Movies older than ${MOVIE_AGE_CAP}y. Shift budget toward Family/Kids by ~${familyDelta}% of mix and reallocate movie spend from catalog to fresher titles (reduce median by ~${movieAgeDelta}y). Keep TV defense intact to protect retention.`;
        case "FAMILY":
        return `Household segment underweight at ${familyPct.toFixed(1)}%. Move toward a ≥ ${FAMILY_FLOOR}% floor; ` +
                `prioritize TV-Y7/PG franchises to boost multi-viewer value while holding TV defense steady.`;
        case "AGE":
        return `Movie median age is ${movieAge.toFixed(1)}y. Tighten the cap to ≤ ${MOVIE_AGE_CAP}y by shifting acquisition ` +
                `from back-catalog to fresher releases and originals. Improves perceived library quality without day-one overspend.`;
        case "TVLOW":
        return `TV budget at ${tvBudget}% risks the 0.0-year freshness advantage. Increase TV to ≥ ${TV_DEFENSE_MIN}% ` +
                `and fund exclusive originals; continue Family/Kids scaling from the movie side.`;
        case "TVHIGH":
        return `TV share at ${tvBudget}% looks overweight. Keep the defense strong but reallocate ~${tvTrim}% to Movies ` +
                `to accelerate acquisition while holding the ≤ ${MOVIE_AGE_CAP}y cap.`;
        default:
        return "Portfolio is balanced for growth and retention. Keep TV as the defense engine, enforce the movie age cap, " +
                "and maintain the Family/Kids floor to secure households.";
    }
    }, [ruleKey, familyPct, movieAge, tvBudget, familyDelta, movieAgeDelta, tvTrim]);

    const punchline = useMemo(() => {
    switch (ruleKey) {
        case "FAMILY+AGE": return "Family and Movie-age risks — rebalance immediately.";
        case "FAMILY":     return "Family/Kids below target — increase volume.";
        case "AGE":        return "Movie library feels old — tighten age cap.";
        case "TVLOW":      return "TV defense underfunded — raise share.";
        case "TVHIGH":     return "TV overweight — give Movies more fuel.";
        default:           return "All green — maintain discipline.";
    }
    }, [ruleKey]);

    // 4) Typewriter restart (force remount) — NO dicts, just ruleKey + sliders
    const [twKey, setTwKey] = useState(0);
    const twSignature = `${ruleKey}|${Number(familyPct).toFixed(1)}|${tvBudget}|${Number(movieAge).toFixed(1)}`;
    useEffect(() => {
    const id = setTimeout(() => setTwKey(k => k + 1), 150);
    return () => clearTimeout(id);
    }, [twSignature]);

    // 5) Notify parent on change
    useEffect(() => {
    onInsightChange?.(
        `${punchline} • Freshness ≈ ${freshness.toFixed(0)}% • TV ${tvBudget}% / Movies ${movieBudget}% • Family ${familyPct.toFixed(1)}%`
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [punchline, freshness, tvBudget, movieBudget, familyPct]);

  /* -------------------- Helpers --------------------- */
  const tooltipStyle = { background: "#111", border: "1px solid #333", color: "#fff" };
  const insideLabel = (props) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
    if (percent < 0.12) return null; // avoid clutter on tiny slices
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text x={x} y={y} fill="#fff" fontSize={12} textAnchor="middle" dominantBaseline="central">
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

    const typedWords = useMemo(
        () =>
            words.map((w, i) => ({
            ...w,
            // use " " for normal wrapping; use "\u00A0" for no-wrap
            text: i < words.length - 1 ? `${w.text} ` : w.text,
            })),
        [words]
    );

  if (!mounted) {
    return (
      <div className={`w-full rounded-2xl border border-neutral-800 bg-neutral-950 p-6 ${className}`}>
        <div className="h-8 w-64 animate-pulse rounded bg-neutral-800" />
        <div className="mt-4 grid gap-6 md:grid-cols-3">
          <div className="h-32 animate-pulse rounded-xl bg-neutral-900" />
          <div className="h-32 animate-pulse rounded-xl bg-neutral-900" />
          <div className="h-32 animate-pulse rounded-xl bg-neutral-900" />
        </div>
      </div>
    );
  }

  /* ------------------------ UI ---------------------- */
  return (
    <div
      className={`w-full rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/70 via-black to-neutral-950 p-6 text-white ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
            Strategic Recommendations Simulator
          </h3>
          <p className="text-neutral-400">Tune the levers and watch the strategy adapt in real time.</p>
        </div>
        <div className="hidden sm:flex gap-2 text-neutral-300">
          <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-1.5">
            <Tv size={16} className="text-purple-400" /> TV (Defense)
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-1.5">
            <Film size={16} className="text-red-500" /> Movies (Acquisition)
          </span>
          <span className="inline-flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900/70 px-3 py-1.5">
            <Users size={16} className="text-amber-400" /> Family Priority
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <label className="mb-2 block text-sm font-semibold text-neutral-300">TV Budget Share (%)</label>
          <input
            type="range"
            min="20"
            max="80"
            value={tvBudget}
            onChange={(e) => setTvBudget(parseInt(e.target.value, 10))}
            className="w-full accent-red-600"
          />
          <div className="mt-1 text-sm text-neutral-300">
            {tvBudget}% TV / {movieBudget}% Movies
          </div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <label className="mb-2 block text-sm font-semibold text-neutral-300">Family Content Share (%)</label>
          <input
            type="range"
            min="10"
            max="50"
            step="0.1"
            value={familyPct}
            onChange={(e) => setFamilyPct(parseFloat(e.target.value))}
            className="w-full accent-red-600"
          />
          <div className="mt-1 text-sm text-neutral-300">{familyPct.toFixed(1)}%</div>
        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <label className="mb-2 block text-sm font-semibold text-neutral-300">Movie Median Age (yrs)</label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={movieAge}
            onChange={(e) => setMovieAge(parseFloat(e.target.value))}
            className="w-full accent-red-600"
          />
          <div className="mt-1 text-sm text-neutral-300">{movieAge.toFixed(1)} years</div>
        </div>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Budget: stacked horizontal */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-neutral-200">
            <Target size={18} className="text-red-400" />
            <h4 className="font-semibold">Budget Distribution</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={budgetRow} layout="vertical" margin={{ top: 10, right: 16, left: 8, bottom: 8 }}>
              <defs>
                <linearGradient id="gradTV" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor={TV_COLOR} stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#9F67FF" stopOpacity={0.95} />
                </linearGradient>
                <linearGradient id="gradMOV" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor={MOVIE_COLOR} stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#FF6B6B" stopOpacity={0.95} />
                </linearGradient>
              </defs>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "#a3a3a3" }} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="key" tick={{ fill: "#a3a3a3" }} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Share"]} />
              <Bar dataKey="TV" stackId="bud" fill="url(#gradTV)" radius={[8, 0, 0, 8]}>
                <LabelList dataKey="TV" position="insideLeft" formatter={(v) => `${v}% TV`} fill="#fff" />
              </Bar>
              <Bar dataKey="Movies" stackId="bud" fill="url(#gradMOV)" radius={[0, 8, 8, 0]}>
                <LabelList dataKey="Movies" position="insideRight" formatter={(v) => `${v}% Movies`} fill="#fff" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audience donut */}
        <div className="relative rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-neutral-200">
            <Users size={18} className="text-amber-400" />
            <h4 className="font-semibold">Audience Composition</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={mix}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                startAngle={90}
                endAngle={-270}
                label={insideLabel}
                labelLine={false}
              >
                <Cell fill={FAMILY_COLOR} stroke="transparent" />
                <Cell fill={MATURE_COLOR} stroke="transparent" />
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v, n) => [`${Number(v).toFixed(1)}%`, n]} />
              <Legend verticalAlign="bottom" height={24} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center KPI */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xs uppercase tracking-wide text-neutral-400">Family/Kids</div>
              <div className="text-2xl font-bold text-amber-400">{familyPct.toFixed(1)}%</div>
            </div>
          </div>
        </div>

        {/* Freshness gauge */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
          <div className="mb-2 flex items-center gap-2 text-neutral-200">
            <Gauge size={18} className="text-emerald-400" />
            <h4 className="font-semibold">Freshness (Higher is Better)</h4>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <RadialBarChart data={gaugeData} innerRadius="60%" outerRadius="100%" startAngle={225} endAngle={-45}>
              <RadialBar dataKey="value" clockWise cornerRadius={20} />
              <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v}%`, "Freshness"]} />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="mt-[-36px] text-center text-lg font-semibold text-emerald-400">
            {freshness.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Dynamic Strategic Insight */}
      <div className="mt-8 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <div className="mb-3 flex items-center justify-center gap-2">
          <Sparkles size={20} className="text-red-400" />
          <h4 className="text-neutral-200">Dynamic Strategic Insight</h4>
        </div>
        <div className="text-center">
          <TypewriterEffect key={twKey} words={words} className="!text-3xl md:!text-5xl font-extrabold" cursorClassName="!bg-red-500" />
          <p className="mx-auto mt-5 max-w-3xl text-lg text-neutral-300">{longInsight}</p>
        </div>
      </div>

      {/* Fixed Recommendations (kept) */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {[
          {
            title: "Maintain 0.0-Year Median Age for TV Shows (Defense Core)",
            desc: "Retention depends on fresh originals and any deviation >0.5 yrs triggers budget review.",
          },
          {
            title: "Cap Movie Median Age ≤ 2 Years",
            desc: "Improves perceived freshness and competitive quality without overspending on day-one releases.",
          },
          {
            title: "Raise Family/Kids Content to ≥ 35%",
            desc: "Closes the household gap and reduces Disney+ risk by expanding multi-viewer appeal.",
          },
          {
            title: "Reinforce Global Hubs (India, SK, Germany)",
            desc: "Ensures steady supply of original content and regional diversification beyond the US market.",
          },
        ].map((rec, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.02 }}
            className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4"
          >
            <div className="font-semibold text-emerald-400"><SquareCheckBig className="text-emerald-400"/> Recommendation {i + 1}:</div>
            <div className="text-neutral-200">{rec.title}</div>
            <div className="text-sm text-neutral-400">{rec.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
