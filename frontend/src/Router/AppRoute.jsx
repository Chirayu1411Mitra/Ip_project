import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import DoubtPage from "../pages/DoubtPage";
import GroupsPage from "../pages/GroupsPage";
import GroupChatPage from "../pages/GroupChatPage";
import DeadlinePage from "../pages/DeadlinePage";
import GlobalDeadlinesPage from "../pages/GlobalDeadlinesPage";
import ProfilePage from "../pages/ProfilePage";

const AppRoute = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/"          element={<Dashboard />} />
            <Route path="/doubts"    element={<DoubtPage />} />
            <Route path="/groups"    element={<GroupsPage />} />
            <Route path="/groups/:groupId/chat"      element={<GroupChatPage />} />
            <Route path="/groups/:groupId/deadlines" element={<DeadlinePage />} />
            <Route path="/deadlines" element={<GlobalDeadlinesPage />} />
            <Route path="/profile"   element={<ProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoute;
