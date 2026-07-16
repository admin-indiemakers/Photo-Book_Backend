import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { SystemCalibration } from './SystemCalibration.jsx';

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-y-2 border-ink mb-4" />
          <p className="font-functional text-xs uppercase tracking-widest text-muted">Authenticating</p>
        </div>
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  return (
    <SystemCalibration>
      {children}
    </SystemCalibration>
  );
}
