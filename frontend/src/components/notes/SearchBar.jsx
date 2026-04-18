import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

const SearchBar = ({ onSearch, onClear }) => {
  const [query, setQuery] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim() === "") {
      onClear();
      return;
    }

    debounceRef.current = setTimeout(() => {
      onSearch(query.trim());
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    // Allowed full width on mobile, restricted on larger screens
    <div className="relative w-full max-w-full sm:max-w-md">
      <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-gray-400 shrink-0" />
      <input
        id="notes-search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search notes by title, subject..."
        // Scaled padding, text size, and radius for mobile
        className="w-full pl-9 sm:pl-12 pr-9 sm:pr-10 py-2.5 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;