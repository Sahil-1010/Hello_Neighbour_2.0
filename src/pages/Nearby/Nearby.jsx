import { useState } from "react";
import { MapPin, Star, MessageCircle, Filter, Search, Users, Building2, Wrench, UserCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { users, businesses, workerCategories } from "../../data/mockData";

const tabs = [
  { id: "people", label: "People", icon: Users },
  { id: "workers", label: "Workers", icon: Wrench },
  { id: "businesses", label: "Businesses", icon: Building2 },
];

const roleColors = {
  normal: "bg-blue-100 text-blue-700",
  worker: "bg-amber-100 text-amber-700",
  business: "bg-purple-100 text-purple-700",
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
    <div className="relative h-48 sm:h-56 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 rounded-2xl overflow-hidden border border-gray-200">
      {/* Street lines */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-400" />
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-gray-400" />
        <div className="absolute left-2/3 top-0 bottom-0 w-px bg-gray-400" />
        <div className="absolute top-1/3 left-0 right-0 h-px bg-gray-300" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-gray-300" />
      </div>

      {/* Radius circle */}
      <div className="absolute rounded-full border-2 border-dashed border-emerald-400 bg-emerald-400/10" style={{ width: "80%", height: "80%", left: "10%", top: "10%" }} />

      {/* Pins */}
      {pins.map((pin) => (
        <div key={pin.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ left: `${pin.x}%`, top: `${pin.y}%` }}>
          <div className={`${pin.color} ${pin.isYou ? "w-5 h-5 ring-4 ring-emerald-200" : "w-3.5 h-3.5"} rounded-full shadow-md transition-transform group-hover:scale-125`} />
          {pin.isYou && (
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">You</div>
          )}
          {!pin.isYou && pin.label && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-white/90 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full whitespace-nowrap shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {pin.label}
            </div>
          )}
        </div>
      ))}

      {/* Legend */}
      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 shadow-sm">
        <div className="flex items-center gap-3 text-[10px] text-gray-600">
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
          <img src={person.avatar} alt={person.name} className="w-13 h-13 w-12 h-12 rounded-xl object-cover" />
          {person.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to={`/profile/${person.id}`} className="font-semibold text-gray-900 text-sm hover:text-emerald-600 transition-colors">
                {person.businessName || person.name}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`badge ${roleColors[person.role]} capitalize text-[10px]`}>{person.role}</span>
                <span className="text-xs text-emerald-600 font-medium flex items-center gap-0.5">
                  <MapPin size={10} />{person.distance}
                </span>
              </div>
            </div>
            <Link to="/chat" className="p-2 rounded-xl text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 border border-gray-200 hover:border-emerald-200 transition-all flex-shrink-0">
              <MessageCircle size={15} />
            </Link>
          </div>
          {person.bio && <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{person.bio}</p>}
          {person.skills && person.skills.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {person.skills.slice(0, 3).map((s) => (
                <span key={s} className="badge bg-emerald-50 text-emerald-700 text-[10px]">{s}</span>
              ))}
            </div>
          )}
          {person.rating && (
            <div className="flex items-center gap-1.5 mt-2">
              <Star size={12} className="text-amber-400 fill-amber-400" />
              <span className="text-xs font-semibold text-gray-700">{person.rating}</span>
              <span className="text-xs text-gray-400">({person.reviewCount})</span>
              {person.hourlyRate && <span className="text-xs font-semibold text-emerald-600 ml-auto">{person.hourlyRate}</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BusinessCard({ business }) {
  return (
    <div className="card overflow-hidden hover:shadow-card-hover transition-all duration-200">
      <div className="h-32 relative">
        <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
          <span className={`badge ${business.isOpen ? "bg-emerald-500 text-white" : "bg-gray-600 text-white"} text-[10px]`}>
            {business.isOpen ? "● Open" : "● Closed"}
          </span>
          <span className="text-white text-xs font-medium">{business.distance}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{business.name}</h3>
            <p className="text-xs text-gray-500">{business.category}</p>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Star size={13} className="text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-gray-700">{business.rating}</span>
          </div>
        </div>
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">{business.description}</p>
        {business.offers.length > 0 && (
          <div className="bg-emerald-50 rounded-xl p-2.5 mb-3">
            <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wide mb-1">Active Offer</p>
            <p className="text-xs text-emerald-800">🎉 {business.offers[0]}</p>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Link to="/chat" className="btn-secondary flex-1 py-2 text-xs text-center">Message</Link>
          <button className="btn-primary flex-1 py-2 text-xs">View</button>
        </div>
      </div>
    </div>
  );
}

export default function Nearby() {
  const [activeTab, setActiveTab] = useState("people");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  const workers = users.filter((u) => u.role === "worker");
  const people = users.filter((u) => u.role !== "business");

  const filteredPeople = people.filter(
    (u) => !search || u.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredWorkers = workers.filter(
    (u) =>
      (!search || u.name.toLowerCase().includes(search.toLowerCase())) &&
      (activeCategory === "All" || (u.skills && u.skills.some((s) => s.includes(activeCategory))))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nearby</h1>
        <p className="text-sm text-gray-500 mt-0.5">People, workers & businesses within 5 km of you</p>
      </div>

      {/* Map */}
      <MapView />

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${activeTab}...`}
          className="input pl-9"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all -mb-px ${
              activeTab === id
                ? "border-emerald-500 text-emerald-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon size={15} />
            {label}
            <span className="badge bg-gray-100 text-gray-600 text-[10px] ml-0.5">
              {id === "people" ? filteredPeople.length : id === "workers" ? workers.length : businesses.length}
            </span>
          </button>
        ))}
      </div>

      {/* Category filter — only for workers */}
      {activeTab === "workers" && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1">
          {workerCategories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                activeCategory === cat.name
                  ? "bg-emerald-500 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span>{cat.icon}</span> {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {activeTab === "people" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPeople.map((person) => (
            <PersonCard key={person.id} person={person} />
          ))}
        </div>
      )}

      {activeTab === "workers" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredWorkers.map((worker) => (
            <PersonCard key={worker.id} person={worker} />
          ))}
          {filteredWorkers.length === 0 && (
            <div className="col-span-full card p-12 text-center">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-gray-500 text-sm">No workers found in this category.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "businesses" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {businesses.map((business) => (
            <BusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
    </div>
  );
}
