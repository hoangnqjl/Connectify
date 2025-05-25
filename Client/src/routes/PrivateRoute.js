// components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

function PrivateRoute({ children }) {
  const { user } = useUser();
  const location = useLocation();
  const token = localStorage.getItem('token');

  // Check both token and user context
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;
