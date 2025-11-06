"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  Users,
  TrendingUp,
  Award,
  Star,
  Film,
  Tv,
  Globe,
  Network as NetworkIcon,
  Target,
  Sparkles,
  ChevronRight,
  X,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
  Crown,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// dynamic import for canvas graph
const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

const CreatorTalentHub = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("projects");
  const [minProjects, setMinProjects] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // server-powered, paginated data
  const [talents, setTalents] = useState([]); // current page (grid)
  const [totalCount, setTotalCount] = useState(0);
  const [risingStars, setRisingStars] = useState([]);
  const [topCollaborations, setTopCollaborations] = useState([]);
  const [diversityMetrics, setDiversityMetrics] = useState({
    totalCountries: 0,
    totalGenres: 0,
    topCountries: [],
    topGenres: [],
  });

  // network data (global)
  const [network, setNetwork] = useState({ nodes: [], links: [] });
  const [netLimit, setNetLimit] = useState(120);
  const [netMin, setNetMin] = useState(2);

  // pagination (grid)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // reset page on filter changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm, selectedRole, minProjects, sortBy, pageSize]);

  // fetch from backend (grid + global stats + network)
  useEffect(() => {
    let cancelled = false;
    async function loadPage() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          search: searchTerm,
          role: selectedRole,
          minProjects: String(minProjects),
          sortBy,
          page: String(page),
          pageSize: String(pageSize),
          netLimit: String(netLimit),
          netMin: String(netMin),
        });
        const res = await fetch(`/api/talent?${params.toString()}`, {
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (cancelled) return;

        setTalents(json.items || []);
        setTotalCount(json.totalCount || 0);
        setRisingStars(json.risingStars || []);
        setTopCollaborations(json.topCollaborations || []);
        setDiversityMetrics(
          json.diversityMetrics || {
            totalCountries: 0,
            totalGenres: 0,
            topCountries: [],
            topGenres: [],
          }
        );
        setNetwork(json.network || { nodes: [], links: [] });
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        if (!cancelled)
          setError(`Failed to load data: ${err?.message || String(err)}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadPage();
    return () => {
      cancelled = true;
    };
  }, [
    searchTerm,
    selectedRole,
    minProjects,
    sortBy,
    page,
    pageSize,
    netLimit,
    netMin,
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const formatCurrency = (value) => {
    if (!value || value === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-red-600/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-neutral-300 animate-pulse">
            Loading talent data...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-600/10 border border-red-600/30 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <X className="text-red-500" size={48} />
          </div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-300 bg-clip-text text-transparent">
            Error Loading Data
          </h2>
          <p className="text-neutral-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">
      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
        .animate-slideDown { animation: slideDown 0.3s ease-out; }
        .animate-fadeInUp { animation: fadeInUp 0.5s ease-out forwards; opacity: 0; }
        .animate-shimmer { background: linear-gradient(90deg, transparent, rgba(239,68,68,0.1), transparent); background-size: 1000px 100%; animation: shimmer 2s infinite; }
      `}</style>

      {/* background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
      </div>

      {/* header */}
      <div className="relative bg-gradient-to-br from-red-950/30 via-neutral-900/50 to-black border-b border-red-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="transform transition-all duration-500 hover:scale-105">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-red-600 to-red-500 rounded-lg">
                  <Users size={28} />
                </div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
                  Creator & Talent Hub
                </h1>
              </div>
              <p className="text-neutral-300 ml-14">
                Discover{" "}
                <span className="text-red-400 font-semibold">{totalCount}</span>{" "}
                creators and analyze their portfolios
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "network" : "grid")
                }
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 rounded-lg transition-all duration-300 border border-neutral-700 hover:border-red-600/50 transform hover:scale-105"
              >
                {viewMode === "grid" ? (
                  <NetworkIcon size={18} />
                ) : (
                  <BarChart3 size={18} />
                )}
                <span>
                  {viewMode === "grid" ? "Network View" : "Grid View"}
                </span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/50"
              >
                <Filter size={18} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* director/actor search */}
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-hover:text-red-400 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by creator name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 hover:border-red-600/30"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="relative bg-gradient-to-r from-neutral-900/95 via-neutral-800/95 to-neutral-900/95 border-b border-red-900/20 backdrop-blur-md animate-slideDown">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Role
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All Roles</option>
                  <option value="Director">Directors</option>
                  <option value="Actor">Actors</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="projects">Project Count</option>
                  <option value="rating">Average Rating</option>
                  <option value="revenue">Total Revenue</option>
                  <option value="popularity">Popularity</option>
                  <option value="name">Name</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Min Projects: {minProjects}
                </label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={minProjects}
                  onChange={(e) => setMinProjects(parseInt(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
                {/* Page size (grid) */}
                <div className="mt-3 flex items-center gap-2 text-neutral-400 text-sm">
                  <span>Page size</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(parseInt(e.target.value))}
                    className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-white"
                  >
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={36}>36</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Network-only controls */}
            {viewMode === "network" && (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Network Nodes: {netLimit}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="250"
                    value={netLimit}
                    onChange={(e) => setNetLimit(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Min Collaborations (edge): {netMin}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={netMin}
                    onChange={(e) => setNetMin(parseInt(e.target.value))}
                    className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Stats Overview (global) */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={<Users className="text-red-500" size={24} />}
            number={totalCount}
            label="Total Creators"
            glow="red"
          />
          <StatCard
            icon={<Globe className="text-purple-500" size={24} />}
            number={diversityMetrics.totalCountries}
            label="Countries Represented"
            glow="purple"
          />
          <StatCard
            icon={<Film className="text-blue-500" size={24} />}
            number={diversityMetrics.totalGenres}
            label="Unique Genres"
            glow="blue"
          />
          <StatCard
            icon={<Zap className="text-green-500" size={24} />}
            number={risingStars.length}
            label="Rising Stars"
            glow="green"
          />
        </div>

        {/* Rising Stars (global) */}
        <SectionTitle
          icon={<Sparkles className="text-yellow-500" size={24} />}
          title="Rising Stars"
          gradient="from-yellow-400 to-yellow-500"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {risingStars.slice(0, 5).map((talent, index) => (
            <div
              key={talent.name}
              onClick={() => setSelectedTalent(talent)}
              className="group bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-600/30 rounded-lg p-4 hover:border-yellow-500/60 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-lg hover:shadow-yellow-600/20"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Crown className="text-yellow-500 flex-shrink-0" size={16} />
                <div className="text-lg font-semibold text-white truncate">
                  {talent.name}
                </div>
              </div>
              <div className="text-xs text-neutral-400 mb-2">{talent.role}</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-300">
                  {talent.projectCount} projects
                </span>
                <Star className="text-yellow-500" size={14} />
              </div>
            </div>
          ))}
        </div>

        {/* Top Collaborations (global) */}
        <SectionTitle
          icon={<NetworkIcon className="text-purple-500" size={24} />}
          title="Top Collaborations"
          gradient="from-purple-400 to-purple-500"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {topCollaborations.slice(0, 6).map((collab, index) => (
            <div
              key={`${collab.persons[0]}-${collab.persons[1]}-${index}`}
              className="group bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-600/30 rounded-lg p-4 hover:border-purple-500/60 transition-all duration-300 transform hover:scale-105"
            >
              <div className="flex items-center gap-2 mb-2">
                <Users className="text-purple-400 flex-shrink-0" size={16} />
                <span className="text-sm font-semibold text-purple-300">
                  {collab.count} collaborations
                </span>
              </div>
              <div className="text-white font-medium text-sm">
                {collab.persons[0]}
              </div>
              <ChevronRight className="text-neutral-500 my-1" size={14} />
              <div className="text-white font-medium text-sm">
                {collab.persons[1]}
              </div>
            </div>
          ))}
        </div>

        {/* Main section: Grid OR Network */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">
              {viewMode === "grid" ? (
                <>
                  All Talent{" "}
                  <span className="text-neutral-500">({totalCount})</span>
                </>
              ) : (
                <>
                  Collaboration Network{" "}
                  <span className="text-neutral-500">
                    ({network.nodes.length} nodes)
                  </span>
                </>
              )}
            </h2>

            {viewMode === "grid" ? (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPrev={() => setPage((p) => Math.max(1, p - 1))}
                onNext={() => setPage((p) => Math.min(totalPages, p + 1))}
              />
            ) : (
              <div className="text-sm text-neutral-400">
                Showing nodes seeded by search/role, built over the full dataset
              </div>
            )}
          </div>
        </div>

        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {talents.map((talent, index) => (
              <TalentCard
                key={`${talent.name}-${index}`}
                talent={talent}
                onClick={() => setSelectedTalent(talent)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-900/80">
            <ForceGraph2D
              graphData={network}
              height={620}
              linkColor={() => "rgba(239,68,68,0.35)"} // subtle red edges
              linkWidth={(l) => Math.max(1, Math.log2((l.count || 1) + 1))}
              linkDirectionalParticles={(l) => (l.count >= 4 ? 2 : 0)}
              linkDirectionalParticleSpeed={0.004}
              nodeRelSize={4}
              nodeVal={(n) => Math.max(4, Math.sqrt(n.projectCount || 1) * 2)}
              onNodeClick={(node) => setSelectedTalent(node)}
              nodeCanvasObject={(node, ctx, globalScale) => {
                const label = `${node.name} • ${node.role} • ${node.projectCount}`;
                const fontSize = Math.max(10, 16 / Math.sqrt(globalScale));
                const radius = Math.max(
                  4,
                  Math.sqrt(node.projectCount || 1) * 2
                );
                const color = node.role === "Director" ? "#ef4444" : "#60a5fa"; // red vs blue

                // glow
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius + 3, 0, 2 * Math.PI, false);
                ctx.fillStyle =
                  node.role === "Director"
                    ? "rgba(239,68,68,0.15)"
                    : "rgba(96,165,250,0.15)";
                ctx.fill();

                // node
                ctx.beginPath();
                ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI, false);
                ctx.fillStyle = color;
                ctx.fill();

                // label
                ctx.font = `${fontSize}px sans-serif`;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillStyle = "#e5e7eb";
                ctx.fillText(label, node.x + radius + 4, node.y);
              }}
            />
          </div>
        )}
      </div>

      {/* Talent Detail Modal (works from grid and network) */}
      {selectedTalent && (
        <TalentModal
          talent={selectedTalent}
          onClose={() => setSelectedTalent(null)}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
};

/* ---------- Small UI helpers ----------- */

function StatCard({ icon, number, label, glow }) {
  const glowBorder =
    glow === "red"
      ? "hover:border-red-600/50"
      : glow === "purple"
      ? "hover:border-purple-600/50"
      : glow === "blue"
      ? "hover:border-blue-600/50"
      : "hover:border-green-600/50";
  return (
    <div
      className={`group bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg p-6 transition-all duration-300 transform hover:scale-105 ${glowBorder}`}
    >
      <div className="flex items-center justify-between mb-3">{icon}</div>
      <div className="text-3xl font-bold bg-gradient-to-r from-red-400 to-red-500 bg-clip-text text-transparent">
        {number}
      </div>
      <div className="text-sm text-neutral-400">{label}</div>
    </div>
  );
}

function SectionTitle({ icon, title, gradient }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h2
        className={`text-2xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}
      >
        {title}
      </h2>
    </div>
  );
}

function Pagination({ page, totalPages, onPrev, onNext }) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onPrev}
        disabled={page <= 1}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 border ${
          page <= 1
            ? "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
            : "bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 border-neutral-700 hover:border-red-600/50"
        }`}
      >
        <ChevronLeftIcon /> Prev
      </button>
      <span className="text-neutral-400 text-sm">
        Page <span className="text-white">{page}</span> / {totalPages}
      </span>
      <button
        onClick={onNext}
        disabled={page >= totalPages}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 border ${
          page >= totalPages
            ? "bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed"
            : "bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 border-neutral-700 hover:border-red-600/50"
        }`}
      >
        Next <ChevronRight size={18} />
      </button>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className="text-neutral-300"
    >
      <path
        fill="currentColor"
        d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      />
    </svg>
  );
}

/* ---- Cards & Modal (unchanged visuals) ---- */

function TalentCard({ talent, onClick }) {
  return (
    <div
      onClick={onClick}
      className="group bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-red-600/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-red-600/20 animate-fadeInUp"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-red-400 transition-colors">
            {talent.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded text-xs text-neutral-300 border border-neutral-600">
              {talent.role}
            </span>
            {talent.projectCount > 20 && (
              <Award className="text-yellow-500" size={16} />
            )}
          </div>
        </div>
        <ChevronRight
          className="text-neutral-500 group-hover:text-red-400 transition-colors"
          size={20}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Film size={14} className="text-blue-400" />
            <span className="text-xs text-neutral-400">Projects</span>
          </div>
          <div className="text-xl font-bold text-white">
            {talent.projectCount}
          </div>
        </div>
        <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50">
          <div className="flex items-center gap-2 mb-1">
            <Star size={14} className="text-yellow-400" />
            <span className="text-xs text-neutral-400">Rating</span>
          </div>
          <div className="text-xl font-bold text-white">{talent.avgRating}</div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-neutral-400 mb-3">
        <span className="flex items-center gap-1">
          <Film size={14} /> {talent.moviesCount} movies
        </span>
        <span className="flex items-center gap-1">
          <Tv size={14} /> {talent.tvShowsCount} shows
        </span>
      </div>

      <div className="flex flex-wrap gap-1">
        {talent.genres.slice(0, 3).map((genre, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded text-xs border border-neutral-700"
          >
            {genre}
          </span>
        ))}
        {talent.genres.length > 3 && (
          <span className="px-2 py-1 bg-neutral-800 text-neutral-400 rounded text-xs">
            +{talent.genres.length - 3}
          </span>
        )}
      </div>
    </div>
  );
}

function TalentModal({ talent, onClose, formatCurrency }) {
  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-6 z-50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-red-900/30 shadow-2xl shadow-red-600/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8">
          {/* header */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start gap-4 flex-1">
              <div className="p-3 bg-gradient-to-br from-red-600 to-red-500 rounded-xl transform transition-transform duration-300 hover:scale-110">
                {talent.role === "Director" ? (
                  <Film className="text-white" size={32} />
                ) : (
                  <Users className="text-white" size={32} />
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-4xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent mb-2">
                  {talent.name}
                </h2>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded-lg text-sm text-neutral-300 border border-neutral-600">
                    {talent.role}
                  </span>
                  {talent.projectCount > 20 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-900/30 to-yellow-800/30 rounded-lg border border-yellow-600/30">
                      <Crown className="text-yellow-500" size={16} />
                      <span className="text-yellow-400 text-sm font-semibold">
                        Veteran
                      </span>
                    </div>
                  )}
                  {talent.avgRating > 7.5 && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-purple-900/30 to-purple-800/30 rounded-lg border border-purple-600/30">
                      <Award className="text-purple-400" size={16} />
                      <span className="text-purple-400 text-sm font-semibold">
                        Acclaimed
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-red-900/30 rounded-lg transition-all duration-300 group hover:rotate-90 transform"
            >
              <X
                size={24}
                className="text-neutral-400 group-hover:text-red-400 transition-colors"
              />
            </button>
          </div>

          {/* metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={<Film className="text-blue-400" size={20} />}
              label="Projects"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                {talent.projectCount}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                {talent.moviesCount}M / {talent.tvShowsCount}TV
              </div>
            </MetricCard>

            <MetricCard
              icon={<Star className="text-yellow-400" size={20} />}
              label="Avg Rating"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                {talent.avgRating}
              </div>
              <div className="text-xs text-neutral-500 mt-1">out of 10</div>
            </MetricCard>

            <MetricCard
              icon={<DollarSign className="text-green-400" size={20} />}
              label="Revenue"
            >
              <div className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                {formatCurrency(talent.totalRevenue)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">
                Total earnings
              </div>
            </MetricCard>

            <MetricCard
              icon={<TrendingUp className="text-purple-400" size={20} />}
              label="Popularity"
            >
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-purple-500 bg-clip-text text-transparent">
                {(talent.avgPopularity ?? 0).toFixed(1)}
              </div>
              <div className="text-xs text-neutral-500 mt-1">Average score</div>
            </MetricCard>
          </div>

          {/* portfolio analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Panel
              title="Genre Expertise"
              icon={<Target size={20} />}
              tint="red"
            >
              <div className="space-y-2">
                {talent.genres.slice(0, 5).map((genre, idx) => {
                  const count = (talent.projects || []).filter((p) =>
                    p.genres?.includes(genre)
                  ).length;
                  const pct = talent.projectCount
                    ? (count / talent.projectCount) * 100
                    : 0;
                  return (
                    <Bar
                      key={idx}
                      label={genre}
                      count={count}
                      pct={pct}
                      colorFrom="from-red-600"
                      colorTo="to-red-500"
                    />
                  );
                })}
              </div>
            </Panel>

            <Panel
              title="Global Reach"
              icon={<Globe size={20} />}
              tint="purple"
            >
              <div className="space-y-2">
                {talent.countries.slice(0, 5).map((country, idx) => {
                  const count = (talent.projects || []).filter(
                    (p) =>
                      p.country &&
                      (Array.isArray(p.country)
                        ? p.country.includes(country)
                        : String(p.country) === country)
                  ).length;
                  const pct = talent.projectCount
                    ? (count / talent.projectCount) * 100
                    : 0;
                  return (
                    <Bar
                      key={idx}
                      label={country}
                      count={count}
                      pct={pct}
                      colorFrom="from-purple-600"
                      colorTo="to-purple-500"
                    />
                  );
                })}
              </div>
            </Panel>
          </div>

          {/* collaborators */}
          <Panel
            title={`Collaboration Network (${talent.collaborators.length} people)`}
            icon={<NetworkIcon size={20} />}
            tint="blue"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {talent.collaborators.slice(0, 12).map((collab, idx) => (
                <div
                  key={idx}
                  className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-700/50 hover:border-blue-600/50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
                >
                  <div className="text-sm text-white truncate font-medium">
                    {collab}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">
                    {
                      (talent.projects || []).filter((p) =>
                        talent.role === "Director"
                          ? (p.cast || []).includes(collab)
                          : String(p.director || "")
                              .split(",")
                              .map((d) => d.trim())
                              .includes(collab)
                      ).length
                    }{" "}
                    projects
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* recent projects */}
          <Panel
            title={`Recent Projects (Top ${Math.min(
              6,
              (talent.projects || []).length
            )} by rating)`}
            icon={<Film size={20} />}
            tint="green"
          >
            <div className="space-y-3">
              {(talent.projects || [])
                .slice()
                .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                .slice(0, 6)
                .map((project, idx) => (
                  <div
                    key={idx}
                    className="group bg-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-green-600/50 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {project.type === "Movie" ? (
                            <Film
                              className="text-blue-400 flex-shrink-0"
                              size={16}
                            />
                          ) : (
                            <Tv
                              className="text-purple-400 flex-shrink-0"
                              size={16}
                            />
                          )}
                          <h4 className="text-white font-semibold group-hover:text-green-400 transition-colors">
                            {project.title}
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {project.release_year || "N/A"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star size={12} className="text-yellow-500" />
                            {project.rating || "N/A"}
                          </span>
                          {project.revenue && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <DollarSign
                                  size={12}
                                  className="text-green-500"
                                />
                                {formatCurrency(project.revenue)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </Panel>
        </div>
      </div>
    </div>
  );
}

/* --- tiny building blocks --- */

function MetricCard({ icon, label, children }) {
  return (
    <div className="bg-gradient-to-br from-neutral-900/50 to-neutral-900/30 rounded-lg p-5 border border-neutral-700/50 hover:border-neutral-600/50 transition-all duration-300 transform hover:scale-[1.01]">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs text-neutral-400 uppercase tracking-wide">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function Panel({ title, icon, tint, children }) {
  const border =
    tint === "red"
      ? "border-red-600/30 hover:border-red-500/60"
      : tint === "purple"
      ? "border-purple-600/30 hover:border-purple-500/60"
      : tint === "blue"
      ? "border-blue-600/30 hover:border-blue-500/60"
      : "border-green-600/30 hover:border-green-500/60";
  const titleColor =
    tint === "red"
      ? "text-red-400"
      : tint === "purple"
      ? "text-purple-400"
      : tint === "blue"
      ? "text-blue-400"
      : "text-green-400";
  return (
    <div
      className={`bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-6 border ${border} transition-all duration-300`}
    >
      <h3
        className={`text-lg font-semibold ${titleColor} mb-4 flex items-center gap-2`}
      >
        {icon}
        {title}
      </h3>
      {children}
    </div>
  );
}

function Bar({ label, count, pct, colorFrom, colorTo }) {
  return (
    <div className="group">
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-neutral-300">{label}</span>
        <span className="text-neutral-500">{count} projects</span>
      </div>
      <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorFrom} ${colorTo} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        ></div>
      </div>
    </div>
  );
}

export default CreatorTalentHub;
