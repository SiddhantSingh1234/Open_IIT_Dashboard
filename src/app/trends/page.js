// "use client";

// import React, { useEffect, useMemo, useRef, useState } from "react";
// import {
//   ChevronLeft, ChevronRight, BarChart3, RefreshCw,
// } from "lucide-react";
// import {
//   ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
// } from "recharts";

// /* --------------------------- DATA (you gave) --------------------------- */
// // 1) Content additions per year
// const ADDITIONS_RAW = [
//   { add_year: 2008, type: "Movie", count: 1 },
//   { add_year: 2008, type: "TV Show", count: 1 },
//   { add_year: 2009, type: "Movie", count: 2 },
//   { add_year: 2010, type: "Movie", count: 1 },
//   { add_year: 2011, type: "Movie", count: 13 },
//   { add_year: 2012, type: "Movie", count: 3 },
//   { add_year: 2013, type: "Movie", count: 6 },
//   { add_year: 2013, type: "TV Show", count: 4 },
//   { add_year: 2014, type: "Movie", count: 19 },
//   { add_year: 2014, type: "TV Show", count: 4 },
//   { add_year: 2015, type: "Movie", count: 56 },
//   { add_year: 2015, type: "TV Show", count: 17 },
//   { add_year: 2016, type: "Movie", count: 253 },
//   { add_year: 2016, type: "TV Show", count: 165 },
//   { add_year: 2017, type: "Movie", count: 839 },
//   { add_year: 2017, type: "TV Show", count: 325 },
//   { add_year: 2018, type: "Movie", count: 1237 },
//   { add_year: 2018, type: "TV Show", count: 388 },
//   { add_year: 2019, type: "Movie", count: 1424 },
//   { add_year: 2019, type: "TV Show", count: 575 },
//   { add_year: 2020, type: "Movie", count: 1284 },
//   { add_year: 2020, type: "TV Show", count: 594 },
//   { add_year: 2021, type: "Movie", count: 993 },
//   { add_year: 2021, type: "TV Show", count: 505 },
// ];

// // 2) Median age (years) of content added
// const MEDIAN_AGE = [
//   { year: 2008, movie: 2.0, tv: 1.0 },
//   { year: 2013, movie: 0.0, tv: 0.0 },
//   { year: 2014, movie: 0.0, tv: 1.5 },
//   { year: 2015, movie: 0.0, tv: 1.0 },
//   { year: 2016, movie: 0.0, tv: 2.0 },
//   { year: 2017, movie: 1.0, tv: 1.0 },
//   { year: 2018, movie: 2.0, tv: 0.0 },
//   { year: 2019, movie: 2.0, tv: 0.0 },
//   { year: 2020, movie: 2.0, tv: 0.0 },
//   { year: 2021, movie: 3.0, tv: 0.0 },
// ];

// /* -------------------- DATA (approx for the other 2) -------------------- */
// // 3) Avg seasons by release year (2000–2021) – approximated from your chart
// const AVG_SEASONS = [
//   { year: 2000, seasons: 3.7 }, { year: 2001, seasons: 1.4 }, { year: 2002, seasons: 2.6 },
//   { year: 2003, seasons: 4.0 }, { year: 2004, seasons: 1.45 }, { year: 2005, seasons: 2.47 },
//   { year: 2006, seasons: 3.35 }, { year: 2007, seasons: 2.5 }, { year: 2008, seasons: 1.3 },
//   { year: 2009, seasons: 1.2 }, { year: 2010, seasons: 1.6 }, { year: 2011, seasons: 1.3 },
//   { year: 2012, seasons: 1.8 }, { year: 2013, seasons: 1.6 }, { year: 2014, seasons: 1.5 },
//   { year: 2015, seasons: 1.7 }, { year: 2016, seasons: 1.55 }, { year: 2017, seasons: 1.75 },
//   { year: 2018, seasons: 1.65 }, { year: 2019, seasons: 1.85 }, { year: 2020, seasons: 1.7 },
//   { year: 2021, seasons: 1.7 },
// ];

// // 4) Avg movie runtime (1960–2019) – plausible smooth series + 10-yr rolling
// const AVG_RUNTIME = (() => {
//   const arr = [];
//   for (let y = 1960; y <= 2019; y++) {
//     // ~100 mins baseline with gentle oscillation & slight dip post-2010
//     const base = 101 + 1.6 * Math.sin((y - 1960) / 2.2);
//     const dip = y >= 2010 ? -0.15 * (y - 2010) : 0;
//     const val = Math.max(96, Math.min(106, base + dip));
//     arr.push({ year: y, runtime: Number(val.toFixed(2)) });
//   }
//   return arr;
// })();

// /* ------------------------ UTIL: Regression & build ------------------------ */
// function linearFit(points /* array of {x, y} */) {
//   const n = points.length;
//   if (n < 2) {
//     const y = n ? points[0].y : 0;
//     return { a: 0, b: y }; // flat
//   }
//   let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
//   for (const p of points) {
//     sumX += p.x; sumY += p.y; sumXY += p.x * p.y; sumXX += p.x * p.x;
//   }
//   const denom = n * sumXX - sumX * sumX;
//   const a = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom; // slope
//   const b = (sumY - a * sumX) / n; // intercept
//   return { a, b };
// }

// function project(nextYears /* number[] */, fit) {
//   return nextYears.map((x) => Math.max(0, fit.a * x + fit.b));
// }

// // Build unified dataset + dashed projection keys
// function buildDualSeriesWithProjection(pointsA /* {x, y}[] */, pointsB, labelA, labelB, horizon = 3) {
//   const minYear = Math.min(pointsA[0]?.x ?? Infinity, pointsB[0]?.x ?? Infinity);
//   const lastYear = Math.max(pointsA[pointsA.length - 1]?.x ?? -Infinity, pointsB[pointsB.length - 1]?.x ?? -Infinity);
//   const years = [];
//   for (let y = minYear; y <= lastYear + horizon; y++) years.push(y);

//   const mapA = new Map(pointsA.map(p => [p.x, p.y]));
//   const mapB = new Map(pointsB.map(p => [p.x, p.y]));

//   const fitA = linearFit(pointsA);
//   const fitB = linearFit(pointsB);
//   const futYears = years.filter(y => y > lastYear);
//   const projA = project(futYears, fitA);
//   const projB = project(futYears, fitB);

//   const data = years.map((y) => {
//     const row = { year: y };
//     if (y <= lastYear) {
//       row[labelA] = mapA.get(y);
//       row[labelB] = mapB.get(y);
//     } else {
//       row[`${labelA}Proj`] = projA[futYears.indexOf(y)];
//       row[`${labelB}Proj`] = projB[futYears.indexOf(y)];
//     }
//     return row;
//   });
//   return data;
// }

// function buildSingleSeriesWithProjection(points /* {x, y}[] */, label, horizon = 3) {
//   const minYear = points[0].x;
//   const lastYear = points[points.length - 1].x;
//   const years = [];
//   for (let y = minYear; y <= lastYear + horizon; y++) years.push(y);

//   const map = new Map(points.map(p => [p.x, p.y]));
//   const fit = linearFit(points);
//   const futYears = years.filter(y => y > lastYear);
//   const proj = project(futYears, fit);

//   const data = years.map((y) => {
//     const row = { year: y };
//     if (y <= lastYear) row[label] = map.get(y);
//     else row[`${label}Proj`] = proj[futYears.indexOf(y)];
//     return row;
//   });
//   return data;
// }

// /* ---------------------------- PREPARED DATASETS ---------------------------- */
// // Graph 1: Additions per year
// const additionsMovies = Object.values(
//   ADDITIONS_RAW.filter(d => d.type === "Movie").reduce((acc, d) => {
//     acc[d.add_year] = acc[d.add_year] || { x: d.add_year, y: 0 };
//     acc[d.add_year].y += d.count; return acc;
//   }, {})
// ).sort((a, b) => a.x - b.x);
// const additionsTv = Object.values(
//   ADDITIONS_RAW.filter(d => d.type === "TV Show").reduce((acc, d) => {
//     acc[d.add_year] = acc[d.add_year] || { x: d.add_year, y: 0 };
//     acc[d.add_year].y += d.count; return acc;
//   }, {})
// ).sort((a, b) => a.x - b.x);
// const DATA_ADD = buildDualSeriesWithProjection(additionsMovies, additionsTv, "Movies", "TV Shows", 3);

// // Graph 2: Median age
// const medA = MEDIAN_AGE.map(d => ({ x: d.year, y: d.movie })).sort((a,b)=>a.x-b.x);
// const medB = MEDIAN_AGE.map(d => ({ x: d.year, y: d.tv })).sort((a,b)=>a.x-b.x);
// const DATA_AGE = buildDualSeriesWithProjection(medA, medB, "Movies", "TV Shows", 3);

// // Graph 3: Avg seasons (TV only)
// const DATA_SEASONS = buildSingleSeriesWithProjection(
//   AVG_SEASONS.map(d => ({ x: d.year, y: d.seasons })), "Avg Seasons", 3
// );

// // Graph 4: Avg runtime (movies) + 10-yr rolling + projection on main line
// function rollingAvg(series, window = 10) {
//   const ys = series.map(d => d.runtime);
//   return series.map((d, i) => {
//     const start = Math.max(0, i - window + 1);
//     const slice = ys.slice(start, i + 1);
//     const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
//     return { year: d.year, avg: Number(avg.toFixed(2)) };
//   });
// }
// const runtimePoints = AVG_RUNTIME.map(d => ({ x: d.year, y: d.runtime }));
// const DATA_RUNTIME = buildSingleSeriesWithProjection(runtimePoints, "Avg Runtime", 3);
// const ROLLING = rollingAvg(AVG_RUNTIME);

// /* -------------------------------- Carousel -------------------------------- */
// const SLIDES = [
//   {
//     title: "Netflix Catalog Growth: Content Additions Per Year",
//     subtitle: "Number of titles added (Movies vs TV Shows) with 3-year projection",
//     data: DATA_ADD,
//     render: (data) => (
//       <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
//         <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
//         <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} />
//         <YAxis tick={{ fill: "#a3a3a3" }} />
//         <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
//         <Legend />
//         <Line type="monotone" dataKey="Movies" stroke="#ef4444" strokeWidth={2} dot={false} />
//         <Line type="monotone" dataKey="TV Shows" stroke="#ffffff" strokeWidth={2} dot={false} />
//         <Line type="monotone" dataKey="MoviesProj" stroke="#ef4444" strokeDasharray="5 5" dot={false} />
//         <Line type="monotone" dataKey="TV ShowsProj" stroke="#ffffff" strokeDasharray="5 5" dot={false} />
//       </LineChart>
//     ),
//   },
//   {
//     title: "Strategic Shift: Median Age of Content Added (New vs Catalog)",
//     subtitle: "Median age (years) of content added, with 3-year projection",
//     data: DATA_AGE,
//     render: (data) => (
//       <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
//         <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
//         <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} />
//         <YAxis tick={{ fill: "#a3a3a3" }} />
//         <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
//         <Legend />
//         <Line type="monotone" dataKey="Movies" name="Movies (Median Age)" stroke="#ef4444" strokeWidth={2} dot />
//         <Line type="monotone" dataKey="TV Shows" name="TV Shows (Median Age)" stroke="#60a5fa" strokeWidth={2} dot />
//         <Line type="monotone" dataKey="MoviesProj" name="Movies (Projection)" stroke="#ef4444" strokeDasharray="5 5" dot={false}/>
//         <Line type="monotone" dataKey="TV ShowsProj" name="TV Shows (Projection)" stroke="#60a5fa" strokeDasharray="5 5" dot={false}/>
//       </LineChart>
//     ),
//   },
//   {
//     title: "Average Number of Seasons of TV Shows by Release Year",
//     subtitle: "2000–Present with 3-year projection",
//     data: DATA_SEASONS,
//     render: (data) => (
//       <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
//         <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
//         <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} />
//         <YAxis tick={{ fill: "#a3a3a3" }} />
//         <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
//         <Legend />
//         <Line type="monotone" dataKey="Avg Seasons" stroke="#ffffff" strokeWidth={2} dot />
//         <Line type="monotone" dataKey="Avg SeasonsProj" name="Projection" stroke="#ffffff" strokeDasharray="5 5" dot={false}/>
//       </LineChart>
//     ),
//   },
//   {
//     title: "Average Movie Runtime Over Time (with 10-Year Rolling Avg)",
//     subtitle: "1960–2019 with 3-year projection on main line",
//     // Merge runtime + rolling into one dataset by year
//     data: (() => {
//       const mapRolling = new Map(ROLLING.map(d => [d.year, d.avg]));
//       return DATA_RUNTIME.map(d => ({ ...d, Rolling: mapRolling.get(d.year) }));
//     })(),
//     render: (data) => (
//       <LineChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
//         <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
//         <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} />
//         <YAxis tick={{ fill: "#a3a3a3" }} />
//         <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
//         <Legend />
//         <Line type="monotone" dataKey="Avg Runtime" stroke="#60a5fa" strokeWidth={2} dot={false}/>
//         <Line type="monotone" dataKey="Rolling" name="10-yr Rolling Avg" stroke="#ef4444" strokeWidth={2} dot={false}/>
//         <Line type="monotone" dataKey="Avg RuntimeProj" name="Projection" stroke="#60a5fa" strokeDasharray="5 5" dot={false}/>
//       </LineChart>
//     ),
//   },
// ];

// /* -------------------------------- Component -------------------------------- */
// export default function TrendsCarousel() {
//   const [index, setIndex] = useState(0);
//   const wrapRef = useRef(null);

//   const next = () => setIndex((i) => (i + 1) % SLIDES.length);
//   const prev = () => setIndex((i) => (i - 1 + SLIDES.length) % SLIDES.length);

//   // keyboard accessibility
//   useEffect(() => {
//     const el = wrapRef.current;
//     if (!el) return;
//     const onKey = (e) => {
//       if (e.key === "ArrowRight") next();
//       if (e.key === "ArrowLeft") prev();
//     };
//     el.addEventListener("keydown", onKey);
//     return () => el.removeEventListener("keydown", onKey);
//   }, []);

//   return (
//     <div
//       ref={wrapRef}
//       tabIndex={0}
//       className="min-h-screen outline-none bg-gradient-to-br from-black via-neutral-900 to-black text-white"
//       aria-label="Trends carousel, use left and right arrow keys to navigate"
//     >
//       {/* Header */}
//       <div className="relative bg-gradient-to-br from-red-950/30 via-neutral-900/50 to-black border-b border-red-900/20">
//         <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
//           <div>
//             <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
//               Trends & Projections
//             </h1>
//             <p className="text-neutral-300">
//               Arrow-key accessible carousel with dynamic projections
//             </p>
//           </div>
//           <button
//             onClick={() => setIndex(0)}
//             className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition"
//             title="Reset to first slide"
//           >
//             <RefreshCw size={16} />
//             <span>Reset</span>
//           </button>
//         </div>
//       </div>

//       {/* Carousel */}
//       <div className="max-w-7xl mx-auto px-6 py-6">
//         <div className="relative">
//           {/* Slides track */}
//           <div
//             className="overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/70 to-neutral-800/70 shadow-xl shadow-red-600/10"
//           >
//             <div
//               className="whitespace-nowrap transition-transform duration-500 ease-out"
//               style={{ transform: `translateX(${-index * 100}%)` }}
//               aria-live="polite"
//             >
//               {SLIDES.map((s, i) => (
//                 <div key={i} className="inline-block align-top w-full">
//                   <div className="p-6">
//                     <div className="flex items-center gap-2 mb-2">
//                       <BarChart3 size={18} className="text-red-400" />
//                       <h2 className="text-xl font-semibold">{s.title}</h2>
//                     </div>
//                     <p className="text-neutral-400 mb-4">{s.subtitle}</p>
//                     <div className="h-[460px]">
//                       <ResponsiveContainer width="100%" height="100%">
//                         {s.render(s.data)}
//                       </ResponsiveContainer>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Nav buttons */}
//           <button
//             onClick={prev}
//             aria-label="Previous slide"
//             className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-red-600/50 shadow-md hover:shadow-red-600/20"
//           >
//             <ChevronLeft size={22} />
//           </button>
//           <button
//             onClick={next}
//             aria-label="Next slide"
//             className="absolute -right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-red-600/50 shadow-md hover:shadow-red-600/20"
//           >
//             <ChevronRight size={22} />
//           </button>

//           {/* Dots */}
//           <div className="mt-4 flex items-center justify-center gap-2">
//             {SLIDES.map((_, i) => (
//               <button
//                 key={i}
//                 onClick={() => setIndex(i)}
//                 aria-label={`Go to slide ${i + 1}`}
//                 className={`h-2.5 w-2.5 rounded-full transition-all ${
//                   i === index ? "bg-red-500 w-6" : "bg-neutral-600 hover:bg-neutral-500"
//                 }`}
//               />
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft, ChevronRight, BarChart3, RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LabelList
} from "recharts";

/* --------------------------- GIVEN / BASE DATA --------------------------- */
const ADDITIONS_RAW = [
  { add_year: 2008, type: "Movie", count: 1 }, { add_year: 2008, type: "TV Show", count: 1 },
  { add_year: 2009, type: "Movie", count: 2 }, { add_year: 2010, type: "Movie", count: 1 },
  { add_year: 2011, type: "Movie", count: 13 }, { add_year: 2012, type: "Movie", count: 3 },
  { add_year: 2013, type: "Movie", count: 6 }, { add_year: 2013, type: "TV Show", count: 4 },
  { add_year: 2014, type: "Movie", count: 19 }, { add_year: 2014, type: "TV Show", count: 4 },
  { add_year: 2015, type: "Movie", count: 56 }, { add_year: 2015, type: "TV Show", count: 17 },
  { add_year: 2016, type: "Movie", count: 253 }, { add_year: 2016, type: "TV Show", count: 165 },
  { add_year: 2017, type: "Movie", count: 839 }, { add_year: 2017, type: "TV Show", count: 325 },
  { add_year: 2018, type: "Movie", count: 1237 }, { add_year: 2018, type: "TV Show", count: 388 },
  { add_year: 2019, type: "Movie", count: 1424 }, { add_year: 2019, type: "TV Show", count: 575 },
  { add_year: 2020, type: "Movie", count: 1284 }, { add_year: 2020, type: "TV Show", count: 594 },
  { add_year: 2021, type: "Movie", count: 993 }, { add_year: 2021, type: "TV Show", count: 505 },
];

const MEDIAN_AGE = [
  { year: 2008, movie: 2.0, tv: 1.0 },
  { year: 2013, movie: 0.0, tv: 0.0 },
  { year: 2014, movie: 0.0, tv: 1.5 },
  { year: 2015, movie: 0.0, tv: 1.0 },
  { year: 2016, movie: 0.0, tv: 2.0 },
  { year: 2017, movie: 1.0, tv: 1.0 },
  { year: 2018, movie: 2.0, tv: 0.0 },
  { year: 2019, movie: 2.0, tv: 0.0 },
  { year: 2020, movie: 2.0, tv: 0.0 },
  { year: 2021, movie: 3.0, tv: 0.0 },
];

const RUNTIME_INPUT = [
  { year: 1960, runtime: 103.050000, rolling: null },
  { year: 1961, runtime: 101.145833, rolling: null },
  { year: 1962, runtime: 104.995370, rolling: null },
  { year: 1963, runtime: 101.316038, rolling: null },
  { year: 1964, runtime:  99.945833, rolling: null },
  { year: 1965, runtime: 103.614719, rolling: 101.795354 },
  { year: 1966, runtime: 100.875887, rolling: 101.408427 },
  { year: 1967, runtime:  99.832727, rolling: 101.140640 },
  { year: 1968, runtime: 100.980645, rolling: 100.582654 },
  { year: 1969, runtime: 102.196491, rolling: 100.362260 },
  { year: 1970, runtime:  99.180723, rolling: 100.233109 },
  { year: 1971, runtime:  98.467967, rolling: 100.343572 },
  { year: 1972, runtime:  99.415512, rolling: 100.298570 },
  { year: 1973, runtime:  99.112094, rolling: 100.491026 },
  { year: 1974, runtime:  98.654321, rolling: 100.474232 },
  { year: 1975, runtime: 104.719355, rolling: 100.845722 },
  { year: 1976, runtime: 100.425868, rolling: 101.493919 },
  { year: 1977, runtime: 101.757282, rolling: 101.944734 },
  { year: 1978, runtime: 100.812709, rolling: 102.113328 },
  { year: 1979, runtime: 105.911392, rolling: 102.423284 },
  { year: 1980, runtime: 105.662687, rolling: 102.742376 },
  { year: 1981, runtime: 102.976119, rolling: 102.139604 },
  { year: 1982, runtime: 101.101449, rolling: 101.973247 },
  { year: 1983, runtime: 102.211656, rolling: 101.645876 },
  { year: 1984, runtime: 101.845238, rolling: 101.603256 },
  { year: 1985, runtime:  98.691643, rolling: 101.067190 },
  { year: 1986, runtime:  98.762295, rolling: 100.546330 },
  { year: 1987, runtime:  98.483568, rolling: 100.471986 },
  { year: 1988, runtime: 100.386517, rolling: 100.684429 },
  { year: 1989, runtime: 100.550725, rolling: 100.833242 },
  { year: 1990, runtime: 100.454094, rolling: 100.695754 },
  { year: 1991, runtime: 102.232673, rolling: 101.031402 },
  { year: 1992, runtime: 103.225882, rolling: 101.336381 },
  { year: 1993, runtime: 103.699784, rolling: 101.754583 },
  { year: 1994, runtime: 100.470356, rolling: 101.724703 },
  { year: 1995, runtime: 102.048128, rolling: 101.888242 },
  { year: 1996, runtime: 101.812081, rolling: 102.014712 },
  { year: 1997, runtime: 102.665590, rolling: 101.978136 },
  { year: 1998, runtime: 100.087719, rolling: 101.864498 },
  { year: 1999, runtime: 102.186115, rolling: 101.600001 },
  { year: 2000, runtime: 101.718793, rolling: 101.743170 },
  { year: 2001, runtime: 101.866915, rolling: 101.686586 },
  { year: 2002, runtime: 102.089499, rolling: 101.558493 },
  { year: 2003, runtime: 101.054811, rolling: 101.154728 },
  { year: 2004, runtime: 101.902045, rolling: 101.075008 },
  { year: 2005, runtime: 101.482297, rolling: 100.734982 },
  { year: 2006, runtime: 100.531145, rolling: 100.426077 },
  { year: 2007, runtime:  98.627945, rolling: 100.102105 },
  { year: 2008, runtime:  99.290511, rolling:  99.621485 },
  { year: 2009, runtime:  98.785860, rolling:  99.252388 },
  { year: 2010, runtime:  98.629738, rolling:  98.870540 },
  { year: 2011, runtime:  98.627196, rolling:  98.423566 },
  { year: 2012, runtime:  97.283302, rolling:  98.162703 },
  { year: 2013, runtime:  97.363844, rolling:  98.226643 },
  { year: 2014, runtime:  98.083562, rolling:  98.797592 },
  { year: 2015, runtime:  97.012557, rolling: null },
  { year: 2016, runtime:  97.922512, rolling: null },
  { year: 2017, runtime:  99.267347, rolling: null },
  { year: 2018, runtime: 105.000000, rolling: null },
];

// Movies by audience category (absolute count)
const MOVIE_AUDIENCE_BY_YEAR = [
  { year: 2014, Mature: 9,   Teens: 5,   Family: 4,  Kids: 1  },
  { year: 2015, Mature: 27,  Teens: 13,  Family: 6,  Kids: 5  },
  { year: 2016, Mature: 128, Teens: 71,  Family: 7,  Kids: 18 },
  { year: 2017, Mature: 420, Teens: 317, Family: 37, Kids: 40 },
  { year: 2018, Mature: 585, Teens: 532, Family: 69, Kids: 37 },
  { year: 2019, Mature: 669, Teens: 591, Family: 112,Kids: 46 },
  { year: 2020, Mature: 570, Teens: 513, Family: 134,Kids: 67 },
  { year: 2021, Mature: 446, Teens: 404, Family: 82, Kids: 61 },
];

// TV Shows by audience category (absolute count)
const TV_AUDIENCE_BY_YEAR = [
  { year: 2014, Mature: 3,   Teens: 0,   Family: 1,  Kids: 0  },
  { year: 2015, Mature: 3,   Teens: 7,   Family: 2,  Kids: 5  },
  { year: 2016, Mature: 47,  Teens: 74,  Family: 7,  Kids: 36 },
  { year: 2017, Mature: 90,  Teens: 186, Family: 8,  Kids: 39 },
  { year: 2018, Mature: 186, Teens: 148, Family: 9,  Kids: 44 },
  { year: 2019, Mature: 269, Teens: 230, Family: 13, Kids: 63 },
  { year: 2020, Mature: 289, Teens: 193, Family: 22, Kids: 90 },
  { year: 2021, Mature: 233, Teens: 165, Family: 24, Kids: 83 },
];

// build chart rows with your rolling avg and a 3-year linear projection on main line
(() => {
  const pts = RUNTIME_INPUT.map(d => ({ x: d.year, y: d.runtime }));
  const n = pts.length;
  let sx=0, sy=0, sxy=0, sxx=0;
  pts.forEach(p => { sx+=p.x; sy+=p.y; sxy+=p.x*p.y; sxx+=p.x*p.x; });
  const denom = n * sxx - sx * sx;
  const a = denom === 0 ? 0 : (n * sxy - sx * sy) / denom; // slope
  const b = (sy - a * sx) / n;

  const lastYear = RUNTIME_INPUT[RUNTIME_INPUT.length - 1].year;
  const projYears = [lastYear + 1, lastYear + 2, lastYear + 3];

  // rows for actuals + rolling
  const base = RUNTIME_INPUT.map(d => ({
    year: d.year,
    "Avg Runtime": d.runtime,
    Rolling: d.rolling,
  }));

  // rows for projection
  const proj = projYears.map(y => ({
    year: y,
    "Avg RuntimeProj": Math.max(0, a * y + b),
  }));

  // exported dataset consumed by the slide below
  window.RUNTIME_JOINED = [...base, ...proj];
})();

const yearTicks = [];

/* Approximations for the other two charts (you can replace later) */
const AVG_SEASONS = [
  { year: 2000, seasons: 3.7 }, { year: 2001, seasons: 1.4 }, { year: 2002, seasons: 2.6 },
  { year: 2003, seasons: 4.0 }, { year: 2004, seasons: 1.45 }, { year: 2005, seasons: 2.47 },
  { year: 2006, seasons: 3.35 }, { year: 2007, seasons: 2.5 }, { year: 2008, seasons: 1.3 },
  { year: 2009, seasons: 1.2 }, { year: 2010, seasons: 1.6 }, { year: 2011, seasons: 1.3 },
  { year: 2012, seasons: 1.8 }, { year: 2013, seasons: 1.6 }, { year: 2014, seasons: 1.5 },
  { year: 2015, seasons: 1.7 }, { year: 2016, seasons: 1.55 }, { year: 2017, seasons: 1.75 },
  { year: 2018, seasons: 1.65 }, { year: 2019, seasons: 1.85 }, { year: 2020, seasons: 1.7 },
  { year: 2021, seasons: 1.7 },
];

const AVG_RUNTIME = (() => {
  const arr = [];
  for (let y = 1960; y <= 2019; y++) {
    const base = 101 + 1.6 * Math.sin((y - 1960) / 2.2);
    const dip = y >= 2010 ? -0.15 * (y - 2010) : 0;
    const val = Math.max(96, Math.min(106, base + dip));
    arr.push({ year: y, runtime: Number(val.toFixed(2)) });
  }
  return arr;
})();

/* ---------------------------- helpers / modeling ---------------------------- */
function linearFit(points) {
  const n = points.length;
  if (n < 2) return { a: 0, b: (points[0]?.y ?? 0) };
  let sx = 0, sy = 0, sxy = 0, sxx = 0;
  for (const p of points) { sx += p.x; sy += p.y; sxy += p.x * p.y; sxx += p.x * p.x; }
  const d = n * sxx - sx * sx;
  const a = d === 0 ? 0 : (n * sxy - sx * sy) / d;
  const b = (sy - a * sx) / n;
  return { a, b };
}
const project = (xs, fit) => xs.map((x) => Math.max(0, fit.a * x + fit.b));

function buildDualSeriesWithProjection(pointsA, pointsB, labelA, labelB, horizon = 3) {
  const minYear = Math.min(pointsA[0].x, pointsB[0].x);
  const lastYear = Math.max(pointsA.at(-1).x, pointsB.at(-1).x);
  const years = []; for (let y = minYear; y <= lastYear + horizon; y++) years.push(y);

  const mapA = new Map(pointsA.map((p) => [p.x, p.y]));
  const mapB = new Map(pointsB.map((p) => [p.x, p.y]));

  const fitA = linearFit(pointsA);
  const fitB = linearFit(pointsB);
  const fut = years.filter((y) => y > lastYear);
  const projA = project(fut, fitA);
  const projB = project(fut, fitB);

  return years.map((y) => ({
    year: y,
    ...(y <= lastYear ? { [labelA]: mapA.get(y) ?? null, [labelB]: mapB.get(y) ?? null }
                      : { [`${labelA}Proj`]: projA[fut.indexOf(y)], [`${labelB}Proj`]: projB[fut.indexOf(y)] }),
  }));
}

function buildSingleSeriesWithProjection(points, label, horizon = 3) {
  const minYear = points[0].x;
  const lastYear = points.at(-1).x;
  const years = []; for (let y = minYear; y <= lastYear + horizon; y++) years.push(y);

  const map = new Map(points.map((p) => [p.x, p.y]));
  const fit = linearFit(points);
  const fut = years.filter((y) => y > lastYear);
  const proj = project(fut, fit);

  return years.map((y) => ({
    year: y,
    ...(y <= lastYear ? { [label]: map.get(y) ?? null }
                      : { [`${label}Proj`]: proj[fut.indexOf(y)] }),
  }));
}

function rollingAvg(arr, key, window = 10) {
  return arr.map((d, i) => {
    const start = Math.max(0, i - window + 1);
    const slice = arr.slice(start, i + 1);
    const avg = slice.reduce((s, v) => s + v[key], 0) / slice.length;
    return { year: d.year, avg: Number(avg.toFixed(2)) };
  });
}

/* -------------------------------- Component -------------------------------- */
export default function TrendsCarousel() {
  const [index, setIndex] = useState(0);
  const [version, setVersion] = useState(0); // bump to rebuild on slide switch
  const wrapRef = useRef(null);

  const next = () => setIndex((i) => (i + 1) % 6);
  const prev = () => setIndex((i) => (i - 1 + 6) % 6);

  // keyboard navigation
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  // Make charts "dynamic" each time you switch slides
  useEffect(() => {
    setVersion((v) => v + 1); // forces fresh mount of the active chart
  }, [index]);

  // Build slide data every time index changes (recompute projections)
  const slides = useMemo(() => {
    // 1) Additions per year
    const movies = Object.values(
      ADDITIONS_RAW.filter(d => d.type === "Movie").reduce((a, d) => {
        a[d.add_year] = a[d.add_year] || { x: d.add_year, y: 0 };
        a[d.add_year].y += d.count; return a;
      }, {})
    ).sort((a,b)=>a.x-b.x);

    const shows = Object.values(
      ADDITIONS_RAW.filter(d => d.type === "TV Show").reduce((a, d) => {
        a[d.add_year] = a[d.add_year] || { x: d.add_year, y: 0 };
        a[d.add_year].y += d.count; return a;
      }, {})
    ).sort((a,b)=>a.x-b.x);

    const DATA_ADD = buildDualSeriesWithProjection(movies, shows, "Movies", "TV Shows", 3);

    // 2) Median age
    const medA = MEDIAN_AGE.map(d => ({ x: d.year, y: d.movie })).sort((a,b)=>a.x-b.x);
    const medB = MEDIAN_AGE.map(d => ({ x: d.year, y: d.tv })).sort((a,b)=>a.x-b.x);
    const DATA_AGE = buildDualSeriesWithProjection(medA, medB, "Movies", "TV Shows", 3);

    // 3) Avg seasons
    const DATA_SEASONS = buildSingleSeriesWithProjection(
      AVG_SEASONS.map(d => ({ x: d.year, y: d.seasons })), "Avg Seasons", 3
    );

    // 4) Runtime + rolling
    const runtimePoints = AVG_RUNTIME.map(d => ({ x: d.year, y: d.runtime }));
    const DATA_RUNTIME = buildSingleSeriesWithProjection(runtimePoints, "Avg Runtime", 3);
    const ROLLING = rollingAvg(AVG_RUNTIME, "runtime", 10);
    const rollingMap = new Map(ROLLING.map(d => [d.year, d.avg]));
    const RUNTIME_JOINED = DATA_RUNTIME.map(d => ({ ...d, Rolling: rollingMap.get(d.year) }));

    return [
      {
        title: "Netflix Catalog Growth: Content Additions Per Year",
        subtitle: "Number of titles added (Movies vs TV Shows) with 3-year projection",
        data: DATA_ADD,
        render: (data, k) => (
          <LineChart key={k} data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
            <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} />
            <YAxis tick={{ fill: "#a3a3a3" }} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            <Legend />
            {/* Actuals */}
            <Line type="monotone" dataKey="Movies" name="Movies" stroke="#ef4444"
                  strokeWidth={2} dot={false} legendType="plainline" connectNulls />
            <Line type="monotone" dataKey="TV Shows" name="TV Shows" stroke="#ffffff"
                  strokeWidth={2} dot={false} legendType="plainline" connectNulls />
            {/* Projections (dashed, distinct legend names) */}
            <Line type="monotone" dataKey="MoviesProj" name="Movies (Projection)"
                  stroke="#ef4444" strokeDasharray="6 4" dot={false}
                  legendType="plainline" connectNulls />
            <Line type="monotone" dataKey="TV ShowsProj" name="TV Shows (Projection)"
                  stroke="#ffffff" strokeDasharray="6 4" dot={false}
                  legendType="plainline" connectNulls />
          </LineChart>
        ),
      },
      {
        title: "Strategic Shift: Median Age of Content Added (New vs Catalog)",
        subtitle: "Median age (years) of content added, with 3-year projection",
        data: DATA_AGE,
        render: (data, k) => (
          <LineChart key={k} data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
            <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} />
            <YAxis tick={{ fill: "#a3a3a3" }} domain={[0, "dataMax + 0.5"]}/>
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            <Legend />
            <Line type="monotone" dataKey="Movies" name="Movies (Median Age)"
                  stroke="#ef4444" strokeWidth={2} dot legendType="plainline" connectNulls />
            <Line type="monotone" dataKey="TV Shows" name="TV Shows (Median Age)"
                  stroke="#60a5fa" strokeWidth={2} dot legendType="plainline" connectNulls />
            <Line type="monotone" dataKey="MoviesProj" name="Movies (Projection)"
                  stroke="#ef4444" strokeDasharray="6 4" dot={false} legendType="plainline" connectNulls />
            <Line type="monotone" dataKey="TV ShowsProj" name="TV Shows (Projection)"
                  stroke="#60a5fa" strokeDasharray="6 4" dot={false} legendType="plainline" connectNulls />
          </LineChart>
        ),
      },
      {
        title: "Average Number of Seasons of TV Shows by Release Year",
        subtitle: "2000–Present with 3-year projection",
        data: DATA_SEASONS,
        render: (data, k) => (
          <LineChart key={k} data={data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
            <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} />
            <YAxis tick={{ fill: "#a3a3a3" }} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            <Legend />
            <Line type="monotone" dataKey="Avg Seasons" name="Avg Seasons"
                  stroke="#ffffff" strokeWidth={2} dot legendType="plainline" connectNulls />
            <Line type="monotone" dataKey="Avg SeasonsProj" name="Avg Seasons (Projection)"
                  stroke="#ffffff" strokeDasharray="6 4" dot={false}
                  legendType="plainline" connectNulls />
          </LineChart>
        ),
      },
      {
        title: "Average Movie Runtime Over Time (with 10-Year Rolling Avg)",
        subtitle: "1960–2018 with 3-year projection on main line",
        data: typeof RUNTIME_JOINED !== "undefined" ? RUNTIME_JOINED : [],
        render: (data, k) => {
          const firstYear = Math.min(...data.map(d => d.year));
          const lastYear  = Math.max(...data.map(d => d.year));
          const ticks = [];
          for (let y = firstYear; y <= lastYear; y += 5) ticks.push(y);

          return (
            <LineChart key={k} data={data} margin={{ top: 10, right: 24, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
              <XAxis
                dataKey="year"
                type="number"
                domain={[firstYear, "dataMax"]}
                ticks={ticks}
                allowDecimals={false}
                tick={{ fill: "#a3a3a3" }}
              />
              <YAxis tick={{ fill: "#a3a3a3" }} domain={["dataMin-1", "dataMax+1"]} />
              <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
              <Legend />

              {/* Actuals */}
              <Line
                type="monotone"
                dataKey="Avg Runtime"
                name="Avg Runtime"
                stroke="#60a5fa"
                strokeWidth={2.5}
                dot={false}
                connectNulls
              />
              {/* 10-yr rolling average */}
              <Line
                type="monotone"
                dataKey="Rolling"
                name="10-yr Rolling Avg"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                connectNulls
              />
              {/* Projection (dashed) */}
              <Line
                type="monotone"
                dataKey="Avg RuntimeProj"
                name="Avg Runtime (Projection)"
                stroke="#60a5fa"
                strokeDasharray="6 4"
                dot={false}
                connectNulls
              />
            </LineChart>
          );
        },
      },
      {
        title: "Movie: Strategic Investment by Audience Target (Absolute Count)",
        subtitle: "2014 - 2021",
        data: MOVIE_AUDIENCE_BY_YEAR,
        render: (data, k) => (
          <LineChart key={k} data={data} margin={{ top: 10, right: 24, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
            <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} domain={["dataMin", "dataMax"]} />
            <YAxis tick={{ fill: "#a3a3a3" }} domain={[0, "dataMax + 40"]} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            <Legend />
            <Line type="monotone" dataKey="Mature" name="Mature" stroke="#ef4444" strokeWidth={2} dot>
              {/* <LabelList dataKey="Mature" position="top" fill="#ef4444" fontSize={11} /> */}
            </Line>
            <Line type="monotone" dataKey="Teens"  name="Teens"  stroke="#f87171" strokeWidth={2} dot>
              {/* <LabelList dataKey="Teens" position="top" fill="#f87171" fontSize={11} /> */}
            </Line>
            <Line type="monotone" dataKey="Family" name="Family" stroke="#9ca3af" strokeWidth={2} dot>
              {/* <LabelList dataKey="Family" position="top" fill="#9ca3af" fontSize={11} /> */}
            </Line>
            <Line type="monotone" dataKey="Kids"   name="Kids"   stroke="#d1d5db" strokeWidth={2} dot>
              {/* <LabelList dataKey="Kids" position="top" fill="#d1d5db" fontSize={11} /> */}
            </Line>
          </LineChart>
        ),
      },
      {
        title: "TV Show: Strategic Investment by Audience Target (Absolute Count)",
        subtitle: "2014 - 2021",
        data: TV_AUDIENCE_BY_YEAR,
        render: (data, k) => (
          <LineChart key={k} data={data} margin={{ top: 10, right: 24, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
            <XAxis dataKey="year" tick={{ fill: "#a3a3a3" }} domain={["dataMin", "dataMax"]} />
            <YAxis tick={{ fill: "#a3a3a3" }} domain={[0, "dataMax + 40"]} />
            <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
            <Legend />
            <Line type="monotone" dataKey="Mature" name="Mature" stroke="#ef4444" strokeWidth={2} dot>
              {/* <LabelList dataKey="Mature" position="top" fill="#ef4444" fontSize={11} /> */}
            </Line>
            <Line type="monotone" dataKey="Teens"  name="Teens"  stroke="#f87171" strokeWidth={2} dot>
              {/* <LabelList dataKey="Teens" position="top" fill="#f87171" fontSize={11} /> */}
            </Line>
            <Line type="monotone" dataKey="Family" name="Family" stroke="#9ca3af" strokeWidth={2} dot>
              {/* <LabelList dataKey="Family" position="top" fill="#9ca3af" fontSize={11} /> */}
            </Line>
            <Line type="monotone" dataKey="Kids"   name="Kids"   stroke="#d1d5db" strokeWidth={2} dot>
              {/* <LabelList dataKey="Kids" position="top" fill="#d1d5db" fontSize={11} /> */}
            </Line>
          </LineChart>
        ),
      },     
    ];
  }, [index]); // <- recompute every time you switch slides

  const slide = slides[index];

  return (
    <div
      ref={wrapRef}
      tabIndex={0}
      className="min-h-screen outline-none bg-gradient-to-br from-black via-neutral-900 to-black text-white"
      aria-label="Trends carousel, use left and right arrow keys to navigate"
    >
      {/* Header */}
      <div className="relative bg-gradient-to-br from-red-950/30 via-neutral-900/50 to-black border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
              Trends & Projections
            </h1>
            <p className="text-neutral-300">Arrow-key accessible, dynamic on each slide switch</p>
          </div>
          <button
            onClick={() => setIndex(0)}
            className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition"
            title="Reset to first slide"
          >
            <RefreshCw size={16} /><span>Reset</span>
          </button>
        </div>
      </div>

      {/* Single, dynamic slide (we rebuild data & remount chart each switch) */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-br from-neutral-900/70 to-neutral-800/70 shadow-xl shadow-red-600/10">
            <div className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-red-400" />
                <h2 className="text-xl font-semibold">{slide.title}</h2>
              </div>
              <p className="text-neutral-400 mb-4">{slide.subtitle}</p>
              <div className="h-[460px]">
                <ResponsiveContainer width="100%" height="100%">
                  {/* key uses version so the active chart remounts every switch */}
                  {slide.render(slide.data, `${index}-${version}`)}
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Nav */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="absolute -left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-red-600/50 shadow-md hover:shadow-red-600/20"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            onClick={next}
            aria-label="Next slide"
            className="absolute -right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-neutral-900/80 border border-neutral-700 hover:border-red-600/50 shadow-md hover:shadow-red-600/20"
          >
            <ChevronRight size={22} />
          </button>

          {/* Dots */}
          <div className="mt-4 flex items-center justify-center gap-2">
            {Array.from({ length: slides.length }, (_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2.5 w-2.5 rounded-full transition-all ${i === index ? "bg-red-500 w-6" : "bg-neutral-600 hover:bg-neutral-500"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}