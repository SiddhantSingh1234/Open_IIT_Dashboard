// src/app/worldmap/page.js
import WorldChoroplethTabs from "@/components/WorldChoroplethTabs";
import { Globe } from "lucide-react";

export const metadata = {
  title: "Global Production Heatmap",
  description: "Movies & TV output by country on a Netflix-styled choropleth",
};

export default function WorldMapPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black text-white">
      {/* header */}
      <div className="relative bg-gradient-to-br from-red-950/30 via-neutral-900/50 to-black border-b border-red-900/20 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-red-600 to-red-500 rounded-lg">
              <Globe size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-500 via-red-600 to-red-400 bg-clip-text text-transparent">
              Global Production Heatmap
            </h1>
          </div>
          <p className="text-neutral-300 mt-2">
            Explore Movie & TV output by country. Use the tabs to switch datasets.
          </p>
        </div>
      </div>

      {/* main */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <WorldChoroplethTabs />
      </main>
    </div>
  );
}