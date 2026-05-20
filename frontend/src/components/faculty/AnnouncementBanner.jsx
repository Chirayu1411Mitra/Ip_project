import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X, Bell } from "lucide-react";
import facultyService from "../../services/facultyService";

// Clean class mapping for Tailwind compilation
const PRIORITY_STYLES = {
  high: "bg-red-50 border-red-100 border-l-red-500 text-red-900",
  normal: "bg-purple-50 border-purple-100 border-l-purple-500 text-purple-900",
  low: "bg-gray-50 border-gray-100 border-l-gray-400 text-gray-800",
};

const ICON_COLORS = {
  high: "text-red-600 bg-red-100",
  normal: "text-purple-600 bg-purple-100",
  low: "text-gray-600 bg-gray-200",
};

const AnnouncementBanner = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [dismissed, setDismissed] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await facultyService.getAnnouncements();
      setAnnouncements(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Failed to fetch announcements:", error);
    } finally {
      setLoading(false);
    }
  };

  const visibleAnnouncements = announcements
    .filter((a) => !dismissed.has(a._id))
    .slice(0, 3);

  const handleDismiss = (id) => {
    setDismissed((prev) => new Set([...prev, id]));
  };

  if (loading || visibleAnnouncements.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6 w-full">
      {visibleAnnouncements.map((ann) => {
        // Fallback to 'normal' if priority is undefined
        const priority = ann.priority || "normal"; 
        
        return (
          <div
            key={ann._id}
            className={`border border-l-4 rounded-xl p-3 sm:p-4 shadow-sm transition-all duration-200 ${PRIORITY_STYLES[priority]}`}
          >
            <div className="flex items-start justify-between gap-3">
              
              {/* Left Side: Icon & Title */}
              <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
                <div className={`p-1.5 sm:p-2 rounded-lg flex-shrink-0 ${ICON_COLORS[priority]}`}>
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                
                <div className="flex-1 min-w-0 pt-0.5">
                  <h4 className="font-bold text-sm sm:text-base mb-1 truncate pr-2">
                    {ann.title}
                  </h4>
                  
                  {/* Expanded Content */}
                  {expandedId === ann._id && (
                    <div className="animate-in fade-in slide-in-from-top-1 mt-2">
                      <p className="text-sm opacity-90 mb-2 leading-relaxed break-words whitespace-pre-wrap">
                        {ann.content}
                      </p>
                      {ann.postedBy && (
                        <p className="text-[11px] sm:text-xs font-semibold opacity-70 uppercase tracking-wide">
                          Posted by {ann.postedBy.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side: Actions */}
              <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 bg-white/40 rounded-lg p-0.5">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === ann._id ? null : ann._id)
                  }
                  className="p-1.5 hover:bg-white/60 rounded-md transition-colors"
                  aria-label="Toggle details"
                >
                  {expandedId === ann._id ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <button
                  onClick={() => handleDismiss(ann._id)}
                  className="p-1.5 hover:bg-white/60 hover:text-red-600 rounded-md transition-colors"
                  aria-label="Dismiss announcement"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AnnouncementBanner;