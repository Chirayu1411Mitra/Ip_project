import React from "react";
import { GraduationCap } from "lucide-react";

const FacultyBadge = ({ small = false }) => {
  // Adjusted sizes to be slightly more refined and responsive
  const sizeClass = small 
    ? "px-2 py-0.5 text-[9px] sm:text-[10px]" 
    : "px-2.5 py-1 text-[11px] sm:text-xs";
  
  const iconSize = small ? "w-3 h-3" : "w-3.5 h-3.5 sm:w-4 sm:h-4";
  
  return (
    <div 
      className={`inline-flex items-center gap-1 sm:gap-1.5 ${sizeClass} bg-purple-50 border border-purple-200 text-purple-700 rounded-full font-bold uppercase tracking-wider shadow-sm`}
    >
      <GraduationCap className={iconSize} />
      <span>Faculty</span>
    </div>
  );
};

export default FacultyBadge;