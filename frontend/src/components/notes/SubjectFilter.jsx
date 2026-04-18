import React from "react";

const subjects = [
  "All",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "Electronics",
  "Mechanical",
  "Civil",
  "Electrical",
  "Other",
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

const SubjectFilter = ({
  selectedSubject,
  onSubjectChange,
  selectedSemester,
  onSemesterChange,
}) => {
  return (
    // Adjusted gaps and added w-full to ensure it spans properly on mobile
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center w-full">
      
      {/* Subject Pills */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 w-full sm:w-auto flex-1">
        {subjects.map((subject) => {
          const isActive =
            subject === "All" ? !selectedSubject : selectedSubject === subject;
          return (
            <button
              key={subject}
              id={`filter-subject-${subject.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() =>
                onSubjectChange(subject === "All" ? "" : subject)
              }
              // Scaled down padding and text size for mobile
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-[#7C3AED] to-[#9F67FF] text-white shadow-md shadow-purple-200"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-purple-200 hover:text-[#7C3AED]"
              }`}
            >
              {subject}
            </button>
          );
        })}
      </div>

      {/* Semester Dropdown */}
      <select
        id="filter-semester-select"
        value={selectedSemester}
        onChange={(e) => onSemesterChange(e.target.value)}
        // Made full width on mobile, auto width on larger screens. Scaled padding/radius.
        className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 cursor-pointer min-w-[140px] shrink-0"
      >
        <option value="">All Semesters</option>
        {semesters.map((sem) => (
          <option key={sem} value={sem}>
            Semester {sem}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SubjectFilter;