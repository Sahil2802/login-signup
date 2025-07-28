import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  fullName: string;
  email: string;
  password: string;
}

interface User {
  _id: string;
  fullName: string;
  email: string;
}

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loginData, setLoginData] = useState<LoginData>({
    email: '',
    password: ''
  });
  const [signupData, setSignupData] = useState<SignupData>({
    fullName: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<User | null>(null);

  // Handle login form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success) {
        // Store token in localStorage
        localStorage.setItem('token', data.token);
        setMessage('Login successful!');
        setUser(data.user);
        // Clear form
        setLoginData({ email: '', password: '' });
      } else {
        setMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setMessage('Network error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle signup form submission
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signupData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Registration successful! Please login.');
        setIsLogin(true); // Switch to login form
        // Clear form
        setSignupData({ fullName: '', email: '', password: '' });
      } else {
        setMessage(data.message || 'Registration failed');
      }
    } catch (error) {
      setMessage('Network error occurred');
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get user profile (test protected route)
  const getUserProfile = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setMessage('Please login first');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        setMessage('Profile loaded successfully');
      } else {
        setMessage(data.message || 'Failed to load profile');
      }
    } catch (error) {
      setMessage('Network error occurred');
      console.error('Profile error:', error);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setMessage('Logged out successfully');
    setLoginData({ email: '', password: '' });
    setSignupData({ fullName: '', email: '', password: '' });
  };

  // If user is logged in, show dashboard
  if (user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="bg-zinc-900 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Welcome, {user.fullName}!</h2>
          <div className="bg-zinc-800 p-4 rounded mb-4">
            <p><span className="font-semibold">Name:</span> {user.fullName}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p><span className="font-semibold">User ID:</span> {user._id}</p>
          </div>
          <div className="flex gap-2 mb-4">
            <button onClick={getUserProfile} className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-2 rounded transition-colors">Refresh Profile</button>
            <button onClick={handleLogout} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition-colors">Logout</button>
          </div>
          {message && <div className="bg-green-100 text-green-800 rounded px-4 py-2 text-center text-sm">{message}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      {/* Left Side */}
      <div className="hidden md:flex flex-col justify-between w-1/2 bg-zinc-950 p-8 rounded-l-lg">
        <div>
          <div className="flex items-center gap-2 text-lg font-semibold text-gray-200">
            <span className="text-2xl">⌘</span>
            Acme Inc
          </div>
        </div>
        <div className="text-sm text-zinc-300 italic mb-2">
          "This library has saved me countless hours of work and helped me deliver stunning designs to my clients faster than ever before." <span className="not-italic">- Sofia Davis</span>
        </div>
      </div>
      {/* Right Side */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-black p-8 rounded-r-lg relative">
        {/* Top right login/signup links */}
        <div className="absolute top-6 right-8 text-xs flex gap-4">
          <button
            className={`text-zinc-200 hover:underline ${isLogin ? 'font-bold underline' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`text-zinc-200 hover:underline ${!isLogin ? 'font-bold underline' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>
        <div className="w-full max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-center mb-2">{isLogin ? 'Login to your account' : 'Create an account'}</h2>
          <p className="text-center text-zinc-400 mb-6 text-sm">{isLogin ? 'Enter your email to login to your account' : 'Enter your email below to create your account'}</p>
          <form
            onSubmit={isLogin ? handleLogin : handleSignup}
            className="space-y-4"
          >
            {/* Email input */}
            <input
              type="email"
              placeholder="Email"
              className="w-full px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={isLogin ? loginData.email : signupData.email}
              onChange={e => {
                if (isLogin) setLoginData({ ...loginData, email: e.target.value });
                else setSignupData({ ...signupData, email: e.target.value });
              }}
              required
            />
            {/* Only show full name for signup */}
            {!isLogin && (
              <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                value={signupData.fullName}
                onChange={e => setSignupData({ ...signupData, fullName: e.target.value })}
                required
              />
            )}
            {/* Password input */}
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-2 rounded bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              value={isLogin ? loginData.password : signupData.password}
              onChange={e => {
                if (isLogin) setLoginData({ ...loginData, password: e.target.value });
                else setSignupData({ ...signupData, password: e.target.value });
              }}
              required
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-semibold hover:bg-zinc-200 disabled:bg-zinc-700 disabled:text-zinc-400"
              size="lg"
            >
              {isLogin ? (loading ? 'Logging in...' : 'Sign In with Email') : (loading ? 'Signing up...' : 'Sign Up with Email')}
            </Button>
          </form>
          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-zinc-800" />
            <span className="mx-2 text-zinc-500 text-xs">OR CONTINUE WITH</span>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
          {/* GitHub button */}
          <button className="w-full flex items-center justify-center gap-2 bg-zinc-900 border border-zinc-800 text-white py-2 rounded hover:bg-zinc-800 transition-colors mb-4">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.37 0 0 5.373 0 12c0 5.303 3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.726-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.09-.745.083-.729.083-.729 1.205.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492.997.108-.775.418-1.305.762-1.605-2.665-.305-5.466-1.334-5.466-5.933 0-1.31.468-2.38 1.236-3.22-.124-.303-.535-1.523.117-3.176 0 0 1.008-.322 3.3 1.23a11.52 11.52 0 013.003-.404c1.02.005 2.047.138 3.003.404 2.29-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.873.12 3.176.77.84 1.235 1.91 1.235 3.22 0 4.61-2.803 5.625-5.475 5.922.43.372.823 1.104.823 2.225 0 1.606-.015 2.898-.015 3.293 0 .322.216.694.825.576C20.565 21.796 24 17.298 24 12c0-6.627-5.373-12-12-12z"/></svg>
            GitHub
          </button>
          <p className="text-xs text-zinc-500 text-center">
            By clicking continue, you agree to our <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>.
          </p>
          {message && <div className="bg-green-100 text-green-800 rounded px-4 py-2 text-center text-sm mt-4">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default Auth;
