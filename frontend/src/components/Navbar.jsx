import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-qut-brand text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-4 text-xl font-bold">
        <img src="/qut-logo.svg" alt="QUT" className="w-12 h-12" />
        Course Feedback
      </Link>
      <div className="flex items-center gap-5">
        {user ? (
          <>
            {user.role === 'student' && (
              <>
                <Link to="/checkin">Weekly check-in</Link>
                <Link to="/my-checkins">My check-ins</Link>
              </>
            )}
            {user.role === 'staff' && <Link to="/staff">Dashboard</Link>}
            <Link to="/profile">Profile</Link>
            <button onClick={handleLogout} className="bg-white text-qut-navy font-semibold px-6 py-3">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register" className="bg-qut-sky text-white font-semibold uppercase px-6 py-3">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
