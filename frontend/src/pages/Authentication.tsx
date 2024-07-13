import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterUser, LoginUser } from '../ApiCalls';
import { setCookie } from '../utils/cookies';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

const USERNAME_PATTERN = /^[a-zA-Z0-9-]{3,20}$/;
const Authentication = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    try {
      if (!USERNAME_PATTERN.test(username)) {
        throw new Error('Username must be 3-20 characters long, and may only contain letters, numbers, and hyphens.');
      }else if(password.length < 5){
        throw new Error('Password must be at least 5 characters long.');
      }
      const response = await RegisterUser(username, password);
      console.log('User registered successfully:', response);
      setCookie('accessToken', response.token, 7);
      setCookie('username', response.user.username, 7);
      setCookie('userId', response.user.id, 7);
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      setError( (error instanceof Error ? error.message : 'An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await LoginUser(username, password);
      console.log('User logged in successfully:', response);
      setCookie('accessToken', response.token, 7);
      setCookie('username', response.user.username, 7);
      setCookie('userId', response.user.id, 7);
      navigate('/home');
    } catch (error) {
      console.error('Login failed');
      setError( (error instanceof Error ? error.message : 'An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError('');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <img src="/icons/logo.png" alt="Logo" className="mb-8" width="400" height="400" />
      <div className="max-w-md w-full bg-white p-8 shadow-md rounded">
        <form>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-12 bg-gray-100 pl-2"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black h-12 bg-gray-100 pl-2"
            />
          </div>
          <button
            type="button"
            className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-customOrange focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <Spinner /> : 'Sign in'}
          </button>
        </form>
        <button
          type="button"
          className="mt-4 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-customBlue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={handleRegister}
          disabled={loading}
        >
          {loading ? <Spinner /> : 'Sign Up'}
        </button>
        
      </div>
      <div className="mx-4"></div>
      {error && <Toast message={error} onClose={clearError} type={"error"} />}
    </div>
  );
}

export default Authentication;
