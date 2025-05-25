import { useEffect, useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import authService from '@/services/authService';

function AdminAccessValidator({ children, onAccessDenied }) {
  const { user, setUser } = useUser();
  const [isValidating, setIsValidating] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const validateAccess = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          throw new Error('No token');
        }

        // Re-validate user from backend
        const userResult = await authService.getMe();
        
        if (!userResult.success) {
          localStorage.removeItem('token');
          setUser(null);
          throw new Error('Invalid token');
        }

        // Update user context if needed
        if (!user || user.userId !== userResult.user.userId) {
          setUser(userResult.user);
        }

        // Check admin role
        if (userResult.user.type !== 'admin') {
          throw new Error('Not admin');
        }

        setHasAccess(true);
      } catch (error) {
        setHasAccess(false);
        if (onAccessDenied) {
          onAccessDenied(error.message);
        }
      } finally {
        setIsValidating(false);
      }
    };

    validateAccess();
  }, [user, setUser, onAccessDenied]);

  if (isValidating) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#6c757d'
      }}>
        Đang xác thực quyền truy cập...
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#dc3545'
      }}>
        <h3>Truy cập bị từ chối</h3>
        <p>Bạn không có quyền truy cập vào khu vực này.</p>
      </div>
    );
  }

  return children;
}

export default AdminAccessValidator;
