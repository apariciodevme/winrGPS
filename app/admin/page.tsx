"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Plus, Edit, Trash2, X, AlertCircle } from "lucide-react";
import { WineType } from "../lib/wine"; // Using the type from existing lib

type WineRaw = {
    _originalIndex?: number;
    _id?: string;
    category: string;
    producer: string;
    wine: string;
    year: string;
    country: string;
    description: string;
    location: string;
};

export default function AdminPage() {
    const [data, setData] = useState<WineRaw[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingItem, setEditingItem] = useState<WineRaw | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/wines");
            if (res.ok) {
                const json = await res.json();
                setData(json);
            }
        } catch (error) {
            console.error("Failed to fetch data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredData = useMemo(() => {
        if (!searchQuery.trim()) return data;
        const q = searchQuery.toLowerCase();
        return data.filter(
            (w) =>
                (w.wine || "").toLowerCase().includes(q) ||
                (w.producer || "").toLowerCase().includes(q) ||
                (w.category || "").toLowerCase().includes(q) ||
                (w.country || "").toLowerCase().includes(q) ||
                (w.location || "").toLowerCase().includes(q)
        );
    }, [data, searchQuery]);

    const handleDelete = async (index: number) => {
        if (!confirm("Are you sure you want to delete this wine?")) return;
        setIsDeleting(index);
        try {
            const res = await fetch(`/api/wines?index=${index}`, {
                method: "DELETE",
            });
            if (res.ok) {
                await fetchData();
            }
        } catch (error) {
            console.error("Failed to delete", error);
        } finally {
            setIsDeleting(null);
        }
    };

    const handleSave = async (item: WineRaw, isNew: boolean) => {
        const method = isNew ? "POST" : "PUT";
        try {
            const res = await fetch("/api/wines", {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(item),
            });

            if (res.ok) {
                setEditingItem(null);
                setIsAdding(false);
                await fetchData();
            } else {
                alert("Failed to save. Please check console for details.");
            }
        } catch (error) {
            console.error("Save error:", error);
            alert("An error occurred while saving.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-24 font-sans selection:bg-foreground selection:text-background">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/60 px-4 pt-12 pb-4">
                <div className="max-w-5xl mx-auto space-y-4">
                    <div className="flex items-end justify-between px-1">
                        <h1 className="text-[34px] leading-tight font-semibold tracking-tight">
                            Wine Administration
                        </h1>
                        <div className="text-[15px] font-medium text-muted-foreground pb-1">
                            {data.length} total entries
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#efeff0] border border-transparent rounded-[10px] py-[7px] pl-10 pr-4 text-[17px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:bg-background focus:ring-[3px] focus:ring-[#007aff]/30 focus:border-[#007aff] transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setIsAdding(true)}
                            className="flex-shrink-0 bg-[#007aff] text-white hover:bg-[#0062cc] active:bg-[#005bb5] px-4 py-2 rounded-[10px] font-medium text-[15px] flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Add New Bottle</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-4 mt-8">
                <div className="bg-card border border-border/80 rounded-[14px] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-border/60 bg-[#f9f9fb] text-[13px] font-semibold text-muted-foreground uppercase tracking-wider">
                                    <th className="px-5 py-4 whitespace-nowrap">Wine / Producer</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Category</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Vintage</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Country</th>
                                    <th className="px-5 py-4 whitespace-nowrap">Location</th>
                                    <th className="px-5 py-4 whitespace-nowrap text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/60">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-2 animate-pulse">
                                                <div className="w-8 h-8 rounded-full border-2 border-[#007aff] border-t-transparent animate-spin" />
                                                <span className="text-[15px] font-medium">Loading dataset...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : filteredData.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center gap-3">
                                                <Search className="w-10 h-10 opacity-20" />
                                                <span className="text-[16px]">No wines found matching "{searchQuery}"</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredData.map((wine, idx) => {
                                        const originalIndex = wine._originalIndex ?? idx;
                                        return (
                                            <tr
                                                key={wine._id || idx}
                                                className="hover:bg-[#f9f9fb] transition-colors group"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="font-medium text-[15px] text-foreground mb-0.5">{wine.wine || "—"}</div>
                                                    <div className="text-[13px] text-muted-foreground">{wine.producer || "—"}</div>
                                                </td>
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md bg-[#f0f0f2] text-[12px] font-medium capitalize text-foreground/80">
                                                        {wine.category?.toLowerCase() || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-[14px] text-foreground/90">{wine.year || "—"}</td>
                                                <td className="px-5 py-3.5 text-[14px] text-foreground/90">{wine.country || "—"}</td>
                                                <td className="px-5 py-3.5">
                                                    <span className="inline-flex items-center justify-center px-2 py-1 rounded-md bg-white border border-[#e0e0e1] shadow-sm text-[13px] font-bold text-foreground">
                                                        {wine.location || "—"}
                                                    </span>
                                                </td>
                                                <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => setEditingItem(wine)}
                                                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-[#007aff] hover:bg-[#007aff]/10 rounded-full transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit className="w-[15px] h-[15px]" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(originalIndex)}
                                                            disabled={isDeleting === originalIndex}
                                                            className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            {isDeleting === originalIndex ? (
                                                                <div className="w-[15px] h-[15px] rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-[15px] h-[15px]" />
                                                            )}
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Adding/Editing Modal */}
            {(isAdding || editingItem) && (
                <WineEditorModal
                    wine={editingItem}
                    onClose={() => {
                        setEditingItem(null);
                        setIsAdding(false);
                    }}
                    onSave={handleSave}
                />
            )}
        </div>
    );
}

function WineEditorModal({
    wine,
    onClose,
    onSave,
}: {
    wine: WineRaw | null;
    onClose: () => void;
    onSave: (wine: WineRaw, isNew: boolean) => Promise<void>;
}) {
    const isNew = !wine;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState<WineRaw>({
        _originalIndex: wine?._originalIndex,
        _id: wine?._id,
        category: wine?.category || "WHITE",
        producer: wine?.producer || "",
        wine: wine?.wine || "",
        year: wine?.year || "",
        country: wine?.country || "",
        description: wine?.description || "",
        location: wine?.location || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        await onSave(formData, isNew);
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-card rounded-[24px] shadow-2xl animate-in zoom-in-95 duration-200 max-h-[95vh] flex flex-col overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 bg-background/50 backdrop-blur-md">
                    <h2 className="text-[20px] font-semibold text-foreground tracking-tight">
                        {isNew ? "Add New Bottle" : "Edit Bottle"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-[#f0f0f2] hover:bg-[#e0e0e1] active:bg-[#d1d1d6] text-muted-foreground rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Body */}
                <form id="wine-editor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
                    {/* Two column grid for main fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[14px] font-medium text-foreground">Wine Name</label>
                            <input
                                required
                                name="wine"
                                value={formData.wine}
                                onChange={handleChange}
                                placeholder="e.g. Cremant de Bourgogne Brut"
                                className="w-full bg-[#efeff0] border border-transparent rounded-[8px] py-2 px-3 text-[15px] focus:bg-background focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[14px] font-medium text-foreground">Producer</label>
                            <input
                                required
                                name="producer"
                                value={formData.producer}
                                onChange={handleChange}
                                placeholder="e.g. Domaine Jean Collet & Fils"
                                className="w-full bg-[#efeff0] border border-transparent rounded-[8px] py-2 px-3 text-[15px] focus:bg-background focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-[14px] font-medium text-foreground">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full bg-[#efeff0] border border-transparent rounded-[8px] py-2 px-3 text-[15px] focus:ring-2 focus:ring-[#007aff]/30 focus:outline-none appearance-none cursor-pointer"
                            >
                                <option value="SPARKLING">Sparkling</option>
                                <option value="WHITE">White</option>
                                <option value="RED">Red</option>
                                <option value="ROSE">Rosé</option>
                                <option value="SWEET">Sweet</option>
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[14px] font-medium text-foreground">Vintage</label>
                            <input
                                name="year"
                                value={formData.year}
                                onChange={handleChange}
                                placeholder="e.g. 2022 or NV"
                                className="w-full bg-[#efeff0] border border-transparent rounded-[8px] py-2 px-3 text-[15px] focus:bg-background focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[14px] font-medium text-foreground">Country</label>
                            <input
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                placeholder="e.g. France"
                                className="w-full bg-[#efeff0] border border-transparent rounded-[8px] py-2 px-3 text-[15px] focus:bg-background focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[14px] font-medium text-foreground flex items-center justify-between">
                            Location
                            <span className="text-muted-foreground text-[12px] font-normal">Physical spot in the cellar</span>
                        </label>
                        <input
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="e.g. A2"
                            className="w-full sm:w-1/3 bg-[#efeff0] border border-transparent rounded-[8px] py-2 px-3 text-[15px] font-semibold focus:bg-background focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-1.5 pb-4">
                        <label className="text-[14px] font-medium text-foreground">Description / Tasting Notes</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Enter details about the wine..."
                            rows={4}
                            className="w-full bg-[#efeff0] border border-transparent rounded-[8px] py-2 px-3 text-[15px] leading-relaxed resize-none focus:bg-background focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] outline-none transition-all"
                        />
                    </div>
                </form>

                {/* Modal Footer */}
                <div className="px-6 py-4 bg-[#f9f9fb] border-t border-border/60 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-[15px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="wine-editor-form"
                        disabled={isSubmitting}
                        className="bg-[#007aff] text-white hover:bg-[#0062cc] disabled:bg-[#007aff]/50 px-5 py-2 rounded-[8px] font-medium text-[15px] transition-colors flex items-center gap-2 shadow-sm"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                                <span>Saving...</span>
                            </>
                        ) : (
                            <span>{isNew ? "Add Bottle" : "Save Changes"}</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
