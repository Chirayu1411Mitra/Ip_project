import { useEffect, useState } from "react";
import { getDoubts } from "../services/api";
import PostDoubtForm from "../components/PostDoubtForm";
import DoubtCard from "../components/DoubtCard";
import {
  HelpCircle,
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../hooks/useSocket";
import AnnouncementBanner from "../components/faculty/AnnouncementBanner";

function DoubtPage() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // "all" | "unanswered"
  const [banInfo, setBanInfo] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isBanExpired, setIsBanExpired] = useState(false);

  const handleNewDoubt = (newDoubt) => {
    setDoubts((prev) => [newDoubt, ...prev]);
  };

  const handleDoubtUpdate = (updatedDoubt) => {
    setDoubts((prev) =>
      prev.map((d) => (d._id === updatedDoubt._id ? updatedDoubt : d)),
    );
  };

  // Load doubts on mount
  useEffect(() => {
    getDoubts()
      .then((res) => setDoubts(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Listen for real-time ban events from backend
  useSocket({
    userBanned: (banData) => {
      setBanInfo(banData);
    },
  });

  // Update countdown timer every second
  useEffect(() => {
    if (!banInfo?.bannedUntil) return;

    const updateCountdown = () => {
      const now = new Date();
      const bannedUntil = new Date(banInfo.bannedUntil);
      const diff = bannedUntil - now;

      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        setIsBanExpired(true);

        // Auto-dismiss after 3 seconds
        const dismissTimer = setTimeout(() => {
          setBanInfo(null);
          setIsBanExpired(false);
        }, 3000);

        return () => clearTimeout(dismissTimer);
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [banInfo]);

  const filtered =
    filter === "unanswered"
      ? doubts.filter((d) => d.answers?.length === 0)
      : doubts;

  const totalAnswers = doubts.reduce(
    (sum, d) => sum + (d.answers?.length ?? 0),
    0,
  );

  const isBanned = user?.bannedUntil && new Date(user.bannedUntil) > new Date();
  const daysRemaining = isBanned
    ? Math.ceil(
        (new Date(user.bannedUntil) - new Date()) / (1000 * 60 * 60 * 24),
      )
    : 0;

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50/50 min-h-screen custom-scrollbar relative">
      {/* Side Countdown Widget (Right Side) */}
      {banInfo && (
        <div className="fixed right-4 top-24 bg-white rounded-2xl shadow-2xl p-5 border-2 border-red-200 w-72 z-40 animate-in slide-in-from-right-4">
          {isBanExpired ? (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3 animate-bounce">
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-green-700 mb-1">
                Account Unbanned
              </h3>
              <p className="text-sm text-green-600">
                Welcome back! You can now post again.
              </p>
            </div>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 bg-red-100 rounded-full mb-3">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h3 className="text-base font-bold text-red-800 mb-1">
                Account Suspended
              </h3>
              <p className="text-xs text-red-600 mb-3">
                Your account is currently suspended
              </p>

              {/* Ban Date */}
              <div className="mb-3 pb-3 border-b border-red-100">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">
                  Expires On
                </p>
                <p className="text-sm font-bold text-gray-800">
                  {new Date(banInfo.bannedUntil).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
                <p className="text-xs text-gray-600">
                  {new Date(banInfo.bannedUntil).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {/* Live Countdown */}
              {timeRemaining && (
                <div>
                  <p className="text-xs text-red-600 uppercase font-bold tracking-wider mb-2">
                    Time Remaining
                  </p>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { value: timeRemaining.days, label: "D" },
                      { value: timeRemaining.hours, label: "H" },
                      { value: timeRemaining.minutes, label: "M" },
                      { value: timeRemaining.seconds, label: "S" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="bg-red-50 rounded p-1.5">
                          <p className="font-black text-red-600 text-xs">
                            {String(item.value).padStart(2, "0")}
                          </p>
                        </div>
                        <p className="text-xs text-red-600 font-bold mt-1">
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ban Reason */}
              {banInfo.banReason && (
                <div className="mt-3 pt-3 border-t border-red-100">
                  <p className="text-xs text-gray-600">
                    <strong className="text-red-700">Reason:</strong>{" "}
                    {banInfo.banReason}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Q&A Forum
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1 font-medium">
            Ask questions, share answers, and collaborate with your peers.
          </p>
        </div>

        {/* Show announcements for students only */}
        {user?.role !== "faculty" && <AnnouncementBanner />}

        {/* Stats Row (Responsive Grid) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            {
              label: "Total Doubts",
              value: doubts.length,
              icon: <HelpCircle size={18} />,
              bg: "bg-purple-50",
              text: "text-purple-600",
              border: "border-purple-100",
            },
            {
              label: "Total Answers",
              value: totalAnswers,
              icon: <MessageSquare size={18} />,
              bg: "bg-emerald-50",
              text: "text-emerald-600",
              border: "border-emerald-100",
            },
            {
              label: "Unanswered",
              value: doubts.filter((d) => !d.answers?.length).length,
              icon: <TrendingUp size={18} />,
              bg: "bg-amber-50",
              text: "text-amber-600",
              border: "border-amber-100",
            },
          ].map(({ label, value, icon, bg, text, border }) => (
            <div
              key={label}
              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-sm border ${border} flex items-center gap-4 transition-transform hover:-translate-y-1 duration-200`}
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${bg} ${text}`}
              >
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-black text-gray-800 leading-none mb-1 truncate">
                  {value}
                </p>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Global Ban Notice (From Auth State) */}
        {isBanned && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-base sm:text-lg font-bold text-red-800">
                  Account Suspended
                </h3>
                <p className="text-sm sm:text-base text-red-700 mt-1 leading-relaxed">
                  Your account is suspended for {daysRemaining} more{" "}
                  {daysRemaining === 1 ? "day" : "days"}.
                </p>
                {user?.banReason && (
                  <p className="text-red-600 text-sm italic mt-2 font-medium">
                    Reason: {user.banReason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Post Form Area */}
        {!isBanned && (
          <>
            <PostDoubtForm
              onNewDoubt={handleNewDoubt}
              onBanError={setBanInfo}
            />

            {/* Inline Ban Error (From Form Submission) */}
            {banInfo && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 shadow-sm animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-red-800">
                      Account Suspended
                    </h3>
                    <p className="text-sm sm:text-base text-red-700 mt-1 leading-relaxed">
                      {banInfo.message}
                    </p>
                    {banInfo.banReason && (
                      <p className="text-red-600 text-sm italic mt-2 font-medium">
                        Reason: {banInfo.banReason}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Ban Modal Popup */}
        {banInfo && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in zoom-in-95">
              {/* Close Button */}
              <button
                onClick={() => setBanInfo(null)}
                className="absolute top-4 right-4 p-1.5 hover:bg-red-50 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400 hover:text-red-600" />
              </button>

              {/* Ban Icon */}
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} className="text-red-600" />
              </div>

              {/* Title */}
              <h2 className="text-2xl font-black text-red-800 text-center mb-2">
                Account Suspended
              </h2>

              {/* Message */}
              <p className="text-red-700 text-center mb-4 leading-relaxed">
                {banInfo.message}
              </p>

              {/* Ban Reason */}
              {banInfo.banReason && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">
                    Reason for Suspension
                  </p>
                  <p className="text-red-700 text-sm">{banInfo.banReason}</p>
                </div>
              )}

              {/* Ban Duration & Countdown */}
              {banInfo.bannedUntil && (
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">
                      Suspension Expires On
                    </p>
                    <p className="text-lg font-bold text-gray-800">
                      {new Date(banInfo.bannedUntil).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(banInfo.bannedUntil).toLocaleTimeString(
                        "en-US",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </p>
                  </div>

                  {/* Countdown Timer */}
                  {timeRemaining && (
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      <p className="text-xs text-red-600 uppercase font-bold tracking-wider mb-3 text-center">
                        Time Remaining
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { value: timeRemaining.days, label: "Days" },
                          { value: timeRemaining.hours, label: "Hours" },
                          { value: timeRemaining.minutes, label: "Mins" },
                          { value: timeRemaining.seconds, label: "Secs" },
                        ].map((item) => (
                          <div key={item.label} className="text-center">
                            <div className="bg-white rounded-lg p-2 mb-1">
                              <p className="font-black text-red-600 text-lg">
                                {String(item.value).padStart(2, "0")}
                              </p>
                            </div>
                            <p className="text-xs text-red-600 font-bold">
                              {item.label}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={() => setBanInfo(null)}
                className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all active:scale-95"
              >
                Understand
              </button>

              {/* Help Text */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Please review our community guidelines before posting again.
              </p>
            </div>
          </div>
        )}

        {/* Filter Tabs & Count */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar w-full sm:w-auto">
            {["all", "unanswered"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 sm:px-5 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap active:scale-95 ${
                  filter === f
                    ? "bg-purple-600 text-white shadow-md shadow-purple-200 border border-transparent"
                    : "bg-white text-gray-500 border border-gray-200 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
                }`}
              >
                {f === "all" ? "All Doubts" : "Unanswered"}
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0 px-1">
            {filtered.length} Result{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Doubts Feed */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
            <p className="text-sm font-bold tracking-wide animate-pulse">
              Loading forum...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 bg-white rounded-3xl border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
              <HelpCircle className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-600 mb-1">
              No doubts found
            </p>
            <p className="text-sm text-gray-400">
              Be the first to ask a question to the community!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 sm:gap-5">
            {filtered.map((doubt) => (
              <DoubtCard
                key={doubt._id}
                doubt={doubt}
                onUpdate={handleDoubtUpdate}
                onBanError={setBanInfo}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default DoubtPage;
