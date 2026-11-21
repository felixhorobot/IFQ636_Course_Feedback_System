import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import RatingInput from '../components/RatingInput';
import CheckInCard from '../components/CheckInCard';

const CheckIn = () => {
  const { user } = useAuth();
  const [week, setWeek] = useState(null);
  const [checkIn, setCheckIn] = useState(null);
  const [formData, setFormData] = useState({ pace: 0, clarity: 0, workload: 0, request: '', anonymous: false });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCurrent = async () => {
      try {
        const response = await axiosInstance.get('/api/checkins/current', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setWeek(response.data.week);
        setCheckIn(response.data.checkIn);
      } catch (error) {
        setError('Failed to load check-in.');
      }
      setLoading(false);
    };
    fetchCurrent();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pace || !formData.clarity || !formData.workload) {
      setError('Please answer all 3 questions.');
      return;
    }
    try {
      const response = await axiosInstance.post('/api/checkins', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setCheckIn(response.data);
      setMessage('Check-in sent. Thank you!');
      setError('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send check-in.');
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  if (!week) {
    return (
      <div className="max-w-2xl mx-auto mt-10 qut-panel">
        <h1 className="text-xl font-bold mb-2">Check-in is not open yet.</h1>
        <p className="text-qut-copy">Please come back when the semester starts.</p>
      </div>
    );
  }

  // already sent, show what student sent
  if (checkIn) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <h1 className="qut-title">Week {week} check-in</h1>
        {message && <p className="qut-msg-ok">{message}</p>}
        {!message && <p className="mb-4">You already sent check-in for this week.</p>}
        <CheckInCard checkIn={checkIn} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mt-10 qut-panel">
      <h1 className="qut-title">Week {week} check-in</h1>
      <p className="text-qut-copy mb-4">Tell us how the class is going this week. It takes about 1 minute.</p>
      <RatingInput label="Pace of the class" low="Too slow" high="Too fast" value={formData.pace}
        onChange={(n) => setFormData({ ...formData, pace: n })} />
      <RatingInput label="How clear was the explanation?" low="Not clear" high="Very clear" value={formData.clarity}
        onChange={(n) => setFormData({ ...formData, clarity: n })} />
      <RatingInput label="Assignment workload" low="Too little" high="Too much" value={formData.workload}
        onChange={(n) => setFormData({ ...formData, workload: n })} />
      <textarea
        placeholder="Special request (optional)"
        maxLength={500}
        value={formData.request}
        onChange={(e) => setFormData({ ...formData, request: e.target.value })}
        className="qut-input mb-1"
      />
      <p className="text-sm text-qut-copy mb-4">{formData.request.length}/500</p>
      <label className="flex items-center gap-2 mb-4">
        <input type="checkbox" checked={formData.anonymous}
          onChange={(e) => setFormData({ ...formData, anonymous: e.target.checked })} />
        Send as anonymous (staff will not see my name)
      </label>
      {error && <p className="qut-msg-error">{error}</p>}
      <button type="submit" className="qut-btn w-full">Send check-in</button>
    </form>
  );
};

export default CheckIn;
