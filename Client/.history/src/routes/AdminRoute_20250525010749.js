import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { useEffect, useState } from 'react';
import authService from '@/services/authService';

function AdminRoute({ children }) {
  const { user, setUser } = useUser();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const validateAdminAccess = async () => {
      const token = localStorage.getItem('token');

      // Check if token exists
      if (!token) {
        setIsValidating(false);
        return;
      }

      // Check if user context exists
      if (!user) {
        // Try to fetch user info
        const userResult = await authService.getMe();
        if (userResult.success) {
          setUser(userResult.user);
          // Check if the fetched user is admin
          if (userResult.user.type === 'admin') {
            setIsAuthorized(true);
          }
        } else {
          // Invalid token, remove it
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        // User context exists, check admin role
        if (user.type === 'admin') {
          setIsAuthorized(true);
        }
      }

      setIsValidating(false);
    };

    validateAdminAccess();
  }, [user, setUser]);

  // Show loading while validating
  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '16px',
        color: '#6c757d'
      }}>
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  // Check if user is logged in
  if (!user || !localStorage.getItem('token')) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has admin role with strict validation
  if (!isAuthorized || user.type !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;
