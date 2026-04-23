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
    // Mark as read only when opening
    if (next && unreadCount > 0) markAllRead();
  };

  const handleClickNotification = (doubtId) => {
    setOpen(false);
    navigate("/doubts");
    setTimeout(() => {
      const el = document.getElementById(`doubt-${doubtId}`);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  return (
    <div ref={ref} className="relative">
      {/* Bell Icon Button */}
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-xl transition-all duration-200 shrink-0 ${
          open 
            ? "bg-purple-100 text-purple-700" 
            : "text-gray-500 hover:bg-purple-50 hover:text-purple-600"
        }`}
      >
        <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1 right-1 min-w-[16px] h-[16px] sm:min-w-[18px] sm:h-[18px] flex items-center justify-center rounded-full text-white text-[9px] sm:text-[10px] font-bold border-2 border-white"
            style={{ background: "#7c3aed" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="absolute right-0 mt-3 w-[calc(100vw-32px)] sm:w-80 bg-white rounded-2xl shadow-2xl border border-purple-50 z-50 overflow-hidden origin-top-right animate-in fade-in zoom-in duration-200"
          style={{ 
            maxHeight: "450px",
            // Center on mobile, align right on desktop
            position: window.innerWidth < 640 ? 'fixed' : 'absolute',
            left: window.innerWidth < 640 ? '16px' : 'auto',
            top: window.innerWidth < 640 ? '70px' : 'auto'
          }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-10">
            <h3 className="text-sm sm:text-base font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="text-[10px] sm:text-xs px-2.5 py-1 rounded-full text-purple-700 bg-purple-100 font-bold uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>

          {/* List Area */}
          <div className="overflow-y-auto" style={{ maxHeight: "380px" }}>
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-3">
                  <Bell className="w-6 h-6 opacity-20" />
                </div>
                <p className="text-xs sm:text-sm font-medium">All caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <button
                    key={n._id}
                    onClick={() => handleClickNotification(n.doubt?._id)}
                    className="w-full text-left px-4 py-4 hover:bg-purple-50/50 transition-colors flex gap-3 items-start"
                    style={{ background: n.isRead ? "white" : "#fdfcff" }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ background: "linear-gradient(135deg, #8b5cf6, #6d28d9)" }}
                    >
                      {(n.sender?.name?.[0] ?? "?").toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] sm:text-sm text-gray-800 leading-tight">
                        <span className="font-bold text-gray-900">{n.sender?.name ?? "User"}</span>
                        {" replied to your doubt"}
                      </p>
                      <p className="text-[11px] sm:text-xs text-purple-500 mt-1 italic truncate font-medium">
                        {n.doubt?.question ?? "View details..."}
                      </p>
                      {!n.isRead && (
                        <div className="mt-2 flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                          <span className="text-[10px] font-bold text-purple-600 uppercase">New</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer (Optional) */}
          <div className="p-2 border-t border-gray-50 bg-gray-50/50 text-center">
             <button className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-purple-600 transition-colors">
               Close Panel
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;