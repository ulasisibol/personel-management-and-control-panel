import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';

const Sidebar = () => {
    const { user } = useAuth();

    return (
        <div className="bg-dark text-white" style={{ width: '250px', minHeight: '100vh' }}>
            <div className="p-3">
                <h5 className="mb-4 border-bottom pb-2">Admin Panel</h5>
                <ul className="nav flex-column">
                    <li className="nav-item">
                        <NavLink to="/dashboard" className="nav-link text-white">
                            Dashboard
                        </NavLink>
                    </li>
                    {user?.isSuperUser && (
                        <li className="nav-item">
                            <NavLink to="/users/add" className="nav-link text-white">
                                Kullanıcı Ekle
                            </NavLink>
                        </li>
                    )}
                    <li className="nav-item">
                        <NavLink to="/empty" className="nav-link text-white">
                            Boş Alan
                        </NavLink>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;