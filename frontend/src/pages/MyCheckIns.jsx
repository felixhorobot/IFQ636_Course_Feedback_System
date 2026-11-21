import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import CheckInCard from '../components/CheckInCard';

const MyCheckIns = () => {
  const { user } = useAuth();
  const [checkIns, setCheckIns] = useState([]);

  useEffect(() => {
    const fetchCheckIns = async () => {
      try {
        const response = await axiosInstance.get('/api/checkins/mine', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setCheckIns(response.data);
      } catch (error) {
        alert('Failed to load check-ins.');
      }
    };
    fetchCheckIns();
  }, [user]);

  if (checkIns.length === 0) {
    return (
      <div className="max-w-2xl mx-auto mt-10 qut-panel">
        <h1 className="qut-title">My check-ins</h1>
        <p className="text-qut-copy mb-4">You have no check-in yet.</p>
        <Link to="/checkin" className="qut-btn inline-block">Go to weekly check-in</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h1 className="qut-title">My check-ins</h1>
      {checkIns.map((checkIn) => (
        <CheckInCard key={checkIn._id} checkIn={checkIn} />
      ))}
    </div>
  );
};

export default MyCheckIns;
