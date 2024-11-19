import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth.js';
const Header = () => {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white border-bottom">
            <div className="d-flex justify-content-between align-items-center p-3">
                <div>
                    Hoş geldin, {user?.username}
                </div>
                <button onClick={handleLogout} className="btn btn-outline-danger">
                    Çıkış Yap
                </button>
            </div>
        </header>
    );
};

export default Header;