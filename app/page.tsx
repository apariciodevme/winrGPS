"use client";

import { useState, useMemo } from "react";
import { Search, Wine as WineIcon, GlassWater, ChevronRight, X, MapPin } from "lucide-react";
import { getAllWines, Wine, WineCategory, WineType } from "./lib/wine";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<WineCategory>("by_the_glass");
  const [selectedWine, setSelectedWine] = useState<Wine | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("All");
  const [selectedGrape, setSelectedGrape] = useState<string>("All");

  const wines = useMemo(() => getAllWines(), []);

  const countries = useMemo(() => ["All", ...Array.from(new Set(wines.map(w => w.country).filter(Boolean)))].sort(), [wines]);
  const grapes = useMemo(() => ["All", ...Array.from(new Set(wines.map(w => w.grape).filter(Boolean)))].sort(), [wines]);

  const filteredWines = useMemo(() => {
    let filtered = wines;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      filtered = wines.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.producer.toLowerCase().includes(q) ||
          w.region.toLowerCase().includes(q) ||
          w.vintage.toLowerCase().includes(q) ||
          w.type.toLowerCase().includes(q)
      );
    } else {
      filtered = wines.filter((w) => w.category === category);
    }

    if (selectedCountry !== "All") {
      filtered = filtered.filter((w) => w.country === selectedCountry);
    }

    if (selectedGrape !== "All") {
      filtered = filtered.filter((w) => w.grape === selectedGrape);
    }

    return filtered;
  }, [wines, searchQuery, category, selectedCountry, selectedGrape]);

  const groupedWines = useMemo(() => {
    if (searchQuery.trim()) return null;

    const groups: Record<string, Wine[]> = {
      sparkling: [],
      white: [],
      red: [],
      sweet: []
    };

    for (const w of filteredWines) {
      if (groups[w.type]) {
        groups[w.type].push(w);
      }
    }
    return groups;
  }, [filteredWines, searchQuery]);

  const formatType = (type: string) => {
    switch (type) {
      case 'beer_and_cider_draft': return 'Draft Beer & Cider';
      case 'beer_and_cider_bottle': return 'Bottled Beer & Cider';
      case 'non_alcoholic_beverages': return 'Non-Alcoholic Beverages';
      case 'non_alcoholic_soda_and_water': return 'Soda & Water';
      case 'dessert_wine': return 'Dessert Wine';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-foreground selection:text-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-12 pb-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <div className="flex items-end justify-between px-1">
            <h1 className="text-[34px] leading-tight font-semibold tracking-tight">
              Wine Menu
            </h1>
            <div className="text-[15px] font-medium text-muted-foreground pb-1">
              {filteredWines.length} items
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, grape, region..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#efeff0] border border-transparent rounded-[10px] py-[7px] pl-10 pr-4 text-[17px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:ring-[3px] focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
            />
          </div>

          {!searchQuery && (
            <div className="flex flex-col gap-3 w-full">
              <div className="flex p-[3px] bg-[#eeeff0] rounded-lg self-center w-full">
                <button
                  onClick={() => setCategory("by_the_glass")}
                  className={`flex-1 py-1 text-[13px] font-semibold tracking-wide rounded-[6px] transition-all ${category === "by_the_glass"
                    ? "bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)]"
                    : "text-foreground/70 hover:bg-[#e0e0e1]/50 active:bg-[#e0e0e1]"
                    }`}
                >
                  By the Glass
                </button>
                <button
                  onClick={() => setCategory("bottles")}
                  className={`flex-1 py-1 text-[13px] font-semibold tracking-wide rounded-[6px] transition-all ${category === "bottles"
                    ? "bg-white text-foreground shadow-[0_1px_3px_rgba(0,0,0,0.1),0_0_1px_rgba(0,0,0,0.1)]"
                    : "text-foreground/70 hover:bg-[#e0e0e1]/50 active:bg-[#e0e0e1]"
                    }`}
                >
                  Bottles
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
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
                <div className="relative flex-1">
                  <select
                    value={selectedGrape}
                    onChange={(e) => setSelectedGrape(e.target.value)}
                    className="w-full bg-[#efeff0] border-transparent rounded-[8px] py-1.5 pl-3 pr-8 text-[14px] font-medium text-foreground focus:ring-2 focus:ring-[#007aff]/30 focus:outline-none appearance-none cursor-pointer"
                  >
                    {grapes.map((g) => (
                      <option key={g as string} value={g as string}>
                        {g === "All" ? "All Grapes" : g as string}
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground rotate-90 pointer-events-none" />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 mt-8">
        {searchQuery.trim() ? (
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
                <p className="text-[17px]">No results found for "{searchQuery}"</p>
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
                    <h2 className="text-[20px] font-semibold text-foreground tracking-tight sticky top-[210px] bg-background/95 backdrop-blur-md z-40 py-2 px-1">
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
      className="px-5 py-4 bg-card rounded-[14px] border border-border/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)] hover:bg-[#f9f9fb] transition-colors active:bg-[#f0f0f2] active:scale-[0.99] cursor-pointer"
    >
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-0.5 flex-1 pr-4">
          <h3 className="text-[17px] font-medium leading-[22px] text-foreground">
            {wine.name}
          </h3>
          <div className="flex flex-col gap-0.5 pt-0.5">
            {wine.producer && (
              <p className="text-[15px] font-normal text-muted-foreground">
                {wine.producer}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-x-1.5 text-[15px] text-muted-foreground">
              {wine.grape && <span>{wine.grape}</span>}
              {wine.grape && <span>&middot;</span>}
              {(wine.region || wine.country) && <span>{wine.region || wine.country}</span>}
              {(wine.region || wine.country) && <span>&middot;</span>}
              <span>{wine.vintage}</span>
              {wine.category === "by_the_glass" && (
                <>
                  <span>&middot;</span>
                  <span className="text-[12px] uppercase font-semibold tracking-wider text-[#a1a1aa] ml-0.5">Glass</span>
                </>
              )}
              {wine.location && (
                <>
                  <span>&middot;</span>
                  <span className="flex items-center gap-0.5 text-[13px]">
                    <MapPin className="w-3 h-3 text-muted-foreground/80" />
                    {wine.location.split(',')[0]}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end shrink-0 pt-0.5 text-right">
          <p className="text-[17px] font-medium text-foreground">
            {wine.price_nok},-
          </p>
        </div>
      </div>
    </div>
  );
}

function WineModal({ wine, onClose }: { wine: Wine; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center p-4 pb-0 sm:pb-4 sm:p-6 bg-black/20 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop for click-outside */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-lg bg-card rounded-t-[24px] sm:rounded-[24px] shadow-2xl animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-4 duration-300 max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 right-0 p-4 flex justify-end z-10">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center bg-[#f0f0f2] hover:bg-[#e0e0e1] active:bg-[#d1d1d6] text-muted-foreground rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 pb-8 -mt-6">
          <div className="space-y-6">
            <div>
              {wine.producer && (
                <p className="text-[15px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                  {wine.producer}
                </p>
              )}
              <h2 className="text-[28px] font-bold leading-tight text-foreground tracking-tight">
                {wine.name}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[15px] text-foreground/80 font-medium">
              {wine.grape && (
                <span className="bg-[#f0f0f2] px-3 py-1 rounded-md">{wine.grape}</span>
              )}
              {(wine.region || wine.country) && (
                <span className="bg-[#f0f0f2] px-3 py-1 rounded-md">{wine.region || wine.country}</span>
              )}
              <span className="bg-[#f0f0f2] px-3 py-1 rounded-md">{wine.vintage}</span>
              <span className="bg-[#f0f0f2] px-3 py-1 rounded-md capitalize">{wine.type}</span>
              {wine.category === "by_the_glass" && (
                <span className="bg-[#e5e5ea] text-foreground px-3 py-1 rounded-md font-semibold">Glass</span>
              )}
            </div>

            {wine.description && (
              <div className="space-y-2">
                <h3 className="text-[15px] font-semibold text-foreground">Tasting Notes</h3>
                <p className="text-[16px] leading-relaxed text-muted-foreground">
                  {wine.description}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-border/60">
              <div className="flex justify-between items-center bg-[#f9f9fb] p-4 rounded-xl">
                {wine.location && (
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Location</span>
                    <span className="text-[16px] font-medium text-foreground">
                      {wine.location}
                    </span>
                  </div>
                )}
                <div className="flex flex-col items-end grow">
                  <span className="text-[13px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">Price</span>
                  <span className="text-[24px] font-bold text-foreground leading-none">
                    {wine.price_nok} <span className="text-[14px] font-semibold text-muted-foreground ml-0.5">NOK</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
