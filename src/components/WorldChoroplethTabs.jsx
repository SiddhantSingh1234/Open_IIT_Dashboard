// // "use client";
// // import React, { useEffect, useMemo, useRef, useState } from "react";
// // import { useTheme } from "next-themes";
// // import DottedMap from "dotted-map";
// // // import { geoNaturalEarth1, geoPath } from "d3-geo";
// // import { geoEquirectangular, geoPath } from "d3-geo";
// // import { feature as topo2geo } from "topojson-client";
// // import { motion } from "motion/react";

// // // ---- data (your counts; ISO/name handled via NAME_FIX) ----
// // const MOVIE_COUNTS = {
// //   "United States": 2752, India: 962, "United Kingdom": 534, Canada: 319, France: 303,
// //   Germany: 182, Spain: 171, Japan: 119, China: 114, Mexico: 111, Egypt: 102,
// //   "Hong Kong": 100, Nigeria: 94, Australia: 94, Indonesia: 86, Turkey: 83,
// //   Philippines: 80, Belgium: 78, Italy: 75, Argentina: 71,
// // };

// // const TV_COUNTS = {
// //   "United States": 938, "United Kingdom": 272, Japan: 199, "South Korea": 170,
// //   Canada: 126, France: 90, India: 84, Taiwan: 70, Australia: 66, Spain: 61,
// //   Mexico: 58, China: 48, Germany: 44, Colombia: 32, Brazil: 31, Turkey: 30,
// //   Italy: 25, Thailand: 24, Singapore: 23, Argentina: 20,
// // };

// // // Map TopoJSON names -> our keys
// // const NAME_FIX = {
// //   "United States of America": "United States",
// //   "Korea, Republic of": "South Korea",
// //   "Türkiye": "Turkey",
// //   "Russian Federation": "Russia",
// //   "Democratic Republic of the Congo": "Congo (Kinshasa)",
// //   "Congo": "Congo (Brazzaville)",
// //   "Hong Kong S.A.R.": "Hong Kong",
// //   "Côte d’Ivoire": "Cote d'Ivoire",
// //   "Czechia": "Czech Republic",
// //   "Eswatini": "Swaziland",
// // };

// // function useWorldFeatures() {
// //   const [features, setFeatures] = useState(null);
// //   useEffect(() => {
// //     let alive = true;
// //     (async () => {
// //       try {
// //         // prefer local package import
// //         const mod = await import("world-atlas/countries-50m.json", { assert: { type: "json" } }).catch(() => null);
// //         let topo = mod?.default || mod;
// //         if (!topo) {
// //           // fallback: you can put a copy at /world-50m.json if needed
// //           const r = await fetch("/world-50m.json");
// //           topo = await r.json();
// //         }
// //         const fc = topo2geo(topo, topo.objects.countries);
// //         if (alive) setFeatures(fc.features);
// //       } catch (e) {
// //         console.error("Failed to load world topology", e);
// //       }
// //     })();
// //     return () => { alive = false; };
// //   }, []);
// //   return features;
// // }

// // function useDottedBackground(theme) {
// //   return useMemo(() => {
// //     const map = new DottedMap({ height: 100, grid: "diagonal" });
// //     return map.getSVG({
// //       radius: 0.22,
// //       color: theme === "dark" ? "#FFFFFF40" : "#00000040",
// //       shape: "circle",
// //       backgroundColor: theme === "dark" ? "black" : "white",
// //     });
// //   }, [theme]);
// // }

// // function interpolateBrand(t) {
// //   // Netflixy: from deep neutral to Netflix red (#E50914)
// //   // clamp
// //   const x = Math.max(0, Math.min(1, t));
// //   const from = { r: 17, g: 24, b: 39 };    // #111827
// //   const to   = { r: 229, g: 9, b: 20 };    // #E50914
// //   const r = Math.round(from.r + (to.r - from.r) * x);
// //   const g = Math.round(from.g + (to.g - from.g) * x);
// //   const b = Math.round(from.b + (to.b - from.b) * x);
// //   return `rgb(${r},${g},${b})`;
// // }

// // function getFillForCountry(name, counts, maxVal) {
// //   const key = NAME_FIX[name] || name;
// //   const v = counts[key] || 0;
// //   if (!v) return "rgba(255,255,255,0.06)"; // faint neutral if zero
// //   const t = Math.pow(v / maxVal, 0.7);     // slightly emphasize mid values
// //   return interpolateBrand(t);
// // }

// // export default function WorldChoroplethTabs({
// //   className = "",
// //   lineColor = "#E50914", // netflix red for strokes/markers
// // }) {
// //   const { theme } = useTheme();
// //   const features = useWorldFeatures();
// //   const dottedSVG = useDottedBackground(theme);
// //   const [tab, setTab] = useState("movies");
// //   const data = tab === "movies" ? MOVIE_COUNTS : TV_COUNTS;
// //   const maxVal = useMemo(() => Math.max(...Object.values(data)), [data]);

// //   const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, label: "", value: 0 });

// //   // const projection = useMemo(
// //   //   () => geoNaturalEarth1().scale(165).translate([480, 245]),
// //   //   []
// //   // );
// //   // Use the same projection the dotted background assumes: equirectangular 2:1
// //   const WIDTH = 960;   // <-- pick ONE size and reuse everywhere
// //   const HEIGHT = 480;  //     (you had 800x400 in your earlier code)
// //   const projection = useMemo(
// //     () =>
// //       geoEquirectangular()
// //         // scale that maps 360° long to WIDTH
// //         .scale(WIDTH / (2 * Math.PI))
// //         .translate([WIDTH / 2, HEIGHT / 2]),
// //     []
// //   );
// //   const pathGen = useMemo(() => geoPath(projection), [projection]);

// //   return (
// //     <div className={`w-full rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-neutral-800 shadow-xl ${className}`}>
// //       {/* header & tabs */}
// //       <div className="flex items-center justify-between px-6 pt-6">
// //         <div>
// //           <h3 className="text-xl font-semibold text-white">Global Production Heatmap</h3>
// //           <p className="text-sm text-neutral-400">Hover any country to see total {tab === "movies" ? "movies" : "TV shows"}.</p>
// //         </div>
// //         <div className="inline-flex p-1 rounded-xl bg-neutral-900 border border-neutral-800">
// //           <button
// //             onClick={() => setTab("movies")}
// //             className={`px-4 py-2 rounded-lg text-sm transition ${tab === "movies"
// //               ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow shadow-red-600/30"
// //               : "text-neutral-300 hover:text-white hover:bg-neutral-800"}`}
// //           >
// //             Movies
// //           </button>
// //           <button
// //             onClick={() => setTab("tv")}
// //             className={`px-4 py-2 rounded-lg text-sm transition ${tab === "tv"
// //               ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow shadow-red-600/30"
// //               : "text-neutral-300 hover:text-white hover:bg-neutral-800"}`}
// //           >
// //             TV Shows
// //           </button>
// //         </div>
// //       </div>

// //       {/* map stage */}
// //       <div className="relative w-full aspect-[2/1] mt-4 overflow-hidden rounded-b-2xl">
// //         {/* dotted background image */}
// //         <img
// //           alt="world dots"
// //           draggable={false}
// //           height={HEIGHT}
// //           width={WIDTH}
// //           className="absolute inset-0 w-full h-full pointer-events-none select-none [mask-image:linear-gradient(to_bottom,transparent,white_10%,white_90%,transparent)]"
// //           src={`data:image/svg+xml;utf8,${encodeURIComponent(dottedSVG)}`}
// //         />

// //         {/* choropleth svg */}
// //         <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 w-full h-full">
// //           <defs>
// //             {/* legend gradient */}
// //             <linearGradient id="legend-grad" x1="0%" y1="0%" x2="100%" y2="0%">
// //               <stop offset="0%" stopColor={interpolateBrand(0)} />
// //               <stop offset="100%" stopColor={interpolateBrand(1)} />
// //             </linearGradient>
// //           </defs>

// //           {/* faint graticule feel: a subtle outline mask */}
// //           <rect x="0" y="0" width="960" height="480" fill="transparent" />

// //           {features ? (
// //             features.map((f, i) => {
// //               const name = f.properties?.name || "";
// //               const fill = getFillForCountry(name, data, maxVal);
// //               return (
// //                 <motion.path
// //                   key={i}
// //                   d={pathGen(f)}
// //                   fill={fill}
// //                   stroke="rgba(255,255,255,0.08)"
// //                   strokeWidth={0.5}
// //                   initial={{ opacity: 0 }}
// //                   animate={{ opacity: 1 }}
// //                   transition={{ duration: 0.35, delay: 0.001 * i }}
// //                   onMouseEnter={(e) => {
// //                     const key = NAME_FIX[name] || name;
// //                     setTooltip({
// //                       show: true,
// //                       x: e.clientX,
// //                       y: e.clientY,
// //                       label: key,
// //                       value: data[key] || 0,
// //                     });
// //                   }}
// //                   onMouseMove={(e) => {
// //                     setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY }));
// //                   }}
// //                   onMouseLeave={() => setTooltip((t) => ({ ...t, show: false }))}
// //                   style={{
// //                     cursor: "default",
// //                     filter: (data[NAME_FIX[name] || name] ? "drop-shadow(0 0 6px rgba(229,9,20,0.15))" : "none"),
// //                   }}
// //                 />
// //               );
// //             })
// //           ) : (
// //             // skeleton shimmer while loading topojson
// //             <g>
// //               <rect x="0" y="0" width="960" height="480" fill="url(#legend-grad)" opacity="0.06" />
// //             </g>
// //           )}

// //           {/* bottom legend */}
// //           <g transform="translate(20,420)">
// //             <rect width="220" height="10" fill="url(#legend-grad)" rx="4" />
// //             <text x="0" y="26" fontSize="10" fill="#000000"><b>Low</b></text>
// //             <text x="220" y="26" fontSize="10" fill="#000000" textAnchor="end"><b>High</b></text>
// //             <text x="0" y="-6" fontSize="10" fill="#000000"><b>Intensity (brand-scaled)</b></text>
// //           </g>
// //         </svg>

// //         {/* tooltip */}
// //         {tooltip.show && (
// //           <div
// //             className="pointer-events-none fixed z-50 rounded-lg border border-red-600/30 bg-neutral-900/95 px-3 py-2 text-sm text-white shadow-lg"
// //             style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
// //           >
// //             <div className="font-semibold">{tooltip.label}</div>
// //             <div className="text-red-400">
// //               {tab === "movies" ? "Movies: " : "TV Shows: "}
// //               <span className="font-bold">{tooltip.value || 0}</span>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }

// // src/components/WorldChoroplethTabs.jsx
// "use client";
// import React, { useEffect, useMemo, useState } from "react";
// import { useTheme } from "next-themes";
// import { geoEquirectangular, geoPath } from "d3-geo";
// import { feature as topo2geo } from "topojson-client";
// import { motion } from "motion/react";

// // ---------- data ----------
// const MOVIE_COUNTS = {
//   "United States": 2752, India: 962, "United Kingdom": 534, Canada: 319, France: 303,
//   Germany: 182, Spain: 171, Japan: 119, China: 114, Mexico: 111, Egypt: 102,
//   "Hong Kong": 100, Nigeria: 94, Australia: 94, Indonesia: 86, Turkey: 83,
//   Philippines: 80, Belgium: 78, Italy: 75, Argentina: 71,
// };
// const TV_COUNTS = {
//   "United States": 938, "United Kingdom": 272, Japan: 199, "South Korea": 170,
//   Canada: 126, France: 90, India: 84, Taiwan: 70, Australia: 66, Spain: 61,
//   Mexico: 58, China: 48, Germany: 44, Colombia: 32, Brazil: 31, Turkey: 30,
//   Italy: 25, Thailand: 24, Singapore: 23, Argentina: 20,
// };
// const NAME_FIX = {
//   "United States of America": "United States",
//   "Korea, Republic of": "South Korea",
//   "Türkiye": "Turkey",
//   "Hong Kong S.A.R.": "Hong Kong",
// };

// // Brand reds (quantized so hue doesn’t drift)
// const BRAND_STOPS = ["#141414","#1E0E0F","#2C0C0E","#4A0D0F","#7A0D12","#B81D24","#E50914"];
// const brandColor = (t) => {
//   const x = Math.max(0, Math.min(1, t));
//   const i = Math.round(x * (BRAND_STOPS.length - 1));
//   return BRAND_STOPS[i];
// };

// function useWorld() {
//   const [features, setFeatures] = useState(null);
//   useEffect(() => {
//     let alive = true;
//     (async () => {
//       try {
//         // try package import, then public fallback
//         let topo;
//         try {
//           const mod = await import("world-atlas/countries-50m.json", { assert: { type: "json" } });
//           topo = mod.default || mod;
//         } catch {
//           const r = await fetch("/world-50m.json");
//           topo = await r.json();
//         }
//         const fc = topo2geo(topo, topo.objects.countries);
//         if (alive) setFeatures(fc.features);
//       } catch (e) {
//         console.error("world topology load failed", e);
//       }
//     })();
//     return () => { alive = false; };
//   }, []);
//   return features;
// }

// export default function WorldChoroplethTabs({ className = "" }) {
//   const { theme } = useTheme();
//   const features = useWorld();
//   const [tab, setTab] = useState("movies");
//   const data = tab === "movies" ? MOVIE_COUNTS : TV_COUNTS;
//   const maxVal = useMemo(() => Math.max(...Object.values(data)), [data]);

//   // ---- SAME projection + SAME canvas for dots and countries ----
//   const WIDTH = 960, HEIGHT = 480;
//   const projection = useMemo(
//     () => geoEquirectangular().scale(WIDTH / (2 * Math.PI)).translate([WIDTH / 2, HEIGHT / 2]),
//     []
//   );
//   const path = useMemo(() => geoPath(projection), [projection]);

//   const dotColor = theme === "dark" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.22)";

//   const getFill = (name) => {
//     const key = NAME_FIX[name] || name;
//     const v = data[key] || 0;
//     if (!v) return theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
//     const t = Math.pow(v / maxVal, 0.7);
//     return brandColor(t);
//   };

//   return (
//     <div className={`w-full rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-neutral-800 text-white ${className}`}>
//       {/* header + tabs */}
//       <div className="flex items-center justify-between px-6 pt-6">
//         <div>
//           <h3 className="text-xl font-semibold">Global Production Heatmap</h3>
//           <p className="text-sm text-neutral-400">Hover any country to see total {tab === "movies" ? "movies" : "TV shows"}.</p>
//         </div>
//         <div className="inline-flex p-1 rounded-xl bg-neutral-900 border border-neutral-800">
//           <button
//             onClick={() => setTab("movies")}
//             className={`px-4 py-2 rounded-lg text-sm transition ${tab === "movies"
//               ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow shadow-red-600/30"
//               : "text-neutral-300 hover:text-white hover:bg-neutral-800"}`}
//           >Movies</button>
//           <button
//             onClick={() => setTab("tv")}
//             className={`px-4 py-2 rounded-lg text-sm transition ${tab === "tv"
//               ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow shadow-red-600/30"
//               : "text-neutral-300 hover:text-white hover:bg-neutral-800"}`}
//           >TV Shows</button>
//         </div>
//       </div>

//       {/* map */}
//       <div className="relative w-full aspect-[2/1] mt-4 overflow-hidden rounded-b-2xl">
//         <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 w-full h-full">
//           <defs>
//             {/* tiny dot pattern for land fill */}
//             <pattern id="land-dots" width="6" height="6" patternUnits="userSpaceOnUse">
//               <circle cx="1.5" cy="1.5" r="1" fill={dotColor} />
//             </pattern>
//             {/* legend */}
//             <linearGradient id="legend-grad" x1="0%" y1="0%" x2="100%" y2="0%">
//               {BRAND_STOPS.map((c, i) => (
//                 <stop key={i} offset={`${(i / (BRAND_STOPS.length - 1)) * 100}%`} stopColor={c} />
//               ))}
//             </linearGradient>
//           </defs>

//           {/* DOTTED LAND using the SAME features/projection -> perfect alignment */}
//           {features && (
//             <g opacity={0.55}>
//               {features.map((f, i) => (
//                 <path key={`dots-${i}`} d={path(f)} fill="url(#land-dots)" stroke="none" />
//               ))}
//             </g>
//           )}

//           {/* COUNTRY FILLS (choropleth) */}
//           {features && features.map((f, i) => {
//             const name = f.properties?.name || "";
//             const fill = getFill(name);
//             return (
//               <motion.path
//                 key={`country-${i}`}
//                 d={path(f)}
//                 fill={fill}
//                 stroke="rgba(184,29,36,0.35)"
//                 strokeWidth={0.5}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 transition={{ duration: 0.3, delay: 0.001 * i }}
//               />
//             );
//           })}

//           {/* legend */}
//           <g transform="translate(20,420)">
//             <rect width="220" height="10" fill="url(#legend-grad)" rx="4" />
//             <text x="0" y="26" fontSize="10" fill="#9CA3AF">Low</text>
//             <text x="220" y="26" fontSize="10" fill="#9CA3AF" textAnchor="end">High</text>
//             <text x="0" y="-6" fontSize="10" fill="#E5E7EB">Intensity (brand-scaled)</text>
//           </g>
//         </svg>

//         {/* vignette that matches background (no misalignment) */}
//         <div
//           className={
//             theme === "dark"
//               ? "absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(0,0,0,.55),rgba(0,0,0,.25)_12%,transparent_20%,transparent_80%,rgba(0,0,0,.25)_88%,rgba(0,0,0,.5))]"
//               : "absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,.65),rgba(255,255,255,.35)_12%,transparent_20%,transparent_80%,rgba(255,255,255,.35)_88%,rgba(255,255,255,.6))]"
//           }
//         />
//       </div>
//     </div>
//   );
// }
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useTheme } from "next-themes";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature as topo2geo } from "topojson-client";
import { motion } from "motion/react";

// ---------- data ----------
const MOVIE_COUNTS = {
  "United States": 2752, India: 962, "United Kingdom": 534, Canada: 319, France: 303,
  Germany: 182, Spain: 171, Japan: 119, China: 114, Mexico: 111, Egypt: 102,
  "Hong Kong": 100, Nigeria: 94, Australia: 94, Indonesia: 86, Turkey: 83,
  Philippines: 80, Belgium: 78, Italy: 75, Argentina: 71,
};
const TV_COUNTS = {
  "United States": 938, "United Kingdom": 272, Japan: 199, "South Korea": 170,
  Canada: 126, France: 90, India: 84, Taiwan: 70, Australia: 66, Spain: 61,
  Mexico: 58, China: 48, Germany: 44, Colombia: 32, Brazil: 31, Turkey: 30,
  Italy: 25, Thailand: 24, Singapore: 23, Argentina: 20,
};
const NAME_FIX = {
  "United States of America": "United States",
  "Korea, Republic of": "South Korea",
  "Türkiye": "Turkey",
  "Hong Kong S.A.R.": "Hong Kong",
};

// Brand reds (quantized so hue doesn’t drift)
// const BRAND_STOPS = ["#141414","#1E0E0F","#2C0C0E","#4A0D0F","#7A0D12","#B81D24","#E50914"];
const BRAND_STOPS = ["#2A2A2A", "#432020", "#5A1C1D", "#7A1E20", "#A11F22", "#C11E23", "#E50914"];
const brandColor = (t) => {
  const x = Math.max(0, Math.min(1, t));
  const i = Math.round(x * (BRAND_STOPS.length - 1));
  return BRAND_STOPS[i];
};

function useWorld() {
  const [features, setFeatures] = useState(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        let topo;
        try {
          const mod = await import("world-atlas/countries-50m.json", { assert: { type: "json" } });
          topo = mod.default || mod;
        } catch {
          const r = await fetch("/world-50m.json");
          topo = await r.json();
        }
        const fc = topo2geo(topo, topo.objects.countries);
        if (alive) setFeatures(fc.features);
      } catch (e) {
        console.error("world topology load failed", e);
      }
    })();
    return () => { alive = false; };
  }, []);
  return features;
}

export default function WorldChoroplethTabs({ className = "" }) {
  const { theme } = useTheme();
  const features = useWorld();
  const [tab, setTab] = useState("movies");
  const data = tab === "movies" ? MOVIE_COUNTS : TV_COUNTS;
  const maxVal = useMemo(() => Math.max(...Object.values(data)), [data]);

  // tooltip state
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, name: "", value: 0 });

  // SAME projection + SAME canvas
  const WIDTH = 960, HEIGHT = 480;
  const projection = useMemo(
    () => geoEquirectangular().scale(WIDTH / (2 * Math.PI)).translate([WIDTH / 2, HEIGHT / 2]),
    []
  );
  const path = useMemo(() => geoPath(projection), [projection]);

  const dotColor = theme === "dark" ? "rgba(255,255,255,0.28)" : "rgba(255,60,60,0.40)";

  const getFill = (name) => {
    const key = NAME_FIX[name] || name;
    const v = data[key] || 0;
    if (!v) return theme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";
    const t = Math.pow(v / maxVal, 0.7);
    return brandColor(t);
  };

  return (
    <div className={`w-full rounded-2xl bg-gradient-to-br from-black via-neutral-900 to-black border border-neutral-800 text-white ${className}`}>
      {/* header + tabs */}
      <div className="flex items-center justify-between px-6 pt-6">
        <div>
          <h3 className="text-xl font-semibold">Global Production Heatmap</h3>
          <p className="text-sm text-neutral-400">Hover any country to see total {tab === "movies" ? "movies" : "TV shows"}.</p>
        </div>
        <div className="inline-flex p-1 rounded-xl bg-neutral-900 border border-neutral-800">
          <button
            onClick={() => setTab("movies")}
            className={`px-4 py-2 rounded-lg text-sm transition ${tab === "movies"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow shadow-red-600/30"
              : "text-neutral-300 hover:text-white hover:bg-neutral-800"}`}
          >Movies</button>
          <button
            onClick={() => setTab("tv")}
            className={`px-4 py-2 rounded-lg text-sm transition ${tab === "tv"
              ? "bg-gradient-to-r from-red-600 to-red-500 text-white shadow shadow-red-600/30"
              : "text-neutral-300 hover:text-white hover:bg-neutral-800"}`}
          >TV Shows</button>
        </div>
      </div>

      {/* map */}
      <div className="relative w-full aspect-[2/1] mt-4 overflow-hidden rounded-b-2xl">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="absolute inset-0 w-full h-full">
          <defs>
            {/* tiny dot pattern for land fill */}
            <pattern id="land-dots" width="6" height="6" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1" fill={dotColor} />
            </pattern>
            {/* legend */}
            <linearGradient id="legend-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              {BRAND_STOPS.map((c, i) => (
                <stop key={i} offset={`${(i / (BRAND_STOPS.length - 1)) * 100}%`} stopColor={c} />
              ))}
            </linearGradient>
          </defs>

          {/* dotted land (aligned) */}
          {features && (
            <g opacity={0.55}>
              {features.map((f, i) => (
                <path key={`dots-${i}`} d={path(f)} fill="url(#land-dots)" stroke="none" />
              ))}
            </g>
          )}

          {/* country fills + hover handlers */}
          {features && features.map((f, i) => {
            const name = f.properties?.name || "";
            const key = NAME_FIX[name] || name;
            const value = data[key] || 0;
            const fill = getFill(name);
            return (
              <motion.path
                key={`country-${i}`}
                d={path(f)}
                fill={fill}
                stroke="rgba(184,29,36,0.35)"
                strokeWidth={0.5}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.001 * i }}
                onMouseEnter={(e) => setTooltip({ show: true, x: e.clientX, y: e.clientY, name: key, value })}
                onMouseMove={(e) => setTooltip((t) => ({ ...t, x: e.clientX, y: e.clientY }))}
                onMouseLeave={() => setTooltip((t) => ({ ...t, show: false }))}
              >
                <title>{`${key} — ${tab === "movies" ? "Movies" : "TV Shows"}: ${value}`}</title>
              </motion.path>
            );
          })}

          {/* legend */}
          <g transform="translate(20,420)">
            <rect width="220" height="10" fill="url(#legend-grad)" rx="4" />
            <text x="0" y="26" fontSize="10" fill="#9CA3AF">Low</text>
            <text x="220" y="26" fontSize="10" fill="#9CA3AF" textAnchor="end">High</text>
            <text x="0" y="-6" fontSize="10" fill="#E5E7EB">Intensity (brand-scaled)</text>
          </g>
        </svg>

        {/* softened top/bottom vignettes (no heavy mid band) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* top fade */}
          <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/35 via-black/15 to-transparent" />
          {/* bottom fade (softer than before) */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/28 via-black/12 to-transparent" />
        </div>

        {/* hover tooltip (above everything) */}
        {tooltip.show && (
          <div
            className="fixed z-50 pointer-events-none px-3 py-2 rounded-lg border border-red-600/40 bg-neutral-900/95 text-white shadow-xl"
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          >
            <div className="font-semibold">{tooltip.name}</div>
            <div className="text-red-400">
              {tab === "movies" ? "Movies: " : "TV Shows: "}
              <span className="font-bold">{tooltip.value}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}