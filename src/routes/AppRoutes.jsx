import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import Login from "../pages/auth/login";
import Register from "../pages/auth/Register";
import Dashboard from "../pages/dashboard/Overview";
import AdminDashboard from "../pages/admin/AdminDashboard";

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    
    <Route path="/" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />

    <Route path="/admin" element={
      <ProtectedRoute role="ADMIN">
        <AdminDashboard />
      </ProtectedRoute>
    } />

    <Route path="*" element={<h1>404 - Not Found</h1>} />
  </Routes>
);

export default AppRoutes;
