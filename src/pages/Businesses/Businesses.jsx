import { useState } from "react";
import { Search, Star, MapPin, MessageCircle, Plus, Clock, Store } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { CategoryIcon } from "../../utils/categoryIcons";

// ── Business Card ─────────────────────────────────────────────────────────────
function BusinessCard({ biz }) {
  const activeOffer = biz.offers?.find((o) =>
    typeof o === "object" ? o.isActive : true
  );
  const offerTitle = activeOffer
    ? (typeof activeOffer === "object" ? activeOffer.title : activeOffer)
    : null;

  return (
    <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-200 flex flex-col">
      {/* Image */}
      <div className="relative h-36 flex-shrink-0">
        {biz.image ? (
          <img src={biz.image} alt={biz.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
            <CategoryIcon category={biz.category} size={44} className="text-white/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="absolute top-2 left-2">
          <span className={`badge ${biz.isOpen ? "bg-emerald-500/90 text-white" : "bg-gray-600/80 text-white"} backdrop-blur-sm text-[10px]`}>
            {biz.isOpen ? "● Open" : "● Closed"}
          </span>
        </div>
        {biz.distance && (
          <div className="absolute top-2 right-2">
            <span className="badge bg-black/40 text-white backdrop-blur-sm text-[10px] flex items-center gap-1">
              <MapPin size={9} />{biz.distance}
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight truncate">{biz.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1">
              <CategoryIcon category={biz.category} size={11} />
              {biz.category}
            </p>
          </div>
          {biz.rating > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{biz.rating}</span>
              <span className="text-xs text-gray-400">({biz.reviewCount})</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3 flex-1">
          {biz.description || "Local business in your neighborhood."}
        </p>

        {/* Hours */}
        {biz.hours && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-3">
            <Clock size={11} />
            <span className="truncate">{biz.hours}</span>
          </div>
        )}

        {/* Active offer */}
        {offerTitle && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl px-3 py-2 mb-3">
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide mb-0.5">Active offer</p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 line-clamp-1">{offerTitle}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Link
            to={`/chat?userId=${biz.owner?._id?.toString() || biz.owner?.id || ""}`}
            className="flex-1 flex items-center justify-center gap-1.5 btn-secondary py-2 text-xs"
          >
            <MessageCircle size={13} /> Contact
          </Link>
          <Link to={`/businesses/${biz.id}`} className="flex-1 flex items-center justify-center btn-primary py-2 text-xs">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Category Summary Card ────────────────────────────────────────────────────
function CategorySummaryCard({ name, count, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 flex-shrink-0 w-24 ${
        isActive
          ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
          : "border-transparent bg-white dark:bg-gray-800 shadow-card hover:border-gray-200 dark:hover:border-gray-600"
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isActive ? "bg-emerald-100 dark:bg-emerald-800/40" : "bg-gray-100 dark:bg-gray-700"}`}>
        <CategoryIcon
          category={name}
          size={16}
          className={isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"}
        />
      </div>
      <div className="text-center">
        <div className={`text-base font-bold ${isActive ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>
          {count}
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium leading-tight">{name}</div>
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Businesses() {
  const { filteredBusinesses, currentNeighborhood, user } = useApp();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const totalCount = filteredBusinesses.length;

  const uniqueCategories = [...new Set(filteredBusinesses.map((b) => b.category).filter(Boolean))];
  const categoryCounts = uniqueCategories.reduce((acc, name) => {
    acc[name] = filteredBusinesses.filter((b) => b.category === name).length;
    return acc;
  }, {});

  const displayed = filteredBusinesses.filter((b) => {
    const matchCat = activeCategory === "All" || b.category === activeCategory;
    const matchSearch =
      !search ||
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description || "").toLowerCase().includes(search.toLowerCase()) ||
      (b.category || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Group by category
  const grouped = {};
  displayed.forEach((biz) => {
    const cat = biz.category || "Other";
    if (!grouped[cat]) grouped[cat] = { name: cat, items: [] };
    grouped[cat].items.push(biz);
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="section-title">Business Directory</h1>
          <p className="section-subtitle">
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{currentNeighborhood}</span>
            {" · "}{totalCount} businesses
          </p>
        </div>
        {user?.role === "business" && (
          <Link to="/business" className="btn-primary flex items-center gap-2 flex-shrink-0">
            <Plus size={16} />
            <span className="hidden sm:inline">Manage Business</span>
          </Link>
        )}
      </div>

      {/* Category Summary Grid */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Browse by Category</h2>
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-1">
          {/* "All" pill */}
          <button
            onClick={() => setActiveCategory("All")}
            className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-200 flex-shrink-0 w-24 ${
              activeCategory === "All"
                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"
                : "border-transparent bg-white dark:bg-gray-800 shadow-card hover:border-gray-200 dark:hover:border-gray-600"
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${activeCategory === "All" ? "bg-emerald-100 dark:bg-emerald-800/40" : "bg-gray-100 dark:bg-gray-700"}`}>
              <Store size={16} className={activeCategory === "All" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-500 dark:text-gray-400"} />
            </div>
            <div className="text-center">
              <div className={`text-base font-bold ${activeCategory === "All" ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"}`}>{totalCount}</div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">All</div>
            </div>
          </button>
          {uniqueCategories.map((name) => (
            <CategorySummaryCard
              key={name}
              name={name}
              count={categoryCounts[name] || 0}
              isActive={activeCategory === name}
              onClick={() => setActiveCategory(name === activeCategory ? "All" : name)}
            />
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search businesses, categories..."
          className="input pl-9"
        />
      </div>

      {/* Content */}
      {displayed.length === 0 ? (
        <div className="card p-16 text-center">
          <Store size={40} className="text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">No businesses found</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Try a different search or category.</p>
        </div>
      ) : activeCategory === "All" ? (
        <div className="space-y-8">
          {Object.values(grouped).map(({ name, items }) => (
            <section key={name}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <CategoryIcon category={name} size={18} className="text-emerald-500" />
                  {name}
                  <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ml-1">{items.length}</span>
                </h2>
              </div>
              <div className="flex gap-4 overflow-x-auto hide-scrollbar md:hidden pb-2">
                {items.map((biz) => (
                  <div key={biz.id} className="min-w-[260px] max-w-[280px] flex-shrink-0">
                    <BusinessCard biz={biz} />
                  </div>
                ))}
              </div>
              <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((biz) => <BusinessCard key={biz.id} biz={biz} />)}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayed.map((biz) => <BusinessCard key={biz.id} biz={biz} />)}
        </div>
      )}

      {/* Business Owner CTA */}
      {user?.role !== "business" && (
        <div className="card p-6 border-dashed border-2 border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10 text-center">
          <Store size={28} className="text-emerald-500 mx-auto mb-2" />
          <h3 className="font-bold text-gray-900 dark:text-white mb-1">Own a local business?</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            List your business and reach thousands of neighbors in {currentNeighborhood}.
          </p>
          <Link to="/signup" className="btn-primary inline-flex py-2 px-6 text-sm">
            Register your business
          </Link>
        </div>
      )}
    </div>
  );
}
