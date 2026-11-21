import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import CheckIn from './pages/CheckIn';
import MyCheckIns from './pages/MyCheckIns';
import StaffDashboard from './pages/StaffDashboard';
import { useAuth } from './context/AuthContext';

function App() {
  const { user } = useAuth();
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        {/* need login first for these page */}
        <Route path="/checkin" element={user ? <CheckIn /> : <Navigate to="/login" />} />
        <Route path="/my-checkins" element={user ? <MyCheckIns /> : <Navigate to="/login" />} />
        <Route path="/staff" element={user ? <StaffDashboard /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
