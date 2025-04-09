import { useEffect, useState } from 'react';
import GoogleLoginButton from '../components/GoogleLoginButton';
import { getCurrentUser } from '../auth';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      console.log('userData', userData);
      if (userData) {
        setUser(userData);
        navigate('/dashboard');
      }
    };
    fetchUser();
  }, [navigate]);
  console.log(user);
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl mb-4">Welcome to My App</h1>
      <GoogleLoginButton />
    </div>
  );
};

export default Home;
