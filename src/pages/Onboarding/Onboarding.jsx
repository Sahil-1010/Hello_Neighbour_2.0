import { useState } from "react";
import { MapPin, Search, Users, ChevronRight, Check, Navigation } from "lucide-react";
import { useApp } from "../../context/AppContext";
import { neighborhoods } from "../../data/mockData";

const mapPins = [
  { id: 1, x: 30, y: 40, label: "You", color: "bg-emerald-500", isYou: true },
  { id: 2, x: 55, y: 25, label: "James", color: "bg-blue-500" },
  { id: 3, x: 70, y: 55, label: "Emma", color: "bg-purple-500" },
  { id: 4, x: 20, y: 65, label: "Mike", color: "bg-amber-500" },
  { id: 5, x: 60, y: 72, label: "Lisa", color: "bg-pink-500" },
  { id: 6, x: 80, y: 35, label: "Carlos", color: "bg-red-500" },
];

export default function Onboarding() {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  const [location, setLocation] = useState("");
  const [locating, setLocating] = useState(false);
  const [located, setLocated] = useState(false);
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null);
  const [searchNeighborhood, setSearchNeighborhood] = useState("");

  const handleDetectLocation = async () => {
    setLocating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLocation("Maple Street, Downtown Heights");
    setLocated(true);
    setLocating(false);
  };

  const handleFinish = async () => {
    const hood = selectedNeighborhood || neighborhoods[0];
    completeOnboarding(hood.name, location || "Maple Street, Downtown Heights");
  };

  const filteredNeighborhoods = neighborhoods.filter((n) =>
    n.name.toLowerCase().includes(searchNeighborhood.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center text-lg">🏘️</div>
            <span className="font-bold text-gray-900 dark:text-white">HelloNeighbour</span>
          </div>
          <div className="flex items-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    step >= s ? "bg-emerald-500 text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {step > s ? <Check size={14} strokeWidth={3} /> : s}
                </div>
                {s < 2 && <div className={`w-8 h-0.5 ${step > s ? "bg-emerald-500" : "bg-gray-200 dark:bg-gray-700"} transition-all`} />}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {step === 1 ? (
            /* Step 1 — Location */
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  📍
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome, {user?.name?.split(" ")[0]}!
                </h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Set your location so we can show you neighbors, services, and posts within 5 km.
                </p>
              </div>

              {/* Simulated Map */}
              <div className="card overflow-hidden mb-6">
                <div className="relative h-56 bg-gradient-to-br from-emerald-50 dark:from-gray-700 to-teal-50 dark:to-gray-800 border-b border-gray-100 dark:border-gray-700">
                  {/* Grid lines */}
                  <div className="absolute inset-0 opacity-20 dark:opacity-10">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="absolute border-gray-400" style={{
                        left: `${i * 20}%`, top: 0, bottom: 0, borderLeftWidth: 1,
                      }} />
                    ))}
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="absolute border-gray-400" style={{
                        top: `${i * 25}%`, left: 0, right: 0, borderTopWidth: 1,
                      }} />
                    ))}
                  </div>

                  {/* Radius circle */}
                  {located && (
                    <div
                      className="absolute rounded-full border-2 border-emerald-400 dark:border-emerald-600 bg-emerald-400/10 transition-all duration-700"
                      style={{ width: "60%", height: "90%", left: "5%", top: "5%" }}
                    />
                  )}

                  {/* Map pins */}
                  {mapPins.map((pin) => (
                    <div
                      key={pin.id}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                    >
                      <div
                        className={`${pin.color} ${
                          pin.isYou ? "w-5 h-5 ring-4 ring-emerald-200 dark:ring-emerald-900" : "w-3.5 h-3.5"
                        } rounded-full shadow-md transition-transform group-hover:scale-125`}
                      />
                      {pin.isYou && (
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm">
                          You
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Overlay label */}
                  <div className="absolute bottom-3 right-3 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-xl px-3 py-1.5 shadow-sm">
                    <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">5 km radius view</span>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Enter your address or street..."
                      className="input pl-9"
                    />
                  </div>
                  <button
                    onClick={handleDetectLocation}
                    disabled={locating}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      located
                        ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {locating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                        Detecting location...
                      </>
                    ) : located ? (
                      <>
                        <Check size={16} className="text-emerald-600 dark:text-emerald-400" />
                        Location detected!
                      </>
                    ) : (
                      <>
                        <Navigation size={16} />
                        Use my current location
                      </>
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!location && !located}
                className="btn-primary w-full py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue — Choose Neighborhood →
              </button>
            </div>
          ) : (
            /* Step 2 — Neighborhood */
            <div>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  🏘️
                </div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Join a Neighborhood</h1>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Communities within 5 km of your location. Join to connect with nearby residents.
                </p>
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchNeighborhood}
                  onChange={(e) => setSearchNeighborhood(e.target.value)}
                  placeholder="Search neighborhoods..."
                  className="input pl-9"
                />
              </div>

              <div className="space-y-3 mb-6">
                {filteredNeighborhoods.map((hood) => (
                  <button
                    key={hood.id}
                    onClick={() => setSelectedNeighborhood(hood)}
                    className={`w-full card p-4 text-left hover:shadow-card-hover transition-all border-2 ${
                      selectedNeighborhood?.id === hood.id
                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-lg">🏡</div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{hood.name}</p>
                            <div className="flex items-center gap-3 mt-0.5">
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Users size={11} />
                                {hood.members.toLocaleString()} members
                              </span>
                              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                                <MapPin size={11} />
                                {hood.distance}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {selectedNeighborhood?.id === hood.id ? (
                        <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <ChevronRight size={18} className="text-gray-300 dark:text-gray-600" />
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary px-6 py-3">
                  ← Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!selectedNeighborhood}
                  className="btn-primary flex-1 py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Enter My Neighborhood 🎉
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
