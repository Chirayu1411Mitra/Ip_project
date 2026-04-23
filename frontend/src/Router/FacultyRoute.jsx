import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/authhook.js";

const FacultyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-[#E9EEF9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-500 font-medium text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return user?.role === "faculty" ? <Outlet /> : <Navigate to="/" replace />;
};

export default FacultyRoute;