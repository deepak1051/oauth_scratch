const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <button
      onClick={handleLogin}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
    >
      Continue with Google
    </button>
  );
};

export default GoogleLoginButton;
