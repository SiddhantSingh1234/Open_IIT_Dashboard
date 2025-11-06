"use client";
import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sun, Moon, Menu, X } from "lucide-react";

const NetflixNavHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const tabs = [
    {
      id: 0,
      name: "Executive Overview",
      shortName: "Overview",
      path: "/overview",
    },
    {
      id: 1,
      name: "Content Explorer",
      shortName: "Content",
      path: "/contentexplorerv2",
    },
    { id: 2, name: "Trend Intelligence", shortName: "Trends", path: "/trends" },
    {
      id: 3,
      name: "Geographic Insights",
      shortName: "Geographic",
      path: "/geographic",
    },
    {
      id: 4,
      name: "Genre & Category Intelligence",
      shortName: "Genre",
      path: "/genre",
    },
    {
      id: 5,
      name: "Creator & Talent Hub",
      shortName: "Talent",
      path: "/creatorandtalenthub",
    },
    {
      id: 6,
      name: "Strategic Recommendations",
      shortName: "Strategy",
      path: "/strategy",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (path) => {
    router.push(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path) => pathname === path;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? isDark
            ? "bg-black/95 backdrop-blur-md shadow-lg"
            : "bg-white/95 backdrop-blur-md shadow-lg"
          : isDark
          ? "bg-gradient-to-b from-black/90 to-transparent"
          : "bg-gradient-to-b from-white/90 to-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo/Brand */}
          <div className="flex items-center space-x-8">
            <div className="flex-shrink-0">
              <button
                onClick={() => handleNavigation("/")}
                className={`text-2xl sm:text-3xl font-bold tracking-tight transition-colors duration-300 ${
                  isDark
                    ? "text-red-600 hover:text-red-500"
                    : "text-red-700 hover:text-red-600"
                }`}
              >
                INSIGHTS
              </button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleNavigation(tab.path)}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 rounded-sm ${
                    isActive(tab.path)
                      ? isDark
                        ? "text-white"
                        : "text-gray-900"
                      : isDark
                      ? "text-gray-400 hover:text-gray-200"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <span className="relative z-10">{tab.shortName}</span>
                  {isActive(tab.path) && (
                    <span
                      className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                        isDark ? "bg-red-600" : "bg-red-700"
                      } animate-[slideIn_0.3s_ease-out]`}
                    ></span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                isDark
                  ? "bg-zinc-800 hover:bg-zinc-700 text-yellow-400"
                  : "bg-gray-200 hover:bg-gray-300 text-indigo-600"
              }`}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`lg:hidden p-2 rounded-md transition-colors duration-300 ${
                isDark
                  ? "text-gray-400 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${
          isMobileMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div
          className={`px-4 pt-2 pb-4 space-y-1 ${
            isDark ? "bg-black/95" : "bg-white/95"
          }`}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleNavigation(tab.path)}
              className={`w-full text-left px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                isActive(tab.path)
                  ? isDark
                    ? "bg-red-600 text-white"
                    : "bg-red-700 text-white"
                  : isDark
                  ? "text-gray-400 hover:bg-zinc-800 hover:text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              {tab.name}
            </button>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: scaleX(0);
          }
          to {
            transform: scaleX(1);
          }
        }
      `}</style>
    </nav>
  );
};

export default NetflixNavHeader;
