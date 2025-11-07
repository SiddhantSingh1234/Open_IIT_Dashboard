// "use client";

// import React, { useEffect, useMemo, useState } from "react";
// import {
//   Search,
//   Filter,
//   Download,
//   X,
//   Calendar,
//   Film,
//   Tv,
//   Star,
//   TrendingUp,
//   DollarSign,
//   ChevronRight,
//   RefreshCw,
//   BarChart3,
//   ChevronLeft,
// } from "lucide-react";
// import {
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// // --- Top-20 unified genres from your chart (chips + aggregation) ---
// const GENRES = [
//   "Drama","Comedy","Thriller","Romance","Action","Crime","Horror","Documentary",
//   "Adventure","Foreign","Family","Science Fiction","Mystery","Fantasy","Animation",
//   "Music","History","War","Western","TV Movie",
// ];

// // Loose aliasing so counts stay sensible even if your data uses variants
// const GENRE_ALIASES = {
//   "Science Fiction": ["Science Fiction","Sci-Fi","Science-Fiction","ScienceFiction"],
//   "TV Movie": ["TV Movie","TV-Movie","Television Movie"],
//   "Foreign": ["Foreign","International"],
// };

// function GenreExplorer() {
//   // -------- UI state --------
//   const [activeTab, setActiveTab] = useState("browse"); // "browse" | "insights"
//   const [selectedGenre, setSelectedGenre] = useState("Drama");
//   const [selectedType, setSelectedType] = useState("all"); // "all" | "Movie" | "TV Show"

//   // browsing list (server-driven, paginated)
//   const [page, setPage] = useState(1);
//   const [pageSize] = useState(48);
//   const [totalCount, setTotalCount] = useState(0);
//   const [items, setItems] = useState([]);
//   const [loadingList, setLoadingList] = useState(true);
//   const [errorList, setErrorList] = useState(null);

//   // modal
//   const [selectedContent, setSelectedContent] = useState(null);

//   // insights (dynamic charts)
//   const [loadingStats, setLoadingStats] = useState(true);
//   const [errorStats, setErrorStats] = useState(null);
//   const [movieCounts, setMovieCounts] = useState({});
//   const [tvCounts, setTvCounts] = useState({});

//   // reset page when filters change
//   useEffect(() => { setPage(1); }, [selectedGenre, selectedType]);

//   // -------- Fetch paginated list for the Browse tab --------
//   useEffect(() => {
//     const controller = new AbortController();
//     (async () => {
//       try {
//         setLoadingList(true);
//         setErrorList(null);
//         const params = new URLSearchParams({
//           q: "",
//           type: selectedType,
//           country: "all",
//           genre: selectedGenre,
//           language: "all",
//           yearMin: "1900",
//           yearMax: "2024",
//           ratingMin: "0",
//           ratingMax: "10",
//           sortBy: "popularity",
//           sortOrder: "desc",
//           page: String(page),
//           pageSize: String(pageSize),
//         });
//         const res = await fetch(`/api/content?${params.toString()}`, {
//           signal: controller.signal,
//           cache: "no-store",
//         });
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();
//         setItems(json.items || []);
//         setTotalCount(json.meta?.total || 0);
//       } catch (e) {
//         setErrorList(e?.message || "Failed to load titles");
//       } finally {
//         setLoadingList(false);
//       }
//     })();
//     return () => controller.abort();
//   }, [selectedGenre, selectedType, page, pageSize]);

//   // -------- Helper for genre aggregation --------
//   function buildCounts(all) {
//     const counts = Object.fromEntries(GENRES.map((g) => [g, 0]));
//     for (const it of all) {
//       const list = Array.isArray(it.genres) ? it.genres : [];
//       const set = new Set(list.map(String));
//       for (const g of GENRES) {
//         const aliases = GENRE_ALIASES[g] ?? [g];
//         if (aliases.some((al) => set.has(al))) counts[g] += 1;
//       }
//     }
//     return counts;
//   }

//   // -------- Fetch full-set (filtered only by type) for dynamic charts --------
//   async function fetchStats() {
//     setLoadingStats(true);
//     setErrorStats(null);
//     try {
//       const pm = new URLSearchParams({
//         export: "1",
//         type: "Movie",
//         country: "all",
//         genre: "all",
//         language: "all",
//         yearMin: "1900",
//         yearMax: "2024",
//         ratingMin: "0",
//         ratingMax: "10",
//         sortBy: "title",
//         sortOrder: "asc",
//       });
//       const pt = new URLSearchParams({
//         export: "1",
//         type: "TV Show",
//         country: "all",
//         genre: "all",
//         language: "all",
//         yearMin: "1900",
//         yearMax: "2024",
//         ratingMin: "0",
//         ratingMax: "10",
//         sortBy: "title",
//         sortOrder: "asc",
//       });
//       const [rm, rt] = await Promise.all([
//         fetch(`/api/content?${pm.toString()}`, { cache: "no-store" }),
//         fetch(`/api/content?${pt.toString()}`, { cache: "no-store" }),
//       ]);
//       if (!rm.ok) throw new Error(`Movies HTTP ${rm.status}`);
//       if (!rt.ok) throw new Error(`TV HTTP ${rt.status}`);
//       const { items: movies } = await rm.json();
//       const { items: shows } = await rt.json();
//       setMovieCounts(buildCounts(movies || []));
//       setTvCounts(buildCounts(shows || []));
//     } catch (e) {
//       setErrorStats(e?.message || "Failed to load stats");
//     } finally {
//       setLoadingStats(false);
//     }
//   }

//   useEffect(() => { fetchStats(); }, []);

//   // -------- Chart data (separate, dynamic) --------
//   const movieChartData = useMemo(
//     () => GENRES.map((g) => ({ genre: g, count: movieCounts[g] ?? 0 })),
//     [movieCounts]
//   );
//   const tvChartData = useMemo(
//     () => GENRES.map((g) => ({ genre: g, count: tvCounts[g] ?? 0 })),
//     [tvCounts]
//   );

//   const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

//   const formatCurrency = (value) =>
//     !value
//       ? "N/A"
//       : new Intl.NumberFormat("en-US", {
//           style: "currency",
//           currency: "USD",
//           minimumFractionDigits: 0,
//         }).format(value);

//   const formatNumber = (value) =>
//     value || value === 0 ? new Intl.NumberFormat("en-US").format(value) : "N/A";

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">
//       {/* subtle background blobs */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply blur-3xl opacity-10"></div>
//         <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply blur-3xl opacity-10"></div>
//       </div>

//       {/* Header */}
//       <div className="relative bg-gradient-to-br from-red-950/30 via-neutral-900/50 to-black border-b border-red-900/20">
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <div className="flex flex-wrap items-end justify-between gap-4">
//             <div>
//               <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
//                 Genre Explorer
//               </h1>
//               <p className="text-neutral-300 mt-1">
//                 Browse by genre & view live genre insights (Movies vs TV Shows)
//               </p>
//             </div>
//             <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-700 rounded-lg p-1">
//               <button
//                 onClick={() => setActiveTab("browse")}
//                 className={`px-4 py-2 rounded-md text-sm transition-all ${
//                   activeTab === "browse" ? "bg-red-600" : "hover:bg-neutral-800"
//                 }`}
//               >
//                 Browse
//               </button>
//               <button
//                 onClick={() => setActiveTab("insights")}
//                 className={`px-4 py-2 rounded-md text-sm transition-all ${
//                   activeTab === "insights" ? "bg-red-600" : "hover:bg-neutral-800"
//                 }`}
//               >
//                 Insights
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Tab: Browse */}
//       {activeTab === "browse" && (
//         <>
//           {/* Controls */}
//           <div className="max-w-7xl mx-auto px-6 py-6 border-b border-neutral-800">
//             <div className="flex flex-wrap items-center gap-4">
//               <div className="flex items-center gap-2">
//                 <span className="text-sm text-neutral-400">Type</span>
//                 <select
//                   value={selectedType}
//                   onChange={(e) => setSelectedType(e.target.value)}
//                   className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
//                 >
//                   <option value="all">All</option>
//                   <option value="Movie">Movies</option>
//                   <option value="TV Show">TV Shows</option>
//                 </select>
//               </div>

//               <div className="flex-1 min-w-[280px]">
//                 <div className="text-sm text-neutral-400 mb-2">Select Genre</div>
//                 <div className="flex flex-row flex-wrap gap-2">
//                   {GENRES.map((g) => (
//                     <button
//                       key={g}
//                       onClick={() => { setSelectedGenre(g); }}
//                       className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
//                         selectedGenre === g
//                           ? "border-red-600 bg-red-900/40 shadow-red-600/30"
//                           : "border-neutral-700 bg-neutral-900 hover:border-red-600/40"
//                       }`}
//                     >
//                       {g}
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Paging header */}
//           <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-neutral-800">
//             <div className="text-neutral-400">
//               <span className="text-white font-semibold">{totalCount}</span> results in{" "}
//               <span className="text-red-400 font-semibold">{selectedGenre}</span>
//               {selectedType !== "all" && (
//                 <>
//                   {" "}• <span className="uppercase">{selectedType}</span>
//                 </>
//               )}
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page <= 1}
//                 title="Prev page"
//                 className="px-3 py-1.5 bg-neutral-800 disabled:opacity-50 border border-neutral-700 rounded-lg hover:bg-neutral-700"
//               >
//                 <ChevronLeft size={16} />
//               </button>
//               <span className="text-sm text-neutral-400">
//                 Page <span className="text-white">{page}</span> /{" "}
//                 <span className="text-white">{totalPages}</span>
//               </span>
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page >= totalPages}
//                 title="Next page"
//                 className="px-3 py-1.5 bg-neutral-800 disabled:opacity-50 border border-neutral-700 rounded-lg hover:bg-neutral-700"
//               >
//                 <ChevronRight size={16} />
//               </button>
//             </div>
//           </div>

//           {/* Results */}
//           <div className="max-w-7xl mx-auto px-6 py-8">
//             {loadingList ? (
//               <div className="text-center text-neutral-400">Loading titles…</div>
//             ) : errorList ? (
//               <div className="text-center text-red-400">{errorList}</div>
//             ) : items.length === 0 ? (
//               <div className="text-center text-neutral-500">No results.</div>
//             ) : (
//               <div className="grid grid-cols-1 gap-4">
//                 {items.map((item, idx) => (
//                   <div
//                     key={item.show_id ?? `${item.title}-${idx}`}
//                     onClick={() => setSelectedContent(item)}
//                     style={{ animationDelay: `${idx * 40}ms` }}
//                     className="group relative bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-red-600/50 transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/20"
//                   >
//                     <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
//                     <div className="relative flex items-start gap-4">
//                       <div className="flex-shrink-0 mt-1">
//                         {item.type === "Movie" ? (
//                           <Film className="text-red-500" size={24} />
//                         ) : (
//                           <Tv className="text-purple-400" size={24} />
//                         )}
//                       </div>
//                       <div className="flex-1">
//                         <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
//                           {item.title || "N/A"}
//                         </h3>
//                         <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 mb-2">
//                           <span className="flex items-center gap-1">
//                             <Calendar size={14} />
//                             {item.release_year || "N/A"}
//                           </span>
//                           <span>•</span>
//                           <span className="flex items-center gap-1">
//                             <Star size={14} className="text-yellow-500" />
//                             {item.rating ?? "N/A"}
//                           </span>
//                           {item.popularity && (
//                             <>
//                               <span>•</span>
//                               <span className="flex items-center gap-1">
//                                 <TrendingUp size={14} className="text-green-500" />
//                                 {parseFloat(String(item.popularity)).toFixed(1)}
//                               </span>
//                             </>
//                           )}
//                           <span>•</span>
//                           <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-xs uppercase">
//                             {item.language || "N/A"}
//                           </span>
//                         </div>
//                         <p className="text-neutral-300 text-sm line-clamp-2">
//                           {item.description || "No description available"}
//                         </p>
//                         <div className="mt-3 flex flex-wrap gap-2">
//                           {(item.genres || []).slice(0, 5).map((g, i) => (
//                             <span
//                               key={i}
//                               className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs"
//                             >
//                               {g}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Modal */}
//           {selectedContent && (
//             <div
//               className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6"
//               onClick={() => setSelectedContent(null)}
//             >
//               <div
//                 className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-red-900/30 shadow-2xl shadow-red-600/20"
//                 onClick={(e) => e.stopPropagation()}
//               >
//                 <div className="p-8">
//                   <div className="flex items-start justify-between mb-6">
//                     <div className="flex items-start gap-4">
//                       {selectedContent.type === "Movie" ? (
//                         <Film className="text-red-500 flex-shrink-0" size={32} />
//                       ) : (
//                         <Tv className="text-purple-500 flex-shrink-0" size={32} />
//                       )}
//                       <div>
//                         <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent">
//                           {selectedContent.title || "N/A"}
//                         </h2>
//                         <div className="flex items-center gap-3 text-neutral-400 mt-1">
//                           <span className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs">
//                             {selectedContent.type}
//                           </span>
//                           <span>•</span>
//                           <span>{selectedContent.release_year || "N/A"}</span>
//                           <span>•</span>
//                           <span className="flex items-center gap-1">
//                             <Star size={16} className="text-yellow-500" />
//                             <span className="font-semibold text-yellow-400">
//                               {selectedContent.rating ?? "N/A"}
//                             </span>
//                             <span className="text-xs">
//                               ({formatNumber(selectedContent.vote_count)} votes)
//                             </span>
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                     <button
//                       onClick={() => setSelectedContent(null)}
//                       className="p-2 hover:bg-red-900/30 rounded-lg transition-all group"
//                     >
//                       <X size={22} className="text-neutral-400 group-hover:text-red-400" />
//                     </button>
//                   </div>

//                   <div className="space-y-6">
//                     <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
//                       <h3 className="text-red-400 font-semibold mb-2">Description</h3>
//                       <p className="text-neutral-300">
//                         {selectedContent.description || "No description available"}
//                       </p>
//                     </div>

//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                       <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
//                         <h4 className="text-neutral-400 text-sm mb-1">Director</h4>
//                         <div className="text-neutral-300">
//                           {selectedContent.director || "N/A"}
//                         </div>
//                       </div>
//                       <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
//                         <h4 className="text-neutral-400 text-sm mb-1">Country</h4>
//                         <div className="text-neutral-300">
//                           {Array.isArray(selectedContent.country)
//                             ? selectedContent.country.join(", ")
//                             : selectedContent.country || "N/A"}
//                         </div>
//                       </div>
//                       <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
//                         <h4 className="text-neutral-400 text-sm mb-1">Budget</h4>
//                         <div className="text-neutral-300">
//                           {formatCurrency(selectedContent.budget)}
//                         </div>
//                       </div>
//                       <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
//                         <h4 className="text-neutral-400 text-sm mb-1">Revenue</h4>
//                         <div className="text-neutral-300">
//                           {formatCurrency(selectedContent.revenue)}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
//                       <h4 className="text-neutral-400 text-sm mb-2">Genres</h4>
//                       <div className="flex flex-wrap gap-2">
//                         {(selectedContent.genres || []).map((g, i) => (
//                           <span
//                             key={i}
//                             className="px-3 py-1.5 bg-red-900/30 border border-red-700/40 rounded-lg text-sm"
//                           >
//                             {g}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//         </>
//       )}

//       {/* Tab: Insights (dynamic charts) */}
//       {activeTab === "insights" && (
//         <div className="max-w-7xl mx-auto px-6 py-8">
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h2 className="text-2xl font-semibold">Movies vs TV Shows by Genre</h2>
//               <p className="text-neutral-400">Counts are computed dynamically from your dataset.</p>
//             </div>
//             <button
//               onClick={fetchStats}
//               className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition"
//               title="Recompute"
//             >
//               <RefreshCw size={16} />
//               <span>Refresh</span>
//             </button>
//           </div>

//           {errorStats && <div className="text-red-400 mb-6">Error: {errorStats}</div>}

//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//             {/* Movies chart */}
//             <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <BarChart3 size={18} className="text-red-400" />
//                 <h3 className="font-semibold">Movies (by Genre)</h3>
//               </div>
//               <div className="h-[420px]">
//                 {loadingStats ? (
//                   <div className="h-full flex items-center justify-center text-neutral-400">
//                     Loading chart…
//                   </div>
//                 ) : (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={movieChartData}>
//                       <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
//                       <XAxis
//                         dataKey="genre"
//                         tick={{ fill: "#a3a3a3", fontSize: 12 }}
//                         interval={0}
//                         angle={-15}
//                         height={70}
//                       />
//                       <YAxis tick={{ fill: "#a3a3a3" }} />
//                       <Tooltip
//                         contentStyle={{
//                           background: "#111",
//                           border: "1px solid #333",
//                           color: "#fff",
//                         }}
//                       />
//                       <Legend />
//                       <Bar dataKey="count" name="Movies" fill="#ef4444" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>
//             </div>

//             {/* TV Shows chart */}
//             <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4">
//               <div className="flex items-center gap-2 mb-2">
//                 <BarChart3 size={18} className="text-purple-400" />
//                 <h3 className="font-semibold">TV Shows (by Genre)</h3>
//               </div>
//               <div className="h-[420px]">
//                 {loadingStats ? (
//                   <div className="h-full flex items-center justify-center text-neutral-400">
//                     Loading chart…
//                   </div>
//                 ) : (
//                   <ResponsiveContainer width="100%" height="100%">
//                     <BarChart data={tvChartData}>
//                       <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
//                       <XAxis
//                         dataKey="genre"
//                         tick={{ fill: "#a3a3a3", fontSize: 12 }}
//                         interval={0}
//                         angle={-15}
//                         height={70}
//                       />
//                       <YAxis tick={{ fill: "#a3a3a3" }} />
//                       <Tooltip
//                         contentStyle={{
//                           background: "#111",
//                           border: "1px solid #333",
//                           color: "#fff",
//                         }}
//                       />
//                       <Legend />
//                       <Bar dataKey="count" name="TV Shows" fill="#ffffff" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default GenreExplorer;
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X, Calendar, Film, Tv, Star, TrendingUp, DollarSign,
  ChevronRight, ChevronLeft, RefreshCw, BarChart3
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend
} from "recharts";

// ---------------- Top genres (kept in your visual order) ----------------
const GENRES = [
  "Drama","Comedy","Thriller","Romance","Action","Crime","Horror","Documentary",
  "Adventure","Foreign","Family","Science Fiction","Mystery","Fantasy","Animation",
  "Music","History","War","Western","TV Movie","Reality"
];

// ---------------- Fixed counts from your table screenshot ----------------
const STATIC_COUNTS = {
  Movie: {
    Action: 6463, Adventure: 3435, Animation: 1904, Comedy: 12674, Crime: 4229,
    Documentary: 3775, Drama: 19817, Family: 2701, Fantasy: 2272, Foreign: 1554,
    History: 1373, Horror: 4595, Music: 1569, Mystery: 2422, Romance: 6663,
    "Science Fiction": 2991, "TV Movie": 728, Thriller: 7464, War: 1305, Western: 1028,
    Reality: 0
  },
  "TV Show": {
    Action: 168, Adventure: 0, Animation: 176, Comedy: 637, Crime: 478,
    Documentary: 487, Drama: 1060, Family: 528, Fantasy: 0, Foreign: 1676,
    History: 0, Horror: 75, Music: 0, Mystery: 98, Romance: 370,
    "Science Fiction": 84, "TV Movie": 0, Thriller: 57, War: 0, Western: 0,
    Reality: 255
  }
};

// Put this alongside your other constants so height scales with number of genres
const H = Math.max(420, 26 * GENRES.length); // ~26px per row + padding

// ---------- nicer multi-line tick so "Science Fiction" doesn't overlap ----------
const GenreTick = (props) => {
  const { x, y, payload } = props;
  const words = String(payload.value).split(" ");
  const lines = [];
  let line = "";
  words.forEach((w) => {
    const tryLine = (line ? line + " " : "") + w;
    if (tryLine.length > 10) { lines.push(line); line = w; } else { line = tryLine; }
  });
  if (line) lines.push(line);

  return (
    <g transform={`translate(${x},${y})`}>
      {lines.map((l, i) => (
        <text key={i} x={0} y={0} dy={12 + i * 12} textAnchor="middle" fill="#a3a3a3">
          {l}
        </text>
      ))}
    </g>
  );
};

function GenreExplorer() {
  // ------------- Browse tab (server-driven) -------------
  const [activeTab, setActiveTab] = useState("insights"); // open on charts
  const [selectedGenre, setSelectedGenre] = useState("Drama");
  const [selectedType, setSelectedType] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(48);
  const [totalCount, setTotalCount] = useState(0);
  const [items, setItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState(null);
  const [selectedContent, setSelectedContent] = useState(null);

  useEffect(() => { setPage(1); }, [selectedGenre, selectedType]);

  useEffect(() => {
    if (activeTab !== "browse") return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoadingList(true);
        setErrorList(null);
        const params = new URLSearchParams({
          q: "", type: selectedType, country: "all", genre: selectedGenre, language: "all",
          yearMin: "1900", yearMax: "2024", ratingMin: "0", ratingMax: "10",
          sortBy: "popularity", sortOrder: "desc", page: String(page), pageSize: String(pageSize),
        });
        const res = await fetch(`/api/content?${params.toString()}`, { signal: controller.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setItems(json.items || []);
        setTotalCount(json.meta?.total || 0);
      } catch (e) {
        setErrorList(e?.message || "Failed to load titles");
      } finally {
        setLoadingList(false);
      }
    })();
    return () => controller.abort();
  }, [activeTab, selectedGenre, selectedType, page, pageSize]);

  // ------------- Insights data from static counts -------------
  const movieChartData = useMemo(
    () => GENRES.map((g) => ({ genre: g, count: STATIC_COUNTS.Movie[g] ?? 0 })),
    []
  );
  const tvChartData = useMemo(
    () => GENRES.map((g) => ({ genre: g, count: STATIC_COUNTS["TV Show"][g] ?? 0 })),
    []
  );

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const formatCurrency = (v) =>
    !v ? "N/A" : new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(v);
  const formatNumber = (v) => (v || v === 0) ? new Intl.NumberFormat("en-US").format(v) : "N/A";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-red-950/30 via-neutral-900/50 to-black border-b border-red-900/20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
                Genre Explorer
              </h1>
              <p className="text-neutral-300 mt-1">
                Browse by genre & view genre insights (movies vs TV shows)
              </p>
            </div>
            <div className="flex items-center gap-2 bg-neutral-900/60 border border-neutral-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("browse")}
                className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab==="browse" ? "bg-red-600" : "hover:bg-neutral-800"}`}
              >
                Browse
              </button>
              <button
                onClick={() => setActiveTab("insights")}
                className={`px-4 py-2 rounded-md text-sm transition-all ${activeTab==="insights" ? "bg-red-600" : "hover:bg-neutral-800"}`}
              >
                Insights
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --------------------- INSIGHTS (fixed numbers) --------------------- */}
      {activeTab === "insights" && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold">Movies vs TV Shows by Genre</h2>
              <p className="text-neutral-400">Using the provided counts.</p>
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg hover:bg-neutral-700 transition"
            >
              <RefreshCw size={16} /><span>Refresh</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Movies */}
            {/* <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-red-400"/><h3 className="font-semibold">Movies (by Genre)</h3>
              </div>
              <div className="h-[440px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={movieChartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15}/>
                    <XAxis
                      dataKey="genre"
                      interval={0}
                      tick={<GenreTick />}
                      height={60}
                      tickMargin={10}
                    />
                    <YAxis tick={{ fill: "#a3a3a3" }}/>
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }}/>
                    <Legend/>
                    <Bar dataKey="count" name="Movies" fill="#ef4444"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div> */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-red-400" />
                <h3 className="font-semibold">Movies (by Genre)</h3>
              </div>
              <div className="h-[${H}px]">
                <ResponsiveContainer width="100%" height={H}>
                  <BarChart
                    data={movieChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, bottom: 10, left: -60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis type="number" tick={{ fill: "#a3a3a3" }} />
                    <YAxis
                      type="category"
                      dataKey="genre"
                      tick={{ fill: "#a3a3a3", fontSize: 12 }}
                      width={140}          // room for "Science Fiction"
                    />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                    <Legend />
                    <Bar dataKey="count" name="Movies" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* TV Shows */}
            {/* <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-purple-400"/><h3 className="font-semibold">TV Shows (by Genre)</h3>
              </div>
              <div className="h-[440px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={tvChartData}
                    margin={{ top: 10, right: 20, left: 10, bottom: 70 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15}/>
                    <XAxis
                      dataKey="genre"
                      interval={0}
                      tick={<GenreTick />}
                      height={60}
                      tickMargin={10}
                    />
                    <YAxis tick={{ fill: "#a3a3a3" }}/>
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }}/>
                    <Legend/>
                    <Bar dataKey="count" name="TV Shows" fill="#ffffff"/>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div> */}
            <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-purple-400" />
                <h3 className="font-semibold">TV Shows (by Genre)</h3>
              </div>
              <div className="h-[${H}px]">
                <ResponsiveContainer width="100%" height={H}>
                  <BarChart
                    data={tvChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, bottom: 10, left: -60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
                    <XAxis type="number" tick={{ fill: "#a3a3a3" }} />
                    <YAxis
                      type="category"
                      dataKey="genre"
                      tick={{ fill: "#a3a3a3", fontSize: 12 }}
                      width={140}
                    />
                    <Tooltip contentStyle={{ background: "#111", border: "1px solid #333", color: "#fff" }} />
                    <Legend />
                    <Bar dataKey="count" name="TV Shows" fill="#ffffff" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --------------------- BROWSE (unchanged from before) --------------------- */}
      {activeTab === "browse" && (
        <>
          <div className="max-w-7xl mx-auto px-6 py-6 border-b border-neutral-800">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-neutral-400">Type</span>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All</option>
                  <option value="Movie">Movies</option>
                  <option value="TV Show">TV Shows</option>
                </select>
              </div>

              <div className="flex-1 min-w-[280px]">
                <div className="text-sm text-neutral-400 mb-2">Select Genre</div>
                <div className="flex flex-row flex-wrap gap-2">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      onClick={() => { setSelectedGenre(g); }}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all ${
                        selectedGenre === g
                          ? "border-red-600 bg-red-900/40 shadow-red-600/30"
                          : "border-neutral-700 bg-neutral-900 hover:border-red-600/40"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-neutral-800">
            <div className="text-neutral-400">
              <span className="text-white font-semibold">{totalCount}</span> results in{" "}
              <span className="text-red-400 font-semibold">{selectedGenre}</span>
              {selectedType !== "all" && <> • <span className="uppercase">{selectedType}</span></>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                title="Prev page"
                className="px-3 py-1.5 bg-neutral-800 disabled:opacity-50 border border-neutral-700 rounded-lg hover:bg-neutral-700"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm text-neutral-400">
                Page <span className="text-white">{page}</span> / <span className="text-white">{Math.max(1, Math.ceil(totalCount / pageSize))}</span>
              </span>
              <button
                onClick={() => setPage((p) => Math.min(Math.max(1, Math.ceil(totalCount / pageSize)), p + 1))}
                disabled={page >= Math.max(1, Math.ceil(totalCount / pageSize))}
                title="Next page"
                className="px-3 py-1.5 bg-neutral-800 disabled:opacity-50 border border-neutral-700 rounded-lg hover:bg-neutral-700"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-6 py-8">
            {loadingList ? (
              <div className="text-center text-neutral-400">Loading titles…</div>
            ) : errorList ? (
              <div className="text-center text-red-400">{errorList}</div>
            ) : items.length === 0 ? (
              <div className="text-center text-neutral-500">No results.</div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {items.map((item, idx) => (
                  <div
                    key={item.show_id ?? `${item.title}-${idx}`}
                    onClick={() => setSelectedContent(item)}
                    style={{ animationDelay: `${idx * 40}ms` }}
                    className="group relative bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-red-600/50 transition-all duration-300 cursor-pointer overflow-hidden transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/20"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {item.type === "Movie" ? (
                          <Film className="text-red-500" size={24} />
                        ) : (
                          <Tv className="text-purple-400" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white group-hover:text-red-400 transition-colors">
                          {item.title || "N/A"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400 mb-2">
                          <span className="flex items-center gap-1"><Calendar size={14} />{item.release_year || "N/A"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1"><Star size={14} className="text-yellow-500" />{item.rating ?? "N/A"}</span>
                          {item.popularity && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1"><TrendingUp size={14} className="text-green-500" />{parseFloat(String(item.popularity)).toFixed(1)}</span>
                            </>
                          )}
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-xs uppercase">
                            {item.language || "N/A"}
                          </span>
                        </div>
                        <p className="text-neutral-300 text-sm line-clamp-2">
                          {item.description || "No description available"}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {(item.genres || []).slice(0, 5).map((g, i) => (
                            <span key={i} className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedContent && (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedContent(null)}>
              <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-red-900/30 shadow-2xl shadow-red-600/20" onClick={(e)=>e.stopPropagation()}>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-start gap-4">
                      {selectedContent.type === "Movie" ? (
                        <Film className="text-red-500 flex-shrink-0" size={32}/>
                      ) : (
                        <Tv className="text-purple-500 flex-shrink-0" size={32}/>
                      )}
                      <div>
                        <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent">
                          {selectedContent.title || "N/A"}
                        </h2>
                        <div className="flex items-center gap-3 text-neutral-400 mt-1">
                          <span className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-xs">{selectedContent.type}</span>
                          <span>•</span>
                          <span>{selectedContent.release_year || "N/A"}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500"/>
                            <span className="font-semibold text-yellow-400">{selectedContent.rating ?? "N/A"}</span>
                            <span className="text-xs">({formatNumber(selectedContent.vote_count)} votes)</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <button onClick={()=>setSelectedContent(null)} className="p-2 hover:bg-red-900/30 rounded-lg transition-all group">
                      <X size={22} className="text-neutral-400 group-hover:text-red-400"/>
                    </button>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
                      <h3 className="text-red-400 font-semibold mb-2">Description</h3>
                      <p className="text-neutral-300">{selectedContent.description || "No description available"}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
                        <h4 className="text-neutral-400 text-sm mb-1">Director</h4>
                        <div className="text-neutral-300">{selectedContent.director || "N/A"}</div>
                      </div>
                      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
                        <h4 className="text-neutral-400 text-sm mb-1">Country</h4>
                        <div className="text-neutral-300">
                          {Array.isArray(selectedContent.country) ? selectedContent.country.join(", ") : (selectedContent.country || "N/A")}
                        </div>
                      </div>
                      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
                        <h4 className="text-neutral-400 text-sm mb-1">Budget</h4>
                        <div className="text-neutral-300">{formatCurrency(selectedContent.budget)}</div>
                      </div>
                      <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
                        <h4 className="text-neutral-400 text-sm mb-1">Revenue</h4>
                        <div className="text-neutral-300">{formatCurrency(selectedContent.revenue)}</div>
                      </div>
                    </div>
                    <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg p-4">
                      <h4 className="text-neutral-400 text-sm mb-2">Genres</h4>
                      <div className="flex flex-wrap gap-2">
                        {(selectedContent.genres || []).map((g, i) => (
                          <span key={i} className="px-3 py-1.5 bg-red-900/30 border border-red-700/40 rounded-lg text-sm">{g}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default GenreExplorer;