import React from "react";
import { TrendingUp } from "lucide-react";

const getTextColorClass = (color) => {
  if (!color) return "text-gray-600";
  const token = color
    .split(" ")
    .find((className) => className.startsWith("text-"));

  return token || "text-gray-600";
};

const StatCard = ({ label, value, icon, color }) => {
  const textColorClass = getTextColorClass(color);

  return (
    // Scaled padding, border radius, and gaps for mobile vs tablet/desktop
    <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[28px] border border-gray-100 shadow-sm flex flex-col gap-3 sm:gap-4">
      <div className="flex justify-between items-start">
        {/* Scaled inner icon padding and radius */}
        <div
          className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-50 ${textColorClass}`}
        >
          {/* We can clone the icon to enforce responsive sizing if needed, or rely on its default size */}
          <div className="scale-90 sm:scale-100 origin-top-left flex items-center justify-center">
            {icon}
          </div>
        </div>
        <TrendingUp className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-green-500 shrink-0" />
      </div>
      <div>
        {/* Scaled text sizes so large numbers don't break the layout on small phones */}
        <h3 className="text-2xl sm:text-3xl font-bold text-gray-800">
          {value}
        </h3>
        <p className="text-xs sm:text-sm text-gray-400 font-medium mt-0.5">
          {label}
        </p>
      </div>
    </div>
  );
};

export default StatCard;
