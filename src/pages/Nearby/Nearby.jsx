import { useState, useEffect } from "react";
import { MapPin, MessageCircle, Search, Users, Wrench, Globe, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { useApp } from "../../context/AppContext";
import { workerCategories } from "../../data/mockData";

const tabs = [
  { id: "people", label: "People", icon: Users },
  { id: "workers", label: "Workers", icon: Wrench },
];

const roleColors = {
  normal: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  worker: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  business: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
};

function MapView() {
  const pins = [
    { id: 1, x: 50, y: 50, isYou: true, color: "bg-emerald-500" },
    { id: 2, x: 30, y: 35, color: "bg-amber-500", label: "Mike" },
    { id: 3, x: 65, y: 30, color: "bg-purple-500", label: "Emma" },
    { id: 4, x: 70, y: 60, color: "bg-amber-500", label: "James" },
    { id: 5, x: 35, y: 65, color: "bg-blue-500", label: "Lisa" },
    { id: 6, x: 78, y: 45, color: "bg-purple-500", label: "Carlos" },
    { id: 7, x: 25, y: 55, color: "bg-amber-500", label: "Priya" },
  ];
  return (
    <div className="relative h-48 sm:h-56 bg-gradient-to-br from-green-50 dark:from-gray-800 via-emerald-50 dark:via-gray-800 to-teal-50 dark:to-gray-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="absolute inset-0 opacity-20 dark:opacity-10">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-500" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gray-500" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-gray-500" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gray-400" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-gray-400" />
      </div>
      <div className="absolute rounded-full border-2 border-dashed border-emerald-400 dark:border-emerald-600 bg-emerald-400/10" style={{ width: "80%", height: "80%", left: "10%", top: "10%" }} />
      {pins.map((pin) => (
        <div key={pin.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
          <div className={`${pin.color} ${pin.isYou ? "w-5 h-5 ring-4 ring-emerald-200 dark:ring-emerald-900" : "w-3.5 h-3.5"} rounded-full shadow-md transition-transform group-hover:scale-125`} />
          {pin.isYou && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">You</div>
          )}
          {!pin.isYou && pin.label && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {pin.label}
            </div>
          )}
        </div>
      ))}
      <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
        <div className="flex items-center gap-3 text-[10px] text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-amber-500" />Worker</span>
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-purple-500" />Business</span>
          <span className="flex items-center gap-1"><div className="w-2.5 h-2.5 rounded-full bg-blue-500" />User</span>
        </div>
      </div>
    </div>
  );
}

function PersonCard({ person }) {
  return (
    <div className="card p-4 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {person.avatar ? (
            <img src={person.avatar} alt={person.name} className="w-12 h-12 rounded-xl object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-xl font-bold text-emerald-700 dark:text-emerald-400">
              {person.name?.[0] || "?"}
            </div>
          )}
          {person.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/profile/${person.id}`} className="font-semibold text-gray-900 dark:text-white text-sm hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                {person.businessName || person.name}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`badge ${roleColors[person.role]} capitalize text-[10px]`}>{person.role}</span>
                {person.distance && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                    <MapPin size={10} />{person.distance}
                  </span>
                )}
              </div>
            </div>
            <Link
              to={`/chat?userId=${person.id || person._id}`}
              className="p-2 rounded-xl text-gray-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 border border-gray-200 dark:border-gray-600 hover:border-emerald-200 dark:hover:border-emerald-800 transition-all flex-shrink-0"
            >
              <MessageCircle size={15} />
            </Link>
          </div>
          {person.bio && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">{person.bio}</p>}
          {person.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {person.skills.slice(0, 3).map((s) => (
                <span key={s} className="badge bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-[10px]">{s}</span>
              ))}
            </div>
          )}
          {person.rating && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{person.rating}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">({person.reviewCount})</span>
              {person.hourlyRate && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 ml-auto">{person.hourlyRate}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


export default function Nearby() {
  const { currentNeighborhood, nearbyUsers, neighborhoodsList, fetchNeighborhoods } = useApp();
  const [activeTab, setActiveTab] = useState("people");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchNeighborhoods().catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const otherNeighborhoods = neighborhoodsList.filter(
    (n) => n.name !== currentNeighborhood
  );

  const workers = nearbyUsers.filter((u) => u.role === "worker");
  const people = nearbyUsers.filter((u) => u.role !== "business");

  const filteredPeople = people.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()));
  const filteredWorkers = workers.filter((u) =>
    (!search || u.name.toLowerCase().includes(search.toLowerCase())) &&
    (activeCategory === "All" || u.skills?.some((s) => s.includes(activeCategory)))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      <div>
        <h1 className="section-title">Nearby</h1>
        <p className="section-subtitle">
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">{currentNeighborhood}</span>
          {" · "}People & workers in your neighborhood
        </p>
      </div>

      <MapView />

      <div className="relative">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={`Search ${activeTab}...`} className="input pl-9" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === id
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <Icon size={15} />
            {label}
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] ml-0.5">
              {id === "people" ? filteredPeople.length : workers.length}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "workers" && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {workerCategories.map((cat) => (
            <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat.name
                  ? "bg-emerald-500 text-white"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
              }`}>
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      )}

      {activeTab === "people" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((p) => <PersonCard key={p.id} person={p} />)}
        </div>
      )}
      {activeTab === "workers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((w) => <PersonCard key={w.id} person={w} />)}
          {filteredWorkers.length === 0 && (
            <div className="col-span-full card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm">No workers found in this category.</p>
            </div>
          )}
        </div>
      )}
      {/* Other Neighborhoods */}
      {otherNeighborhoods.length > 0 && (
        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Globe size={16} className="text-emerald-500" />
            <h2 className="font-semibold text-gray-900 dark:text-white text-sm">Other Neighborhoods</h2>
            <span className="badge bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px]">
              {otherNeighborhoods.length}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherNeighborhoods.map((n) => (
              <div key={n.id || n._id} className="card p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{n.name}</p>
                  {n.memberCount > 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{n.memberCount} members</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
