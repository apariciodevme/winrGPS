"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, ChevronRight, X } from "lucide-react";
import { getAllWines, Wine, WineType } from "./lib/wine";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");

  const [wines, setWines] = useState<Wine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getAllWines();
      setWines(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const countries = useMemo(
    () => ["All", ...Array.from(new Set(wines.map((w) => w.country).filter(Boolean))).sort()],
    [wines]
  );

  const filteredWines = useMemo(() => {
    let filtered = wines;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = wines.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.producer.toLowerCase().includes(q) ||
          w.vintage.toLowerCase().includes(q) ||
          w.type.toLowerCase().includes(q) ||
          (w.country || "").toLowerCase().includes(q)
      );
    }

    if (selectedCountry !== "All") {
      filtered = filtered.filter((w) => w.country === selectedCountry);
    }

    return filtered;
  }, [wines, searchQuery, selectedCountry]);

  const groupedWines = useMemo(() => {
    if (searchQuery.trim()) return null;

    const order: WineType[] = ["sparkling", "white", "rose", "red", "sweet"];
    const groups: Record<string, Wine[]> = {};
    for (const t of order) groups[t] = [];

    for (const w of filteredWines) {
      if (groups[w.type] !== undefined) {
        groups[w.type].push(w);
      }
    }
    return groups;
  }, [filteredWines, searchQuery]);

  const formatType = (type: string) => {
    switch (type) {
      case "sparkling": return "Sparkling";
      case "white": return "White";
      case "red": return "Red";
      case "rose": return "Rosé";
      case "sweet": return "Sweet & Dessert";
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-foreground selection:text-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-10 sm:pt-12 pb-3 sm:pb-4">
        <div className="max-w-2xl mx-auto space-y-3 sm:space-y-4">
          <div className="flex items-end justify-between px-1">
            <h1 className="text-[28px] sm:text-[34px] leading-tight font-semibold tracking-tight">
              Wine Map
            </h1>
            <div className="text-[14px] sm:text-[15px] font-medium text-muted-foreground pb-1">
              {filteredWines.length} bottles
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
            <input
              type="text"
              placeholder="Search wines, producers, countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#efeff0] border border-transparent rounded-[10px] py-[7px] pl-10 pr-4 text-[17px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:ring-[3px] focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
            />
          </div>

          {!searchQuery && (
            <div className="relative">
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-[#efeff0] border-transparent rounded-[8px] py-1.5 pl-3 pr-8 text-[14px] font-medium text-foreground focus:ring-2 focus:ring-[#007aff]/30 focus:outline-none appearance-none cursor-pointer"
              >
                {countries.map((c) => (
                  <option key={c as string} value={c as string}>
                    {c === "All" ? "All Countries" : c as string}
                  </option>
                ))}
              </select>
              <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 mt-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-[#007aff] border-t-transparent animate-spin mb-4" />
            <p className="text-[17px] font-medium">Loading wine cellar...</p>
          </div>
        ) : searchQuery.trim() ? (
          <div className="space-y-4">
            <h2 className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              Top Hits
            </h2>
            {filteredWines.length > 0 ? (
              <div className="space-y-3">
                {filteredWines.map((wine) => (
                  <WineCard key={wine.id} wine={wine} onClick={() => setSelectedWine(wine)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p className="text-[17px]">No results found for &ldquo;{searchQuery}&rdquo;</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10">
            {groupedWines &&
              Object.entries(groupedWines).map(([type, typeWines]) => {
                if (typeWines.length === 0) return null;
                return (
                  <section key={type} className="space-y-3">
                    <h2 className="text-[20px] font-semibold text-foreground tracking-tight sticky top-[168px] bg-background/95 backdrop-blur-md z-40 py-2 px-1">
                      {formatType(type)}
                    </h2>
                    <div className="space-y-3">
                      {typeWines.map((wine) => (
                        <WineCard key={wine.id} wine={wine} onClick={() => setSelectedWine(wine)} />
                      ))}
                    </div>
                  </section>
                );
              })}
          </div>
        )}
      </main>

      {/* Wine Details Modal */}
      {selectedWine && (
        <WineModal wine={selectedWine} onClose={() => setSelectedWine(null)} />
      )}
    </div>
  );
}

function WineCard({ wine, onClick }: { wine: Wine; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="px-4 sm:px-5 py-3.5 sm:py-4 bg-card rounded-[14px] border border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-[#f9f9fb] transition-colors active:bg-[#f0f0f2] active:scale-[0.99] cursor-pointer"
    >
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
        <div className="space-y-0.5 flex-1">
          <h3 className="text-[16px] sm:text-[17px] font-medium leading-[20px] sm:leading-[22px] text-foreground">
            {wine.name}
          </h3>
          <div className="flex flex-col gap-0.5 pt-0.5">
            {wine.producer && (
              <p className="text-[14px] sm:text-[15px] font-normal text-muted-foreground line-clamp-1">
                {wine.producer}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-1.5 text-[13px] sm:text-[14px] text-muted-foreground">
              {wine.country && <span>{wine.country}</span>}
              {wine.country && wine.vintage && <span>&middot;</span>}
              {wine.vintage && <span>{wine.vintage}</span>}
            </div>
          </div>
        </div>
        {wine.location && (
          <div className="shrink-0 pt-0.5 self-start sm:self-auto">
            <span className="inline-flex items-center justify-center px-2 py-1 sm:px-2 sm:py-1.5 rounded-md bg-[#efeff0] text-[12px] sm:text-[13px] font-medium text-foreground/80">
              {wine.location}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function WineModal({ wine, onClose }: { wine: Wine; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop for click-outside */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-card rounded-t-[24px] sm:rounded-b-[24px] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-4 sm:zoom-in-95 duration-300 max-h-[90vh] flex flex-col overflow-hidden bottom-0 pb-safe">
        {/* Header with sticky close button */}
        <div className="sticky top-0 right-0 p-4 pb-2 sm:pb-4 flex justify-center sm:justify-end z-10 bg-card/90 backdrop-blur bg-fade-to-b">
          {/* Mobile Handle */}
          <div className="w-12 h-1.5 bg-border/80 rounded-full sm:hidden absolute top-3" />

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-[#f0f0f2] hover:bg-[#e0e0e1] active:bg-[#d1d1d6] text-muted-foreground rounded-full transition-colors ml-auto mt-2 sm:mt-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 sm:px-6 pb-8 overflow-y-auto">
          <div className="space-y-6">
            <div>
              {wine.producer && (
                <p className="text-[14px] sm:text-[15px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  {wine.producer}
                </p>
              )}
              <h2 className="text-[24px] sm:text-[28px] font-bold leading-tight text-foreground tracking-tight">
                {wine.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[15px] text-foreground/80 font-medium">
              {wine.country && (
                <span className="bg-[#f0f0f2] px-3 py-1 rounded-md">{wine.country}</span>
              )}
              {wine.vintage && (
                <span className="bg-[#f0f0f2] px-3 py-1 rounded-md">{wine.vintage}</span>
              )}
              <span className="bg-[#f0f0f2] px-3 py-1 rounded-md capitalize">{wine.type}</span>
            </div>

            {wine.description && (
              <div className="space-y-2 pb-4">
                <h3 className="text-[15px] font-semibold text-foreground">Tasting Notes</h3>
                <p className="text-[16px] leading-relaxed text-muted-foreground">
                  {wine.description}
                </p>
              </div>
            )}

            {wine.location && (
              <div className="bg-[#f0f0f2] rounded-xl p-4 flex items-center justify-between">
                <span className="text-[15px] font-semibold text-foreground">Location</span>
                <span className="text-[17px] font-bold text-foreground bg-white px-3 py-1 rounded-md shadow-sm">
                  {wine.location}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
