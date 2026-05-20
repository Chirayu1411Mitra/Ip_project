import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const FacultyRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!user || user.role !== "faculty") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default FacultyRoute;
