import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import GlobalSocketListener from './components/layout/GlobalSocketListener';
import OfflineBanner from './components/ui/OfflineBanner';
import PWAPrompt from './components/ui/PWAPrompt';
import { useFirebaseMessaging } from './hooks/useFirebaseMessaging';
import LoginPage from './auth/LoginPage';
import RegisterPage from './auth/RegisterPage';
import ForgotPasswordPage from './auth/ForgotPasswordPage';
import SuperAdminApp from './portals/super-admin/SuperAdminApp';
import AdminApp from './portals/admin/AdminApp';
import ResidentApp from './portals/resident/ResidentApp';
import StaffApp from './portals/staff/StaffApp';
import GuardApp from './portals/guard/GuardApp';
import SuspendedPage from './components/common/SuspendedPage';
import UnauthorizedPage from './components/common/UnauthorizedPage';
import NotFoundPage from './components/common/NotFoundPage';

// ── Role sets ─────────────────────────────────────────────────────────────────
// Staff portal: committee, accountant, facility, help desk
const STAFF_ROLES = ['COMMITTEE_MEMBER', 'ACCOUNTANT', 'FACILITY_MANAGER', 'HELP_DESK'];

/**
 * ProtectedRoute — redirects to /auth/login if:
 *   - not authenticated, OR
 *   - authenticated but role doesn't match any of the required roles
 *
 * @param {string | string[]} requiredRole - one role or array of allowed roles
 */
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  if (requiredRole && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children;
}

function App() {
  // Initialize Firebase Cloud Messaging (push notifications)
  useFirebaseMessaging();

  const { isSuspended, isAuthenticated, user } = useSelector((state) => state.auth);

  if (isSuspended) {
    return <SuspendedPage />;
  }

  const getDashboardRoute = () => {
    if (!isAuthenticated || !user) return '/auth/login';
    if (user.role === 'SUPER_ADMIN') return '/super-admin';
    if (user.role === 'SOCIETY_ADMIN') return '/admin';
    if (user.role === 'RESIDENT') return '/resident';
    if (user.role === 'SECURITY_GUARD') return '/guard';
    return '/staff';
  };

  return (
    <div className="relative min-h-screen bg-[#f4f5f7] text-slate-900 overflow-hidden selection:bg-indigo-500/30 font-sans">
      {/* Premium Modern Ambient Background */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#f8fafc]">
        {/* Dynamic Glowing Blobs */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-[120px] animate-blob mix-blend-multiply"></div>
        <div className="absolute top-[10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-fuchsia-400/20 blur-[120px] animate-blob animation-delay-2000 mix-blend-multiply"></div>
        <div className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] rounded-full bg-violet-400/20 blur-[120px] animate-blob animation-delay-4000 mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] rounded-full bg-amber-400/20 blur-[120px] animate-blob mix-blend-multiply"></div>

        {/* Subtle Dot Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEuNSIgZmlsbD0iI2U1ZTdlYiIgLz48L3N2Zz4=')] opacity-[0.8]"></div>

        {/* Noise Texture Overlay for premium glassmorphism feel */}
        <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}></div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* PWA Components */}
        <OfflineBanner />
        <PWAPrompt />
        <Toaster position="top-right" toastOptions={{ style: { marginTop: '8px' } }} />
        <GlobalSocketListener />
        <Routes>
          {/* Default → dashboard or login */}
          <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />

          {/* ── Public / Auth ─────────────────────────────────────────── */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/suspended" element={<SuspendedPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* ── Super Admin Portal ────────────────────────────────────── */}
          <Route
            path="/super-admin/*"
            element={
              <ProtectedRoute requiredRole="SUPER_ADMIN">
                <SuperAdminApp />
              </ProtectedRoute>
            }
          />

          {/* ── Society Admin Portal ──────────────────────────────────── */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute requiredRole="SOCIETY_ADMIN">
                <AdminApp />
              </ProtectedRoute>
            }
          />

          {/* ── Resident Portal ───────────────────────────────────────── */}
          <Route
            path="/resident/*"
            element={
              <ProtectedRoute requiredRole="RESIDENT">
                <ResidentApp />
              </ProtectedRoute>
            }
          />

          {/* ── Staff Portal (Committee, Accountant, FM, Help Desk) ───── */}
          <Route
            path="/staff/*"
            element={
              <ProtectedRoute requiredRole={STAFF_ROLES}>
                <StaffApp />
              </ProtectedRoute>
            }
          />

          {/* ── Security Guard Portal (separate dedicated app) ─────────── */}
          <Route
            path="/guard/*"
            element={
              <ProtectedRoute requiredRole="SECURITY_GUARD">
                <GuardApp />
              </ProtectedRoute>
            }
          />

          {/* ── Catch-all ─────────────────────────────────────────────── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;
