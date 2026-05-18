import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { useNotif } from "../context/NotifContext";
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
        className="relative p-2 rounded-xl text-gray-500 hover:bg-purple-50 hover:text-purple-600 transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-white text-[10px] font-bold px-1"
            style={{ background: "#7c3aed" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{ maxHeight: "420px" }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">Notifications</h3>
            {unreadCount > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                style={{ background: "#7c3aed" }}
              >
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="overflow-y-auto" style={{ maxHeight: "360px" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <Bell className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => handleClickNotification(n.doubt?._id)}
                  className="w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-purple-50 transition-colors flex gap-3 items-start"
                  style={{ background: n.isRead ? "white" : "#f5f3ff" }}
                >
                  {/* Avatar dot */}
                  <div
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}
                  >
                    {(n.sender?.name?.[0] ?? "?").toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-700 leading-snug">
                      <span className="font-semibold">{n.sender?.name ?? "Someone"}</span>
                      {" answered your doubt"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">
                      "{n.doubt?.question ?? "your question"}"
                    </p>
                    {!n.isRead && (
                      <span
                        className="inline-block mt-1 w-2 h-2 rounded-full"
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
