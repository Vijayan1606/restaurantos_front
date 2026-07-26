import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user, hasRole } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !hasRole(...roles)) {
    return (
      <div className="p-8 text-center text-gray-500">
        You don't have permission to view this page.
      </div>
    );
  }
  return children;
}
