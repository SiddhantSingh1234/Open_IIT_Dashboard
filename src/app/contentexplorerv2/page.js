"use client";
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  X,
  ChevronDown,
  ChevronUp,
  Calendar,
  Film,
  Tv,
  Globe,
  Star,
  Users,
  DollarSign,
  TrendingUp,
} from "lucide-react";

const ContentExplorer = () => {
  // Draft input for the search box (type freely here)
  const [searchDraft, setSearchDraft] = useState("");
  // Actual query sent to backend (updates only when you click Search or press Enter)
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedType, setSelectedType] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [yearRange, setYearRange] = useState({ min: 1900, max: 2024 });
  const [ratingRange, setRatingRange] = useState({ min: 0, max: 10 });
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  // NEW: server-driven state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(50); // paging supported server-side; no UI change
  const [totalCount, setTotalCount] = useState(0);
  const [facets, setFacets] = useState({
    countries: [],
    genres: [],
    languages: [],
  });
  const [serverItems, setServerItems] = useState([]);

  // kept for minimal UI changes where you referenced contentData.length in the header
  const [contentData, setContentData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // reset to page 1 when filters/sort/search change
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    selectedType,
    selectedCountry,
    selectedGenre,
    selectedLanguage,
    yearRange.min,
    yearRange.max,
    ratingRange.min,
    ratingRange.max,
    sortBy,
    sortOrder,
  ]);

  // fetch from server whenever query state changes (including page)
  useEffect(() => {
    const controller = new AbortController();

    async function loadFromServer() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          q: searchTerm,
          type: selectedType,
          country: selectedCountry,
          genre: selectedGenre,
          language: selectedLanguage,
          yearMin: String(yearRange.min),
          yearMax: String(yearRange.max),
          ratingMin: String(ratingRange.min),
          ratingMax: String(ratingRange.max),
          sortBy,
          sortOrder,
          page: String(page),
          pageSize: String(pageSize),
        });
        const res = await fetch(`/api/content?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        setServerItems(json.items || []);
        setFacets(json.facets || { countries: [], genres: [], languages: [] });
        setTotalCount(json.meta?.total || 0);
        // keep header count working without UI changes
        setContentData(
          Array.from({ length: json.meta?.total || 0 }, (_, i) => ({ _i: i }))
        );
        setError(null);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(`Failed to load data: ${err?.message || String(err)}`);
      } finally {
        setLoading(false);
      }
    }

    loadFromServer();
    return () => controller.abort();
  }, [
    searchTerm,
    selectedType,
    selectedCountry,
    selectedGenre,
    selectedLanguage,
    yearRange.min,
    yearRange.max,
    ratingRange.min,
    ratingRange.max,
    sortBy,
    sortOrder,
    page,
    pageSize,
  ]);

  // Use server-provided facets
  const countries = facets.countries;
  const genres = facets.genres;
  const languages = facets.languages;

  // All filtering/sorting/paging is server-side now.
  const filteredAndSortedData = useMemo(() => serverItems, [serverItems]);

  const exportToCSV = async () => {
    const params = new URLSearchParams({
      q: searchTerm,
      type: selectedType,
      country: selectedCountry,
      genre: selectedGenre,
      language: selectedLanguage,
      yearMin: String(yearRange.min),
      yearMax: String(yearRange.max),
      ratingMin: String(ratingRange.min),
      ratingMax: String(ratingRange.max),
      sortBy,
      sortOrder,
      export: "1", // fetch ALL filtered rows (ignores paging)
    });
    const res = await fetch(`/api/content?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      alert(`Export failed (HTTP ${res.status})`);
      return;
    }
    const { items } = await res.json();
    const headers = [
      "Title",
      "Type",
      "Director",
      "Cast",
      "Country",
      "Release Year",
      "Rating",
      "Genres",
      "Language",
      "Popularity",
      "Budget",
      "Revenue",
      "Description",
    ];
    const rows = items.map((item) =>
      [
        `"${item.title || "N/A"}"`,
        item.type || "N/A",
        `"${item.director || "N/A"}"`,
        `"${Array.isArray(item.cast) ? item.cast.join(", ") : "N/A"}"`,
        `"${Array.isArray(item.country) ? item.country.join(", ") : "N/A"}"`,
        item.release_year || "N/A",
        item.rating ?? "N/A",
        `"${Array.isArray(item.genres) ? item.genres.join(", ") : "N/A"}"`,
        item.language || "N/A",
        item.popularity ?? "N/A",
        item.budget ?? "N/A",
        item.revenue ?? "N/A",
        `"${(item.description || "N/A").replace(/"/g, '""')}"`,
      ].join(",")
    );
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `netflix_content_${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSearchDraft(""); // keep input box in sync when clearing
    setSelectedType("all");
    setSelectedCountry("all");
    setSelectedGenre("all");
    setSelectedLanguage("all");
    setYearRange({ min: 1900, max: 2024 });
    setRatingRange({ min: 0, max: 10 });
  };

  const activeFiltersCount = [
    selectedType !== "all",
    selectedCountry !== "all",
    selectedGenre !== "all",
    selectedLanguage !== "all",
    yearRange.min !== 1900 || yearRange.max !== 2024,
    ratingRange.min !== 0 || ratingRange.max !== 10,
  ].filter(Boolean).length;

  const formatCurrency = (value) => {
    if (!value || value === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "N/A";
    return new Intl.NumberFormat("en-US").format(value);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-red-600/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-neutral-300 animate-pulse">Loading content...</p>
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
      {/* Add custom CSS for animations */}
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>

      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          style={{ animationDelay: "2s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-5"
          style={{ animationDelay: "4s" }}
        ></div>
      </div>

      {/* Header */}
      <div className="relative bg-gradient-to-br from-red-950/30 via-neutral-900/50 to-black border-b border-red-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="transform transition-all duration-500 hover:scale-105">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent mb-2 animate-gradient">
                Content Explorer
              </h1>
              <p className="text-neutral-300">
                Discover and analyze{" "}
                <span className="text-red-400 font-semibold">{totalCount}</span>{" "}
                movies and shows
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-neutral-800 to-neutral-900 hover:from-neutral-700 hover:to-neutral-800 rounded-lg transition-all duration-300 border border-neutral-700 hover:border-red-600/50 transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/20"
              >
                <Filter
                  size={18}
                  className="group-hover:rotate-12 transition-transform duration-300"
                />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-gradient-to-r from-red-600 to-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={exportToCSV}
                disabled={filteredAndSortedData.length === 0}
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:from-neutral-700 disabled:to-neutral-700 disabled:cursor-not-allowed rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-600/50"
              >
                <Download
                  size={18}
                  className="group-hover:translate-y-1 transition-transform duration-300"
                />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <button
              type="button"
              onClick={() => setSearchTerm(searchDraft)}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 group-hover:text-red-400 transition-colors duration-300 z-10"
              aria-label="Search"
              title="Search"
            >
              <Search size={20} />
            </button>
            <input
              type="text"
              placeholder="Search by title, cast, director, or description..."
              value={searchDraft}
              onChange={(e) => setSearchDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setSearchTerm(searchDraft);
              }}
              className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 hover:border-red-600/30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/5 to-red-600/0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="relative bg-gradient-to-r from-neutral-900/95 via-neutral-800/95 to-neutral-900/95 border-b border-red-900/20 backdrop-blur-md animate-slideDown">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                >
                  <option value="all">All Types</option>
                  <option value="Movie">Movies</option>
                  <option value="TV Show">TV Shows</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                >
                  <option value="all">All Countries</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Genre
                </label>
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                >
                  <option value="all">All Genres</option>
                  {genres.map((genre) => (
                    <option key={genre} value={genre}>
                      {genre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Language
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                >
                  <option value="all">All Languages</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Release Year Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={yearRange.min}
                    onChange={(e) =>
                      setYearRange((prev) => ({
                        ...prev,
                        min: parseInt(e.target.value) || 1900,
                      }))
                    }
                    className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={yearRange.max}
                    onChange={(e) =>
                      setYearRange((prev) => ({
                        ...prev,
                        max: parseInt(e.target.value) || 2024,
                      }))
                    }
                    className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                    placeholder="Max"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Rating Range (0-10)
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={ratingRange.min}
                    onChange={(e) =>
                      setRatingRange((prev) => ({
                        ...prev,
                        min: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={ratingRange.max}
                    onChange={(e) =>
                      setRatingRange((prev) => ({
                        ...prev,
                        max: parseFloat(e.target.value) || 10,
                      }))
                    }
                    className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-red-400 transition-colors duration-300"
              >
                <X size={16} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="relative max-w-7xl mx-auto px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="text-neutral-400">
            <span className="text-white font-semibold bg-gradient-to-r from-red-500 to-red-400 bg-clip-text text-transparent">
              {totalCount}
            </span>{" "}
            results found
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 hover:border-red-600/30 transition-all duration-300"
            >
              <option value="title">Title</option>
              <option value="release_year">Release Year</option>
              <option value="date_added">Date Added</option>
              <option value="rating">Rating</option>
              <option value="popularity">Popularity</option>
              <option value="revenue">Revenue</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-all duration-300 hover:border-red-600/30 hover:shadow-lg hover:shadow-red-600/20"
            >
              {sortOrder === "asc" ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Pagination (Prev / Next) */}
      {(() => {
        const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
        return (
          <div className="relative max-w-7xl mx-auto px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
            <div className="text-sm text-neutral-400">
              Page <span className="text-white font-semibold">{page}</span> of{" "}
              <span className="text-white font-semibold">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800 disabled:opacity-50 border border-neutral-700 rounded-lg text-white text-sm transition-all duration-300 hover:border-red-600/30 hover:shadow-lg hover:shadow-red-600/20"
                aria-label="Previous page"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-800 disabled:opacity-50 border border-neutral-700 rounded-lg text-white text-sm transition-all duration-300 hover:border-red-600/30 hover:shadow-lg hover:shadow-red-600/20"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </div>
        );
      })()}

      {/* Content Grid */}
      <div className="relative max-w-7xl mx-auto px-6 py-8">
        {filteredAndSortedData.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-neutral-600 mb-4">
              <Search size={64} className="mx-auto mb-4 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-neutral-400 mb-2">
              No results found
            </h3>
            <p className="text-neutral-500">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredAndSortedData.map((item, index) => (
              <div
                key={item.show_id}
                onClick={() => setSelectedContent(item)}
                style={{ animationDelay: `${index * 50}ms` }}
                className="group relative bg-gradient-to-br from-neutral-900 to-neutral-800 border border-neutral-700 rounded-lg p-6 hover:border-red-600/50 transition-all duration-300 cursor-pointer animate-fadeInUp overflow-hidden transform hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/20"
              >
                {/* Animated gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                <div className="relative flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1 transform group-hover:scale-110 transition-transform duration-300">
                        {item.type === "Movie" ? (
                          <Film
                            className="text-red-500 group-hover:text-red-400 transition-colors"
                            size={24}
                          />
                        ) : (
                          <Tv
                            className="text-purple-500 group-hover:text-purple-400 transition-colors"
                            size={24}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1 group-hover:text-red-400 transition-colors duration-300">
                          {item.title || "N/A"}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {item.release_year || "N/A"}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" />
                            {item.rating || "N/A"}
                          </span>
                          {item.popularity && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <TrendingUp
                                  size={14}
                                  className="text-green-500"
                                />
                                {parseFloat(item.popularity).toFixed(1)}
                              </span>
                            </>
                          )}
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-neutral-800 to-neutral-700 border border-neutral-600 rounded text-xs uppercase">
                            {item.language || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-300 text-sm mb-4 line-clamp-2 group-hover:text-neutral-200 transition-colors duration-300">
                      {item.description || "No description available"}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div>
                        <span className="text-neutral-500">Director:</span>
                        <span className="text-neutral-300 ml-2">
                          {item.director || "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Country:</span>
                        <span className="text-neutral-300 ml-2">
                          {Array.isArray(item.country)
                            ? item.country.join(", ")
                            : "N/A"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(item.genres) &&
                        item.genres.map((genre, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gradient-to-r from-neutral-800 to-neutral-700 text-neutral-300 rounded text-xs border border-neutral-600 group-hover:border-red-600/30 transition-all duration-300 hover:from-red-900/50 hover:to-red-800/50"
                          >
                            {genre}
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

      {/* Detail Modal */}
      {selectedContent && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center p-6 z-50 backdrop-blur-sm animate-fadeInUp"
          onClick={() => setSelectedContent(null)}
        >
          <div
            className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-red-900/30 shadow-2xl shadow-red-600/20 transform transition-all duration-500"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  <div className="transform transition-transform duration-300 hover:scale-110">
                    {selectedContent.type === "Movie" ? (
                      <Film className="text-red-500 flex-shrink-0" size={32} />
                    ) : (
                      <Tv className="text-purple-500 flex-shrink-0" size={32} />
                    )}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-red-500 to-red-300 bg-clip-text text-transparent mb-2">
                      {selectedContent.title || "N/A"}
                    </h2>
                    <div className="flex items-center gap-3 text-neutral-400">
                      <span className="px-2 py-1 bg-gradient-to-r from-neutral-800 to-neutral-700 rounded text-xs border border-neutral-600">
                        {selectedContent.type || "N/A"}
                      </span>
                      <span>•</span>
                      <span>{selectedContent.release_year || "N/A"}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500" />
                        <span className="font-semibold text-yellow-400">
                          {selectedContent.rating || "N/A"}
                        </span>
                        <span className="text-xs">
                          ({formatNumber(selectedContent.vote_count)} votes)
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="p-2 hover:bg-red-900/30 rounded-lg transition-all duration-300 group hover:rotate-90 transform"
                >
                  <X
                    size={24}
                    className="text-neutral-400 group-hover:text-red-400 transition-colors"
                  />
                </button>
              </div>

              <div className="space-y-6">
                <div className="bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
                  <h3 className="text-lg font-semibold text-red-400 mb-2 flex items-center gap-2">
                    <span className="w-1 h-6 bg-gradient-to-b from-red-500 to-red-600 rounded"></span>
                    Description
                  </h3>
                  <p className="text-neutral-300 leading-relaxed">
                    {selectedContent.description || "No description available"}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-red-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                      <Users size={16} />
                      Cast
                    </h3>
                    <p className="text-neutral-300">
                      {Array.isArray(selectedContent.cast)
                        ? selectedContent.cast.join(", ")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-red-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                      <Film size={16} />
                      Director
                    </h3>
                    <p className="text-neutral-300">
                      {selectedContent.director || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-red-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                      <Globe size={16} />
                      Country
                    </h3>
                    <p className="text-neutral-300">
                      {Array.isArray(selectedContent.country)
                        ? selectedContent.country.join(", ")
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-red-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2 group-hover:text-red-400 transition-colors">
                      <Calendar size={16} />
                      Date Added
                    </h3>
                    <p className="text-neutral-300">
                      {selectedContent.date_added
                        ? new Date(
                            selectedContent.date_added
                          ).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "N/A"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-green-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2 group-hover:text-green-400 transition-colors">
                      <TrendingUp size={16} />
                      Popularity
                    </h3>
                    <p className="text-neutral-300">
                      {selectedContent.popularity || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-purple-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 group-hover:text-purple-400 transition-colors">
                      Language
                    </h3>
                    <p className="text-neutral-300 uppercase">
                      {selectedContent.language || "N/A"}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-yellow-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2 group-hover:text-yellow-400 transition-colors">
                      <DollarSign size={16} />
                      Budget
                    </h3>
                    <p className="text-neutral-300">
                      {formatCurrency(selectedContent.budget)}
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50 hover:border-green-600/30 transition-all duration-300 group">
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2 group-hover:text-green-400 transition-colors">
                      <DollarSign size={16} />
                      Revenue
                    </h3>
                    <p className="text-neutral-300">
                      {formatCurrency(selectedContent.revenue)}
                    </p>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-neutral-800/50 to-neutral-900/50 rounded-lg p-4 border border-neutral-700/50">
                  <h3 className="text-sm font-semibold text-neutral-400 mb-3 flex items-center gap-2">
                    <span className="w-1 h-5 bg-gradient-to-b from-purple-500 to-red-500 rounded"></span>
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(selectedContent.genres) &&
                    selectedContent.genres.length > 0 ? (
                      selectedContent.genres.map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-900/50 to-purple-900/50 text-neutral-300 rounded-lg text-sm border border-red-700/30 hover:border-red-500/50 hover:from-red-800/60 hover:to-purple-800/60 transition-all duration-300 transform hover:scale-105"
                        >
                          {genre}
                        </span>
                      ))
                    ) : (
                      <span className="text-neutral-500">
                        No genres available
                      </span>
                    )}
                  </div>
                </div>

                {selectedContent.vote_average && (
                  <div className="bg-gradient-to-br from-neutral-800/80 via-neutral-900/80 to-neutral-800/80 border border-red-900/30 rounded-lg p-6 shadow-lg">
                    <h3 className="text-sm font-semibold text-red-400 mb-4 flex items-center gap-2">
                      <span className="w-1 h-5 bg-gradient-to-b from-red-500 to-yellow-500 rounded"></span>
                      Ratings & Performance
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                      <div className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 rounded-lg p-4 border border-yellow-600/30 hover:border-yellow-500/50 transition-all duration-300 transform hover:scale-105">
                        <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
                          {selectedContent.vote_average || "N/A"}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          Average Rating
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 rounded-lg p-4 border border-blue-600/30 hover:border-blue-500/50 transition-all duration-300 transform hover:scale-105">
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent">
                          {formatNumber(selectedContent.vote_count)}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          Total Votes
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-900/20 to-green-800/20 rounded-lg p-4 border border-green-600/30 hover:border-green-500/50 transition-all duration-300 transform hover:scale-105">
                        <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-green-500 bg-clip-text text-transparent">
                          {selectedContent.popularity
                            ? parseFloat(selectedContent.popularity).toFixed(1)
                            : "N/A"}
                        </div>
                        <div className="text-xs text-neutral-400 mt-1">
                          Popularity Score
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentExplorer;
