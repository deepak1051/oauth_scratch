import { useEffect, useState } from 'react';
import { getCurrentUser, logout } from '../auth';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      if (!userData) {
        navigate('/');
      } else {
        setUser(userData);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl mb-2">Hello, {user.name}</h2>
      <img
        src={user.avatar}
        alt="avatar"
        className="w-16 h-16 rounded-full mb-4"
      />
      <button
        onClick={handleLogout}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Dashboard;
