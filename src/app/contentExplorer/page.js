import React, { useState, useMemo, useEffect } from "react";
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
  Clock,
  Users,
} from "lucide-react";

const ContentExplorer = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [yearRange, setYearRange] = useState({ min: 1920, max: 2024 });
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedContent, setSelectedContent] = useState(null);

  // Sample data - replace with your actual data
  const [contentData] = useState([
    {
      show_id: "s1",
      type: "Movie",
      title: "The Irishman",
      director: "Martin Scorsese",
      cast: "Robert De Niro, Al Pacino, Joe Pesci",
      country: "United States",
      date_added: "2019-11-27",
      release_year: 2019,
      rating: "R",
      duration: "209 min",
      listed_in: "Crime, Drama",
      description:
        "An aging hitman recalls his time with the mob and the intersecting events with his friend, Jimmy Hoffa, through the 1950-70s.",
    },
    {
      show_id: "s2",
      type: "TV Show",
      title: "Stranger Things",
      director: "The Duffer Brothers",
      cast: "Millie Bobby Brown, Finn Wolfhard, Winona Ryder",
      country: "United States",
      date_added: "2016-07-15",
      release_year: 2016,
      rating: "TV-14",
      duration: "4 Seasons",
      listed_in: "Horror, Drama, Sci-Fi",
      description:
        "When a young boy vanishes, a small town uncovers a mystery involving secret experiments, terrifying supernatural forces.",
    },
    // Add more sample data as needed
  ]);

  const ratings = useMemo(() => {
    const allRatings = [...new Set(contentData.map((item) => item.rating))];
    return allRatings.sort();
  }, [contentData]);

  const countries = useMemo(() => {
    const allCountries = new Set();
    contentData.forEach((item) => {
      item.country.split(",").forEach((c) => allCountries.add(c.trim()));
    });
    return Array.from(allCountries).sort();
  }, [contentData]);

  const genres = useMemo(() => {
    const allGenres = new Set();
    contentData.forEach((item) => {
      item.listed_in.split(",").forEach((g) => allGenres.add(g.trim()));
    });
    return Array.from(allGenres).sort();
  }, [contentData]);

  const filteredAndSortedData = useMemo(() => {
    let filtered = contentData.filter((item) => {
      const matchesSearch =
        searchTerm === "" ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.cast.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.director.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = selectedType === "all" || item.type === selectedType;
      const matchesRating =
        selectedRating === "all" || item.rating === selectedRating;
      const matchesCountry =
        selectedCountry === "all" || item.country.includes(selectedCountry);
      const matchesGenre =
        selectedGenre === "all" || item.listed_in.includes(selectedGenre);
      const matchesYear =
        item.release_year >= yearRange.min &&
        item.release_year <= yearRange.max;

      return (
        matchesSearch &&
        matchesType &&
        matchesRating &&
        matchesCountry &&
        matchesGenre &&
        matchesYear
      );
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "release_year") {
        aVal = parseInt(aVal);
        bVal = parseInt(bVal);
      } else if (sortBy === "date_added") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [
    contentData,
    searchTerm,
    selectedType,
    selectedRating,
    selectedCountry,
    selectedGenre,
    yearRange,
    sortBy,
    sortOrder,
  ]);

  const exportToCSV = () => {
    const headers = [
      "Title",
      "Type",
      "Director",
      "Cast",
      "Country",
      "Release Year",
      "Rating",
      "Duration",
      "Genres",
      "Description",
    ];
    const csvContent = [
      headers.join(","),
      ...filteredAndSortedData.map((item) =>
        [
          `"${item.title}"`,
          item.type,
          `"${item.director}"`,
          `"${item.cast}"`,
          `"${item.country}"`,
          item.release_year,
          item.rating,
          `"${item.duration}"`,
          `"${item.listed_in}"`,
          `"${item.description}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
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
    setSelectedType("all");
    setSelectedRating("all");
    setSelectedCountry("all");
    setSelectedGenre("all");
    setYearRange({ min: 1920, max: 2024 });
  };

  const activeFiltersCount = [
    selectedType !== "all",
    selectedRating !== "all",
    selectedCountry !== "all",
    selectedGenre !== "all",
    yearRange.min !== 1920 || yearRange.max !== 2024,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-b from-neutral-900 to-black border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Content Explorer
              </h1>
              <p className="text-neutral-400">
                Discover and analyze Netflix's extensive catalog
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-all duration-200 border border-neutral-700"
              >
                <Filter size={18} />
                <span>Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={exportToCSV}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg transition-all duration-200"
              >
                <Download size={18} />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by title, cast, director, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-neutral-900 border-b border-neutral-800">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Type
                </label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All Types</option>
                  <option value="Movie">Movies</option>
                  <option value="TV Show">TV Shows</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Rating
                </label>
                <select
                  value={selectedRating}
                  onChange={(e) => setSelectedRating(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                >
                  <option value="all">All Ratings</option>
                  {ratings.map((rating) => (
                    <option key={rating} value={rating}>
                      {rating}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">
                  Country
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => setSelectedCountry(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
                  Year Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={yearRange.min}
                    onChange={(e) =>
                      setYearRange((prev) => ({
                        ...prev,
                        min: parseInt(e.target.value) || 1920,
                      }))
                    }
                    className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
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
                    className="w-1/2 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-600"
                    placeholder="Max"
                  />
                </div>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-neutral-400 hover:text-white transition-colors"
              >
                <X size={16} />
                Clear all filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="max-w-7xl mx-auto px-6 py-4 border-b border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="text-neutral-400">
            <span className="text-white font-semibold">
              {filteredAndSortedData.length}
            </span>{" "}
            results found
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-400">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600"
            >
              <option value="title">Title</option>
              <option value="release_year">Release Year</option>
              <option value="date_added">Date Added</option>
              <option value="rating">Rating</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="p-1.5 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition-colors"
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

      {/* Content Grid */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {filteredAndSortedData.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-neutral-600 mb-4">
              <Search size={64} className="mx-auto mb-4" />
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
            {filteredAndSortedData.map((item) => (
              <div
                key={item.show_id}
                onClick={() => setSelectedContent(item)}
                className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 hover:border-neutral-700 hover:bg-neutral-800 transition-all duration-200 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        {item.type === "Movie" ? (
                          <Film className="text-red-600" size={24} />
                        ) : (
                          <Tv className="text-red-600" size={24} />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-1">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-neutral-400">
                          <span className="flex items-center gap-1">
                            <Calendar size={14} />
                            {item.release_year}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {item.duration}
                          </span>
                          <span>•</span>
                          <span className="px-2 py-0.5 bg-neutral-800 border border-neutral-700 rounded text-xs">
                            {item.rating}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-neutral-300 text-sm mb-4 line-clamp-2">
                      {item.description}
                    </p>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-neutral-500">Director:</span>
                        <span className="text-neutral-300 ml-2">
                          {item.director}
                        </span>
                      </div>
                      <div>
                        <span className="text-neutral-500">Country:</span>
                        <span className="text-neutral-300 ml-2">
                          {item.country}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {item.listed_in.split(",").map((genre, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs"
                        >
                          {genre.trim()}
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
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-6 z-50"
          onClick={() => setSelectedContent(null)}
        >
          <div
            className="bg-neutral-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-neutral-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-start gap-4">
                  {selectedContent.type === "Movie" ? (
                    <Film className="text-red-600 flex-shrink-0" size={32} />
                  ) : (
                    <Tv className="text-red-600 flex-shrink-0" size={32} />
                  )}
                  <div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      {selectedContent.title}
                    </h2>
                    <div className="flex items-center gap-3 text-neutral-400">
                      <span>{selectedContent.type}</span>
                      <span>•</span>
                      <span>{selectedContent.release_year}</span>
                      <span>•</span>
                      <span className="px-2 py-1 bg-neutral-800 border border-neutral-700 rounded text-sm">
                        {selectedContent.rating}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedContent(null)}
                  className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <p className="text-neutral-300 leading-relaxed">
                    {selectedContent.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2">
                      <Users size={16} />
                      Cast
                    </h3>
                    <p className="text-neutral-300">{selectedContent.cast}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2">
                      <Film size={16} />
                      Director
                    </h3>
                    <p className="text-neutral-300">
                      {selectedContent.director}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2">
                      <Globe size={16} />
                      Country
                    </h3>
                    <p className="text-neutral-300">
                      {selectedContent.country}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2">
                      <Clock size={16} />
                      Duration
                    </h3>
                    <p className="text-neutral-300">
                      {selectedContent.duration}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2 flex items-center gap-2">
                      <Calendar size={16} />
                      Date Added
                    </h3>
                    <p className="text-neutral-300">
                      {new Date(selectedContent.date_added).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long", day: "numeric" }
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-neutral-400 mb-2">
                      Release Year
                    </h3>
                    <p className="text-neutral-300">
                      {selectedContent.release_year}
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-neutral-400 mb-3">
                    Genres
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedContent.listed_in.split(",").map((genre, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg text-sm border border-neutral-700"
                      >
                        {genre.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentExplorer;
