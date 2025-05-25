// components/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom';

function PrivateRoute({ children }) {
  const isLoggedIn = localStorage.getItem('token');
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

export default PrivateRoute;
