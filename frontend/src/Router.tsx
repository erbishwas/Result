// src/AppRouter.tsx

import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./components/auth/AuthContext";
import Layout from "./components/layout/Layout";
import Login from "./pages/Login";              // Example: non-admin can access
import YearsManagement from "./pages/YearManagement";
import GradesManagement from "./pages/GradeManagement";
import UsersManagement from "./pages/UserManagement";
import SubjectsManagement from "./pages/General/SubjectManagement";
import StudentsManagement from "./pages/General/StudentManagement";
import UserRoleAdmin from "./pages/UserRoleAdmin";
import NotFound from "./pages/NotFound";


// Protect authentication only
function RequireAuth() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

// Protect admin-only routes + show 404 if non-admin tries to access
function RequireAdmin() {
  const { user } = useAuth();

  // If not admin → show 404 inside layout (not redirect)
  if (!user?.is_admin) {
    return (
      <NotFound />
    );
  }

  return <Outlet />;
}

export default function AppRouter() {
  const { isAuthenticated } = useAuth();
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
      />

      {/* All Authenticated Routes (with Layout) */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
        
          <Route path="/" element={user?.is_admin? <StudentsManagement/>:<StudentsManagement/>} />  
          <Route path="/subjects" element={<SubjectsManagement />} />  
          <Route path="/students" element={<StudentsManagement />} />     

          {/* Admin-Only Routes */}
          <Route element={<RequireAdmin />}>
            <Route path="/users" element={<UsersManagement />} />
            <Route path="/years" element={<YearsManagement />} />
            <Route path="/grades" element={<GradesManagement />} />
            <Route path="/user-roles" element={<UserRoleAdmin />} />
            {/* Add more admin pages here */}
          </Route>

          {/* 404 inside the layout for unknown routes */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>

      {/* Global 404 (outside layout, e.g. /random-url when not logged in) */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}