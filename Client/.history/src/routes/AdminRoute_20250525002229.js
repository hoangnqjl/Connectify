import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

function AdminRoute({ children }) {
  const { user } = useUser();
  const location = useLocation();
  
  // Check if user is logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // Check if user has admin role
  if (user.type !== 'admin') {
    return <Navigate to="/" replace />;
  }
  
  return children;
}

export default AdminRoute;
