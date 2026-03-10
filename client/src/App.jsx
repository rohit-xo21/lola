import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import AuthCallback from './pages/AuthCallback';
import { CheckCircle, XCircle } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30000 } },
});

// On mobile, only the landing page is accessible
function MobileGuard({ children }) {
  const isMobile = window.innerWidth <= 768;
  if (isMobile) return <Navigate to="/" replace />;
  return children;
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const isMobile = window.innerWidth <= 768;
  if (loading) return <div className="flex items-center justify-center h-screen bg-[#1a1e24] text-[#948979] text-sm">Loading…</div>;
  if (!user || isMobile) return <Landing />;
  if (!user.hasGroqKey) return <Navigate to="/settings" replace />;
  return children;
}

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<MobileGuard><AuthRoute><Login /></AuthRoute></MobileGuard>} />
      <Route path="/oauth/callback" element={<MobileGuard><AuthCallback /></MobileGuard>} />
      <Route path="/settings" element={<MobileGuard><Settings /></MobileGuard>} />
      <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#222831',
              color: '#DFD0B8',
              border: '1px solid #393E46',
              fontSize: 12,
              fontFamily: 'DM Sans, sans-serif',
              borderRadius: 10,
              padding: '10px 14px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            },
            success: {
              icon: <CheckCircle size={14} color="#86efac" strokeWidth={2} />,
              duration: 2500,
            },
            error: {
              icon: <XCircle size={14} color="#f87171" strokeWidth={2} />,
              duration: 3500,
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
}