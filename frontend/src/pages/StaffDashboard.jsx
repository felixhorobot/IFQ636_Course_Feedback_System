import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import CheckInCard from '../components/CheckInCard';

const TILES = [
  ['pace', 'Pace of the class', 'Too slow 1 to 5 Too fast'],
  ['clarity', 'How clear was the explanation?', 'Not clear 1 to 5 Very clear'],
  ['workload', 'Assignment workload', 'Too little 1 to 5 Too much'],
];

const StaffDashboard = () => {
  const { user } = useAuth();
  const [week, setWeek] = useState(0); // 0 mean current week
  const [showArchived, setShowArchived] = useState(false);
  const [data, setData] = useState(null);
  const [replies, setReplies] = useState({});
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const fetchWeek = async () => {
      try {
        const response = await axiosInstance.get(`/api/checkins?week=${week}&archived=${showArchived}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setData(response.data);
      } catch (error) {
        alert('Failed to load check-ins.');
      }
    };
    fetchWeek();
  }, [user, week, showArchived, reload]);

  const sendReply = async (id) => {
    const reply = replies[id] || '';
    if (!reply.trim()) {
      setErrors({ ...errors, [id]: 'Please write a reply before sending.' });
      return;
    }
    try {
      await axiosInstance.put(`/api/checkins/${id}/reply`, { reply }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setErrors({ ...errors, [id]: '' });
      setMessage('Reply sent. The student can see it now.');
      setReload(reload + 1);
    } catch (error) {
      setErrors({ ...errors, [id]: error.response?.data?.message || 'Failed to send reply.' });
    }
  };

  const archive = async (id) => {
    try {
      await axiosInstance.put(`/api/checkins/${id}/archive`, {}, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessage('Check-in archived.');
      setReload(reload + 1);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to archive.');
    }
  };

  if (!data) return <div className="text-center mt-20">Loading...</div>;

  // week list from week 1 to this week
  const weeks = [];
  for (let i = 1; i <= (data.currentWeek || data.week); i++) weeks.push(i);

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-bold flex-1">Week {data.week} check-ins</h1>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          Show archived
        </label>
        <select
          value={data.week}
          onChange={(e) => { setWeek(Number(e.target.value)); setMessage(''); }}
          className="border border-qut-outline bg-white p-2"
        >
          {weeks.map((w) => <option key={w} value={w}>Week {w}</option>)}
        </select>
      </div>

      {message && <p className="qut-msg-ok">{message}</p>}

      {data.count === 0 ? (
        <div className="qut-panel">
          <h2 className="text-lg font-bold">No check-ins for week {data.week} yet.</h2>
          <p className="text-qut-copy">Averages show here when students send their check-in.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-2">
            {TILES.map(([key, label, scale]) => (
              <div key={key} className="bg-white border-t-4 border-qut-sky p-4 text-center">
                <p className="text-sm text-qut-copy">{label}</p>
                <p className="text-3xl font-bold text-qut-brand">{data.averages[key]}</p>
                <p className="text-xs text-qut-copy">{scale}</p>
              </div>
            ))}
          </div>
          <p className="text-sm text-qut-copy mb-4">
            {data.count} check-ins this week. Averages include archived check-ins.
          </p>

          {data.checkIns.length === 0 && (
            <div className="qut-panel">
              <h2 className="text-lg font-bold">All check-ins for this week are archived.</h2>
              <p className="text-qut-copy">Tick Show archived to see them again.</p>
            </div>
          )}

          {data.checkIns.map((c) => (
            <div key={c._id} className="mb-6">
              <CheckInCard checkIn={c} name={c.student ? c.student.name : 'Anonymous student'} />
              {c.status === 'Open' && (
                <>
                  <textarea
                    placeholder="Write a reply to this student"
                    value={replies[c._id] || ''}
                    onChange={(e) => setReplies({ ...replies, [c._id]: e.target.value })}
                    className={`qut-input ${errors[c._id] ? 'border-2 border-qut-pink' : ''}`}
                  />
                  {errors[c._id] && <p className="qut-msg-error">{errors[c._id]}</p>}
                  <button onClick={() => sendReply(c._id)} className="qut-btn">Send reply</button>
                </>
              )}
              {c.status === 'Replied' && !c.archived && (
                <button onClick={() => archive(c._id)} className="qut-btn-outline">Archive</button>
              )}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default StaffDashboard;
