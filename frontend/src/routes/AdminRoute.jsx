import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

const AdminRoute = () => {
    const { user } = useAuth();
    console.log('Current user:', user);
    const isAdmin = user?.isSuperUser === true;
    console.log('Is admin?', isAdmin);
    
    return isAdmin ? <Outlet /> : <Navigate to="/dashboard" replace />;
};

export default AdminRoute;