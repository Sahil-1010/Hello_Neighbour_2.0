import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Star, Clock, Phone, MessageCircle, ArrowLeft, MapPin, ShoppingBag, Navigation, Edit3, Users, CheckCircle, Tag } from "lucide-react";
import { api } from "../../services/api";
import { useApp } from "../../context/AppContext";
import OrderModal from "../../components/business/OrderModal";
import { CategoryIcon } from "../../utils/categoryIcons";

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
  const { user, rateBusiness, startConversation, placeOrder, connectToBusiness } = useApp();

  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [myRating, setMyRating] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [connectingBiz, setConnectingBiz] = useState(false);

  useEffect(() => {
    api.get(`/businesses/${id}`)
      .then((data) => {
        setBusiness(data);
        const existing = data.ratings?.find(
          (r) => r.userId?.toString() === user?.id || r.userId === user?.id
        );
        if (existing) setMyRating(existing.value);
      })
      .catch(() => navigate("/businesses"))
      .finally(() => setLoading(false));
    api.get(`/orders/user/${id}`).then(setMyOrders).catch(() => {});
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
      await startConversation(ownerId);
      navigate(`/chat?userId=${ownerId}`);
    } catch {
      navigate(`/chat?userId=${ownerId}`);
    }
  };

  const handleChatAboutOrder = async (orderId) => {
    const ownerId = business?.owner?.id || business?.owner?._id;
    if (!ownerId) return;
    try { await startConversation(ownerId); } catch {}
    navigate(`/chat?userId=${ownerId}&orderId=${orderId}`);
  };

  const handleConnectBusiness = async () => {
    if (connectingBiz) return;
    setConnectingBiz(true);
    try {
      const data = await connectToBusiness(id);
      setBusiness((prev) => {
        if (!prev) return prev;
        const members = prev.members || [];
        if (data.connected) return { ...prev, members: [...members, user?.id] };
        return { ...prev, members: members.filter((m) => m?.toString() !== user?.id) };
      });
    } catch {}
    setConnectingBiz(false);
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
  const isConnectedToBiz = (business.members || []).some((m) => m?.toString() === user?.id || m === user?.id);
  const memberCount = business.members?.length || 0;
  const activeOffers = (business.offers || []).filter((o) => o.isActive);
  const geoCoords = business.geoLocation?.coordinates; // [lng, lat]
  const hasGeo = geoCoords?.length === 2 && (geoCoords[0] !== 0 || geoCoords[1] !== 0);
  const directionsUrl = hasGeo
    ? `https://www.google.com/maps?q=${geoCoords[1]},${geoCoords[0]}`
    : null;

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
              <CategoryIcon category={business.category} size={64} className="text-white/80" />
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
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <CategoryIcon category={business.category} size={13} />
                {business.category}
              </p>
              {business.owner?.name && (
                <Link to={`/profile/${business.owner._id || business.owner.id}`} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline mt-0.5 inline-block">
                  By {business.owner.name}{business.owner.username ? ` (@${business.owner.username})` : ""}
                </Link>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
              {isOwner ? (
                <Link to="/business" className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                  <Edit3 size={15} /> Edit
                </Link>
              ) : (
                <>
                  <button
                    onClick={handleConnectBusiness}
                    disabled={connectingBiz}
                    className="btn-secondary flex items-center gap-2 py-2 px-3 text-sm"
                    title={isConnectedToBiz ? "Unfollow" : "Follow this business"}
                  >
                    {isConnectedToBiz ? <CheckCircle size={15} className="text-emerald-500" /> : <Users size={15} />}
                    {isConnectedToBiz ? "Following" : "Follow"}
                    {memberCount > 0 && <span className="text-[10px] opacity-70">({memberCount})</span>}
                  </button>
                  <button onClick={handleChat} className="btn-secondary flex items-center gap-2 py-2 px-4 text-sm">
                    <MessageCircle size={15} /> Chat
                  </button>
                  <button onClick={() => setShowOrderModal(true)} className="btn-primary flex items-center gap-2 py-2 px-4 text-sm">
                    <ShoppingBag size={15} /> Order
                  </button>
                </>
              )}
            </div>
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
            {directionsUrl && (
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
              >
                <Navigation size={14} /> Get Directions
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
                    <p className="font-medium text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                      <Tag size={12} className="text-emerald-600" />{offer.title}
                    </p>
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

      {/* My Orders */}
      {!isOwner && myOrders.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <ShoppingBag size={16} className="text-emerald-500" /> My Orders
          </h2>
          <div className="space-y-3">
            {myOrders.map((order) => {
              const statusColors = {
                pending:  "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
                accepted: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                partial:  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
                rejected: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
              };
              return (
                <div key={order.id || order._id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className={`badge text-[10px] ${statusColors[order.status] || statusColors.pending}`}>
                      {order.status}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {order.comment && <p className="text-xs text-gray-600 dark:text-gray-300 mb-1">{order.comment}</p>}
                  {order.ownerReply && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-1">Owner: {order.ownerReply}</p>
                  )}
                  <button
                    onClick={() => handleChatAboutOrder(order.id || order._id)}
                    className="flex items-center gap-1 text-[11px] text-blue-500 hover:text-blue-600 font-medium mt-1"
                  >
                    <MessageCircle size={11} /> Chat about this order
                  </button>
                </div>
              );
            })}
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

      {/* Order modal */}
      {!isOwner && (
        <OrderModal
          isOpen={showOrderModal}
          onClose={() => setShowOrderModal(false)}
          business={business}
          onSubmit={placeOrder}
        />
      )}
    </div>
  );
}
