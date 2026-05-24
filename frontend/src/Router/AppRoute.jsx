import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RegisterFaculty from "../pages/RegisterFaculty";
import ProtectedRoute from "./ProtectedRoute";
import FacultyRoute from "./FacultyRoute";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import DoubtPage from "../pages/DoubtPage";
import GroupsPage from "../pages/GroupsPage";
import GroupChatPage from "../pages/GroupChatPage";
import DeadlinePage from "../pages/DeadlinePage";
import GlobalDeadlinesPage from "../pages/GlobalDeadlinesPage";
import ProfilePage from "../pages/ProfilePage";
import FacultyDashboard from "../pages/FacultyDashboard";
import NotesPage from "../pages/NotesPage";

const AppRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/register-faculty" element={<RegisterFaculty />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/doubts" element={<DoubtPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/groups/:groupId/chat" element={<GroupChatPage />} />
            <Route
              path="/groups/:groupId/deadlines"
              element={<DeadlinePage />}
            />
            <Route path="/deadlines" element={<GlobalDeadlinesPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* Faculty-only routes */}
          <Route element={<FacultyRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/faculty" element={<FacultyDashboard />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoute;
