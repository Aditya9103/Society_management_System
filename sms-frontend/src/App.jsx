import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import SuperAdminApp from './portals/super-admin/SuperAdminApp';

/**
 * ProtectedRoute — redirects to login if not authenticated,
 * or to home if the user's role doesn't match the required role.
 */
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/auth/login" replace />;
  return children;
}

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Routes>
        <Route path="/" element={<Navigate to="/auth/login" replace />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

        {/* Super Admin Portal */}
        <Route
          path="/super-admin/*"
          element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <SuperAdminApp />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
