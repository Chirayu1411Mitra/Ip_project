import React from "react";
import { BrowserRouter, Route,Routes,Navigate} from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/register";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import { AuthProvider } from "../context/AuthContext";
const AppRoute = () => {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>

          <Route element={<MainLayout />}>
            <Route path="/"              element={<Dashboard />} />
            {/* <Route path="/notes"         element={<Notes />} />
            <Route path="/doubts"        element={<Doubts />} />
            <Route path="/doubts/:id"    element={<DoubtDetail />} />
            <Route path="/groups"        element={<StudyGroups />} />
            <Route path="/groups/:id"    element={<GroupChat />} />
            <Route path="/deadlines"     element={<Deadlines />} />
            <Route path="/profile"       element={<Profile />} /> */}
          </Route>

        </Route>

         <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

export default AppRoute;
