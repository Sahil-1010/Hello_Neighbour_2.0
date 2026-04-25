import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Clock, Phone, MessageCircle, ArrowLeft, MapPin } from "lucide-react";
import { api } from "../../services/api";
import { useApp } from "../../context/AppContext";

function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110"}`}
        >
          <Star
            size={readonly ? 14 : 24}
            className={star <= display ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-gray-600"}
          />
        </button>
      ))}
    </div>
  );
}

export default function BusinessDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, rateBusiness, startConversation } = useApp();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/businesses/${id}`)
      .then((data) => {
        setBusiness(data);
        // Find existing rating by current user
        const existing = data.ratings?.find(
          (r) => r.userId?.toString() === user?.id || r.userId === user?.id
        );
        if (existing) setMyRating(existing.value);
      })
      .catch(() => navigate("/businesses"))
      .finally(() => setLoading(false));
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleRate = async (value) => {
    if (!user) return;
    if (business?.owner?.id === user.id || business?.owner?._id === user.id) return;
    setMyRating(value);
    setRatingSubmitting(true);
    try {
      const updated = await rateBusiness(id, value);
      setBusiness((prev) => ({ ...prev, rating: updated.rating, reviewCount: updated.reviewCount }));
    } catch {
      setMyRating(0);
    } finally {
      setRatingSubmitting(false);
    }
  };

  const handleChat = async () => {
    const ownerId = business?.owner?.id || business?.owner?._id;
    if (!ownerId) return;
    try {
      const conv = await startConversation(ownerId);
      navigate(`/chat?conv=${conv.id}`);
    } catch {
      navigate(`/chat?userId=${ownerId}`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!business) return null;

  const isOwner = business.owner?.id === user?.id || business.owner?._id === user?.id;
  const activeOffers = (business.offers || []).filter((o) => o.isActive);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">
      {/* Back link */}
      <Link to="/businesses" className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
        <ArrowLeft size={16} /> Back to Directory
      </Link>

      {/* Banner */}
      <div className="card overflow-hidden">
        <div className="h-48 relative">
          {business.image ? (
            <img src={business.image} alt={business.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
              <span className="text-8xl">{business.categoryIcon || "🏪"}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
            <span className={`badge ${business.isOpen ? "bg-emerald-500 text-white" : "bg-gray-600 text-white"}`}>
              {business.isOpen ? "● Open Now" : "● Closed"}
            </span>
            {business.neighborhood && (
              <span className="badge bg-black/40 text-white text-[10px] flex items-center gap-1 backdrop-blur-sm">
                <MapPin size={9} />{business.neighborhood}
              </span>
            )}
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">{business.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{business.categoryIcon} {business.category}</p>
            </div>
            {!isOwner && (
              <button
                onClick={handleChat}
                className="btn-primary flex items-center gap-2 flex-shrink-0"
              >
                <MessageCircle size={16} /> Chat
              </button>
            )}
          </div>

          {/* Rating display */}
          <div className="flex items-center gap-3 mb-4">
            <StarRating value={Math.round(business.rating || 0)} readonly />
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {business.rating > 0 ? business.rating.toFixed(1) : "No ratings"}
            </span>
            {business.reviewCount > 0 && (
              <span className="text-xs text-gray-400 dark:text-gray-500">({business.reviewCount} reviews)</span>
            )}
          </div>

          {/* Meta */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            {business.hours && (
              <span className="flex items-center gap-1.5"><Clock size={14} />{business.hours}</span>
            )}
            {business.phone && (
              <a href={`tel:${business.phone}`} className="flex items-center gap-1.5 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                <Phone size={14} />{business.phone}
              </a>
            )}
          </div>

          {/* Description */}
          {business.description && (
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{business.description}</p>
          )}
        </div>
      </div>

      {/* Rate this business */}
      {!isOwner && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">
            {myRating ? "Your Rating" : "Rate this Business"}
          </h2>
          <div className="flex items-center gap-4">
            <StarRating value={myRating} onChange={handleRate} readonly={ratingSubmitting} />
            {myRating > 0 && (
              <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                {ratingSubmitting ? "Saving…" : "Saved!"}
              </span>
            )}
          </div>
          {!myRating && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">Click a star to rate</p>
          )}
        </div>
      )}

      {/* Active offers */}
      {activeOffers.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3">Active Offers</h2>
          <div className="space-y-3">
            {activeOffers.map((offer) => (
              <div key={offer._id} className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300 text-sm">🎉 {offer.title}</p>
                    {offer.discount && (
                      <span className="inline-block mt-1 text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">
                        {offer.discount}
                      </span>
                    )}
                    {offer.description && (
                      <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">{offer.description}</p>
                    )}
                  </div>
                  {offer.validUntil && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-500 whitespace-nowrap">
                      Until {new Date(offer.validUntil).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Owner CTA */}
      {isOwner && (
        <div className="card p-5 border-2 border-dashed border-emerald-200 dark:border-emerald-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">This is your business listing.</p>
          <Link to="/business" className="btn-primary inline-flex py-2 px-6 text-sm">
            Go to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
