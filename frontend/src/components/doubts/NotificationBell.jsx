import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotif } from "../../context/NotifContext";
import { useNavigate } from "react-router-dom";

const NotificationBell = () => {
  const { notifications, unreadCount, markAllRead } = useNotif();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && unreadCount > 0) markAllRead();
  };

  const handleClickNotification = (doubtId) => {
    setOpen(false);
    navigate("/doubts");
    // scroll after navigation settles
    setTimeout(() => {
      const el = document.getElementById(`doubt-${doubtId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleToggle}
        // Scaled padding for mobile
        className="relative p-1.5 sm:p-2 rounded-xl text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all shrink-0"
      >
        <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
        {unreadCount > 0 && (
          <span
            // Scaled badge size and text for mobile
            className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center rounded-full text-white text-[9px] sm:text-[10px] font-bold px-1"
            style={{ background: "#7c3aed" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          // Adjusted width and right-offset for mobile to prevent touching screen edge
          className="absolute right-[-20px] sm:right-0 top-10 sm:top-12 w-[300px] sm:w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden origin-top-right"
          style={{ maxHeight: "420px" }}
        >
          {/* Header */}
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xs sm:text-sm font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span
                className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ background: "#7c3aed" }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 sm:py-10 text-gray-400">
                <Bell className="w-6 h-6 sm:w-8 sm:h-8 mb-2 opacity-30" />
                <p className="text-xs sm:text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClickNotification(n.doubt?._id)}
                  className="w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 border-b border-gray-50 hover:bg-purple-50 transition-colors flex gap-2.5 sm:gap-3 items-start"
                  style={{ background: n.isRead ? "white" : "#f5f3ff" }}
                >
                  {/* Avatar dot */}
                  <div
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}
                  >
                    {(n.sender?.name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] sm:text-xs text-gray-700 leading-snug">
                      <span className="font-semibold">{n.sender?.name ?? "Someone"}</span>
                      {" answered your doubt"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">
                      "{n.doubt?.question ?? "your question"}"
                    </p>
                    {!n.isRead && (
                      <span
                        className="inline-block mt-1 w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full"
                        style={{ background: "#7c3aed" }}
                      />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;