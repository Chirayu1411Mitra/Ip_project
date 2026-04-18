import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import NotesPage from "../pages/NotesPage";
import NoteDetail from "../pages/NoteDetail";
import { AuthProvider } from "../context/AuthContext";
import DoubtPage from "../pages/DoubtPage";

const AppRoute = () => {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>

            <Route element={<MainLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/notes/:id" element={<NoteDetail />} />
              {/* <Route path="/doubts"        element={<Doubts />} />
            <Route path="/doubts/:id"    element={<DoubtDetail />} />
            <Route path="/groups"        element={<StudyGroups />} />
            <Route path="/groups/:id"    element={<GroupChat />} />
            <Route path="/deadlines"     element={<Deadlines />} />
            <Route path="/profile"       element={<Profile />} /> */}
            </Route>

          </Route>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/doubts" element={<DoubtPage />} />
          </Route>
        


        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter >
    </>
  );
};

export default AppRoute;
