import React from "react";
import { GraduationCap } from "lucide-react";

const FacultyBadge = ({ small = false }) => (
  <span 
    className={`inline-flex items-center gap-1 rounded-full font-bold text-white shadow-sm tracking-wide uppercase ${
      small ? "text-[8px] sm:text-[9px] px-1.5 py-0.5" : "text-[10px] px-2.5 py-1"
    }`}
    style={{ 
      background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    }}
  >
    <GraduationCap 
      size={small ? 10 : 12} 
      strokeWidth={3} 
      className="shrink-0" 
    />
    Faculty
  </span>
);

export default FacultyBadge;