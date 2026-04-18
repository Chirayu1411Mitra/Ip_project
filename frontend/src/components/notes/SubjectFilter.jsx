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
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      {/* Subject Pills */}
      <div className="flex flex-wrap gap-2">
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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
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
        className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 cursor-pointer min-w-[140px]"
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
