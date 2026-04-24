import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/authhook"; // Ensure this is imported

// ... other imports
import Login from "../pages/Login";
import Register from "../pages/Register";
import RegisterFaculty from "../pages/RegisterFaculty";
import FacultyDashboard from "../pages/FacultyDashboard";
import FacultyRoute from "./FacultyRoute";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import NotesPage from "../pages/NotesPage";
import Profile from "../pages/Profile";
import NoteDetail from "../pages/NoteDetail";
import DoubtPage from "../pages/DoubtPage";

const AppRoute = () => {
  const { user } = useAuth(); // Access user role here

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-faculty" element={<RegisterFaculty />} />

        {/* Authenticated Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            
            {/* 1. ROLE-BASED ROOT REDIRECT */}
            <Route 
              path="/" 
              element={
                user?.role === "faculty" 
                  ? <Navigate to="/faculty" replace /> 
                  : <Dashboard />
              } 
            />

            {/* Shared Routes */}
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/:id" element={<NoteDetail />} />
            <Route path="/doubts" element={<DoubtPage />} />
            <Route path="/profile" element={<Profile />} />

            {/* 2. FACULTY SPECIFIC ROUTES */}
            <Route element={<FacultyRoute />}>
              <Route path="/faculty" element={<FacultyDashboard />} />
            </Route>

          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoute;